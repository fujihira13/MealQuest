// 食費管理アプリ - メインJavaScript
class FoodExpenseApp {
    constructor() {
        // アプリデータの初期化
        this.userData = {
            level: 1,
            points: 0,
            totalSavings: 0,
            monthlySavings: 0,
            monthlyExpense: 0,
            cookingCount: 0,
            allowanceUsed: 0,
            lastUpdated: new Date().toISOString().split('T')[0],
            savingsLevel: 1  // 節約専用レベル
        };

        // ガチャコレクション
        this.collection = [];
        this.gachaItems = [
            { id: 1, name: '金のコイン', icon: '🪙', rarity: 'common', description: '普通の金貨です' },
            { id: 2, name: '節約レシピ本', icon: '📚', rarity: 'common', description: '簡単節約レシピが載っています' },
            { id: 3, name: 'おにぎり', icon: '🍙', rarity: 'common', description: '美味しいおにぎりです' },
            { id: 4, name: '魔法の財布', icon: '👛', rarity: 'rare', description: '節約効果がアップします' },
            { id: 5, name: '料理の達人証', icon: '🏆', rarity: 'rare', description: '自炊ポイントがアップします' },
            { id: 6, name: '宝石', icon: '💎', rarity: 'epic', description: 'キラキラ光る宝石です' },
            { id: 7, name: '黄金のフライパン', icon: '🍳', rarity: 'epic', description: '何でも美味しく作れます' },
            { id: 8, name: '伝説の食材', icon: '🌟', rarity: 'legendary', description: '最高級の食材です' },
            { id: 9, name: '節約の王冠', icon: '👑', rarity: 'legendary', description: '節約マスターの証です' },
            { id: 10, name: 'ピザ', icon: '🍕', rarity: 'common', description: '美味しいピザです' },
            { id: 11, name: 'ハンバーガー', icon: '🍔', rarity: 'common', description: 'ジューシーなハンバーガーです' },
            { id: 12, name: 'アイスクリーム', icon: '🍦', rarity: 'rare', description: '冷たくて甘いアイスです' },
            { id: 13, name: 'ケーキ', icon: '🎂', rarity: 'rare', description: '特別な日のケーキです' },
            { id: 14, name: 'ドラゴンフルーツ', icon: '🐉', rarity: 'epic', description: '神秘的な果物です' },
            { id: 15, name: '虹色のキャンディ', icon: '🌈', rarity: 'legendary', description: '食べると幸せになれます' }
        ];

        // 目標設定
        this.goals = {
            monthlyExpenseGoal: 25000,
            allowanceGoal: 15000,
            cookingGoal: 20
        };

        // 支出記録
        this.expenses = [];
        
        // 自炊記録
        this.cookingRecords = [];
        
        // 節約記録
        this.savingsRecords = [];

        // ミッション管理
        this.missions = {
            daily: {},
            weekly: {},
            lastDailyReset: '',
            lastWeeklyReset: '',
            completedHistory: []
        };

        // バッジ・称号システム
        this.badges = {
            earned: [],
            currentTitle: 'beginner'
        };

        // 連続記録システム
        this.streaks = {
            noWasteStreak: 0,
            lastNoWasteDate: '',
            bestNoWasteStreak: 0,
            snackFreeStreak: 0,
            lastSnackFreeDate: '',
            bestSnackFreeStreak: 0
        };

        // 節約額と買える物の対応表
        this.savingsEquivalents = [
            { amount: 120, item: 'ペットボトル飲料1本', icon: '🥤' },
            { amount: 200, item: 'おにぎり1個', icon: '🍙' },
            { amount: 300, item: 'コンビニサンドイッチ', icon: '🥪' },
            { amount: 500, item: 'コンビニ弁当', icon: '🍱' },
            { amount: 800, item: 'ファストフード1食', icon: '🍔' },
            { amount: 1000, item: '好きな文庫本1冊', icon: '📚' },
            { amount: 1500, item: 'スタバのコーヒー2杯', icon: '☕' },
            { amount: 2000, item: 'ランチ外食1回', icon: '🍽️' },
            { amount: 3000, item: '映画鑑賞チケット', icon: '🎬' },
            { amount: 5000, item: '洋服1着', icon: '👕' },
            { amount: 8000, item: '高級ランチコース', icon: '🍽️' },
            { amount: 10000, item: '欲しかった雑貨', icon: '🛍️' },
            { amount: 15000, item: '美容院でのトリートメント', icon: '💇' },
            { amount: 20000, item: '友達との旅行(日帰り)', icon: '🚌' },
            { amount: 30000, item: '新しいスニーカー', icon: '👟' },
            { amount: 50000, item: '憧れのブランドバッグ', icon: '👜' },
            { amount: 100000, item: '1泊2日の温泉旅行', icon: '♨️' }
        ];
        
        this.badgeDefinitions = [
            // 自炊関連
            { id: 'cooking_start', category: 'cooking', title: '自炊デビュー', description: '初回自炊記録', icon: '🍳', requirement: { type: 'cooking_count', value: 1 }, earned: false },
            { id: 'cooking_novice', category: 'cooking', title: '自炊初心者', description: '自炊5回達成', icon: '👨‍🍳', requirement: { type: 'cooking_count', value: 5 }, earned: false },
            { id: 'cooking_adept', category: 'cooking', title: '自炊上手', description: '自炊20回達成', icon: '🧑‍🍳', requirement: { type: 'cooking_count', value: 20 }, earned: false },
            { id: 'cooking_master', category: 'cooking', title: '自炊マスター', description: '自炊50回達成', icon: '👑', requirement: { type: 'cooking_count', value: 50 }, earned: false },
            { id: 'cooking_legend', category: 'cooking', title: '料理の達人', description: '自炊100回達成', icon: '🌟', requirement: { type: 'cooking_count', value: 100 }, earned: false },

            // 節約関連
            { id: 'savings_start', category: 'savings', title: '節約デビュー', description: '初回節約記録', icon: '💰', requirement: { type: 'savings_count', value: 1 }, earned: false },
            { id: 'savings_saver', category: 'savings', title: '節約家', description: '1000円節約達成', icon: '💳', requirement: { type: 'total_savings', value: 1000 }, earned: false },
            { id: 'savings_expert', category: 'savings', title: '節約上手', description: '5000円節約達成', icon: '💎', requirement: { type: 'total_savings', value: 5000 }, earned: false },
            { id: 'savings_master', category: 'savings', title: '節約マスター', description: '10000円節約達成', icon: '👑', requirement: { type: 'total_savings', value: 10000 }, earned: false },
            { id: 'savings_champion', category: 'savings', title: '節約チャンピオン', description: '30000円節約達成', icon: '🏆', requirement: { type: 'total_savings', value: 30000 }, earned: false },
            { id: 'savings_legend', category: 'savings', title: '節約の王様', description: '50000円節約達成', icon: '👑', requirement: { type: 'total_savings', value: 50000 }, earned: false },
            
            // 節約レベル関連
            { id: 'savings_level_5', category: 'savings', title: '節約ビギナー', description: '節約レベル5達成', icon: '⭐', requirement: { type: 'savings_level', value: 5 }, earned: false },
            { id: 'savings_level_10', category: 'savings', title: '節約アドバンス', description: '節約レベル10達成', icon: '⭐⭐', requirement: { type: 'savings_level', value: 10 }, earned: false },
            { id: 'savings_level_20', category: 'savings', title: '節約プロ', description: '節約レベル20達成', icon: '⭐⭐⭐', requirement: { type: 'savings_level', value: 20 }, earned: false },
            
            // 連続記録関連
            { id: 'streak_week', category: 'special', title: '継続の力', description: '7日連続無駄遣いなし', icon: '🔥', requirement: { type: 'no_waste_streak', value: 7 }, earned: false },
            { id: 'streak_month', category: 'special', title: '鉄の意志', description: '30日連続無駄遣いなし', icon: '💪', requirement: { type: 'no_waste_streak', value: 30 }, earned: false },

            // レベル関連
            { id: 'level_5', category: 'level', title: '成長中', description: 'レベル5達成', icon: '⭐', requirement: { type: 'level', value: 5 }, earned: false },
            { id: 'level_10', category: 'level', title: '中級者', description: 'レベル10達成', icon: '⭐⭐', requirement: { type: 'level', value: 10 }, earned: false },
            { id: 'level_20', category: 'level', title: '上級者', description: 'レベル20達成', icon: '⭐⭐⭐', requirement: { type: 'level', value: 20 }, earned: false },
            { id: 'level_50', category: 'level', title: 'エキスパート', description: 'レベル50達成', icon: '🌟', requirement: { type: 'level', value: 50 }, earned: false },

            // 特別称号
            { id: 'first_week', category: 'special', title: '継続は力なり', description: '7日連続記録', icon: '🔥', requirement: { type: 'consecutive_days', value: 7 }, earned: false },
            { id: 'monthly_goal', category: 'special', title: '目標達成者', description: '月間目標達成', icon: '🎯', requirement: { type: 'monthly_goal_achieved', value: 1 }, earned: false },
            { id: 'gacha_collector', category: 'special', title: 'コレクター', description: 'ガチャアイテム10種獲得', icon: '🎁', requirement: { type: 'gacha_items', value: 10 }, earned: false },
            { id: 'mission_master', category: 'special', title: 'ミッションマスター', description: 'ミッション20個達成', icon: '🏅', requirement: { type: 'missions_completed', value: 20 }, earned: false }
        ];

        // UI状態
        this.currentInputCategory = '';
        this.currentAmount = '';
        this.selectedMeal = '';
        this.editingRecord = null;

        // データの読み込み
        this.loadData();
        
        // 初期化
        this.init();
        
        // データ更新（月が変わった場合の対応）
        this.updateSavingsData();
    }

    // アプリ初期化
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.showTab('home');
        this.setTodayDate();
        this.checkDailyReset();
        this.initCharts();
        this.initMissions();
        this.initBadges();
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });

        // モーダル外クリックで閉じる
        document.getElementById('input-modal').addEventListener('click', (e) => {
            if (e.target.id === 'input-modal') {
                this.hideInputScreen();
            }
        });

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideInputScreen();
                this.cancelAction();
            }
        });
    }

    // タブ表示切り替え
    showTab(tabName) {
        // すべてのタブコンテンツを非表示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // すべてのタブボタンを非アクティブ
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 指定されたタブを表示
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 統計タブの場合は記録を更新
        if (tabName === 'stats') {
            this.loadRecordsForDate();
        }
        // コレクションタブの場合はコレクションを更新
        if (tabName === 'collection') {
            this.updateCollectionDisplay();
        }
    }

    // 入力画面を表示
    showInputScreen(category) {
        this.currentInputCategory = category;
        this.currentAmount = '';
        this.selectedMeal = '';
        
        document.getElementById('input-category-title').textContent = category;
        document.getElementById('amount-input').value = '';
        
        // 食事ボタンをリセット
        document.querySelectorAll('.meal-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.getElementById('input-modal').classList.add('show');
    }

    // 入力画面を非表示
    hideInputScreen() {
        document.getElementById('input-modal').classList.remove('show');
        this.currentInputCategory = '';
        this.currentAmount = '';
        this.selectedMeal = '';
        this.editingRecord = null;
    }

    // 数字キーパッド操作
    addDigit(digit) {
        if (this.currentAmount.length < 8) {
            this.currentAmount += digit;
            this.updateAmountDisplay();
        }
    }

    deleteDigit() {
        this.currentAmount = this.currentAmount.slice(0, -1);
        this.updateAmountDisplay();
    }

    clearAmount() {
        this.currentAmount = '';
        this.updateAmountDisplay();
    }

    updateAmountDisplay() {
        const display = this.currentAmount ? parseInt(this.currentAmount).toLocaleString() : '';
        document.getElementById('amount-input').value = display;
    }

    // 食事時間帯選択
    selectMeal(meal, button) {
        document.querySelectorAll('.meal-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');
        this.selectedMeal = meal;
    }

    // 支出記録保存
    saveExpenseRecord() {
        if (!this.currentAmount || !this.selectedMeal) {
            this.showNotification('金額と時間帯を選択してください', 'error');
            return;
        }

        const amount = parseInt(this.currentAmount);
        const record = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            category: this.currentInputCategory,
            amount: amount,
            meal: this.selectedMeal,
            timestamp: new Date().toISOString()
        };

        if (this.editingRecord) {
            // 編集モード
            const index = this.expenses.findIndex(e => e.id === this.editingRecord.id);
            if (index !== -1) {
                this.expenses[index] = { ...this.editingRecord, ...record, id: this.editingRecord.id };
            }
            this.editingRecord = null;
        } else {
            // 新規追加
            this.expenses.unshift(record);
        }

        // データ更新
        this.updateExpenseData();
        this.updateSavingsData();
        this.updateMissionProgress('expense_record');
        this.resetStreakIfNeeded(this.currentInputCategory);
        this.updateUI();
        this.saveData();
        this.hideInputScreen();

        this.showNotification(`${this.currentInputCategory}の支出を記録しました: ¥${amount.toLocaleString()}`);
    }

    // 自炊記録
    recordCooking(meal, button) {
        const today = new Date().toISOString().split('T')[0];
        const existingRecord = this.cookingRecords.find(r => r.date === today && r.meal === meal);

        if (existingRecord) {
            // 既に記録済みの場合は削除
            this.cookingRecords = this.cookingRecords.filter(r => !(r.date === today && r.meal === meal));
            button.classList.remove('active');
            this.showNotification(`${this.getMealName(meal)}の自炊記録を削除しました`);
        } else {
            // 新規記録
            const record = {
                id: Date.now(),
                date: today,
                meal: meal,
                timestamp: new Date().toISOString()
            };
            this.cookingRecords.push(record);
            button.classList.add('active');
            this.userData.points += 20; // 自炊でポイント獲得
            this.showNotification(`${this.getMealName(meal)}の自炊を記録しました！ +20pt`);
            this.updateMissionProgress('cooking');
        }

        this.updateCookingData();
        this.updateSavingsData();
        this.updateBadgeProgress();
        this.updateUI();
        this.saveData();
    }

    // 節約記録
    recordSavings(amount) {
        const record = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            timestamp: new Date().toISOString()
        };

        this.savingsRecords.push(record);
        this.userData.totalSavings += amount;
        this.userData.points += Math.floor(amount / 10); // 節約額の10%をポイントで還元

        // 今月の貯金額を更新
        this.updateSavingsData();
        this.updateMissionProgress('savings');
        this.updateMissionProgress('total_savings', amount);
        this.updateBadgeProgress();
        this.updateUI();
        this.saveData();
        this.showNotification(`節約成功！ ¥${amount.toLocaleString()}を節約貯金に追加しました！ +${Math.floor(amount / 10)}pt`);
    }

    // カスタム節約記録
    showCustomSavings() {
        const amount = prompt('節約できた金額を入力してください（円）');
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
            this.recordSavings(parseInt(amount));
        }
    }

    // ガチャ
    playGacha() {
        if (this.userData.points < 100) {
            this.showNotification('ポイントが不足しています（100pt必要）', 'error');
            return;
        }

        this.userData.points -= 100;
        
        // レアリティ確率設定
        const rarityProbabilities = {
            'common': 60,
            'rare': 25,
            'epic': 12,
            'legendary': 3
        };

        // レアリティを決定
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity = 'common';

        for (const [rarity, probability] of Object.entries(rarityProbabilities)) {
            cumulative += probability;
            if (random <= cumulative) {
                selectedRarity = rarity;
                break;
            }
        }

        // 該当レアリティのアイテムから選択
        const availableItems = this.gachaItems.filter(item => item.rarity === selectedRarity);
        const selectedItem = availableItems[Math.floor(Math.random() * availableItems.length)];

        // コレクションに追加
        const existingItem = this.collection.find(item => item.id === selectedItem.id);
        if (existingItem) {
            existingItem.count += 1;
        } else {
            this.collection.push({ ...selectedItem, count: 1, obtained: new Date().toISOString() });
        }

        // レアリティボーナスポイント
        const bonusPoints = {
            'common': 0,
            'rare': 20,
            'epic': 50,
            'legendary': 100
        };

        if (bonusPoints[selectedRarity] > 0) {
            this.userData.points += bonusPoints[selectedRarity];
        }

        this.updateUI();
        this.updateCollectionDisplay();
        this.saveData();
        
        const rarityText = {
            'common': '⭐',
            'rare': '⭐⭐',
            'epic': '⭐⭐⭐',
            'legendary': '⭐⭐⭐⭐'
        };

        this.showNotification(`ガチャ結果: ${rarityText[selectedRarity]} ${selectedItem.name} ${selectedItem.icon}を獲得！${bonusPoints[selectedRarity] > 0 ? ` (+${bonusPoints[selectedRarity]}pt)` : ''}`);
    }

    // 支出データ更新
    updateExpenseData() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = this.expenses.filter(e => e.date.startsWith(currentMonth));
        
        this.userData.monthlyExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        // 消費許容額の更新（スーパー以外）
        const wastefulExpenses = monthlyExpenses.filter(e => e.category !== 'スーパー');
        this.userData.allowanceUsed = wastefulExpenses.reduce((sum, e) => sum + e.amount, 0);
    }

    // 自炊データ更新
    updateCookingData() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyCooking = this.cookingRecords.filter(r => r.date.startsWith(currentMonth));
        this.userData.cookingCount = monthlyCooking.length;
    }

    // 貯金データ更新
    updateSavingsData() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlySavingsRecords = this.savingsRecords.filter(r => r.date.startsWith(currentMonth));
        this.userData.monthlySavings = monthlySavingsRecords.reduce((sum, r) => sum + r.amount, 0);
    }

    // UI更新
    updateUI() {
        // ヘッダー情報
        document.getElementById('user-level').textContent = this.userData.level;
        const userPointsElement = document.getElementById('user-points');
        if (userPointsElement) {
            userPointsElement.textContent = this.userData.points.toLocaleString();
        }

        // レベルアップ条件表示
        const pointsToNext = (this.userData.level * 100) - this.userData.points;
        const progressPercent = (this.userData.points / (this.userData.level * 100)) * 100;
        
        const pointsToNextElement = document.getElementById('points-to-next');
        const levelProgressBar = document.getElementById('level-progress-bar');
        
        if (pointsToNextElement) {
            pointsToNextElement.textContent = Math.max(0, pointsToNext).toLocaleString();
        }
        if (levelProgressBar) {
            levelProgressBar.style.width = `${Math.min(100, progressPercent)}%`;
        }

        // ゲージ
        const remaining = Math.max(0, this.goals.allowanceGoal - this.userData.allowanceUsed);
        const gaugePercent = Math.max(0, (remaining / this.goals.allowanceGoal) * 100);
        document.getElementById('allowance-gauge').style.width = `${gaugePercent}%`;
        document.getElementById('remaining-allowance').textContent = remaining.toLocaleString();
        document.getElementById('total-allowance').textContent = this.goals.allowanceGoal.toLocaleString();

        // アバター・ステータス
        document.getElementById('savings-total').textContent = this.userData.totalSavings.toLocaleString();
        const monthlySavingsElement = document.getElementById('monthly-savings');
        if (monthlySavingsElement) {
            monthlySavingsElement.textContent = this.userData.monthlySavings.toLocaleString();
        }
        document.getElementById('cooking-count').textContent = this.userData.cookingCount;
        document.getElementById('monthly-expense').textContent = this.userData.monthlyExpense.toLocaleString();

        // 節約レベル表示
        const savingsLevelElement = document.getElementById('savings-level');
        const savingsToNextElement = document.getElementById('savings-to-next');
        if (savingsLevelElement) {
            savingsLevelElement.textContent = this.userData.savingsLevel;
        }
        if (savingsToNextElement) {
            const nextSavings = this.userData.savingsLevel * 1000;
            const remaining = Math.max(0, nextSavings - this.userData.totalSavings);
            savingsToNextElement.textContent = remaining.toLocaleString();
        }

        // 統計タブ
        document.getElementById('total-expense').textContent = this.userData.monthlyExpense.toLocaleString();
        document.getElementById('expense-goal').textContent = this.goals.monthlyExpenseGoal.toLocaleString();
        document.getElementById('total-savings').textContent = this.userData.totalSavings.toLocaleString();
        document.getElementById('cooking-total').textContent = this.userData.cookingCount;
        document.getElementById('cooking-goal').textContent = this.goals.cookingGoal;

        // 自炊ボタンの状態更新
        this.updateCookingButtons();

        // 連続記録表示更新
        this.updateStreakDisplay();

        // 節約額で買える物の表示更新
        this.updateSavingsEquivalent();

        // 貯金目標の進捗更新
        this.updateSavingsGoals();

        // レベルアップチェック
        this.checkLevelUp();
    }

    // 自炊ボタンの状態更新
    updateCookingButtons() {
        const today = new Date().toISOString().split('T')[0];
        const todayCooking = this.cookingRecords.filter(r => r.date === today);

        document.querySelectorAll('.cooking-btn').forEach(btn => {
            const meal = btn.dataset.meal;
            const hasRecord = todayCooking.some(r => r.meal === meal);
            btn.classList.toggle('active', hasRecord);
        });
    }

    // レベルアップチェック
    checkLevelUp() {
        const requiredPoints = this.userData.level * 100;
        if (this.userData.points >= requiredPoints) {
            this.userData.level++;
            this.userData.points -= requiredPoints;
            this.showNotification(`レベルアップ！ Lv.${this.userData.level}になりました！`);
            this.updateBadgeProgress();
        }
        
        // 節約レベルアップチェック
        this.checkSavingsLevelUp();
    }

    // 節約レベルアップチェック
    checkSavingsLevelUp() {
        const requiredSavings = this.userData.savingsLevel * 1000; // 1000円ごとにレベルアップ
        if (this.userData.totalSavings >= requiredSavings) {
            const newLevel = Math.floor(this.userData.totalSavings / 1000) + 1;
            if (newLevel > this.userData.savingsLevel) {
                const oldLevel = this.userData.savingsLevel;
                this.userData.savingsLevel = newLevel;
                
                // レベルアップ報酬
                const bonus = (newLevel - oldLevel) * 20; // レベルあたり20pt
                this.userData.points += bonus;
                
                this.showNotification(`節約レベルアップ！ 節約Lv.${this.userData.savingsLevel}になりました！ (+${bonus}pt)`, 'success');
                this.updateBadgeProgress();
            }
        }
    }

    // 日付リセットチェック
    checkDailyReset() {
        const today = new Date().toISOString().split('T')[0];
        if (this.userData.lastUpdated !== today) {
            this.userData.lastUpdated = today;
            this.saveData();
        }
    }

    // 今日の日付をセット
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('record-date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    // 指定日の記録を読み込み
    loadRecordsForDate() {
        const dateInput = document.getElementById('record-date');
        const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        
        const dayExpenses = this.expenses.filter(e => e.date === selectedDate);
        const dayCooking = this.cookingRecords.filter(r => r.date === selectedDate);
        
        const recordList = document.getElementById('record-list');
        recordList.innerHTML = '';

        if (dayExpenses.length === 0 && dayCooking.length === 0) {
            recordList.innerHTML = '<p class="no-records">この日の記録はありません</p>';
            return;
        }

        // 支出記録を表示
        dayExpenses.forEach(expense => {
            const recordItem = this.createRecordItem(expense, 'expense');
            recordList.appendChild(recordItem);
        });

        // 自炊記録を表示
        dayCooking.forEach(cooking => {
            const recordItem = this.createRecordItem(cooking, 'cooking');
            recordList.appendChild(recordItem);
        });
    }

    // 記録アイテムを作成
    createRecordItem(record, type) {
        const item = document.createElement('div');
        item.className = `record-item ${type}-record`;

        if (type === 'expense') {
            item.innerHTML = `
                <div class="record-info">
                    <span class="record-category">${this.getCategoryIcon(record.category)} ${record.category}</span>
                    <span class="record-amount">¥${record.amount.toLocaleString()}</span>
                    <span class="record-time">${this.getMealName(record.meal)}</span>
                </div>
                <div class="record-actions">
                    <button class="edit-btn" onclick="app.editRecord(${record.id}, 'expense')">編集</button>
                    <button class="delete-btn" onclick="app.deleteRecord(${record.id}, 'expense')">削除</button>
                </div>
            `;
        } else {
            item.innerHTML = `
                <div class="record-info">
                    <span class="record-category">👨‍🍳 自炊記録</span>
                    <span class="record-amount">${this.getMealName(record.meal)}</span>
                    <span class="record-time"></span>
                </div>
                <div class="record-actions">
                    <button class="delete-btn" onclick="app.deleteRecord(${record.id}, 'cooking')">削除</button>
                </div>
            `;
        }

        return item;
    }

    // 記録編集
    editRecord(recordId, type) {
        if (type === 'expense') {
            const record = this.expenses.find(e => e.id === recordId);
            if (record) {
                this.editingRecord = record;
                this.showInputScreen(record.category);
                
                // 既存の値をセット
                setTimeout(() => {
                    this.currentAmount = record.amount.toString();
                    this.updateAmountDisplay();
                    
                    const mealBtn = document.querySelector(`[data-meal="${record.meal}"]`);
                    if (mealBtn) {
                        this.selectMeal(record.meal, mealBtn);
                    }
                }, 100);
            }
        }
    }

    // 記録削除
    deleteRecord(recordId, type) {
        this.showConfirmDialog(
            `この${type === 'expense' ? '支出' : '自炊'}記録を削除しますか？`,
            () => {
                if (type === 'expense') {
                    this.expenses = this.expenses.filter(e => e.id !== recordId);
                    this.updateExpenseData();
                } else {
                    this.cookingRecords = this.cookingRecords.filter(r => r.id !== recordId);
                    this.updateCookingData();
                }
                
                this.updateUI();
                this.saveData();
                this.loadRecordsForDate();
                this.showNotification('記録を削除しました');
            }
        );
    }

    // 目標更新
    updateGoal(type, value) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue <= 0) return;

        switch (type) {
            case 'expense':
                this.goals.monthlyExpenseGoal = numValue;
                break;
            case 'allowance':
                this.goals.allowanceGoal = numValue;
                break;
            case 'cooking':
                this.goals.cookingGoal = numValue;
                break;
        }

        this.updateUI();
        this.saveData();
        this.showNotification('目標を更新しました');
    }

    // 確認ダイアログ表示
    showConfirmDialog(message, onConfirm) {
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-dialog').classList.add('show');
        this.currentConfirmAction = onConfirm;
    }

    // 確認アクション実行
    confirmAction() {
        if (this.currentConfirmAction) {
            this.currentConfirmAction();
            this.currentConfirmAction = null;
        }
        this.cancelAction();
    }

    // アクションキャンセル
    cancelAction() {
        document.getElementById('confirm-dialog').classList.remove('show');
        this.currentConfirmAction = null;
    }

    // 通知表示
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const content = notification.querySelector('.notification-content');
        
        content.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // ユーティリティ関数
    getCategoryIcon(category) {
        const icons = {
            'スーパー': '🛒',
            '自販機': '🥤',
            'コンビニ': '🏪',
            '飲み会': '🍻',
            'デート': '💕',
            'その他': '📝'
        };
        return icons[category] || '📝';
    }

    getMealName(meal) {
        const names = {
            'morning': '朝',
            'lunch': '昼',
            'dinner': '夜'
        };
        return names[meal] || meal;
    }

    // レアリティフィルター
    filterByRarity(rarity, button) {
        // フィルターボタンの状態更新
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // コレクション表示更新
        this.updateCollectionDisplay();
    }

    // コレクション表示更新
    updateCollectionDisplay() {
        const collectionGrid = document.getElementById('collection-grid');
        const collectionCount = document.getElementById('collection-count');
        const completionRate = document.getElementById('completion-rate');
        
        if (!collectionGrid) return;

        // 統計更新
        if (collectionCount) {
            collectionCount.textContent = this.collection.reduce((sum, item) => sum + item.count, 0);
        }
        if (completionRate) {
            const uniqueItems = this.collection.length;
            const totalItems = this.gachaItems.length;
            const rate = Math.round((uniqueItems / totalItems) * 100);
            completionRate.textContent = rate;
        }

        // フィルター取得
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.rarity || 'all';
        
        // アイテム表示
        collectionGrid.innerHTML = '';
        
        const itemsToShow = activeFilter === 'all' ? this.gachaItems : this.gachaItems.filter(item => item.rarity === activeFilter);
        
        if (itemsToShow.length === 0) {
            collectionGrid.innerHTML = '<div class="collection-empty"><div class="collection-empty-icon">📦</div><p>アイテムがありません</p></div>';
            return;
        }

        itemsToShow.forEach(gachaItem => {
            const collectionItem = this.collection.find(item => item.id === gachaItem.id);
            const isObtained = !!collectionItem;
            
            const itemElement = document.createElement('div');
            itemElement.className = `collection-item rarity-${gachaItem.rarity} ${!isObtained ? 'locked' : ''}`;
            
            itemElement.innerHTML = `
                <div class="item-icon">${isObtained ? gachaItem.icon : '❓'}</div>
                <div class="item-name">${isObtained ? gachaItem.name : '???'}</div>
                <div class="item-rarity">${this.getRarityText(gachaItem.rarity)}</div>
                <div class="item-count">${isObtained ? `×${collectionItem.count}` : '未獲得'}</div>
            `;
            
            collectionGrid.appendChild(itemElement);
        });
    }

    // レアリティテキスト取得
    getRarityText(rarity) {
        const rarityTexts = {
            'common': '⭐ コモン',
            'rare': '⭐⭐ レア',
            'epic': '⭐⭐⭐ エピック',
            'legendary': '⭐⭐⭐⭐ レジェンド'
        };
        return rarityTexts[rarity] || rarity;
    }

    // データ保存
    saveData() {
        const data = {
            userData: this.userData,
            goals: this.goals,
            expenses: this.expenses,
            cookingRecords: this.cookingRecords,
            savingsRecords: this.savingsRecords,
            collection: this.collection,
            missions: this.missions,
            badges: this.badges,
            streaks: this.streaks
        };
        localStorage.setItem('foodExpenseApp', JSON.stringify(data));
        this.updateCharts();
    }

    // データ読み込み
    loadData() {
        const savedData = localStorage.getItem('foodExpenseApp');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.userData = { ...this.userData, ...data.userData };
            this.goals = { ...this.goals, ...data.goals };
            this.expenses = data.expenses || [];
            this.cookingRecords = data.cookingRecords || [];
            this.savingsRecords = data.savingsRecords || [];
            this.collection = data.collection || [];
            this.missions = data.missions || {
                daily: {},
                weekly: {},
                lastDailyReset: '',
                lastWeeklyReset: '',
                completedHistory: []
            };
            this.badges = data.badges || {
                earned: [],
                currentTitle: 'beginner'
            };
            this.streaks = data.streaks || {
                noWasteStreak: 0,
                lastNoWasteDate: '',
                bestNoWasteStreak: 0,
                snackFreeStreak: 0,
                lastSnackFreeDate: '',
                bestSnackFreeStreak: 0
            };
        }
    }

    // グラフ初期化
    initCharts() {
        this.expenseChart = null;
        this.categoryChart = null;
        this.cookingChart = null;
        this.savingsChart = null;
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    }

    // グラフ描画
    renderCharts() {
        this.renderExpenseChart();
        this.renderCategoryChart();
        this.renderCookingChart();
        this.renderSavingsChart();
    }

    // 支出推移グラフ
    renderExpenseChart() {
        const ctx = document.getElementById('expense-chart');
        if (!ctx) return;

        // 過去30日のデータを生成
        const dates = [];
        const expenses = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dates.push(date.getDate() + '日');
            
            // その日の支出合計を計算
            const dayExpense = this.expenses
                .filter(expense => expense.date === dateStr)
                .reduce((sum, expense) => sum + expense.amount, 0);
            expenses.push(dayExpense);
        }

        if (this.expenseChart) {
            this.expenseChart.destroy();
        }

        this.expenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '日次支出 (円)',
                    data: expenses,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        display: true,
                        maxTicksLimit: 10
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // カテゴリ別支出円グラフ
    renderCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;

        // カテゴリ別支出を集計
        const categoryData = {};
        const categoryColors = {
            'スーパー': '#4CAF50',
            '自販機': '#FF9800',
            'コンビニ': '#2196F3',
            '飲み会': '#E91E63',
            'デート': '#9C27B0',
            'その他': '#607D8B'
        };

        this.expenses.forEach(expense => {
            if (!categoryData[expense.category]) {
                categoryData[expense.category] = 0;
            }
            categoryData[expense.category] += expense.amount;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const colors = labels.map(label => categoryColors[label] || '#757575');

        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ¥' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // 自炊回数推移グラフ
    renderCookingChart() {
        const ctx = document.getElementById('cooking-chart');
        if (!ctx) return;

        // 過去30日の自炊回数を集計
        const dates = [];
        const cookingCounts = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dates.push(date.getDate() + '日');
            
            // その日の自炊回数を計算
            const dayCount = this.cookingRecords
                .filter(record => record.date === dateStr)
                .length;
            cookingCounts.push(dayCount);
        }

        if (this.cookingChart) {
            this.cookingChart.destroy();
        }

        this.cookingChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: '自炊回数',
                    data: cookingCounts,
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 3,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        display: true,
                        maxTicksLimit: 10
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // グラフ更新
    updateCharts() {
        if (this.expenseChart || this.categoryChart || this.cookingChart || this.savingsChart) {
            this.renderCharts();
        }
    }

    // ミッション初期化
    initMissions() {
        this.checkMissionResets();
        this.generateDailyMissions();
        this.generateWeeklyMissions();
        this.updateMissionUI();
        this.startMissionTimers();
    }

    // ミッションリセットチェック
    checkMissionResets() {
        const today = new Date().toISOString().split('T')[0];
        const thisWeek = this.getWeekKey();

        // デイリーリセット
        if (this.missions.lastDailyReset !== today) {
            this.missions.daily = {};
            this.missions.lastDailyReset = today;
        }

        // ウィークリーリセット
        if (this.missions.lastWeeklyReset !== thisWeek) {
            this.missions.weekly = {};
            this.missions.lastWeeklyReset = thisWeek;
        }
    }

    // 週キー生成
    getWeekKey() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return startOfWeek.toISOString().split('T')[0];
    }

    // デイリーミッション生成
    generateDailyMissions() {
        const dailyMissionTemplates = [
            {
                id: 'daily_cooking_1',
                title: '自炊チャレンジ',
                description: '今日1回自炊する',
                target: 1,
                reward: 30,
                type: 'cooking',
                icon: '🍳'
            },
            {
                id: 'daily_expenses_record',
                title: '記録の習慣',
                description: '支出を1回記録する',
                target: 1,
                reward: 20,
                type: 'expense_record',
                icon: '📝'
            },
            {
                id: 'daily_savings',
                title: '節約成功',
                description: '誘惑に負けず節約を記録する',
                target: 1,
                reward: 25,
                type: 'savings',
                icon: '💰'
            }
        ];

        // 既存のミッションが存在しない場合のみ生成
        if (Object.keys(this.missions.daily).length === 0) {
            dailyMissionTemplates.forEach(template => {
                this.missions.daily[template.id] = {
                    ...template,
                    progress: 0,
                    completed: false,
                    claimed: false
                };
            });
        }
    }

    // ウィークリーミッション生成
    generateWeeklyMissions() {
        const weeklyMissionTemplates = [
            {
                id: 'weekly_cooking_goal',
                title: '週間自炊マスター',
                description: '1週間で10回自炊する',
                target: 10,
                reward: 100,
                type: 'cooking',
                icon: '👨‍🍳'
            },
            {
                id: 'weekly_expense_goal',
                title: '支出管理上手',
                description: '1週間で食費を目標以下に抑える',
                target: 1,
                reward: 80,
                type: 'expense_control',
                icon: '📊'
            },
            {
                id: 'weekly_savings_goal',
                title: '節約チャンピオン',
                description: '1週間で1000円節約する',
                target: 1000,
                reward: 120,
                type: 'total_savings',
                icon: '🏆'
            }
        ];

        // 既存のミッションが存在しない場合のみ生成
        if (Object.keys(this.missions.weekly).length === 0) {
            weeklyMissionTemplates.forEach(template => {
                this.missions.weekly[template.id] = {
                    ...template,
                    progress: 0,
                    completed: false,
                    claimed: false
                };
            });
        }
    }

    // ミッション進捗更新
    updateMissionProgress(actionType, value = 1) {
        let updated = false;

        // デイリーミッション更新
        Object.values(this.missions.daily).forEach(mission => {
            if (!mission.completed && mission.type === actionType) {
                mission.progress = Math.min(mission.progress + value, mission.target);
                if (mission.progress >= mission.target) {
                    mission.completed = true;
                    this.showNotification(`🎯 デイリーミッション達成: ${mission.title}!`, 'success');
                }
                updated = true;
            }
        });

        // ウィークリーミッション更新
        Object.values(this.missions.weekly).forEach(mission => {
            if (!mission.completed && mission.type === actionType) {
                if (actionType === 'total_savings') {
                    const weekSavings = this.getWeekSavings();
                    mission.progress = weekSavings;
                } else if (actionType === 'cooking') {
                    const weekCooking = this.getWeekCookingCount();
                    mission.progress = weekCooking;
                } else {
                    mission.progress = Math.min(mission.progress + value, mission.target);
                }
                
                if (mission.progress >= mission.target) {
                    mission.completed = true;
                    this.showNotification(`🏆 ウィークリーミッション達成: ${mission.title}!`, 'success');
                }
                updated = true;
            }
        });

        if (updated) {
            this.updateMissionUI();
            this.saveData();
        }
    }

    // 今週の節約額取得
    getWeekSavings() {
        const weekStart = this.getWeekKey();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        return this.savingsRecords
            .filter(record => record.date >= weekStart && record.date < weekEnd.toISOString().split('T')[0])
            .reduce((sum, record) => sum + record.amount, 0);
    }

    // 今週の自炊回数取得
    getWeekCookingCount() {
        const weekStart = this.getWeekKey();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        return this.cookingRecords
            .filter(record => record.date >= weekStart && record.date < weekEnd.toISOString().split('T')[0])
            .length;
    }

    // ミッションUI更新
    updateMissionUI() {
        this.updateDailyMissionsUI();
        this.updateWeeklyMissionsUI();
        this.updateMissionStats();
    }

    // デイリーミッションUI更新
    updateDailyMissionsUI() {
        const container = document.getElementById('daily-missions');
        if (!container) return;

        container.innerHTML = '';
        Object.values(this.missions.daily).forEach(mission => {
            const missionElement = this.createMissionElement(mission);
            container.appendChild(missionElement);
        });
    }

    // ウィークリーミッションUI更新
    updateWeeklyMissionsUI() {
        const container = document.getElementById('weekly-missions');
        if (!container) return;

        container.innerHTML = '';
        Object.values(this.missions.weekly).forEach(mission => {
            const missionElement = this.createMissionElement(mission);
            container.appendChild(missionElement);
        });
    }

    // ミッション要素作成
    createMissionElement(mission) {
        const element = document.createElement('div');
        element.className = `mission-card ${mission.completed ? 'completed' : ''} ${mission.claimed ? 'claimed' : ''}`;
        
        const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);
        
        element.innerHTML = `
            <div class="mission-icon">${mission.icon}</div>
            <div class="mission-content">
                <h5>${mission.title}</h5>
                <p>${mission.description}</p>
                <div class="mission-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${mission.progress}/${mission.target}</span>
                </div>
                <div class="mission-reward">報酬: ${mission.reward}pt</div>
            </div>
            <div class="mission-action">
                ${mission.completed && !mission.claimed ? 
                    `<button class="claim-btn" onclick="claimMissionReward('${mission.id}')">受取</button>` : 
                    mission.claimed ? '<span class="claimed-text">受取済</span>' : ''
                }
            </div>
        `;
        
        return element;
    }

    // ミッション報酬受取
    claimMissionReward(missionId) {
        const mission = this.missions.daily[missionId] || this.missions.weekly[missionId];
        if (!mission || !mission.completed || mission.claimed) return;

        mission.claimed = true;
        this.userData.points += mission.reward;
        this.missions.completedHistory.push({
            id: missionId,
            title: mission.title,
            reward: mission.reward,
            claimedAt: new Date().toISOString(),
            type: this.missions.daily[missionId] ? 'daily' : 'weekly'
        });

        this.showNotification(`🎁 報酬を受け取りました: ${mission.reward}pt!`, 'success');
        this.updateUI();
        this.updateMissionUI();
        this.checkLevelUp();
        this.saveData();
    }

    // ミッション統計更新
    updateMissionStats() {
        const dailyPoints = Object.values(this.missions.daily)
            .filter(m => m.completed && !m.claimed)
            .reduce((sum, m) => sum + m.reward, 0);
            
        const weeklyPoints = Object.values(this.missions.weekly)
            .filter(m => m.completed && !m.claimed)
            .reduce((sum, m) => sum + m.reward, 0);

        const availablePoints = dailyPoints + weeklyPoints;
        const element = document.getElementById('available-mission-points');
        if (element) {
            element.textContent = availablePoints;
        }
    }

    // ミッションタイマー開始
    startMissionTimers() {
        setInterval(() => {
            this.updateMissionTimers();
        }, 1000);
    }

    // ミッションタイマー更新
    updateMissionTimers() {
        // デイリーリセットタイマー
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeToReset = tomorrow - now;
        const hours = Math.floor(timeToReset / (1000 * 60 * 60));
        const minutes = Math.floor((timeToReset % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeToReset % (1000 * 60)) / 1000);
        
        const dailyTimer = document.getElementById('daily-reset-timer');
        if (dailyTimer) {
            dailyTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // ウィークリーリセットタイマー
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
        nextWeek.setHours(0, 0, 0, 0);
        
        const timeToWeekReset = nextWeek - now;
        const days = Math.floor(timeToWeekReset / (1000 * 60 * 60 * 24));
        const weekHours = Math.floor((timeToWeekReset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const weeklyTimer = document.getElementById('weekly-reset-timer');
        if (weeklyTimer) {
            weeklyTimer.textContent = `${days}日${weekHours}時間`;
        }
    }

    // バッジシステム初期化
    initBadges() {
        this.syncBadgeEarnedStatus();
        this.checkBadgeEligibility();
        this.updateBadgeUI();
    }

    // バッジ獲得状況を同期
    syncBadgeEarnedStatus() {
        this.badgeDefinitions.forEach(badge => {
            badge.earned = this.badges.earned.includes(badge.id);
        });
    }

    // バッジ獲得条件チェック
    checkBadgeEligibility() {
        let newBadges = [];
        
        this.badgeDefinitions.forEach(badge => {
            if (!badge.earned && this.checkBadgeRequirement(badge)) {
                badge.earned = true;
                this.badges.earned.push(badge.id);
                newBadges.push(badge);
                this.showNotification(`🏆 新しい称号を獲得しました: ${badge.title}!`, 'success');
            }
        });

        if (newBadges.length > 0) {
            this.updateCurrentTitle();
            this.updateBadgeUI();
            this.saveData();
        }
    }

    // バッジ獲得条件の確認
    checkBadgeRequirement(badge) {
        const req = badge.requirement;
        
        switch (req.type) {
            case 'cooking_count':
                return this.cookingRecords.length >= req.value;
            
            case 'total_savings':
                return this.userData.totalSavings >= req.value;
            
            case 'savings_count':
                return this.savingsRecords.length >= req.value;
            
            case 'level':
                return this.userData.level >= req.value;
            
            case 'consecutive_days':
                return this.getConsecutiveDays() >= req.value;
            
            case 'monthly_goal_achieved':
                return this.checkMonthlyGoalAchieved();
            
            case 'gacha_items':
                return this.collection.length >= req.value;
            
            case 'missions_completed':
                return this.missions.completedHistory.length >= req.value;
            
            case 'savings_level':
                return this.userData.savingsLevel >= req.value;
            
            case 'no_waste_streak':
                return this.streaks.noWasteStreak >= req.value;
            
            default:
                return false;
        }
    }

    // 連続記録日数取得
    getConsecutiveDays() {
        if (this.expenses.length === 0 && this.cookingRecords.length === 0 && this.savingsRecords.length === 0) {
            return 0;
        }

        const allDates = new Set();
        this.expenses.forEach(exp => allDates.add(exp.date));
        this.cookingRecords.forEach(rec => allDates.add(rec.date));
        this.savingsRecords.forEach(rec => allDates.add(rec.date));

        const sortedDates = Array.from(allDates).sort().reverse();
        let consecutiveDays = 0;
        let currentDate = new Date().toISOString().split('T')[0];

        for (let i = 0; i < sortedDates.length; i++) {
            if (sortedDates[i] === currentDate) {
                consecutiveDays++;
                const nextDate = new Date(currentDate);
                nextDate.setDate(nextDate.getDate() - 1);
                currentDate = nextDate.toISOString().split('T')[0];
            } else {
                break;
            }
        }

        return consecutiveDays;
    }

    // 月間目標達成チェック
    checkMonthlyGoalAchieved() {
        const monthlyExpense = this.userData.monthlyExpense;
        const monthlyCooking = this.userData.cookingCount;
        const monthlyAllowanceUsed = this.userData.allowanceUsed;

        return (
            monthlyExpense <= this.goals.monthlyExpenseGoal &&
            monthlyCooking >= this.goals.cookingGoal &&
            monthlyAllowanceUsed <= this.goals.allowanceGoal
        );
    }

    // 現在の称号更新
    updateCurrentTitle() {
        const earnedBadges = this.badgeDefinitions.filter(b => b.earned);
        if (earnedBadges.length === 0) {
            this.badges.currentTitle = 'beginner';
            return;
        }

        // 最新の称号を設定（優先度：特別 > レベル > 自炊 > 節約）
        const priorities = { special: 4, level: 3, cooking: 2, savings: 1 };
        earnedBadges.sort((a, b) => {
            const priorityDiff = priorities[b.category] - priorities[a.category];
            if (priorityDiff !== 0) return priorityDiff;
            return this.badges.earned.indexOf(b.id) - this.badges.earned.indexOf(a.id);
        });

        this.badges.currentTitle = earnedBadges[0].id;
    }

    // バッジUI更新
    updateBadgeUI() {
        this.updateBadgeStats();
        this.updateBadgeGrid();
        this.updateCurrentTitleDisplay();
    }

    // バッジ統計更新
    updateBadgeStats() {
        const totalBadges = this.badgeDefinitions.length;
        const earnedBadges = this.badges.earned.length;
        const completionRate = Math.round((earnedBadges / totalBadges) * 100);

        const elements = {
            'earned-badges-count': earnedBadges,
            'total-badges-count': totalBadges,
            'badge-completion-rate': completionRate
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // バッジグリッド更新
    updateBadgeGrid() {
        const container = document.getElementById('badges-grid');
        if (!container) return;

        container.innerHTML = '';
        this.badgeDefinitions.forEach(badge => {
            const badgeElement = this.createBadgeElement(badge);
            container.appendChild(badgeElement);
        });
    }

    // バッジ要素作成
    createBadgeElement(badge) {
        const element = document.createElement('div');
        element.className = `badge-card ${badge.earned ? 'earned' : 'locked'} category-${badge.category}`;
        
        const progress = this.getBadgeProgress(badge);
        const progressPercent = badge.earned ? 100 : Math.min((progress / badge.requirement.value) * 100, 100);
        
        element.innerHTML = `
            <div class="badge-icon">${badge.earned ? badge.icon : '🔒'}</div>
            <div class="badge-content">
                <h5 class="badge-title">${badge.earned ? badge.title : '???'}</h5>
                <p class="badge-description">${badge.earned ? badge.description : '条件を満たすと獲得できます'}</p>
                <div class="badge-progress">
                    <div class="badge-progress-bar">
                        <div class="badge-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="badge-progress-text">
                        ${badge.earned ? '達成済み' : `${progress}/${badge.requirement.value}`}
                    </span>
                </div>
            </div>
            ${badge.earned ? '<div class="badge-earned-mark">✓</div>' : ''}
        `;
        
        return element;
    }

    // バッジ進捗取得
    getBadgeProgress(badge) {
        const req = badge.requirement;
        
        switch (req.type) {
            case 'cooking_count':
                return this.cookingRecords.length;
            case 'total_savings':
                return this.userData.totalSavings;
            case 'savings_count':
                return this.savingsRecords.length;
            case 'level':
                return this.userData.level;
            case 'consecutive_days':
                return this.getConsecutiveDays();
            case 'monthly_goal_achieved':
                return this.checkMonthlyGoalAchieved() ? 1 : 0;
            case 'gacha_items':
                return this.collection.length;
            case 'missions_completed':
                return this.missions.completedHistory.length;
            case 'savings_level':
                return this.userData.savingsLevel;
            case 'no_waste_streak':
                return this.streaks.noWasteStreak;
            default:
                return 0;
        }
    }

    // 現在の称号表示更新
    updateCurrentTitleDisplay() {
        const element = document.getElementById('current-title');
        if (!element) return;

        const currentBadge = this.badgeDefinitions.find(b => b.id === this.badges.currentTitle);
        element.textContent = currentBadge ? currentBadge.title : '初心者';
    }

    // カテゴリ別フィルター
    filterBadgesByCategory(category, button) {
        // ボタンのアクティブ状態更新
        document.querySelectorAll('.category-filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // バッジ表示フィルター
        const badges = document.querySelectorAll('.badge-card');
        badges.forEach(badge => {
            if (category === 'all' || badge.classList.contains(`category-${category}`)) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    // バッジ獲得条件チェック（各アクション後に呼び出し）
    updateBadgeProgress() {
        this.checkBadgeEligibility();
    }

    // 無駄遣いなしの日を記録
    recordNoWasteDay() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.streaks.lastNoWasteDate === today) {
            this.showNotification('今日はすでに記録済みです', 'error');
            return;
        }

        // 連続記録を更新
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (this.streaks.lastNoWasteDate === yesterdayStr) {
            // 連続記録継続
            this.streaks.noWasteStreak++;
        } else {
            // 新しい記録スタート
            this.streaks.noWasteStreak = 1;
        }

        this.streaks.lastNoWasteDate = today;
        
        // 最高記録更新チェック
        if (this.streaks.noWasteStreak > this.streaks.bestNoWasteStreak) {
            this.streaks.bestNoWasteStreak = this.streaks.noWasteStreak;
            this.showNotification(`🎉 無駄遣いなし記録更新！${this.streaks.noWasteStreak}日連続達成！`, 'success');
        } else {
            this.showNotification(`🔥 無駄遣いなし ${this.streaks.noWasteStreak}日連続！素晴らしい！`, 'success');
        }

        // ポイント報酬
        const bonus = Math.min(this.streaks.noWasteStreak * 5, 50); // 最大50pt
        this.userData.points += bonus;

        this.updateStreakButtonState();
        this.updateBadgeProgress();
        this.updateUI();
        this.saveData();
    }

    // お菓子我慢の日を記録
    recordSnackFreeDay() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.streaks.lastSnackFreeDate === today) {
            this.showNotification('今日はすでに記録済みです', 'error');
            return;
        }

        // 連続記録を更新
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (this.streaks.lastSnackFreeDate === yesterdayStr) {
            // 連続記録継続
            this.streaks.snackFreeStreak++;
        } else {
            // 新しい記録スタート
            this.streaks.snackFreeStreak = 1;
        }

        this.streaks.lastSnackFreeDate = today;
        
        // 最高記録更新チェック
        if (this.streaks.snackFreeStreak > this.streaks.bestSnackFreeStreak) {
            this.streaks.bestSnackFreeStreak = this.streaks.snackFreeStreak;
            this.showNotification(`🎉 お菓子我慢記録更新！${this.streaks.snackFreeStreak}日連続達成！`, 'success');
        } else {
            this.showNotification(`🍭 お菓子我慢 ${this.streaks.snackFreeStreak}日連続！頑張ってる！`, 'success');
        }

        // ポイント報酬
        const bonus = Math.min(this.streaks.snackFreeStreak * 3, 30); // 最大30pt
        this.userData.points += bonus;

        this.updateStreakButtonState();
        this.updateBadgeProgress();
        this.updateUI();
        this.saveData();
    }

    // 連続記録ボタンの状態更新
    updateStreakButtonState() {
        const today = new Date().toISOString().split('T')[0];
        
        const noWasteBtn = document.getElementById('no-waste-btn');
        const snackFreeBtn = document.getElementById('snack-free-btn');

        if (noWasteBtn) {
            if (this.streaks.lastNoWasteDate === today) {
                noWasteBtn.classList.add('recorded');
                noWasteBtn.textContent = '✅ 今日は記録済み';
            } else {
                noWasteBtn.classList.remove('recorded');
                noWasteBtn.textContent = '🔥 今日は無駄遣いなし！';
            }
        }

        if (snackFreeBtn) {
            if (this.streaks.lastSnackFreeDate === today) {
                snackFreeBtn.classList.add('recorded');
                snackFreeBtn.textContent = '✅ 今日は記録済み';
            } else {
                snackFreeBtn.classList.remove('recorded');
                snackFreeBtn.textContent = '🍭 今日はお菓子我慢！';
            }
        }
    }

    // 連続記録の表示更新
    updateStreakDisplay() {
        const elements = {
            'no-waste-streak': this.streaks.noWasteStreak,
            'best-no-waste-streak': this.streaks.bestNoWasteStreak,
            'snack-free-streak': this.streaks.snackFreeStreak,
            'best-snack-free-streak': this.streaks.bestSnackFreeStreak
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        this.updateStreakButtonState();
    }

    // 連続記録をリセット（無駄遣いした場合）
    resetStreakIfNeeded(category) {
        const today = new Date().toISOString().split('T')[0];
        
        // コンビニ、自販機、お菓子系の出費で連続記録をリセット
        if (['コンビニ', '自販機'].includes(category)) {
            if (this.streaks.lastNoWasteDate === today && this.streaks.noWasteStreak > 0) {
                this.showNotification('無駄遣い記録がリセットされました', 'error');
                this.streaks.noWasteStreak = 0;
                this.streaks.lastNoWasteDate = '';
            }
            
            // お菓子系の買い物でスナック我慢記録もリセット
            if (this.streaks.lastSnackFreeDate === today && this.streaks.snackFreeStreak > 0) {
                this.showNotification('お菓子我慢記録がリセットされました', 'error');
                this.streaks.snackFreeStreak = 0;
                this.streaks.lastSnackFreeDate = '';
            }
        }
    }

    // 節約額で買える物の表示更新
    updateSavingsEquivalent() {
        const element = document.getElementById('savings-can-buy-text');
        if (!element) return;

        const totalSavings = this.userData.totalSavings;
        
        if (totalSavings === 0) {
            element.textContent = '節約を始めて、欲しい物を手に入れよう！';
            return;
        }

        // 現在の節約額で買える最も価値の高い物を見つける
        let bestMatch = null;
        for (let i = this.savingsEquivalents.length - 1; i >= 0; i--) {
            if (totalSavings >= this.savingsEquivalents[i].amount) {
                bestMatch = this.savingsEquivalents[i];
                break;
            }
        }

        if (bestMatch) {
            const count = Math.floor(totalSavings / bestMatch.amount);
            if (count === 1) {
                element.innerHTML = `${bestMatch.icon} <strong>${bestMatch.item}</strong>が買えます！`;
            } else {
                element.innerHTML = `${bestMatch.icon} <strong>${bestMatch.item}</strong>が<span style="color: #ff6b6b; font-weight: bold;">${count}個</span>買えます！`;
            }
        } else {
            // 最も安い物まで何円足りないかを表示
            const cheapest = this.savingsEquivalents[0];
            const remaining = cheapest.amount - totalSavings;
            element.innerHTML = `あと¥${remaining.toLocaleString()}で${cheapest.icon}<strong>${cheapest.item}</strong>が買えます！`;
        }
    }

    // 貯金目標の進捗更新
    updateSavingsGoals() {
        const totalSavings = this.userData.totalSavings;
        const goals = [
            { current: 'short-term-current', progress: 'short-term-progress', target: 5000 },
            { current: 'medium-term-current', progress: 'medium-term-progress', target: 20000 },
            { current: 'long-term-current', progress: 'long-term-progress', target: 50000 }
        ];

        goals.forEach(goal => {
            const currentElement = document.getElementById(goal.current);
            const progressElement = document.getElementById(goal.progress);
            
            if (currentElement) {
                currentElement.textContent = Math.min(totalSavings, goal.target).toLocaleString();
            }
            
            if (progressElement) {
                const percentage = Math.min((totalSavings / goal.target) * 100, 100);
                progressElement.style.width = `${percentage}%`;
                
                // 達成時の特別スタイル
                if (percentage >= 100) {
                    progressElement.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
                } else {
                    progressElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                }
            }
        });
    }

    // 節約額推移グラフを追加
    renderSavingsChart() {
        const ctx = document.getElementById('savings-chart');
        if (!ctx) return;

        // 過去30日の節約額推移を計算
        const dates = [];
        const cumulativeSavings = [];
        const today = new Date();
        let runningTotal = 0;
        
        // 初期の貯金額を逆算
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29);
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dates.push(date.getDate() + '日');
            
            // その日の節約額を加算
            const daySavings = this.savingsRecords
                .filter(record => record.date === dateStr)
                .reduce((sum, record) => sum + record.amount, 0);
            
            runningTotal += daySavings;
            cumulativeSavings.push(runningTotal);
        }

        if (this.savingsChart) {
            this.savingsChart.destroy();
        }

        this.savingsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '累積節約額 (円)',
                    data: cumulativeSavings,
                    borderColor: '#00b894',
                    backgroundColor: 'rgba(0, 184, 148, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        display: true,
                        maxTicksLimit: 10
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
}

// グローバル関数（HTMLから呼び出し用）
let app;

function recordCooking(meal, button) {
    app.recordCooking(meal, button);
}

function recordSavings(amount) {
    app.recordSavings(amount);
}

function showCustomSavings() {
    app.showCustomSavings();
}

function showInputScreen(category) {
    app.showInputScreen(category);
}

function hideInputScreen() {
    app.hideInputScreen();
}

function addDigit(digit) {
    app.addDigit(digit);
}

function deleteDigit() {
    app.deleteDigit();
}

function clearAmount() {
    app.clearAmount();
}

function selectMeal(meal, button) {
    app.selectMeal(meal, button);
}

function saveExpenseRecord() {
    app.saveExpenseRecord();
}

function playGacha() {
    app.playGacha();
}

function loadRecordsForDate() {
    app.loadRecordsForDate();
}

function updateGoal(type, value) {
    app.updateGoal(type, value);
}

function confirmAction() {
    app.confirmAction();
}

function cancelAction() {
    app.cancelAction();
}

function filterByRarity(rarity, button) {
    app.filterByRarity(rarity, button);
}

function claimMissionReward(missionId) {
    app.claimMissionReward(missionId);
}

function filterBadgesByCategory(category, button) {
    app.filterBadgesByCategory(category, button);
}

function recordNoWasteDay() {
    app.recordNoWasteDay();
}

function recordSnackFreeDay() {
    app.recordSnackFreeDay();
}

// PWA Service Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('[PWA] Service Worker registration failed:', error);
            });
    });
}

// PWA インストールプロンプト
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt triggered');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

// インストールボタン表示
function showInstallButton() {
    // 将来的にインストールボタンを表示する処理
    console.log('[PWA] App can be installed');
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    app = new FoodExpenseApp();
});