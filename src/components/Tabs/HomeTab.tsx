import React from "react";
import {
  ExpenseCategoryGrid,
  BudgetGauge,
  MonthlyExpenseSummary,
  StatusCompact,
  CookingRecordSection,
  DailyChallengeSection,
  QuickSavingsSection,
  GachaSection,
} from "@/components/HomeTab";

export const HomeTab: React.FC = () => {
  return (
    <section className="tab-content active">
      <ExpenseCategoryGrid />
      <BudgetGauge />
      <MonthlyExpenseSummary />
      <StatusCompact />

      <div className="daily-activities-row">
        <CookingRecordSection />
        <DailyChallengeSection />
      </div>

      <QuickSavingsSection />
      <GachaSection />
    </section>
  );
};
