export const getCurrentDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const isToday = (dateString: string): boolean => {
  return dateString === getCurrentDate();
};

export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

export const getDateRange = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
};
