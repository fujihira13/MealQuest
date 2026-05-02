export const getTotalXpRequiredForLevel = (level: number): number => {
  const safeLevel = Math.max(1, Math.floor(level));
  return ((safeLevel - 1) * safeLevel * 100) / 2;
};

export const calculateLevelFromTotalXp = (totalXp: number): number => {
  const safeTotalXp = Math.max(0, Math.floor(totalXp));
  let level = 1;

  while (safeTotalXp >= getTotalXpRequiredForLevel(level + 1)) {
    level += 1;
  }

  return level;
};

export const applyXpChange = <T extends { level: number; totalXp: number }>(
  userData: T,
  xpDelta: number
): T => {
  const totalXp = Math.max(0, userData.totalXp + xpDelta);
  return {
    ...userData,
    totalXp,
    level: calculateLevelFromTotalXp(totalXp),
  };
};
