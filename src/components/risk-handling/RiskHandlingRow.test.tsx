import { fireEvent, render, screen, within } from "@testing-library/react";
import type { Row } from "@tanstack/react-table";

import { TooltipProvider } from "@/components/ui/tooltip";
import type { VulnByPackage, VulnWithCVE } from "@/types/api/api";
import RiskHandlingRow from "./RiskHandlingRow";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("../../hooks/useDecodedPathname", () => ({
  __esModule: true,
  default: () => "/acme/projects/shop/assets/web/refs/main/dependency-risks",
}));

jest.mock("../../hooks/useUserRole", () => ({
  isMember: () => false,
  useCurrentUserRole: () => null,
}));

jest.mock("../common/Purl", () => ({
  __esModule: true,
  default: ({ purl }: { purl: string }) => <span>{purl}</span>,
}));

jest.mock("../common/Severity", () => ({
  __esModule: true,
  default: ({ risk }: { risk: number }) => <span>{risk}</span>,
  CVSSBadge: ({ cvss }: { cvss: number }) => <span>{cvss}</span>,
}));

jest.mock("../Quickfix", () => ({
  isQuickfixAvailable: () => false,
}));

const vulnerability = (id: string): VulnWithCVE => ({
  artifacts: [],
  assetId: "asset-1",
  assetVersionName: "main",
  componentFixedVersion: "16.2.11",
  componentPurl: "pkg:npm/next@16.2.10",
  createdAt: "2026-08-09T00:00:00Z",
  cveID: "GHSA-89xv-2m56-2m9x",
  directDependencyFixedVersion: "16.2.11",
  id,
  level: "direct",
  message: null,
  priority: null,
  rawRiskAssessment: 1.4,
  riskRecalculatedAt: "2026-08-09T00:00:00Z",
  ruleId: "osv-scanner",
  scannerIds: "osv-scanner",
  state: "open",
  ticketId: null,
  ticketUrl: null,
  updatedAt: "2026-08-09T00:00:00Z",
  vulnerabilityPath: ["pkg:npm/next@16.2.10"],
});

const renderRow = (vulns: VulnWithCVE[]) => {
  const row = {
    original: {
      avgRisk: 1.4,
      maxCvss: 8.3,
      maxRisk: 1.4,
      packageName: "pkg:npm/next@16.2.10",
      totalRisk: 1.4,
      vulnCount: vulns.length,
      vulns,
    },
  } as Row<VulnByPackage>;

  render(
    <TooltipProvider>
      <table>
        <tbody>
          <RiskHandlingRow
            row={row}
            index={0}
            arrLength={1}
            selectedVulnIds={new Set()}
            onToggleVuln={jest.fn()}
            onToggleAll={jest.fn()}
            onBulkAction={jest.fn()}
          />
        </tbody>
      </table>
    </TooltipProvider>,
  );
};

describe("RiskHandlingRow", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders directly navigable CVEs as links that preserve modified-click behavior", () => {
    renderRow([vulnerability("vuln-1")]);

    fireEvent.click(screen.getByTestId("package-row"));

    const cveRow = screen.getByTestId("cve-row");
    const link = within(cveRow).getByRole("link", {
      name: "GHSA-89xv-2m56-2m9x",
    });
    expect(link).toHaveAttribute(
      "href",
      "/acme/projects/shop/assets/web/refs/main/dependency-risks/../dependency-risks/vuln-1",
    );

    fireEvent.click(link, { ctrlKey: true });
    expect(push).not.toHaveBeenCalled();
  });

  it("does not override browser navigation from individual path links", () => {
    renderRow([vulnerability("vuln-1"), vulnerability("vuln-2")]);

    fireEvent.click(screen.getByTestId("package-row"));
    fireEvent.click(screen.getByTestId("cve-row"));

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);

    fireEvent.click(links[0], { metaKey: true });
    expect(push).not.toHaveBeenCalled();
  });
});
