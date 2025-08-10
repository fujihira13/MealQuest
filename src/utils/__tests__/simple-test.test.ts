import { describe, it, expect } from "vitest";
import { calculateBudgetRemaining } from "../calculationHelpers";

// 初心者向けの超シンプルなテスト
describe("家計簿の計算テスト", () => {
  it("予算から使った分を引く計算", () => {
    // 予算10000円で3000円使った場合
    const result = calculateBudgetRemaining(10000, 3000);
    expect(result).toBe(7000); // 7000円残るはず
  });

  it("予算を超えて使った場合", () => {
    // 予算5000円で8000円使った場合
    const result = calculateBudgetRemaining(5000, 8000);
    expect(result).toBe(0); // マイナスにならず0になるはず
  });
});
