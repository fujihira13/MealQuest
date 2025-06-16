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
            lastUpdated: new Date().toISOString().split('T')[0]
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
        }

        this.updateCookingData();
        this.updateSavingsData();
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

        // 統計タブ
        document.getElementById('total-expense').textContent = this.userData.monthlyExpense.toLocaleString();
        document.getElementById('expense-goal').textContent = this.goals.monthlyExpenseGoal.toLocaleString();
        document.getElementById('total-savings').textContent = this.userData.totalSavings.toLocaleString();
        document.getElementById('cooking-total').textContent = this.userData.cookingCount;
        document.getElementById('cooking-goal').textContent = this.goals.cookingGoal;

        // 自炊ボタンの状態更新
        this.updateCookingButtons();

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
            collection: this.collection
        };
        localStorage.setItem('foodExpenseApp', JSON.stringify(data));
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
        }
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

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    app = new FoodExpenseApp();
});