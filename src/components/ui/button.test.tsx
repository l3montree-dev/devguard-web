import { Button, buttonVariants } from "./button";
import { render, screen } from "@testing-library/react";

describe("button variant test", () => {
  it("should include border destructive on dark if passed a destructive button variant", () => {
    const actual = buttonVariants({ variant: "destructive" });
    expect(actual).toContain("dark:border-destructive");
  });
});

describe("button variant component test", () => {
  it("should include the dark border destructive as className if passed a destructive button variant", async () => {
    render(<Button variant={"destructive"}>Destructive Button</Button>);
    expect((await screen.findByText("Destructive Button")).className).toContain(
      "dark:border-destructive",
    );
  });
});
