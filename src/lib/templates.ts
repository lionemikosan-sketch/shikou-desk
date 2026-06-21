import type { CardType, NewCardInput } from '@/types';

// ============================================================
// 思考整理テンプレート
// 選ぶと、質問項目を本文に展開したカードを作成できる。
// ============================================================

export interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: CardType;
  defaultTitle: string;
  questions: string[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'worry',
    name: '悩み整理',
    emoji: '🌧️',
    description: 'もやもやを言葉にして、今日できる一歩を見つける',
    type: 'worry',
    defaultTitle: '悩みの整理',
    questions: [
      '何に悩んでいる？',
      'なぜ気になっている？',
      '自分で変えられることは？',
      '自分で変えられないことは？',
      '今日できる最小行動は？',
    ],
  },
  {
    id: 'idea',
    name: 'アイデア整理',
    emoji: '💡',
    description: '思いつきを、最初の一歩まで具体化する',
    type: 'idea',
    defaultTitle: 'アイデアの整理',
    questions: [
      '何を思いついた？',
      '誰のため？',
      '何が便利？',
      '似たものはある？',
      '最初に作るならどこまで？',
      '次の一歩は？',
    ],
  },
  {
    id: 'decision',
    name: '決断',
    emoji: '⚖️',
    description: '選択肢を並べて、納得して決める',
    type: 'memo',
    defaultTitle: '決断メモ',
    questions: [
      '選択肢A',
      '選択肢B',
      'Aのメリット',
      'Aのデメリット',
      'Bのメリット',
      'Bのデメリット',
      'お金の負担',
      '時間の負担',
      '今の結論',
    ],
  },
  {
    id: 'project',
    name: 'プロジェクト整理',
    emoji: '📁',
    description: 'ゴールから逆算して、最初の一歩を決める',
    type: 'project',
    defaultTitle: 'プロジェクトの整理',
    questions: [
      'ゴール',
      '期限',
      '必要な作業',
      '最初の一歩',
      '詰まりそうなところ',
      '完了条件',
    ],
  },
  {
    id: 'shopping',
    name: '買い物比較',
    emoji: '🛒',
    description: '候補を比べて、買う・買わないを決める',
    type: 'shopping',
    defaultTitle: '買い物の比較',
    questions: [
      '商品名',
      '価格',
      'メリット',
      'デメリット',
      '代替案',
      '買う理由',
      '買わない理由',
      '結論',
    ],
  },
];

/** 質問項目を本文テキストに展開する */
export function buildTemplateBody(questions: string[]): string {
  return questions.map((q) => `■ ${q}\n\n`).join('').trimEnd() + '\n';
}

/** テンプレートから新規カード入力を作る */
export function cardInputFromTemplate(t: Template): NewCardInput {
  return {
    title: t.defaultTitle,
    body: buildTemplateBody(t.questions),
    type: t.type,
    status: 'inbox',
    tags: [],
    priority: 'medium',
  };
}
