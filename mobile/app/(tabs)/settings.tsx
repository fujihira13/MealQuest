import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/formatHelpers';

export default function SettingsTab() {
  const { userData, goals, updateGoals, resetAllData } = useAppStore();
  const [dailyNotif, setDailyNotif] = useState(true);
  const [missionNotif, setMissionNotif] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(goals.monthlyExpenseGoal));

  const handleBudgetChange = () => {
    setBudgetInput(String(goals.monthlyExpenseGoal));
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = () => {
    const normalized = budgetInput.replace(/,/g, '').trim();
    const parsed = Number(normalized);

    if (!/^\d+$/.test(normalized) || !Number.isSafeInteger(parsed) || parsed <= 0) {
      Alert.alert('入力エラー', '予算は1円以上の整数で入力してください');
      return;
    }

    updateGoals('expense', parsed);
    setIsBudgetModalOpen(false);
  };

  const handleExport = () => {
    Alert.alert('データを書き出す', 'この機能は近日実装予定です');
  };

  const handleImport = () => {
    Alert.alert('データを読み込む', 'この機能は近日実装予定です');
  };

  const handleHelp = () => {
    Alert.alert('ヘルプ', 'MealQuest は食費管理に特化したゲーミフィケーション付き家計簿アプリです。\n\n自炊・節約・ミッション達成でXPを貯めてレベルアップし、ポイントでガチャや報酬を楽しみましょう！');
  };

  const handleReset = () => {
    Alert.alert(
      'データをリセット',
      '全てのデータが削除されます。本当によろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('完了', 'データをリセットしました');
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* アカウント */}
      <Text style={styles.sectionLabel}>アカウント</Text>
      <TouchableOpacity style={styles.accountCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarIcon}>👑</Text>
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>節約マスター</Text>
          <Text style={styles.accountLevel}>Lv. {userData.level}</Text>
          <Text style={styles.accountPoints}>🪙 {userData.points.toLocaleString()} pt</Text>
        </View>
        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>

      {/* 予算設定 */}
      <Text style={styles.sectionLabel}>予算設定</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📊</Text>
            <Text style={styles.settingLabel}>月の食費予算</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{formatCurrency(goals.monthlyExpenseGoal)}</Text>
            <TouchableOpacity style={styles.changeBtn} onPress={handleBudgetChange}>
              <Text style={styles.changeBtnText}>変更</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 通知 */}
      <Text style={styles.sectionLabel}>通知</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🕐</Text>
            <Text style={styles.settingLabel}>デイリー通知</Text>
          </View>
          <Switch
            value={dailyNotif}
            onValueChange={setDailyNotif}
            trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
            thumbColor={dailyNotif ? '#4CAF50' : '#BDBDBD'}
          />
        </View>
        <View style={styles.separator} />
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🚩</Text>
            <Text style={styles.settingLabel}>ミッション通知</Text>
          </View>
          <Switch
            value={missionNotif}
            onValueChange={setMissionNotif}
            trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
            thumbColor={missionNotif ? '#4CAF50' : '#BDBDBD'}
          />
        </View>
      </View>

      {/* データ管理 */}
      <Text style={styles.sectionLabel}>データ管理</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📤</Text>
            <Text style={styles.settingLabel}>データを書き出す</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
            <Text style={styles.actionBtnText}>書き出す</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📥</Text>
            <Text style={styles.settingLabel}>データを読み込む</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={handleImport}>
            <Text style={styles.actionBtnText}>読み込む</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* アプリ情報 */}
      <Text style={styles.sectionLabel}>アプリ情報</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.settingRow} onPress={handleHelp}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>ℹ️</Text>
            <Text style={styles.settingLabel}>ヘルプ</Text>
          </View>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📱</Text>
            <Text style={styles.settingLabel}>バージョン</Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>

      {/* リセット */}
      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetIcon}>⚠️</Text>
        <Text style={styles.resetText}>すべてのデータをリセット</Text>
        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>

      </ScrollView>

      <Modal
        visible={isBudgetModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsBudgetModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.budgetModal}>
            <Text style={styles.modalTitle}>月の食費予算</Text>
            <Text style={styles.modalDescription}>新しい予算を入力してください</Text>
            <View style={styles.budgetInputRow}>
              <Text style={styles.yen}>¥</Text>
              <TextInput
                style={styles.budgetInput}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="numeric"
                placeholder="25000"
                placeholderTextColor="#BDBDBD"
                autoFocus
              />
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsBudgetModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveBudget}>
                <Text style={styles.modalSaveText}>保存する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 4,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 26,
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  accountLevel: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  accountPoints: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontSize: 14,
    color: '#424242',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingValue: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  changeBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  changeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtn: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionBtnText: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: -16,
  },
  resetBtn: {
    backgroundColor: '#FFEBEE',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 8,
  },
  resetIcon: {
    fontSize: 18,
  },
  resetText: {
    flex: 1,
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  budgetModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  yen: {
    fontSize: 20,
    color: '#424242',
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#212121',
    paddingVertical: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
