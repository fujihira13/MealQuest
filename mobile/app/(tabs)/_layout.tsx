import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { Toast } from '@/components/Toast';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
}

const tabs: TabConfig[] = [
  { name: 'index', title: 'ホーム', icon: 'home-outline' },
  { name: 'stats', title: 'ふりかえり', icon: 'bar-chart-outline' },
  { name: 'missions', title: 'ミッション', icon: 'flag-outline' },
  { name: 'achievements', title: '実績', icon: 'ribbon-outline' },
  { name: 'settings', title: '設定', icon: 'settings-outline' },
];

function AppTabBar({ state, navigation, insets }: TabBarProps) {
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabContent}>
        {state.routes.map((route, index) => {
          const config = tabs.find((tab) => tab.name === route.name);
          if (!config) return null;

          const focused = state.index === index;
          const color = focused ? '#4CAF50' : '#9E9E9E';

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabItem, focused && styles.tabItemActive]}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={config.title}
            >
              <Ionicons name={config.icon} size={22} color={color} />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {config.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          header: () => <AppHeader />,
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E0E0E0',
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
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 6,
  },
  tabContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: '#E8F5E9',
  },
  tabLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#2E7D32',
  },
});
