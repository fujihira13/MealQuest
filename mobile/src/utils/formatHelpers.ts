export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString()}`;
};

export const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    スーパー: "🛒",
    自販機: "🥤",
    コンビニ: "🏪",
    外食: "🍽️",
    飲み会: "🍻",
    デート: "💕",
    その他: "📝",
  };
  return icons[category] || "📝";
};

export const getMealLabel = (meal: string): string => {
  const labels: { [key: string]: string } = {
    morning: "朝",
    lunch: "昼",
    dinner: "夜",
    snack: "間食",
  };
  return labels[meal] || meal;
};
