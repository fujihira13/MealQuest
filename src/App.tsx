import { useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { TabNavigation } from "@/components/Layout/TabNavigation";
import { HomeTab } from "@/components/Tabs/HomeTab";
import { StatsTab } from "@/components/Tabs/StatsTab";
import { MissionsTab } from "@/components/Tabs/MissionsTab";
import { BadgesTab } from "@/components/Tabs/BadgesTab";
import { CollectionTab } from "@/components/Tabs/CollectionTab";
import { SettingsTab } from "@/components/Tabs/SettingsTab";
import { InputModal } from "@/components/Modals/InputModal";
import { Notification } from "@/components/Common/Notification";
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";
import { HelpModal } from "@/components/Common/HelpModal";
import { useAppStore, useUIStore } from "@/store/useAppStore";

function App() {
  const {
    updateMonthlyData,
    generateDailyMissions,
    generateWeeklyMissions,
    missions,
    resetDailyMissions,
    resetWeeklyMissions,
  } = useAppStore();
  const { currentTab } = useUIStore();

  useEffect(() => {
    // アプリ起動時に月次データを更新
    updateMonthlyData();

    // ミッションリセットチェック
    resetDailyMissions();
    resetWeeklyMissions();

    // ミッションが存在しない場合は生成
    if (Object.keys(missions.daily).length === 0) {
      generateDailyMissions();
    }
    if (Object.keys(missions.weekly).length === 0) {
      generateWeeklyMissions();
    }
  }, [
    updateMonthlyData,
    missions.daily,
    missions.weekly,
    generateDailyMissions,
    generateWeeklyMissions,
    resetDailyMissions,
    resetWeeklyMissions,
  ]);

  const renderCurrentTab = () => {
    switch (currentTab) {
      case "home":
        return <HomeTab />;
      case "stats":
        return <StatsTab />;
      case "missions":
        return <MissionsTab />;
      case "badges":
        return <BadgesTab />;
      case "collection":
        return <CollectionTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <TabNavigation />
      <main className="main-content">{renderCurrentTab()}</main>
      <InputModal />
      <Notification />
      <ConfirmDialog />
      <HelpModal />
    </div>
  );
}

export default App;
