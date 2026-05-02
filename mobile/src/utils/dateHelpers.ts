export const getCurrentDate = (): string => {
  return formatDateKey(new Date());
};

export const getCurrentMonth = (): string => {
  return getCurrentDate().slice(0, 7);
};

export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isValidDateKey = (dateString: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const addDaysToDateKey = (dateString: string, days: number): string => {
  if (!isValidDateKey(dateString)) return dateString;

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!isValidDateKey(dateString)) return dateString;

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const isToday = (dateString: string): boolean => {
  return dateString === getCurrentDate();
};

export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateKey(date);
};

export const getDateRange = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
};
