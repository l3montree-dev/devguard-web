import { Button, buttonVariants } from "./button";
import { render, screen } from "@testing-library/react";

describe("button variant test", () => {
  it("should include bg-destructive if passed a destructive button variant", () => {
    const actual = buttonVariants({ variant: "destructive" });
    expect(actual).toContain("bg-destructive");
  });
});

describe("button variant component test", () => {
  it("should include the bg-destructive as className if passed a destructive button variant", async () => {
    render(<Button variant={"destructive"}>Destructive Button</Button>);
    expect((await screen.findByText("Destructive Button")).className).toContain(
      "bg-destructive",
    );
  });
});
