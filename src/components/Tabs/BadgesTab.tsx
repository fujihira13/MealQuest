import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Badge } from "@/types";

export const BadgesTab: React.FC = () => {
  const {
    badges,
    badgeDefinitions,
    userData,
    expenses,
    cookingRecords,
    savingsRecords,
    collection,
    missions,
    streaks,
  } = useAppStore();

  const [filter, setFilter] = useState<"all" | "earned" | "unearned">("all");

  const getBadgeProgress = (badge: Badge): number => {
    switch (badge.requirement.type) {
      case "cooking_count":    return cookingRecords.length;
      case "total_savings":    return userData.totalSavings;
      case "savings_count":    return savingsRecords.length;
      case "level":            return userData.level;
      case "consecutive_days": return getConsecutiveDays();
      case "monthly_goal_achieved": return checkMonthlyGoal() ? 1 : 0;
      case "gacha_items":      return collection.length;
      case "missions_completed": return missions.completedHistory.length;
      case "savings_level":    return userData.savingsLevel;
      case "no_waste_streak":  return streaks.noWasteStreak;
      default: return 0;
    }
  };

  const getRequirementDesc = (badge: Badge): string => {
    const { type, value } = badge.requirement;
    switch (type) {
      case "cooking_count":    return `自炊を${value}回達成で獲得`;
      case "total_savings":    return `合計¥${value.toLocaleString()}節約で獲得`;
      case "savings_count":    return `節約記録${value}回で獲得`;
      case "level":            return `Lv.${value}達成で獲得`;
      case "consecutive_days": return `${value}日連続記録で獲得`;
      case "monthly_goal_achieved": return "月間目標達成で獲得";
      case "gacha_items":      return `アイテム${value}種類で獲得`;
      case "missions_completed": return `ミッション${value}個達成で獲得`;
      case "savings_level":    return `節約Lv.${value}で獲得`;
      case "no_waste_streak":  return `無駄遣いなし${value}日連続で獲得`;
      default: return "条件を満たすと獲得";
    }
  };

  const getConsecutiveDays = (): number => {
    const allDates = new Set<string>();
    expenses.forEach((e) => allDates.add(e.date));
    cookingRecords.forEach((r) => allDates.add(r.date));
    savingsRecords.forEach((r) => allDates.add(r.date));
    const sorted = Array.from(allDates).sort().reverse();
    let count = 0;
    let cur = new Date().toISOString().split("T")[0];
    for (const d of sorted) {
      if (d === cur) {
        count++;
        const next = new Date(cur);
        next.setDate(next.getDate() - 1);
        cur = next.toISOString().split("T")[0];
      } else break;
    }
    return count;
  };

  const checkMonthlyGoal = () =>
    userData.monthlyExpense <= 25000 && userData.cookingCount >= 20;

  const earnedBadges = badgeDefinitions.filter((b) => badges.earned.includes(b.id));
  const nextGoal = badgeDefinitions.filter((b) => !badges.earned.includes(b.id)).length;

  const filteredBadges = badgeDefinitions.filter((b) => {
    const earned = badges.earned.includes(b.id);
    if (filter === "earned")   return earned;
    if (filter === "unearned") return !earned;
    return true;
  });

  return (
    <section className="tab-content active">
      <div className="badges-header">
        <h3>バッジ</h3>
        <div className="badges-stats">
          <div className="badges-stat-item">
            <span className="badges-stat-value">{earnedBadges.length} / {badgeDefinitions.length}</span>
            <span className="badges-stat-label">獲得バッジ</span>
          </div>
          <div className="badges-stat-item">
            <span className="badges-stat-value">あと{Math.min(nextGoal, 99)}個</span>
            <span className="badges-stat-label">次の達成まで</span>
          </div>
        </div>
        {badges.currentTitle && (
          <div className="current-title">
            現在の称号: {badgeDefinitions.find((b) => b.id === badges.currentTitle)?.title ?? "初心者"}
          </div>
        )}
      </div>

      <div className="badge-categories">
        {(["all", "earned", "unearned"] as const).map((f) => (
          <button
            key={f}
            className={`category-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "すべて" : f === "earned" ? "獲得済み" : "未獲得"}
          </button>
        ))}
      </div>

      <div className="badges-grid">
        {filteredBadges.map((badge) => {
          const isEarned = badges.earned.includes(badge.id);
          const progress = getBadgeProgress(badge);
          const pct = isEarned ? 100 : Math.min((progress / badge.requirement.value) * 100, 100);

          return (
            <div
              key={badge.id}
              className={`badge-card ${isEarned ? "earned" : "locked"} category-${badge.category}`}
            >
              <div className="badge-icon">{isEarned ? badge.icon : "🔒"}</div>
              <div className="badge-content">
                <h5 className="badge-title">{isEarned ? badge.title : "???"}</h5>
                <p className="badge-description">
                  {isEarned ? badge.description : getRequirementDesc(badge)}
                </p>
                <div className="badge-progress">
                  <div className="badge-progress-bar">
                    <div className="badge-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="badge-progress-text">
                    {isEarned ? "達成済み" : `${progress}/${badge.requirement.value}`}
                  </span>
                </div>
              </div>
              {isEarned && <div className="badge-earned-mark">✓</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
};
