// src/lib/data/courses.ts

export interface GameRound {
  roundNumber: number;
  rows: number;
  cols: number;
  sizeText: string;
}

export interface CourseMessages {
  stageClearTitle: string;
  stageClearBody: string;
  gameOverTitle: string;
  gameOverBody: string;
  courseClearTitle: string;
  courseClearBody: string;
}

export interface GameCourse {
  id: string;
  title: string;
  difficulty: number;
  description: string;
  flavorText: string;
  chocoColor: string;
  labelColor: string;
  rounds: GameRound[];
  messages: CourseMessages;
}

export const coursesData: GameCourse[] = [
  {
    id: '1',
    title: '밀크 가나슈 코스',
    difficulty: 1,
    description: '촘프의 기초부터 다지는 입문 코스입니다. 점진적으로 크기가 커지는 3개의 판을 정복하며 필승 전략의 감을 잡으세요.',
    flavorText: '“달콤한 밀크 초코와 함께 가볍게 워밍업!”',
    chocoColor: '#8c5a3c',
    labelColor: 'linear-gradient(135deg, #a26a47, #734326)',
    rounds: [
      { roundNumber: 1, rows: 2, cols: 3, sizeText: '2 × 3' },
      { roundNumber: 2, rows: 3, cols: 3, sizeText: '3 × 3' },
      { roundNumber: 3, rows: 3, cols: 4, sizeText: '3 × 4' }
    ],
    messages: {
      stageClearTitle: 'STAGE CLEAR! 🎉',
      stageClearBody: '훌륭합니다! 완벽한 연산으로 AI를 막다른 길로 몰아넣었습니다.',
      gameOverTitle: '독약 섭취 (GAME OVER) 😢',
      gameOverBody: 'AI의 설계에 말려들어 해골 초콜릿을 삼키고 말았습니다.',
      courseClearTitle: '밀크 가나슈 완파! 🏆',
      courseClearBody: '3개의 스테이지 시나리오를 연달아 정복하셨습니다.<br>이제 더 높은 차원의 <b>\'다크 카카오 코스\'</b>에 도전할 자격이 주어졌습니다.'
    }
  },
  {
    id: '2',
    title: '다크 카카오 코스',
    difficulty: 3,
    description: '본격적인 대칭성과 수학적 균형이 요구되는 보통 난이도 코스입니다. 한 치의 양보도 없는 3연속 심리전이 펼쳐집니다.',
    flavorText: '“카카오 72%, 가로세로의 균형을 무너뜨려라.”',
    chocoColor: '#4a2c1a',
    labelColor: 'linear-gradient(135deg, #5c3820, #341e14)',
    rounds: [
      { roundNumber: 1, rows: 4, cols: 4, sizeText: '4 × 4' },
      { roundNumber: 2, rows: 3, cols: 5, sizeText: '3 × 5' },
      { roundNumber: 3, rows: 4, cols: 6, sizeText: '4 × 6' }
    ],
    messages: {
      stageClearTitle: '진형 파괴 성공! 🍫',
      stageClearBody: '균형을 무너뜨리는 데 성공했습니다. 대칭 수학의 감을 잡으셨군요!',
      gameOverTitle: '씁쓸한 패배... ☕',
      gameOverBody: '카카오 72%의 씁쓸함이 전해집니다. 선공과 후공의 대칭 포인트를 다시 설계해 보세요.',
      courseClearTitle: '다크 카카오 마스터! 👑',
      courseClearBody: '쉽지 않은 심리전을 모두 이겨내셨습니다.<br>이제 신의 영역인 <b>\'블랙 가드너 코스\'</b>가 기다립니다.'
    }
  },
  {
    id: '3',
    title: '블랙 가드너 코스',
    difficulty: 5,
    description: '수학자 데이비드 게일의 난제를 마스터하는 전문가 코스입니다. 거대한 경우의 수 속에서 완벽한 선공의 필승 루트를 증명하세요.',
    flavorText: '“마지막 독약 조각을 남기기 위한 치밀한 3단계 설계.”',
    chocoColor: '#2b1810',
    labelColor: 'linear-gradient(135deg, #3d2314, #1f100a)',
    rounds: [
      { roundNumber: 1, rows: 5, cols: 5, sizeText: '5 × 5' },
      { roundNumber: 2, rows: 4, cols: 7, sizeText: '4 × 7' },
      { roundNumber: 3, rows: 5, cols: 8, sizeText: '5 × 8' }
    ],
    messages: {
      stageClearTitle: '난제 증명 성공! 🧠',
      stageClearBody: '데이비드 게일도 울고 갈 완벽한 수읽기였습니다. 엄청난 집중력이시네요!',
      gameOverTitle: '수학적 조난 🌌',
      gameOverBody: '방대한 경우의 수 속에서 길을 잃었습니다. 처음부터 다시 필승 루트를 역추적해 보세요.',
      courseClearTitle: 'CHOMP 마스터 등극! 🖤',
      courseClearBody: '가장 거대하고 복잡한 초콜릿 판을 모두 지워내셨습니다.<br>당신은 이제 촘프 게임의 완벽한 <b>최종 지배자</b>입니다.'
    }
  }
];