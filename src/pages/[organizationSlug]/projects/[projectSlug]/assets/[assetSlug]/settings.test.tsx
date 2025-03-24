import { isNumber } from "./settings";

describe("input test, to check if it always return true, when a number is given", () => {
  it("should only return true if its a number ", () => {
    const table = {
      1: true,
      2: true,
      3: true,
      undefined: false,
      NaN: false,
    };

    for (const index of Object.entries(table)) {
      const actual = isNumber(index[0]);

      expect(actual).toBe(index[1]);
    }
  });
});
