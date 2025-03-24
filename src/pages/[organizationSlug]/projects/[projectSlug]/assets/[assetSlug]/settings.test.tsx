import { isNumber } from "./settings";

describe("input test, to check if it always return true, when a number is given", () => {
  it("should only return true if its a number ", () => {
    const table = [1, 2, 3, 4, 5, 6];

    for (const index of table) {
      const actual = isNumber(index);
      expect(actual).toBe(true);
    }
  });
});
