// テスト用の設定ファイル
// テスト間でLocalStorageをクリアして、テスト同士が影響しないようにします

import { beforeEach } from "vitest";

beforeEach(() => {
  // LocalStorageをクリア
  localStorage.clear();
});
