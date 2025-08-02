import { useAppStore, useUIStore } from "@/store/useAppStore";

export const useNotifications = () => {
  const { userData, checkLevelUp, checkSavingsLevelUp } = useAppStore();
  const { showNotification } = useUIStore();

  const notifyLevelUp = () => {
    const leveledUp = checkLevelUp();
    const savingsLeveledUp = checkSavingsLevelUp();

    if (leveledUp) {
      showNotification(
        "success",
        `レベルアップ！ Lv.${userData.level}になりました！`
      );
    }
    if (savingsLeveledUp) {
      showNotification(
        "success",
        `節約レベルアップ！ 節約Lv.${userData.savingsLevel}になりました！`
      );
    }

    return { leveledUp, savingsLeveledUp };
  };

  return { notifyLevelUp };
};