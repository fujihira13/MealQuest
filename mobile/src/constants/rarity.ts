// ガチャアイテムのレアリティ表示（色・星）。
// CollectionList / GachaResultModal の双方から共通で参照する。
export const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export const RARITY_BG: Record<string, string> = {
  common: '#FAFAFA',
  rare: '#E3F2FD',
  epic: '#F3E5F5',
  legendary: '#FFF3E0',
};

export const RARITY_STARS: Record<string, string> = {
  common: '★',
  rare: '★★',
  epic: '★★★',
  legendary: '★★★★',
};

// レアリティの段階数（4段階中いくつ星が埋まるか）。
// GachaResultModal では「常に4つ枠を表示し、埋まっている分だけ金色にする」表示に使う。
// RARITY_STARS はそのまま（CollectionList が引き続き参照）残しているため、
// キーの並びは RARITY_STARS の★の数と対応させている。
export const RARITY_STAR_COUNT: Record<string, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};
