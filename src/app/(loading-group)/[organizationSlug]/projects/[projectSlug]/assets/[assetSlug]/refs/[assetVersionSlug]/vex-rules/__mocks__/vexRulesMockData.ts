import { Paged, VexRule } from "@/types/api/api";

// Mock VEX rules with sample data
export const mockVexRulesData: Paged<VexRule> = {
  data: [
    {
      assetId: "asset-001",
      cveId: "GHSA-9qr9-h5gf-34mp",
      pathPatternHash: "hash-001",
      vexSource: "upstream",
      justification: "Component is not reachable in production environment",
      mechanicalJustification: "vulnerable_code_not_in_execute_path",
      eventType: "falsePositive" as any, // Backend sends string, not full DTO
      pathPattern: "*,pkg:npm/@example/package@1.0.0",
      createdById: "user-001",
      createdAt: "2025-12-15T10:30:00Z",
      updatedAt: "2025-12-20T14:45:00Z",
      effectCount: 2,
    },
    {
      assetId: "asset-001",
      cveId: "CVE-2024-5678",
      pathPatternHash: "hash-002",
      vexSource: "manual",
      justification: "Vulnerability only affects Windows, we run on Linux",
      mechanicalJustification: "vulnerable_code_not_present",
      eventType: "accepted" as any,
      pathPattern: "pkg:npm/lodash@4.17.20",
      createdById: "user-002",
      createdAt: "2025-11-10T08:15:00Z",
      updatedAt: "2025-11-10T08:15:00Z",
      effectCount: 3,
    },
    {
      assetId: "asset-001",
      cveId: "CVE-2023-9999",
      pathPatternHash: "hash-003",
      vexSource: "csaf",
      justification: "",
      mechanicalJustification: "inline_mitigations_already_exist",
      eventType: "falsePositive" as any,
      pathPattern: "pkg:maven/org.apache.commons/commons-text@1.9",
      createdById: "user-001",
      createdAt: "2025-10-05T16:20:00Z",
      updatedAt: "2026-01-02T09:30:00Z",
      effectCount: 0,
    },
    {
      assetId: "asset-001",
      cveId: "CVE-2024-2222",
      pathPatternHash: "hash-004",
      vexSource: "vex",
      justification: "Fixed in internal fork of the library",
      mechanicalJustification: "component_not_present",
      eventType: "accepted" as any,
      pathPattern: "pkg:pypi/requests@2.28.0",
      createdById: "user-003",
      createdAt: "2025-09-20T11:00:00Z",
      updatedAt: "2025-12-01T13:45:00Z",
      effectCount: 43,
    },
    {
      assetId: "asset-001",
      cveId: "CVE-2024-3333",
      pathPatternHash: "hash-005",
      vexSource: "upstream",
      justification:
        "Requires local access which is not possible in our environment",
      mechanicalJustification:
        "vulnerable_code_cannot_be_controlled_by_adversary",
      eventType: "falsePositive" as any,
      pathPattern: "pkg:golang/github.com/example/lib@v1.2.3",
      createdById: "user-001",
      createdAt: "2026-01-15T07:30:00Z",
      updatedAt: "2026-01-28T10:00:00Z",
      effectCount: 0,
    },
  ],
  total: 5,
  page: 1,
  pageSize: 10,
};

// Empty mock data to test empty state
export const mockVexRulesEmpty: Paged<VexRule> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
};
