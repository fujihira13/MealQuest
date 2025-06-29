import React, { useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { TabNavigation } from '@/components/Layout/TabNavigation';
import { HomeTab } from '@/components/Tabs/HomeTab';
import { InputModal } from '@/components/Modals/InputModal';
import { Notification } from '@/components/Common/Notification';
import { ConfirmDialog } from '@/components/Common/ConfirmDialog';
import { useAppStore, useUIStore } from '@/store/useAppStore';

// 他のタブコンポーネントは簡易版として実装
const StatsTab: React.FC = () => (
  <section className="tab-content">
    <h3>統計タブ</h3>
    <p>統計機能は実装中です</p>
  </section>
);

const MissionsTab: React.FC = () => (
  <section className="tab-content">
    <h3>ミッションタブ</h3>
    <p>ミッション機能は実装中です</p>
  </section>
);

const BadgesTab: React.FC = () => (
  <section className="tab-content">
    <h3>称号タブ</h3>
    <p>称号機能は実装中です</p>
  </section>
);

const CollectionTab: React.FC = () => (
  <section className="tab-content">
    <h3>コレクションタブ</h3>
    <p>コレクション機能は実装中です</p>
  </section>
);

function App() {
  const { updateMonthlyData } = useAppStore();
  const { currentTab } = useUIStore();

  useEffect(() => {
    // アプリ起動時に月次データを更新
    updateMonthlyData();
  }, [updateMonthlyData]);

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab />;
      case 'stats':
        return <StatsTab />;
      case 'missions':
        return <MissionsTab />;
      case 'badges':
        return <BadgesTab />;
      case 'collection':
        return <CollectionTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <TabNavigation />
      {renderCurrentTab()}
      <InputModal />
      <Notification />
      <ConfirmDialog />
    </div>
  );
}

export default App;