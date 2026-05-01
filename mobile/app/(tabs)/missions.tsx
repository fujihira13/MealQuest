import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MissionsTab() {
  const { missions, streaks, claimMissionReward } = useAppStore();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dailyList = Object.values(missions.daily);
  const weeklyList = Object.values(missions.weekly);
  const allList = [...dailyList, ...weeklyList];

  const completedCount = dailyList.filter((m) => m.completed).length;
  const totalCount = dailyList.length;
  const earnedPts = allList.filter((m) => m.claimed).reduce((s, m) => s + m.reward, 0);
  const claimable = allList.filter((m) => m.completed && !m.claimed);
  const claimableIds = claimable.map((m) => m.id);

  const handleClaimAll = () => {
    claimableIds.forEach((id) => claimMissionReward(id));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* サマリーカード */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryTitle}>今日の達成</Text>
            <Text style={styles.summaryProgress}>
              <Text style={styles.summaryBig}>{completedCount}</Text>/{totalCount}完了
            </Text>
            <View style={styles.pointRow}>
              <Text style={styles.pointIcon}>🏅</Text>
              <Text style={styles.pointText}>獲得 {earnedPts}pt</Text>
            </View>
          </View>
          <View style={styles.summaryRight}>
            <View style={styles.timerRow}>
              <Text style={styles.timerIcon}>🔁</Text>
              <Text style={styles.timerLabel}>リセットまで</Text>
            </View>
            <Text style={styles.timer}>{timeLeft}</Text>
            <Text style={styles.timerSub}>毎日 24:00 にリセット</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.streakRow}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakText}>連続記録 {streaks.noWasteStreak}日</Text>
        </View>
      </View>

      {/* デイリーミッション */}
      <Text style={styles.sectionTitle}>デイリーミッション</Text>
      {dailyList.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.empty}>ミッションがありません</Text>
        </View>
      ) : (
        dailyList.map((mission) => (
          <View key={mission.id} style={styles.card}>
            <View style={styles.missionTop}>
              <Text style={styles.missionIcon}>{mission.icon}</Text>
              <View style={styles.flex1}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDesc}>{mission.description}</Text>
              </View>
              {mission.completed ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>完了</Text>
                </View>
              ) : (
                <Text style={styles.rewardText}>+{mission.reward}pt</Text>
              )}
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
              <Text style={styles.progressText}>{mission.progress}/{mission.target}</Text>
              {mission.completed && !mission.claimed && (
                <TouchableOpacity style={styles.claimBtn} onPress={() => claimMissionReward(mission.id)}>
                  <Text style={styles.claimBtnText}>受け取る +{mission.reward}pt</Text>
                </TouchableOpacity>
              )}
              {mission.claimed && (
                <Text style={styles.claimedText}>受け取り済み ✓</Text>
              )}
            </View>
          </View>
        ))
      )}

      {/* ウィークリーミッション */}
      <Text style={[styles.sectionTitle, styles.sectionTitleWeekly]}>ウィークリーミッション</Text>
      {weeklyList.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.empty}>ミッションがありません</Text>
        </View>
      ) : (
        weeklyList.map((mission) => (
          <View key={mission.id} style={[styles.card, styles.weeklyCard]}>
            <View style={styles.missionTop}>
              <Text style={styles.missionIcon}>{mission.icon}</Text>
              <View style={styles.flex1}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDesc}>{mission.description}</Text>
              </View>
              {mission.completed ? (
                <View style={[styles.completedBadge, styles.completedBadgeBlue]}>
                  <Text style={styles.completedText}>完了</Text>
                </View>
              ) : (
                <Text style={styles.rewardText}>+{mission.reward}pt</Text>
              )}
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
              <Text style={styles.progressText}>{mission.progress}/{mission.target}</Text>
              {mission.completed && !mission.claimed && (
                <TouchableOpacity
                  style={[styles.claimBtn, styles.claimBtnBlue]}
                  onPress={() => claimMissionReward(mission.id)}
                >
                  <Text style={styles.claimBtnText}>受け取る +{mission.reward}pt</Text>
                </TouchableOpacity>
              )}
              {mission.claimed && (
                <Text style={styles.claimedText}>受け取り済み ✓</Text>
              )}
            </View>
          </View>
        ))
      )}

      {/* 一括受取ボタン */}
      {claimable.length > 0 && (
        <TouchableOpacity style={styles.claimAllBtn} onPress={handleClaimAll}>
          <Text style={styles.claimAllIcon}>📦</Text>
          <View>
            <Text style={styles.claimAllTitle}>ミッション達成ポイントGET！</Text>
            <Text style={styles.claimAllSub}>報酬を受け取る（{claimable.length}件）</Text>
          </View>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 12,
    gap: 10,
    paddingBottom: 24,
  },
  flex1: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLeft: {
    gap: 4,
  },
  summaryRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#757575',
  },
  summaryProgress: {
    fontSize: 14,
    color: '#424242',
  },
  summaryBig: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4CAF50',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointIcon: {
    fontSize: 14,
  },
  pointText: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerIcon: {
    fontSize: 12,
  },
  timerLabel: {
    fontSize: 11,
    color: '#757575',
  },
  timer: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212121',
    fontVariant: ['tabular-nums'],
  },
  timerSub: {
    fontSize: 10,
    color: '#9E9E9E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakIcon: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginTop: 4,
  },
  sectionTitleWeekly: {
    color: '#1565C0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
  },
  weeklyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  missionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  missionIcon: {
    fontSize: 22,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  missionDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedBadgeBlue: {
    backgroundColor: '#2196F3',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  rewardText: {
    fontSize: 13,
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
  claimBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  claimBtnBlue: {
    backgroundColor: '#2196F3',
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    fontSize: 13,
  },
  claimAllBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    marginTop: 4,
  },
  claimAllIcon: {
    fontSize: 24,
  },
  claimAllTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  claimAllSub: {
    color: '#C8E6C9',
    fontSize: 12,
  },
});
