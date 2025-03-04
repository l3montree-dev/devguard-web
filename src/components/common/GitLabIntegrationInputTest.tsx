import { render, screen } from "@testing-library/react";
import GitLabIntegrationDialog from "./GitLabIntegrationDialog";
import { Button } from "../ui/button";

describe("input tested", () => {
  it("should give formate urls and compare them if, they are equal ", () => {
    regexFunction();
    const actual = "https://gitlab.com";

    expect(actual) === expect(actual).toContain("bg-destructive");
  });
});

// describe("button variant component test", () => {
//   it("should include the bg-destructive as className if passed a destructive button variant", async () => {
//     render(<Button variant={"destructive"}>Destructive Button</Button>);
//     expect((await screen.findByText("Destructive Button")).className).toContain(
//       "bg-destructive",
//     );
//   });
// });
