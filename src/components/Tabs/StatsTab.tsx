import React from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  DetailedStatusSection,
  MonthlyStatsOverview,
  ChartComponents,
  RecordsEditSection,
} from "@/components/StatsTab";

export const StatsTab: React.FC = () => {
  const { expenses, cookingRecords, savingsRecords } = useAppStore();

  return (
    <section className="tab-content active">
      <DetailedStatusSection />
      <MonthlyStatsOverview />
      <ChartComponents
        expenses={expenses}
        cookingRecords={cookingRecords}
        savingsRecords={savingsRecords}
      />
      <RecordsEditSection />
    </section>
  );
};
