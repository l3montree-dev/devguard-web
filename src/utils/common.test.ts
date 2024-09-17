import { beautifyPurl } from "./common";

describe("beautifyPurl", () => {
  it("handles package names containing an '@' correct", () => {
    expect(beautifyPurl("pkg:npm/@ory/integrations@1.2.1")).toBe(
      "@ory/integrations",
    );
  });
});
