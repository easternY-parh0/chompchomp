// onnxruntime-web 세션 관리 + value head 배치 추론 (난이도별 여러 모델 캐시).
// SSR 안전을 위해 onnxruntime-web 은 브라우저에서 동적 import 한다.
import { CIN, MAX_H, MAX_W } from './encode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ortMod: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sessions = new Map<string, Promise<any>>();

async function ensureOrt() {
  if (!ortMod) {
    const ort = await import('onnxruntime-web/wasm'); // wasm 전용 번들 (jsep/webgpu variant 불필요)
    // 단일 스레드 wasm: Vercel 에서 COOP/COEP 헤더 없이 동작.
    ort.env.wasm.numThreads = 1;
    // 오프라인/부스용 self-host: node_modules/onnxruntime-web/dist/*.wasm → static/ort/
    // (온라인만 배포하면 이 줄 지워서 CDN 자동 사용 가능)
    ort.env.wasm.wasmPaths = '/ort/';
    ortMod = ort;
  }
  return ortMod;
}

function getSession(url: string) {
  let p = sessions.get(url);
  if (!p) {
    p = (async () => {
      const ort = await ensureOrt();
      return ort.InferenceSession.create(url, { executionProviders: ['wasm'] });
    })();
    sessions.set(url, p);
  }
  return p;
}

/**
 * 지정 모델로 인코딩된 보드 n개(길이 n*CANVAS_SIZE)의 value 를 한 번의 forward 로 계산.
 * 반환: 길이 n 의 Float32Array (현재 차례 플레이어 관점 기대결과, -1..1).
 */
export async function valueBatch(modelUrl: string, data: Float32Array, n: number): Promise<Float32Array> {
  const session = await getSession(modelUrl);
  const ort = ortMod;
  const input = new ort.Tensor('float32', data, [n, CIN, MAX_H, MAX_W]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feeds: Record<string, any> = {};
  feeds[session.inputNames[0]] = input;
  const out = await session.run(feeds);
  const valName = out['value']
    ? 'value'
    : session.outputNames.find((nm: string) => nm.includes('value')) ??
      session.outputNames[session.outputNames.length - 1];
  return out[valName].data as Float32Array;
}

/** 모델들을 미리 로드해 첫 수 지연 제거 (선택). 실패는 무시(호출부가 폴백). */
export async function warmup(urls: string[]): Promise<void> {
  await Promise.all(urls.map((u) => getSession(u).catch(() => {})));
}
