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

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getBadgeProgress = (badge: Badge): number => {
    const req = badge.requirement;

    switch (req.type) {
      case "cooking_count":
        return cookingRecords.length;
      case "total_savings":
        return userData.totalSavings;
      case "savings_count":
        return savingsRecords.length;
      case "level":
        return userData.level;
      case "consecutive_days":
        return getConsecutiveDays();
      case "monthly_goal_achieved":
        return checkMonthlyGoalAchieved() ? 1 : 0;
      case "gacha_items":
        return collection.length;
      case "missions_completed":
        return missions.completedHistory.length;
      case "savings_level":
        return userData.savingsLevel;
      case "no_waste_streak":
        return streaks.noWasteStreak;
      default:
        return 0;
    }
  };

  const getBadgeRequirementDescription = (badge: Badge): string => {
    const req = badge.requirement;

    switch (req.type) {
      case "cooking_count":
        return `自炊を${req.value}回達成で獲得`;
      case "total_savings":
        return `合計${req.value.toLocaleString()}円節約で獲得`;
      case "savings_count":
        return `節約記録を${req.value}回達成で獲得`;
      case "level":
        return `レベル${req.value}達成で獲得`;
      case "consecutive_days":
        return `${req.value}日連続記録で獲得`;
      case "monthly_goal_achieved":
        return "月間目標を全て達成で獲得";
      case "gacha_items":
        return `ガチャアイテム${req.value}種類獲得で取得`;
      case "missions_completed":
        return `クエスト${req.value}個達成で獲得`;
      case "savings_level":
        return `節約レベル${req.value}達成で獲得`;
      case "no_waste_streak":
        return `${req.value}日連続無駄遣いなしで獲得`;
      default:
        return "条件を満たすと獲得できます";
    }
  };

  const getConsecutiveDays = (): number => {
    if (
      expenses.length === 0 &&
      cookingRecords.length === 0 &&
      savingsRecords.length === 0
    ) {
      return 0;
    }

    const allDates = new Set<string>();
    expenses.forEach((exp) => allDates.add(exp.date));
    cookingRecords.forEach((rec) => allDates.add(rec.date));
    savingsRecords.forEach((rec) => allDates.add(rec.date));

    const sortedDates = Array.from(allDates).sort().reverse();
    let consecutiveDays = 0;
    let currentDate = new Date().toISOString().split("T")[0];

    for (let i = 0; i < sortedDates.length; i++) {
      if (sortedDates[i] === currentDate) {
        consecutiveDays++;
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() - 1);
        currentDate = nextDate.toISOString().split("T")[0];
      } else {
        break;
      }
    }

    return consecutiveDays;
  };

  const checkMonthlyGoalAchieved = (): boolean => {
    // 簡略化した目標達成判定
    return (
      userData.monthlyExpense <= 25000 &&
      userData.cookingCount >= 20 &&
      userData.allowanceUsed <= 15000
    );
  };

  const filterBadges = (badges: Badge[]): Badge[] => {
    if (selectedCategory === "all") {
      return badges;
    }
    return badges.filter((badge) => badge.category === selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const getCurrentTitle = (): string => {
    const currentBadge = badgeDefinitions.find(
      (b) => b.id === badges.currentTitle
    );
    return currentBadge ? currentBadge.title : "初心者";
  };

  const earnedBadges = badgeDefinitions.filter((b) =>
    badges.earned.includes(b.id)
  );
  const filteredBadges = filterBadges(badgeDefinitions);
  const completionRate = Math.round(
    (earnedBadges.length / badgeDefinitions.length) * 100
  );

  return (
    <section className="tab-content active">
      <div className="badges-header">
        <h3>🏆 称号・バッジリスト</h3>
        <div className="badges-stats">
          <span>
            獲得称号: {earnedBadges.length} / {badgeDefinitions.length}
          </span>
          <span>達成率: {completionRate}%</span>
        </div>
        <div className="current-title">現在の称号: {getCurrentTitle()}</div>
      </div>

      {/* 称号カテゴリフィルター */}
      <div className="badge-categories">
        <button
          className={`category-filter-btn ${
            selectedCategory === "all" ? "active" : ""
          }`}
          onClick={() => handleCategoryFilter("all")}
        >
          全て
        </button>
        <button
          className={`category-filter-btn ${
            selectedCategory === "cooking" ? "active" : ""
          }`}
          onClick={() => handleCategoryFilter("cooking")}
        >
          🍳 自炊
        </button>
        <button
          className={`category-filter-btn ${
            selectedCategory === "savings" ? "active" : ""
          }`}
          onClick={() => handleCategoryFilter("savings")}
        >
          💰 節約
        </button>
        <button
          className={`category-filter-btn ${
            selectedCategory === "level" ? "active" : ""
          }`}
          onClick={() => handleCategoryFilter("level")}
        >
          ⭐ レベル
        </button>
        <button
          className={`category-filter-btn ${
            selectedCategory === "special" ? "active" : ""
          }`}
          onClick={() => handleCategoryFilter("special")}
        >
          ✨ 特別
        </button>
      </div>

      {/* バッジ一覧 */}
      <div className="badges-grid">
        {filteredBadges.map((badge) => {
          const isEarned = badges.earned.includes(badge.id);
          const progress = getBadgeProgress(badge);
          const progressPercent = isEarned
            ? 100
            : Math.min((progress / badge.requirement.value) * 100, 100);

          return (
            <div
              key={badge.id}
              className={`badge-card ${
                isEarned ? "earned" : "locked"
              } category-${badge.category}`}
            >
              <div className="badge-icon">{isEarned ? badge.icon : "🔒"}</div>
              <div className="badge-content">
                <h5 className="badge-title">
                  {isEarned ? badge.title : "???"}
                </h5>
                <p className="badge-description">
                  {isEarned ? badge.description : getBadgeRequirementDescription(badge)}
                </p>
                <div className="badge-progress">
                  <div className="badge-progress-bar">
                    <div
                      className="badge-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="badge-progress-text">
                    {isEarned
                      ? "達成済み"
                      : `${progress}/${badge.requirement.value}`}
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
