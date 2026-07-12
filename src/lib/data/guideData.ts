export interface GuideArticle {
  id: number;
  emoji: string;
  title: string;
  preview: string;
  layoutClass: string; // 아티클 자체의 기본 레이아웃 클래스
  sections: Array<{
    type: 'paragraph' | 'subtitle' | 'callout' | 'highlight' | 'board';
    text?: string;
    caption?: string;
    subDesc?: string;
    layoutClass?: string; // 👈여기에 옵셔널(?)로 추가해 줘야 에러가 안 납니다!
    pieces?: string[];
  }>;
}
export const guideArticles: GuideArticle[] = [
  {
    id: 1,
    emoji: '💡',
    title: '1. 촘프 게임의 역사와 게임 이론',
    preview: '1950년대 슈(Schuh)의 약수 게임부터 체르멜로 정리와 조합론적 공정 게임 분석.',
    layoutClass: 'layout-1xn',
    sections: [
      { type: 'subtitle', text: '📜 촘프의 역사: 약수 게임에서 초콜릿으로' },
      { type: 'paragraph', text: "촘프 게임의 수학적 모태는 1952년 네덜란드의 수학자 <b>프레드 슈(Fred Schuh)</b>가 고안한 <b>'약수 게임(Divisor Game)'</b>으로 거슬러 올라갑니다. 특정 자연수 \\(N\\)을 정해둔 뒤, 플레이어들이 교대로 약수 중 하나를 선택하고 그 수와 배수들을 지워나가며 마지막에 '1'을 고르는 사람이 지는 대수적 규칙이었습니다." },
      { 
        type: 'board', 
        caption: '[도표 1-1] 프레드 슈의 초기 1차원 약수 보드 기하학적 모사 (\\(1 \\times 5\\))',
        layoutClass: 'layout-1xn',
        pieces: ['poison', '2', '4', '8', '16'],
        subDesc: '선택된 수의 배수 계열을 소거하는 1차원 선형 대수 매트릭스 형태'
      },
      { type: 'paragraph', text: '이후 1974년, 미국의 수학자이자 경제학자인 <b>데이비드 게일(David Gale)</b>이 이 복잡한 수식 게임을 사각형 격자판 형태의 규칙으로 리디자인하면서 현재의 <b>\'CHOMP(촘프)\'</b>라는 직관적인 이름이 탄생했습니다. 천재 수학 저술가 마틴 가드너가 이를 대중에 소개하며 조합론의 핵심 과제로 부상했습니다.' },
      { 
        type: 'board', 
        caption: '[도표 1-2] 데이비드 게일이 정립한 2차원 초콜릿 격자 보드 (\\(3 \\times 3\\))',
        layoutClass: 'layout-3x3',
        pieces: ['poison', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal'],
        subDesc: '2차원 평면 좌표축 개념을 결합하여 가독성과 직관성을 극대화한 현대적 촘프 보드'
      },
      { type: 'subtitle', text: '🧩 조합론적 게임 이론 (Combinatorial Game Theory)' },
      { type: 'paragraph', text: "촘프는 조합론적 게임 이론에서 <b>'유한 불완전 배제 공정 게임(Finite Impartial Game)'</b>의 완벽한 표본입니다. 양측이 동일한 조건에서 대칭적으로 돌을 두며, 비기는 경우가 없고 유한한 횟수 내에 게임이 무조건 종료됩니다. 따라서 <b>체르멜로의 정리(Zermelo's Theorem)</b>에 의해, 이 게임은 선공과 후공 중 어느 한쪽에 100% 승리를 가져다주는 <b>'필승 전략'</b>이 무조건 설계되어 있습니다." }
    ]
  },
  {
    id: 2,
    emoji: '🍕',
    title: '2. 전략 도둑질 논증 (Strategy Stealing)',
    preview: '선공의 승리를 귀류법으로 완벽하게 증명해내는 비구성적 증명 세계관.',
    layoutClass: 'layout-3x3',
    sections: [
      { type: 'subtitle', text: '💡 비구성적 존재 증명: "답은 있지만 알려주지는 않는다"' },
      { type: 'paragraph', text: '전략 도둑질 논증은 크기가 \\(1 \\times 1\\)보다 큰 모든 사각형 촘프 게임 보드에서 <b>"무조건 선공이 승리한다"</b>는 정리를 유도해내는 수학적 귀류법 체계입니다. 수학에서 말하는 대표적인 비구성적 증명(Non-constructive proof)으로, 승리의 존재성은 확증하지만 정작 첫 수로 어디를 두어야 하는지는 비밀에 붙입니다.' },
      { type: 'callout', text: "<b>[귀류법적 가정]</b> 후공에게 판을 어떻게 받아도 무조건 승리하는 절대적 마법의 '필승 전략 \\(S\\)'가 존재한다고 귀류법 가정을 세워봅시다." },
      { type: 'paragraph', text: '<b>스텝 1 (선공의 유인책):</b> 선공은 첫 차례에 보드의 맨 오른쪽 아래 맨 구석에 위치한 조각<b>(가장 영향력이 적은 단 1칸)</b>만 톡 깨물어 먹고 후공에게 보드를 넘깁니다.' },
      { 
        type: 'board', 
        caption: '① 선공의 첫 수: 우하단 구석탱이 1조각만 살짝 제거',
        layoutClass: 'layout-3x3',
        pieces: ['poison', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'eaten']
      },
      { type: 'paragraph', text: '<b>스텝 2 (후공의 응수):</b> 후공은 자신이 가지고 있다고 가정한 필승 전략 \\(S\\)의 매뉴얼을 꺼내어, 현재 판에서 가장 완벽한 킬러 좌표인 특정 포인트 <b>🎯</b>를 타격하여 격자를 파괴할 것입니다.' },
      { 
        type: 'board', 
        caption: '② 후공이 자신의 필승 전략 \\(S\\)를 적용해 대응 사격한 배치 (🎯 위치)',
        layoutClass: 'layout-3x3',
        pieces: ['poison', 'normal', 'normal', 'normal', 'target', 'normal', 'normal', 'normal', 'eaten']
      },
      { type: 'paragraph', text: '<b>스텝 3 (논리적 모순 발생):</b> 여기서 수학적 모순이 찾아옵니다. 후공이 🎯를 먹어서 만들어낸 그 이상적인 필승의 배치 상태는, 사실 <b>선공이 첫 번째 차례에 애초부터 🎯 조각을 바로 선택했어도 똑같이 만들어낼 수 있었던 형태</b>입니다.' },
      { 
        type: 'board', 
        caption: '③ 선공이 애초에 첫 수로 ②번 모양을 가로채서 선점해 버린 형태',
        layoutClass: 'layout-3x3',
        pieces: ['poison', 'normal', 'normal', 'normal', 'eaten', 'eaten', 'normal', 'eaten', 'eaten']
      },
      { type: 'highlight', text: "결론적으로 후공이 이기기 위해 준비한 모든 마법의 패는 선공이 첫 턴에 '전략 도둑질(Strategy Stealing)'을 통해 똑같이 재현해 버릴 수 있습니다. 따라서 \"후공에게 필승 전략이 있다\"는 가정은 모순을 일으켜 파괴되며, <b>촘프 게임은 항상 선공의 필승만이 존재함</b>이 증명됩니다." }
    ]
  },
  {
    id: 3,
    emoji: '📊',
    title: '3. 보드 판형별 필승 공식 대백과',
    preview: '\\(1 \\times n\\), 정사각형, \\(2 \\times n\\) 보드판에서 사용하는 거울 대칭 알고리즘.',
    layoutClass: 'layout-2xn',
    sections: [
      { type: 'paragraph', text: '귀류법적 존재 증명을 넘어, 특정한 직사각형 및 규격을 가진 필드에서는 기계적으로 대응하여 무조건 이길 수 있는 마스터 알고리즘이 정립되어 있습니다.' },
      { type: 'subtitle', text: '⭐ 유형 A. 가로형 한 줄 보드 (\\(1 \\times n\\))' },
      { type: 'paragraph', text: '<b>승리 알고리즘:</b> 난이도가 가장 낮습니다. 선공은 첫 턴에 독약 바로 우측 옆 칸(🎯)을 선택합니다. 이 한 수로 독약을 제외한 우측 라인의 모든 초콜릿이 단 한 번에 증발하게 되며, 후공은 강제로 독약을 삼키고 즉사하게 됩니다.' },
      { 
        type: 'board', 
        caption: '', 
        layoutClass: 'layout-1xn', 
        pieces: ['poison', 'target', 'normal', 'normal', 'normal'] 
      },
      { type: 'subtitle', text: '⭐ 유형 B. 정사각형 보드 (\\(n \\times n\\))' },
      { type: 'paragraph', text: '<b>승리 알고리즘 [대각선 거울 복사]:</b> 선공은 첫 수로 메인 대각선 대칭점인 <b>(2, 2) 위치를 정밀 타격</b>해 우측 하단 덩어리를 소거합니다. 그러면 독약을 중심으로 가로축과 세로축의 길이가 똑같은 완벽한 대칭형 \'L\'자 보드가 남습니다. 이후 후공이 가로를 \\(k\\)칸 깎아 먹으면 선공은 세로를 똑같이 \\(k\\)칸 깎으며 대칭 매칭을 복사 유지하면 백전백승합니다.' },
      { 
        type: 'board', 
        caption: '', 
        layoutClass: 'layout-3x3', 
        pieces: ['poison', 'sym-a-style:A1', 'sym-b-style:B1', 'sym-a-style:A2', 'eaten', 'eaten', 'sym-b-style:B2', 'eaten', 'eaten'],
        subDesc: '대칭축을 기준으로 상대방이 깎아낸 분량만큼 반대 축을 똑같이 상쇄하는 거울 공식' 
      },
      { type: 'subtitle', text: '⭐ 유형 C. 2열 격자 보드 (\\(2 \\times n\\))' },
      { type: 'paragraph', text: '<b>승리 알고리즘 [시차 1칸 마진 유지형]:</b> 선공은 아래쪽 행의 가장 우측 조각을 끊어내어 <b>\'첫 번째 행의 잔존 칸수가 두 번째 행의 잔존 칸수보다 무조건 항상 1개 더 많은 상태\'</b>를 요새처럼 유지합니다. 상대방이 위를 깎아 균형을 맞추려 하거나 아래를 더 깎으면, 다음 선공 턴에 이 1칸 차이 마진 공식이 복구되도록 대응 계산을 해주는 것으로 우승 궤도를 사수할 수 있습니다.' },
      { 
        type: 'board', 
        caption: '', 
        layoutClass: 'layout-2xn', 
        pieces: ['poison', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'eaten'],
        subDesc: '윗줄 4칸, 아랫줄 3칸으로 정확히 1칸 격차의 마진 밸런스가 유지된 필승 국면' 
      }
    ]
  }
];