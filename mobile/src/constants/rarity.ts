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
