export interface Theme {
  id: string
  name: string
  css: string
  type: 'solid' | 'gradient'
}

export const THEMES: Theme[] = [
  // 단색 5가지
  { id: 'slate',    name: '아이스 그레이', css: '#f1f5f9',                                                                     type: 'solid'    },
  { id: 'mint',     name: '민트 포그',     css: '#ecfdf5',                                                                     type: 'solid'    },
  { id: 'blush',    name: '블러쉬 로즈',   css: '#fff1f2',                                                                     type: 'solid'    },
  { id: 'sky',      name: '스카이 미스트', css: '#f0f9ff',                                                                     type: 'solid'    },
  { id: 'lemon',    name: '레몬 크림',     css: '#fffbeb',                                                                     type: 'solid'    },
  // 그라데이션 5가지
  { id: 'indigo',   name: '인디고 퍼플',   css: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #faf5ff 100%)',  type: 'gradient' },
  { id: 'ocean',    name: '오션 블루',     css: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 50%, #eff6ff 100%)',  type: 'gradient' },
  { id: 'sunset',   name: '선셋 오렌지',   css: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fce7f3 100%)',  type: 'gradient' },
  { id: 'forest',   name: '포레스트 그린', css: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdfa 100%)',  type: 'gradient' },
  { id: 'rosegold', name: '로즈 골드',     css: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 50%, #fffbeb 100%)',  type: 'gradient' },
]

export const DEFAULT_THEME_ID = 'indigo'
