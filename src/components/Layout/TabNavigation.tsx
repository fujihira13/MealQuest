import React from "react";
import { useUIStore } from "@/store/useAppStore";
import type { TabType } from "@/types";

interface TabButton {
  key: TabType;
  icon: string;
  label: string;
}

const tabs: TabButton[] = [
  { key: "home", icon: "🏠", label: "ホーム" },
  { key: "stats", icon: "📊", label: "統計" },
  { key: "missions", icon: "🎯", label: "クエスト" },
  { key: "badges", icon: "🏆", label: "称号" },
  { key: "collection", icon: "🎁", label: "リスト" },
];

export const TabNavigation: React.FC = () => {
  const { currentTab, setCurrentTab } = useUIStore();

  return (
    <nav className="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn ${currentTab === tab.key ? "active" : ""}`}
          onClick={() => setCurrentTab(tab.key)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </nav>
  );
};
