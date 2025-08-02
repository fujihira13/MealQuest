import React from "react";
import { useUIStore } from "@/store/useAppStore";

export const HelpModal: React.FC = () => {
  const { isHelpOpen, setHelpOpen } = useUIStore();

  const handleClose = () => {
    setHelpOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isHelpOpen) {
    return null;
  }

  return (
    <div className="help-modal" onClick={handleBackdropClick}>
      <div className="help-modal-content">
        {/* ヘッダー */}
        <div className="help-header">
          <h2>📖 使い方ガイド</h2>
          <button className="help-close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="help-content">
          <div className="help-section">
            <div className="guide-item">
              <h4>💰 支出記録</h4>
              <p>
                ホーム画面でカテゴリボタンを押して日々の支出を記録しましょう
              </p>
              <ul>
                <li>🛒 スーパー：食材の買い物</li>
                <li>🥤 自販機：飲み物の購入</li>
                <li>🏪 コンビニ：お弁当やお菓子</li>
                <li>🍻 飲み会：外食や飲み会</li>
                <li>❤️ デート：特別な外食</li>
                <li>📦 その他：上記以外の食費</li>
              </ul>
            </div>

            <div className="guide-item">
              <h4>🍳 自炊記録</h4>
              <p>
                自炊をした時間帯（朝・昼・夜）をタップしてポイントを獲得しましょう
              </p>
              <ul>
                <li>朝食：50ポイント獲得</li>
                <li>昼食：50ポイント獲得</li>
                <li>夕食：100ポイント獲得</li>
                <li>連続自炊でボーナスポイント</li>
              </ul>
            </div>

            <div className="guide-item">
              <h4>💎 節約記録</h4>
              <p>
                誘惑に負けずに節約できた時は節約記録で貯金額を積み上げましょう
              </p>
              <ul>
                <li>クイック節約：100円、200円、500円</li>
                <li>カスタム節約：自由な金額を入力</li>
                <li>節約した分だけ貯金として記録</li>
                <li>節約レベルが上がると特典アップ</li>
              </ul>
            </div>

            <div className="guide-item">
              <h4>🎯 クエスト</h4>
              <p>
                デイリー・ウィークリークエストを達成してポイントを稼ぎましょう
              </p>
              <ul>
                <li>デイリー：毎日リセットされる短期目標</li>
                <li>ウィークリー：週単位の長期目標</li>
                <li>クエスト達成でポイント獲得</li>
                <li>連続達成でボーナス</li>
              </ul>
            </div>

            <div className="guide-item">
              <h4>🎁 ガチャ＆コレクション</h4>
              <p>貯めたポイントでガチャを回してアイテムを集めましょう</p>
              <ul>
                <li>100ポイントでガチャ1回</li>
                <li>レア度：ノーマル、レア、エピック、レジェンド</li>
                <li>コレクション画面で収集状況を確認</li>
                <li>レアアイテムは特別なボーナス</li>
              </ul>
            </div>

            <div className="guide-item">
              <h4>🏆 称号＆バッジ</h4>
              <p>様々な条件を達成して称号とバッジを獲得しましょう</p>
              <ul>
                <li>節約マスター：一定額の節約を達成</li>
                <li>自炊の達人：連続自炊記録を更新</li>
                <li>コレクター：アイテムを一定数収集</li>
                <li>称号は自分のステータスとして表示</li>
              </ul>
            </div>

            <div className="guide-item">
              <h4>📊 統計＆分析</h4>
              <p>支出パターンを分析して節約効率を向上させましょう</p>
              <ul>
                <li>月間支出の推移をグラフで確認</li>
                <li>カテゴリ別の支出割合を分析</li>
                <li>目標達成率をチェック</li>
                <li>記録の編集・削除も可能</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
