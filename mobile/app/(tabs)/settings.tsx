import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, getMealLabel } from "@/utils/formatHelpers";
import { getCurrentDate } from "@/utils/dateHelpers";
import type { ExpenseRecord } from "@/types";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

type EditableBudgetType = "expense" | "allowance";

const BUDGET_LABELS: Record<EditableBudgetType, string> = {
  expense: "月のスーパーの予算",
  allowance: "月のお小遣い予算",
};

const CSV_HEADERS = ["日付", "カテゴリ", "食事時間帯", "金額", "記録日時"];

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function createExpensesCsv(expenses: ExpenseRecord[]): string {
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateDiff = a.date.localeCompare(b.date);
    return dateDiff !== 0 ? dateDiff : a.timestamp.localeCompare(b.timestamp);
  });
  const rows = sortedExpenses.map((expense) => [
    expense.date,
    expense.category,
    getMealLabel(expense.meal),
    expense.amount,
    expense.timestamp,
  ]);
  const csvLines = [CSV_HEADERS, ...rows].map((row) =>
    row.map(escapeCsvValue).join(","),
  );
  return `\uFEFF${csvLines.join("\r\n")}`;
}

const DEFAULT_TITLE = "かけだし節約家";

export default function SettingsTab() {
  const { userData, goals, expenses, badges, badgeDefinitions, updateGoals, resetAllData } =
    useAppStore();
  const currentTitleName =
    badges.currentTitle === "beginner"
      ? DEFAULT_TITLE
      : (badgeDefinitions.find((b) => b.id === badges.currentTitle)?.title ??
        DEFAULT_TITLE);
  const [isExporting, setIsExporting] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetType, setEditingBudgetType] =
    useState<EditableBudgetType>("expense");
  const [budgetInput, setBudgetInput] = useState(
    String(goals.monthlyExpenseGoal),
  );
  const totalBudgetGoal = goals.monthlyExpenseGoal + goals.allowanceGoal;

  const handleBudgetChange = (type: EditableBudgetType) => {
    setEditingBudgetType(type);
    setBudgetInput(
      String(
        type === "expense" ? goals.monthlyExpenseGoal : goals.allowanceGoal,
      ),
    );
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = () => {
    const normalized = budgetInput.replace(/,/g, "").trim();
    const parsed = Number(normalized);

    if (
      !/^\d+$/.test(normalized) ||
      !Number.isSafeInteger(parsed) ||
      parsed <= 0
    ) {
      Alert.alert("入力エラー", "予算は1円以上の整数で入力してください");
      return;
    }

    updateGoals(editingBudgetType, parsed);
    setIsBudgetModalOpen(false);
  };

  const handleExport = async () => {
    if (isExporting) return;
    if (expenses.length === 0) {
      Alert.alert("データを書き出す", "書き出すデータがありません");
      return;
    }

    setIsExporting(true);
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(
          "書き出しエラー",
          "この端末ではCSVファイルの共有を利用できません",
        );
        return;
      }

      const fileName = `mealquest-expenses-${getCurrentDate()}.csv`;
      const file = new File(Paths.cache, fileName);
      file.write(createExpensesCsv(expenses), { encoding: "utf8" });

      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
        dialogTitle: "MealQuestの食費記録CSVを書き出す",
      });
    } catch {
      Alert.alert("書き出しエラー", "CSVファイルの書き出しに失敗しました");
    } finally {
      setIsExporting(false);
    }
  };

  const handleHelp = () => {
    Alert.alert(
      "ヘルプ",
      "MealQuest は食費管理に特化したゲーミフィケーション付き家計簿アプリです。\n\n自炊・節約・ミッション達成でXPを貯めてレベルアップし、ポイントでガチャや報酬を楽しみましょう！",
    );
  };

  const handleReset = () => {
    Alert.alert(
      "データをリセット",
      "全てのデータが削除されます。本当によろしいですか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "リセット",
          style: "destructive",
          onPress: () => {
            resetAllData();
            Alert.alert("完了", "データをリセットしました");
          },
        },
      ],
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* アカウント */}
        <Text style={styles.sectionLabel}>アカウント</Text>
        <View style={styles.accountCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>👑</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{currentTitleName}</Text>
            <Text style={styles.accountLevel}>Lv. {userData.level}</Text>
            <Text style={styles.accountPoints}>
              🪙 {userData.points.toLocaleString()} pt
            </Text>
          </View>
        </View>

        {/* 予算設定 */}
        <Text style={styles.sectionLabel}>予算設定</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📊</Text>
              <View>
                <Text style={styles.settingLabel}>月のスーパーの予算</Text>
                <Text style={styles.settingSub}>
                  スーパーの予算に反映
                </Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {formatCurrency(goals.monthlyExpenseGoal)}
              </Text>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => handleBudgetChange("expense")}
              >
                <Text style={styles.changeBtnText}>変更</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>👛</Text>
              <View>
                <Text style={styles.settingLabel}>月のお小遣い予算</Text>
                <Text style={styles.settingSub}>スーパー以外の予算に反映</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {formatCurrency(goals.allowanceGoal)}
              </Text>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => handleBudgetChange("allowance")}
              >
                <Text style={styles.changeBtnText}>変更</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🧾</Text>
              <View>
                <Text style={styles.settingLabel}>食費合計予算</Text>
                <Text style={styles.settingSub}>
                  スーパーの予算 + お小遣い予算
                </Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {formatCurrency(totalBudgetGoal)}
              </Text>
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>自動</Text>
              </View>
            </View>
          </View>
        </View>

        {/* データ管理 */}
        <Text style={styles.sectionLabel}>データ管理</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📤</Text>
              <View>
                <Text style={styles.settingLabel}>CSVを書き出す</Text>
                <Text style={styles.settingSub}>食費記録を表計算用に保存</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isExporting && styles.actionBtnDisabled,
              ]}
              onPress={handleExport}
              disabled={isExporting}
            >
              <Text style={styles.actionBtnText}>
                {isExporting ? "書き出し中..." : "書き出す"}
              </Text>
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
            <Text style={styles.arrow}>{">"}</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📱</Text>
              <Text style={styles.settingLabel}>バージョン</Text>
            </View>
            <Text style={styles.settingValue}>{APP_VERSION}</Text>
          </View>
        </View>

        {/* リセット */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetIcon}>⚠️</Text>
          <Text style={styles.resetText}>すべてのデータをリセット</Text>
          <Text style={styles.arrow}>{">"}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isBudgetModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsBudgetModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.budgetModal}>
            <Text style={styles.modalTitle}>
              {BUDGET_LABELS[editingBudgetType]}
            </Text>
            <Text style={styles.modalDescription}>
              新しい予算を入力してください
            </Text>
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
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveBudget}
              >
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
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 4,
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "700",
    color: "#212121",
  },
  accountLevel: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  accountPoints: {
    fontSize: 13,
    color: "#FF9800",
    fontWeight: "600",
  },
  arrow: {
    fontSize: 16,
    color: "#9E9E9E",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontSize: 14,
    color: "#424242",
  },
  settingSub: {
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 2,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingValue: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  changeBtn: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  changeBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  autoBadge: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  autoBadgeText: {
    fontSize: 13,
    color: "#757575",
    fontWeight: "700",
  },
  actionBtn: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    fontSize: 13,
    color: "#424242",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: -16,
  },
  resetBtn: {
    backgroundColor: "#FFEBEE",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    marginTop: 8,
  },
  resetIcon: {
    fontSize: 18,
  },
  resetText: {
    flex: 1,
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  budgetModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 13,
    color: "#757575",
    textAlign: "center",
  },
  budgetInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  yen: {
    fontSize: 20,
    color: "#424242",
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: "700",
    color: "#212121",
    paddingVertical: 10,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "600",
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
