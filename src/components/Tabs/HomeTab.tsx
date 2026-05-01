import React from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  ExpenseCategoryGrid,
  MonthlyExpenseSummary,
  CookingRecordSection,
  DailyChallengeSection,
  QuickSavingsSection,
  GachaSection,
} from "@/components/HomeTab";

export const HomeTab: React.FC = () => {
  const { streaks } = useAppStore();

  return (
    <section className="tab-content active">
      <MonthlyExpenseSummary />
      <ExpenseCategoryGrid />

      <div className="daily-activities-section">
        <div className="daily-activities-header">
          <span className="daily-activities-title">今日のアクション</span>
          {streaks.noWasteStreak > 0 && (
            <span className="streak-badge">🔥 連続記録 {streaks.noWasteStreak}日</span>
          )}
        </div>
        <div className="daily-activities-row">
          <CookingRecordSection />
          <DailyChallengeSection />
        </div>
      </div>

      <QuickSavingsSection />
      <GachaSection />
    </section>
  );
};
