import { isNumber } from "@/utils/common";

describe("input test, to check if it always return true, when a number is given", () => {
  it("should only return true if its a number ", () => {
    const table = [1, 2, 3, 4, 5, 6];

    for (const index of table) {
      const actual = isNumber(index);
      expect(actual).toBe(true);
    }
  });
  it("should only return false if its not a number", () => {
    const table2 = [NaN, null, "string", undefined];
    for (const index of table2) {
      const actual = isNumber(index);
      expect(actual).toBe(false);
    }
  });
});
