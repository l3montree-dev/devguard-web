import { render, screen } from "@testing-library/react";
import { documentationLinks } from "@/const/documentationLinks";
import VexRuleRecommendationCard from "./VexRuleRecommendationCard";

jest.mock("@/components/common/CelCodeBlock", () => ({
  __esModule: true,
  default: () => null,
}));

describe("VexRuleRecommendationCard", () => {
  it("links to the VEX sharing whitepaper", () => {
    render(
      <VexRuleRecommendationCard
        recommendation={{
          celExpression: "",
          justification: "",
          mechanicalJustification: "component_not_present",
          eventType: "accepted",
          confidence: 0,
          title: "Recommendation",
          appliesToAmountOfDependencyVulns: 1,
        }}
        onCreateRule={jest.fn()}
      />,
    );

    const link = screen.getByRole("link", {
      name: "VEX sharing whitepaper",
    });

    expect(link).toHaveAttribute(
      "href",
      documentationLinks.vexRecommendationWhitepaper,
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
