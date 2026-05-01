import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
}

const tabs: TabConfig[] = [
  { name: 'index', title: 'ホーム', icon: 'home-outline' },
  { name: 'stats', title: '統計', icon: 'bar-chart-outline' },
  { name: 'missions', title: 'ミッション', icon: 'flag-outline' },
  { name: 'badges', title: 'バッジ', icon: 'ribbon-outline' },
  { name: 'collection', title: 'コレクション', icon: 'star-outline' },
  { name: 'settings', title: '設定', icon: 'settings-outline' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
