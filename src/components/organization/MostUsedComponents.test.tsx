import { render, screen } from "@testing-library/react";
import MostUsedComponents from "./MostUsedComponents";

describe("MostUsedComponents", () => {
  it("keeps the occurrences heading on one line", () => {
    render(
      <MostUsedComponents topComponents={[{ purl: "ROOT", totalAmount: 1 }]} />,
    );

    expect(
      screen.getByRole("columnheader", { name: "Occurrences" }),
    ).toHaveClass("whitespace-nowrap");
  });
});
