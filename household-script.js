// アプリケーションの状態管理
class HouseholdApp {
  constructor() {
    // ユーザーデータの初期化
    this.userData = {
      level: 1,
      points: 0,
      hp: 80,
      cookingSkill: 3,
      monthlySavings: 0,
      cookingCount: 0,
      expRecorded: 0,
      currentStreak: 0,
      lastCookingDate: null,
    };

    // 支出データ
    this.expenses = [];

    // ミッション状態
    this.missions = {
      "daily-cooking": { completed: false, target: 1, current: 0 },
      "no-snack": { completed: false, target: 0, current: 0 },
      "record-expense": { completed: false, target: 3, current: 0 },
    };

    // 料理図鑑
    this.recipes = [
      {
        id: "omurice",
        name: "オムライス",
        icon: "🍳",
        unlocked: false,
        difficulty: 2,
        savings: 300,
        source: "cooking",
      },
      {
        id: "pasta",
        name: "パスタ",
        icon: "🍝",
        unlocked: false,
        difficulty: 1,
        savings: 500,
        source: "cooking",
      },
      {
        id: "curry",
        name: "カレー",
        icon: "🍛",
        unlocked: false,
        difficulty: 2,
        savings: 400,
        source: "cooking",
      },
      {
        id: "ramen",
        name: "ラーメン",
        icon: "🍜",
        unlocked: false,
        difficulty: 3,
        savings: 600,
        source: "cooking",
      },
      {
        id: "sandwich",
        name: "サンドイッチ",
        icon: "🥪",
        unlocked: true,
        difficulty: 1,
        savings: 200,
        source: "default",
      },
      {
        id: "salad",
        name: "サラダ",
        icon: "🥗",
        unlocked: true,
        difficulty: 1,
        savings: 150,
        source: "default",
      },
      {
        id: "hamburger",
        name: "ハンバーグ",
        icon: "🍖",
        unlocked: false,
        difficulty: 3,
        savings: 700,
        source: "gacha",
      },
      {
        id: "sushi",
        name: "寿司",
        icon: "🍣",
        unlocked: false,
        difficulty: 4,
        savings: 1000,
        source: "gacha",
      },
    ];

    // バッジコレクション
    this.badges = [
      { id: "first_cooking", name: "初回自炊", icon: "🏆", unlocked: false },
      {
        id: "cooking_master",
        name: "料理マスター",
        icon: "👨‍🍳",
        unlocked: false,
      },
      { id: "saving_hero", name: "節約ヒーロー", icon: "💰", unlocked: false },
      {
        id: "streak_champion",
        name: "連続チャンピオン",
        icon: "🔥",
        unlocked: false,
      },
    ];

    // ガチャアイテム
    this.gachaItems = [
      {
        item: "新レシピ: ハンバーグ",
        icon: "🍖",
        rarity: "common",
        probability: 40,
        type: "recipe",
        recipeId: "hamburger",
      },
      {
        item: "新レシピ: 寿司",
        icon: "🍣",
        rarity: "rare",
        probability: 20,
        type: "recipe",
        recipeId: "sushi",
      },
      {
        item: "キャラクター: シェフ帽",
        icon: "👨‍🍳",
        rarity: "rare",
        probability: 20,
        type: "character",
      },
      {
        item: "称号: 節約王",
        icon: "👑",
        rarity: "epic",
        probability: 15,
        type: "title",
      },
      {
        item: "特別ボーナス: ×2ポイント",
        icon: "⭐",
        rarity: "epic",
        probability: 4,
        type: "bonus",
      },
      {
        item: "伝説の料理道具",
        icon: "🔪",
        rarity: "legendary",
        probability: 1,
        type: "tool",
      },
    ];

    this.inventory = [];

    // ガチャ専用コレクション
    this.gachaCollection = [
      {
        id: "chef_hat",
        name: "シェフ帽",
        icon: "👨‍🍳",
        unlocked: false,
        rarity: "rare",
        type: "character",
      },
      {
        id: "saving_king",
        name: "節約王",
        icon: "👑",
        unlocked: false,
        rarity: "epic",
        type: "title",
      },
      {
        id: "double_points",
        name: "×2ポイント",
        icon: "⭐",
        unlocked: false,
        rarity: "epic",
        type: "bonus",
      },
      {
        id: "legendary_tool",
        name: "伝説の料理道具",
        icon: "🔪",
        unlocked: false,
        rarity: "legendary",
        type: "tool",
      },
    ];

    // LocalStorageからデータを読み込み
    this.loadData();

    // 初期化
    this.init();
  }

  // 初期化処理
  init() {
    this.setupEventListeners();
    this.updateUI();
    this.renderRecipeCollection();
    this.renderBadges();
    this.renderGachaCollection();
    this.renderInventory();
    this.updateMissions();
    this.showTab("dashboard");
  }

  // イベントリスナーの設定
  setupEventListeners() {
    // タブ切り替え
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabName = e.target.dataset.tab;
        this.showTab(tabName);
      });
    });

    // カテゴリー変更時のポイントプレビュー
    document
      .getElementById("expense-category")
      .addEventListener("change", () => {
        this.updatePointPreview();
      });

    document.getElementById("expense-amount").addEventListener("input", () => {
      this.updatePointPreview();
    });
  }

  // タブ表示切り替え
  showTab(tabName) {
    // すべてのタブコンテンツを非表示
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    // すべてのタブボタンを非アクティブ
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // 指定されたタブを表示
    document.getElementById(tabName).classList.add("active");
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  }

  // ポイントプレビューの更新
  updatePointPreview() {
    const amount =
      parseInt(document.getElementById("expense-amount").value) || 0;
    const category = document.getElementById("expense-category").value;
    const points = this.calculatePoints(amount, category);

    const previewElement = document.getElementById("point-preview");
    if (points > 0) {
      previewElement.innerHTML = `<span style="color: #28a745;">+${points}ポイント獲得！</span>`;
    } else if (points < 0) {
      previewElement.innerHTML = `<span style="color: #dc3545;">${points}ポイント</span>`;
    } else {
      previewElement.innerHTML = "";
    }
  }

  // ポイント計算
  calculatePoints(amount, category) {
    switch (category) {
      case "cooking":
        return Math.floor(amount * 0.2); // 20%のポイント還元
      case "grocery":
        return Math.floor(amount * 0.1); // 10%のポイント還元
      case "eating-out":
        return -Math.floor(amount * 0.1); // 10%のポイント減少
      case "snack":
        return -Math.floor(amount * 0.15); // 15%のポイント減少
      case "vending-machine":
        return -Math.floor(amount * 0.2); // 20%のポイント減少
      default:
        return 0;
    }
  }

  // 支出追加
  addExpense() {
    const amount = parseInt(document.getElementById("expense-amount").value);
    const category = document.getElementById("expense-category").value;
    const description = document.getElementById("expense-description").value;

    if (!amount || amount <= 0) {
      this.showNotification("金額を正しく入力してください", "error");
      return;
    }

    // 支出データを作成
    const expense = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      amount: amount,
      category: category,
      description: description,
      points: this.calculatePoints(amount, category),
    };

    // データに追加
    this.expenses.unshift(expense);

    // ユーザーデータを更新
    this.userData.points += expense.points;
    this.userData.expRecorded++;

    // カテゴリー別の処理
    if (category === "cooking") {
      this.userData.cookingCount++;
      this.userData.cookingSkill = Math.min(
        10,
        this.userData.cookingSkill + 0.2
      );
      this.userData.hp = Math.min(100, this.userData.hp + 5);
      this.updateCookingStreak();
      this.unlockRecipe();
      this.missions["daily-cooking"].current++;
    } else if (category === "eating-out") {
      this.userData.hp = Math.max(0, this.userData.hp - 3);
      this.resetCookingStreak();
    } else if (category === "snack") {
      this.userData.hp = Math.max(0, this.userData.hp - 2);
      this.missions["no-snack"].current++;
    } else if (category === "vending-machine") {
      this.userData.hp = Math.max(0, this.userData.hp - 1);
    }

    // 外食とお菓子以外は節約とみなす
    if (
      category !== "eating-out" &&
      category !== "snack" &&
      category !== "vending-machine"
    ) {
      this.userData.monthlySavings += this.getExpectedSavings(category, amount);
    }

    // ミッション更新
    this.missions["record-expense"].current++;

    // レベルアップチェック
    this.checkLevelUp();

    // ミッション完了チェック
    this.checkMissionCompletion();

    // UI更新
    this.updateUI();
    this.updateMissions();
    this.saveData();

    // フォームをリセット
    document.getElementById("expense-amount").value = "";
    document.getElementById("expense-description").value = "";
    document.getElementById("point-preview").innerHTML = "";

    // 通知表示
    if (expense.points > 0) {
      this.showNotification(`+${expense.points}ポイント獲得！`);
    } else if (expense.points < 0) {
      this.showNotification(`${expense.points}ポイント`, "error");
    }

    // キャラクターの表情更新
    this.updateCharacterMood();
  }

  // 予想節約額計算
  getExpectedSavings(category, amount) {
    switch (category) {
      case "cooking":
        return 300; // 外食と比較した節約額
      case "grocery":
        return 100; // 外食材料費での節約
      default:
        return 0;
    }
  }

  // 自炊連続記録の更新
  updateCookingStreak() {
    const today = new Date().toISOString().split("T")[0];
    if (this.userData.lastCookingDate === today) {
      return; // 同日の場合は更新しない
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (this.userData.lastCookingDate === yesterdayStr) {
      this.userData.currentStreak++;
    } else {
      this.userData.currentStreak = 1;
    }

    this.userData.lastCookingDate = today;
    this.updateStreakProgress();
  }

  // 自炊連続記録のリセット
  resetCookingStreak() {
    // 外食した場合は連続記録をリセットしない（優しい設計）
    // this.userData.currentStreak = 0;
  }

  // 連続記録プログレスバーの更新
  updateStreakProgress() {
    const progressBar = document.getElementById("cooking-streak");
    const streakText = document.getElementById("streak-text");
    const progress = Math.min(100, (this.userData.currentStreak / 5) * 100);

    progressBar.style.width = `${progress}%`;
    streakText.textContent = `${this.userData.currentStreak}/5日`;

    if (this.userData.currentStreak >= 5) {
      this.unlockBadge("streak_champion");
      this.userData.points += 200;
      this.showNotification("🏆 5日連続自炊達成！特別ボーナス200pt獲得！");
    }
  }

  // レシピアンロック
  unlockRecipe() {
    const lockedRecipes = this.recipes.filter((recipe) => !recipe.unlocked);
    if (lockedRecipes.length > 0 && Math.random() < 0.3) {
      const recipe =
        lockedRecipes[Math.floor(Math.random() * lockedRecipes.length)];
      recipe.unlocked = true;
      this.showNotification(
        `新しいレシピを覚えました: ${recipe.name} ${recipe.icon}`
      );
      this.renderRecipeCollection();
    }
  }

  // バッジアンロック
  unlockBadge(badgeId) {
    const badge = this.badges.find((b) => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      this.showNotification(`新しいバッジを獲得: ${badge.name} ${badge.icon}`);
      this.renderBadges();
    }
  }

  // レベルアップチェック
  checkLevelUp() {
    const requiredPoints = this.userData.level * 100;
    if (this.userData.points >= requiredPoints) {
      this.userData.level++;
      this.userData.points -= requiredPoints;
      this.showLevelUpEffect();
      this.showNotification(
        `レベルアップ！ Lv.${this.userData.level}になりました！`
      );
    }
  }

  // ミッション完了チェック
  checkMissionCompletion() {
    Object.keys(this.missions).forEach((missionId) => {
      const mission = this.missions[missionId];
      if (!mission.completed) {
        if (
          missionId === "daily-cooking" &&
          mission.current >= mission.target
        ) {
          mission.completed = true;
          this.userData.points += 50;
          this.showNotification("ミッション完了：今日は自炊しよう！ +50pt");
          this.unlockBadge("first_cooking");
        } else if (
          missionId === "record-expense" &&
          mission.current >= mission.target
        ) {
          mission.completed = true;
          this.userData.points += 20;
          this.showNotification("ミッション完了：家計簿記録 +20pt");
        } else if (missionId === "no-snack" && mission.current === 0) {
          // お菓子我慢は夜にチェック（デモ用に即座に完了）
          mission.completed = true;
          this.userData.points += 30;
          this.showNotification("ミッション完了：お菓子を我慢 +30pt");
        }
      }
    });
  }

  // ガチャを回す
  playGacha() {
    if (this.userData.points < 100) {
      this.showNotification("ポイントが足りません！", "error");
      return;
    }

    this.userData.points -= 100;

    // ガチャアニメーション
    const gachaDisplay = document.getElementById("gacha-display");
    const gachaItem = gachaDisplay.querySelector(".gacha-item");

    // アニメーション開始
    gachaItem.style.animation = "none";
    gachaItem.textContent = "🎲";

    setTimeout(() => {
      gachaItem.style.animation = "pulse 0.5s infinite";
    }, 100);

    // 結果決定
    setTimeout(() => {
      const result = this.drawGacha();
      gachaItem.textContent = result.icon;
      gachaItem.style.animation = "pulse 1s infinite";

      // ガチャアイテムを処理
      this.processGachaResult(result);

      this.inventory.push(result);
      this.showNotification(`ガチャ結果: ${result.item} (${result.rarity})`);
      this.renderInventory();
      this.renderRecipeCollection();
      this.renderGachaCollection();
      this.updateUI();
      this.saveData();
    }, 2000);
  }

  // ガチャ抽選
  drawGacha() {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const item of this.gachaItems) {
      cumulative += item.probability;
      if (random <= cumulative) {
        return { ...item };
      }
    }

    return this.gachaItems[0]; // フォールバック
  }

  // ガチャ結果処理
  processGachaResult(result) {
    if (result.type === "recipe") {
      const recipe = this.recipes.find((r) => r.id === result.recipeId);
      if (recipe && !recipe.unlocked) {
        recipe.unlocked = true;
        this.showNotification(
          `新しいレシピを覚えました: ${recipe.name} ${recipe.icon}`
        );
        this.renderRecipeCollection();
      }
    } else {
      // レシピ以外のガチャアイテムをコレクションに追加
      const collectionItem = this.gachaCollection.find((item) => {
        if (result.type === "character" && item.type === "character")
          return true;
        if (result.type === "title" && item.type === "title") return true;
        if (result.type === "bonus" && item.type === "bonus") return true;
        if (result.type === "tool" && item.type === "tool") return true;
        return false;
      });

      if (collectionItem && !collectionItem.unlocked) {
        collectionItem.unlocked = true;
      }

      if (result.type === "character") {
        this.showNotification(
          `キャラクターを獲得しました: ${result.item} ${result.icon}`
        );
      } else if (result.type === "title") {
        this.showNotification(
          `称号を獲得しました: ${result.item} ${result.icon}`
        );
      } else if (result.type === "bonus") {
        this.userData.points += 100; // ボーナスポイント付与
        this.showNotification(
          `特別ボーナスを獲得しました: ${result.item} ${result.icon} (+100pt)`
        );
      } else if (result.type === "tool") {
        this.showNotification(
          `伝説の料理道具を獲得しました: ${result.item} ${result.icon}`
        );
      }
    }
  }

  // キャラクターの表情更新
  updateCharacterMood() {
    const characterFace = document
      .getElementById("main-character")
      .querySelector(".character-face");

    if (this.userData.hp >= 80) {
      characterFace.textContent = "😊";
    } else if (this.userData.hp >= 60) {
      characterFace.textContent = "😐";
    } else if (this.userData.hp >= 40) {
      characterFace.textContent = "😟";
    } else {
      characterFace.textContent = "😢";
    }
  }

  // レベルアップエフェクト表示
  showLevelUpEffect() {
    const effect = document.getElementById("level-up-effect");
    effect.classList.add("show");

    setTimeout(() => {
      effect.classList.remove("show");
    }, 2000);
  }

  // 通知表示
  showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // UI更新
  updateUI() {
    // ヘッダー情報更新
    document.getElementById("user-level").textContent = this.userData.level;
    document.getElementById("user-points").textContent = this.userData.points;

    // キャラクター状態更新
    document.getElementById("hp-bar").style.width = `${this.userData.hp}%`;
    document.getElementById("hp-value").textContent = `${this.userData.hp}/100`;

    const skillProgress = (this.userData.cookingSkill / 10) * 100;
    document.getElementById("skill-bar").style.width = `${skillProgress}%`;
    document.getElementById("skill-value").textContent = `${Math.floor(
      this.userData.cookingSkill
    )}/10`;

    // ダッシュボード更新
    document.getElementById("monthly-savings").textContent =
      this.userData.monthlySavings;
    document.getElementById("cooking-count").textContent =
      this.userData.cookingCount;
    document.getElementById("goal-remaining").textContent = Math.max(
      0,
      10000 - this.userData.monthlySavings
    );

    // 最新の実績更新
    this.updateLatestAchievement();

    // 最近の支出更新
    this.renderRecentExpenses();

    // ガチャボタン状態更新
    const gachaBtn = document.getElementById("gacha-btn");
    gachaBtn.disabled = this.userData.points < 100;
  }

  // 最新実績更新
  updateLatestAchievement() {
    const achievementElement = document.getElementById("latest-achievement");
    const completedMissions = Object.keys(this.missions).filter(
      (id) => this.missions[id].completed
    );

    if (completedMissions.length > 0) {
      achievementElement.textContent = "今日のミッション達成中！";
    } else if (this.userData.cookingCount > 0) {
      achievementElement.textContent = `自炊 ${this.userData.cookingCount}回達成`;
    } else {
      achievementElement.textContent = "まだ実績がありません";
    }
  }

  // 最近の支出表示
  renderRecentExpenses() {
    const container = document.getElementById("expense-list");
    container.innerHTML = "";

    const recentExpenses = this.expenses.slice(0, 5);

    if (recentExpenses.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #666;">まだ支出記録がありません</p>';
      return;
    }

    recentExpenses.forEach((expense) => {
      const expenseElement = document.createElement("div");
      expenseElement.className = "expense-item fade-in";

      const icon = this.getCategoryIcon(expense.category);
      const pointsText =
        expense.points > 0 ? `+${expense.points}pt` : `${expense.points}pt`;
      const pointsColor = expense.points > 0 ? "#28a745" : "#dc3545";

      expenseElement.innerHTML = `
                <div class="expense-icon">${icon}</div>
                <div class="expense-details">
                    <div class="expense-amount">¥${expense.amount}</div>
                    <div class="expense-category">${
                      expense.description ||
                      this.getCategoryName(expense.category)
                    }</div>
                </div>
                <div style="color: ${pointsColor}; font-weight: bold;">${pointsText}</div>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="editExpense(${
                      expense.id
                    })">編集</button>
                    <button class="btn-delete" onclick="deleteExpense(${
                      expense.id
                    })">削除</button>
                </div>
            `;

      container.appendChild(expenseElement);
    });
  }

  // カテゴリーアイコン取得
  getCategoryIcon(category) {
    const icons = {
      cooking: "🍳",
      "eating-out": "🍽️",
      snack: "🍫",
      "vending-machine": "🥤",
      grocery: "🛒",
      other: "📝",
    };
    return icons[category] || "📝";
  }

  // カテゴリー名取得
  getCategoryName(category) {
    const names = {
      cooking: "自炊",
      "eating-out": "外食",
      snack: "お菓子",
      "vending-machine": "自販機",
      grocery: "食材購入",
      other: "その他",
    };
    return names[category] || "その他";
  }

  // ミッション状態更新
  updateMissions() {
    document.querySelectorAll(".mission-card").forEach((card) => {
      const missionId = card.dataset.mission;
      const mission = this.missions[missionId];
      const statusElement = card.querySelector(".mission-status");

      if (mission.completed) {
        card.classList.add("completed");
        statusElement.textContent = "完了";
        statusElement.className = "mission-status completed";
      } else {
        card.classList.remove("completed");
        statusElement.textContent = "未完了";
        statusElement.className = "mission-status incomplete";
      }
    });
  }

  // 料理図鑑表示
  renderRecipeCollection() {
    const container = document.getElementById("recipe-collection");
    container.innerHTML = "";

    this.recipes.forEach((recipe) => {
      const recipeElement = document.createElement("div");
      recipeElement.className = `recipe-card ${
        recipe.unlocked ? "" : "locked"
      }`;

      let sourceText = "";
      if (recipe.source === "gacha") {
        sourceText = "ガチャ限定";
      } else if (recipe.source === "cooking") {
        sourceText = "自炊で解放";
      } else {
        sourceText = "初期レシピ";
      }

      recipeElement.innerHTML = `
                <div class="recipe-icon">${
                  recipe.unlocked ? recipe.icon : "❓"
                }</div>
                <div class="recipe-name">${
                  recipe.unlocked ? recipe.name : "???"
                }</div>
                <div class="recipe-stats">
                    ${
                      recipe.unlocked
                        ? `難易度: ${"⭐".repeat(
                            recipe.difficulty
                          )}<br>節約: ¥${
                            recipe.savings
                          }<br><small>${sourceText}</small>`
                        : `ロック中<br><small>${sourceText}</small>`
                    }
                </div>
            `;

      container.appendChild(recipeElement);
    });
  }

  // バッジ表示
  renderBadges() {
    const container = document.getElementById("badges-container");
    container.innerHTML = "";

    this.badges.forEach((badge) => {
      const badgeElement = document.createElement("div");
      badgeElement.className = "badge-item";

      badgeElement.innerHTML = `
                <div class="badge-icon">${
                  badge.unlocked ? badge.icon : "🔒"
                }</div>
                <div class="badge-name">${
                  badge.unlocked ? badge.name : "ロック中"
                }</div>
            `;

      container.appendChild(badgeElement);
    });
  }

  // ガチャコレクション表示
  renderGachaCollection() {
    const container = document.getElementById("gacha-collection");
    container.innerHTML = "";

    this.gachaCollection.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = `recipe-card ${item.unlocked ? "" : "locked"}`;

      let rarityColor = "#666";
      if (item.rarity === "rare") rarityColor = "#3498db";
      else if (item.rarity === "epic") rarityColor = "#9b59b6";
      else if (item.rarity === "legendary") rarityColor = "#f39c12";

      itemElement.innerHTML = `
                <div class="recipe-icon">${
                  item.unlocked ? item.icon : "❓"
                }</div>
                <div class="recipe-name">${
                  item.unlocked ? item.name : "???"
                }</div>
                <div class="recipe-stats">
                    ${
                      item.unlocked
                        ? `<span style="color: ${rarityColor}; font-weight: bold;">${item.rarity.toUpperCase()}</span><br><small>ガチャで獲得</small>`
                        : `ロック中<br><small>ガチャで獲得可能</small>`
                    }
                </div>
            `;

      container.appendChild(itemElement);
    });
  }

  // インベントリ表示
  renderInventory() {
    const container = document.getElementById("inventory-items");
    container.innerHTML = "";

    if (this.inventory.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #666;">まだアイテムがありません</p>';
      return;
    }

    const inventoryGrid = document.createElement("div");
    inventoryGrid.className = "inventory-grid";

    this.inventory.forEach((item, index) => {
      const itemElement = document.createElement("div");
      itemElement.className = "inventory-item";
      itemElement.innerHTML = `
                <div>${item.icon}</div>
                <div style="font-size: 0.7rem;">${item.item}</div>
            `;
      inventoryGrid.appendChild(itemElement);
    });

    container.appendChild(inventoryGrid);
  }

  // データ保存
  saveData() {
    const data = {
      userData: this.userData,
      expenses: this.expenses,
      missions: this.missions,
      recipes: this.recipes,
      badges: this.badges,
      gachaCollection: this.gachaCollection,
      inventory: this.inventory,
    };
    localStorage.setItem("householdApp", JSON.stringify(data));
  }

  // データ読み込み
  loadData() {
    const savedData = localStorage.getItem("householdApp");
    if (savedData) {
      const data = JSON.parse(savedData);
      this.userData = { ...this.userData, ...data.userData };
      this.expenses = data.expenses || [];
      this.missions = { ...this.missions, ...data.missions };
      this.recipes = data.recipes || this.recipes;
      this.badges = data.badges || this.badges;
      this.gachaCollection = data.gachaCollection || this.gachaCollection;
      this.inventory = data.inventory || [];
    }
  }

  // 支出編集開始
  editExpense(expenseId) {
    const expense = this.expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    this.editingExpenseId = expenseId;

    // モーダルに現在の値を設定
    document.getElementById("edit-amount").value = expense.amount;
    document.getElementById("edit-category").value = expense.category;
    document.getElementById("edit-description").value =
      expense.description || "";

    // モーダル表示
    document.getElementById("edit-modal").classList.add("show");
  }

  // 支出編集保存
  saveExpenseEdit() {
    const newAmount = parseInt(document.getElementById("edit-amount").value);
    const newCategory = document.getElementById("edit-category").value;
    const newDescription = document.getElementById("edit-description").value;

    if (!newAmount || newAmount <= 0) {
      this.showNotification("金額を正しく入力してください", "error");
      return;
    }

    const expense = this.expenses.find((e) => e.id === this.editingExpenseId);
    if (!expense) return;

    // 古いデータの影響を取り消し
    this.revertExpenseEffects(expense);

    // 新しいデータを設定
    expense.amount = newAmount;
    expense.category = newCategory;
    expense.description = newDescription;
    expense.points = this.calculatePoints(newAmount, newCategory);

    // 新しいデータの影響を適用
    this.applyExpenseEffects(expense);

    // UI更新
    this.updateUI();
    this.updateMissions();
    this.saveData();

    // モーダル閉じる
    this.cancelExpenseEdit();

    this.showNotification("支出を編集しました");
  }

  // 支出編集キャンセル
  cancelExpenseEdit() {
    document.getElementById("edit-modal").classList.remove("show");
    this.editingExpenseId = null;
  }

  // 支出削除開始
  deleteExpense(expenseId) {
    this.deletingExpenseId = expenseId;
    document.getElementById("confirm-dialog").classList.add("show");
  }

  // 支出削除確認
  confirmDelete() {
    const expense = this.expenses.find((e) => e.id === this.deletingExpenseId);
    if (!expense) return;

    // データの影響を取り消し
    this.revertExpenseEffects(expense);

    // 支出を削除
    this.expenses = this.expenses.filter(
      (e) => e.id !== this.deletingExpenseId
    );

    // UI更新
    this.updateUI();
    this.updateMissions();
    this.saveData();

    // ダイアログ閉じる
    this.cancelDelete();

    this.showNotification("支出を削除しました");
  }

  // 削除キャンセル
  cancelDelete() {
    document.getElementById("confirm-dialog").classList.remove("show");
    this.deletingExpenseId = null;
  }

  // 支出の影響を取り消し
  revertExpenseEffects(expense) {
    // ポイントを取り消し
    this.userData.points -= expense.points;

    // カテゴリー別の影響を取り消し
    if (expense.category === "cooking") {
      this.userData.cookingCount = Math.max(0, this.userData.cookingCount - 1);
      this.userData.cookingSkill = Math.max(
        0,
        this.userData.cookingSkill - 0.2
      );
      this.userData.hp = Math.max(0, this.userData.hp - 5);
      this.missions["daily-cooking"].current = Math.max(
        0,
        this.missions["daily-cooking"].current - 1
      );
    } else if (expense.category === "eating-out") {
      this.userData.hp = Math.min(100, this.userData.hp + 3);
    } else if (expense.category === "snack") {
      this.userData.hp = Math.min(100, this.userData.hp + 2);
      this.missions["no-snack"].current = Math.max(
        0,
        this.missions["no-snack"].current - 1
      );
    } else if (expense.category === "vending-machine") {
      this.userData.hp = Math.min(100, this.userData.hp + 1);
    }

    // 節約額を取り消し
    if (
      expense.category !== "eating-out" &&
      expense.category !== "snack" &&
      expense.category !== "vending-machine"
    ) {
      this.userData.monthlySavings = Math.max(
        0,
        this.userData.monthlySavings -
          this.getExpectedSavings(expense.category, expense.amount)
      );
    }

    // 記録回数を取り消し
    this.userData.expRecorded = Math.max(0, this.userData.expRecorded - 1);
    this.missions["record-expense"].current = Math.max(
      0,
      this.missions["record-expense"].current - 1
    );
  }

  // 支出の影響を適用
  applyExpenseEffects(expense) {
    // ポイントを追加
    this.userData.points += expense.points;

    // カテゴリー別の影響を適用
    if (expense.category === "cooking") {
      this.userData.cookingCount++;
      this.userData.cookingSkill = Math.min(
        10,
        this.userData.cookingSkill + 0.2
      );
      this.userData.hp = Math.min(100, this.userData.hp + 5);
      this.missions["daily-cooking"].current++;
    } else if (expense.category === "eating-out") {
      this.userData.hp = Math.max(0, this.userData.hp - 3);
    } else if (expense.category === "snack") {
      this.userData.hp = Math.max(0, this.userData.hp - 2);
      this.missions["no-snack"].current++;
    } else if (expense.category === "vending-machine") {
      this.userData.hp = Math.max(0, this.userData.hp - 1);
    }

    // 節約額を追加
    if (
      expense.category !== "eating-out" &&
      expense.category !== "snack" &&
      expense.category !== "vending-machine"
    ) {
      this.userData.monthlySavings += this.getExpectedSavings(
        expense.category,
        expense.amount
      );
    }

    // 記録回数を追加
    this.userData.expRecorded++;
    this.missions["record-expense"].current++;

    // レベルアップチェック
    this.checkLevelUp();

    // ミッション完了チェック
    this.checkMissionCompletion();

    // キャラクター表情更新
    this.updateCharacterMood();
  }
}

// アプリケーション初期化
let app;

// 支出追加関数（HTMLから呼び出し）
function addExpense() {
  app.addExpense();
}

// ガチャ関数（HTMLから呼び出し）
function playGacha() {
  app.playGacha();
}

// 支出編集関数（HTMLから呼び出し）
function editExpense(expenseId) {
  app.editExpense(expenseId);
}

// 支出編集保存関数（HTMLから呼び出し）
function saveExpenseEdit() {
  app.saveExpenseEdit();
}

// 支出編集キャンセル関数（HTMLから呼び出し）
function cancelExpenseEdit() {
  app.cancelExpenseEdit();
}

// 支出削除関数（HTMLから呼び出し）
function deleteExpense(expenseId) {
  app.deleteExpense(expenseId);
}

// 支出削除確認関数（HTMLから呼び出し）
function confirmDelete() {
  app.confirmDelete();
}

// 削除キャンセル関数（HTMLから呼び出し）
function cancelDelete() {
  app.cancelDelete();
}

// ページ読み込み完了時にアプリを初期化
document.addEventListener("DOMContentLoaded", () => {
  app = new HouseholdApp();

  // デモ用のサンプルデータ追加（初回のみ）
  if (app.expenses.length === 0) {
    // サンプル支出を追加
    setTimeout(() => {
      app.showNotification(
        "節約マスターへようこそ！自炊や節約でポイントを貯めてレベルアップしよう！"
      );
    }, 1000);
  }
});
