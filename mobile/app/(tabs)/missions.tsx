import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

export default function MissionsTab() {
  const { missions, claimMissionReward } = useAppStore();

  const dailyList = Object.values(missions.daily);
  const weeklyList = Object.values(missions.weekly);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>デイリーミッション</Text>
        {dailyList.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.empty}>ミッションがありません</Text>
          </View>
        ) : (
          dailyList.map((mission) => (
            <View key={mission.id} style={styles.card}>
              <View style={styles.missionHeader}>
                <Text style={styles.missionIcon}>{mission.icon}</Text>
                <View style={styles.missionInfo}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionDesc}>{mission.description}</Text>
                </View>
                <Text style={styles.reward}>+{mission.reward}pt</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((mission.progress / mission.target) * 100, 100)}%`,
                      backgroundColor: mission.completed ? '#4CAF50' : '#81C784',
                    },
                  ]}
                />
              </View>
              <View style={styles.missionFooter}>
                <Text style={styles.progressText}>
                  {mission.progress}/{mission.target}
                </Text>
                {mission.completed && !mission.claimed && (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => claimMissionReward(mission.id)}
                  >
                    <Text style={styles.claimButtonText}>受け取る</Text>
                  </TouchableOpacity>
                )}
                {mission.claimed && (
                  <Text style={styles.claimedText}>受け取り済み ✓</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ウィークリーミッション</Text>
        {weeklyList.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.empty}>ミッションがありません</Text>
          </View>
        ) : (
          weeklyList.map((mission) => (
            <View key={mission.id} style={[styles.card, styles.weeklyCard]}>
              <View style={styles.missionHeader}>
                <Text style={styles.missionIcon}>{mission.icon}</Text>
                <View style={styles.missionInfo}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionDesc}>{mission.description}</Text>
                </View>
                <Text style={styles.reward}>+{mission.reward}pt</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((mission.progress / mission.target) * 100, 100)}%`,
                      backgroundColor: mission.completed ? '#2196F3' : '#64B5F6',
                    },
                  ]}
                />
              </View>
              <View style={styles.missionFooter}>
                <Text style={styles.progressText}>
                  {mission.progress}/{mission.target}
                </Text>
                {mission.completed && !mission.claimed && (
                  <TouchableOpacity
                    style={[styles.claimButton, styles.weeklyClaimButton]}
                    onPress={() => claimMissionReward(mission.id)}
                  >
                    <Text style={styles.claimButtonText}>受け取る</Text>
                  </TouchableOpacity>
                )}
                {mission.claimed && (
                  <Text style={styles.claimedText}>受け取り済み ✓</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
  },
  weeklyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  missionIcon: {
    fontSize: 24,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  missionDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  reward: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9800',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weeklyClaimButton: {
    backgroundColor: '#2196F3',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  claimedText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  empty: {
    color: '#9E9E9E',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
