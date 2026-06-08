// ─────────────────────────────────────────────────────────────────────────
// TEMPORARY mock "backend" for Compliance Risks.
//
// The real /compliance-risks endpoints don't exist yet. These functions mimic
// what the Go API will do: read the SAME query string the pages already build
// (filterQuery[field][op], sort[field]=asc|desc, search, page, pageSize) and
// return a Paged<ComplianceRiskDTO>. They're used as the SWR `fetcher` on the
// two pages, so the component logic is identical to a real backend-driven page.
//
// 👉 GOING LIVE: in the two pages, replace the fetcher only —
//      complianceRisksListMock   → fetcher        (list page)
//      complianceRiskDetailMock  → fetcher        (detail page)
//    then delete this file and public/mock/compliance-risks.json.
//    Nothing else in the pages needs to change.
// ─────────────────────────────────────────────────────────────────────────
import type {
  ComplianceRiskDTO,
  DetailedComplianceRiskDTO,
  Paged,
} from "@/types/api/api";

const MOCK_URL = "/mock/compliance-risks.json";

const loadAll = (): Promise<ComplianceRiskDTO[]> =>
  fetch(MOCK_URL).then((res) => {
    if (!res.ok) throw new Error("Failed to load mock compliance risks");
    return res.json();
  });

// Maps the backend column ids used in `filterOptions` / column `id`s to the
// corresponding ComplianceRiskDTO accessor.
const FIELD_ACCESSORS: Record<
  string,
  (r: ComplianceRiskDTO) => string | number
> = {
  policy_title: (r) => r.policyTitle ?? "",
  predicate_type: (r) => r.predicateType ?? "",
  state: (r) => r.state,
  attestation_updated_at: (r) =>
    r.attestationUpdatedAt ? new Date(r.attestationUpdatedAt).getTime() : 0,
  attestation_violations: (r) => r.attestationViolations?.length ?? 0,
};

const matchesFilter = (
  risk: ComplianceRiskDTO,
  field: string,
  operator: string,
  rawValue: string,
): boolean => {
  const accessor = FIELD_ACCESSORS[field];
  if (!accessor) return true; // unknown column → don't filter the row out
  const cell = accessor(risk);
  const value = rawValue.replace(/^%/, "").replace(/%$/, ""); // strip ilike % wildcards
  switch (operator) {
    case "is":
      return String(cell).toLowerCase() === value.toLowerCase();
    case "is not":
      return String(cell).toLowerCase() !== value.toLowerCase();
    case "like":
    case "ilike":
      return String(cell).toLowerCase().includes(value.toLowerCase());
    case "is greater than":
      return Number(cell) > Number(value);
    case "is less than":
      return Number(cell) < Number(value);
    default:
      return true;
  }
};

const getQueryString = (key: string): URLSearchParams =>
  new URLSearchParams(key.includes("?") ? key.slice(key.indexOf("?") + 1) : "");

/** Mimics `GET .../compliance-risks/?<filters/sort/page>`. */
export const complianceRisksListMock = async (
  key: string,
): Promise<Paged<ComplianceRiskDTO>> => {
  const params = getQueryString(key);
  let rows = await loadAll();

  // filterQuery[field][operator]=value  (includes the Open/Closed tab filter)
  params.forEach((value, k) => {
    const m = k.match(/^filterQuery\[(.+)\]\[(.+)\]$/);
    if (m) rows = rows.filter((r) => matchesFilter(r, m[1], m[2], value));
  });

  // free-text search
  const search = params.get("search")?.toLowerCase();
  if (search) {
    rows = rows.filter(
      (r) =>
        r.policyTitle.toLowerCase().includes(search) ||
        r.predicateType.toLowerCase().includes(search),
    );
  }

  // sort[field]=asc|desc
  params.forEach((dir, k) => {
    const m = k.match(/^sort\[(.+)\]$/);
    const accessor = m ? FIELD_ACCESSORS[m[1]] : undefined;
    if (accessor) {
      rows = [...rows].sort((a, b) => {
        const av = accessor(a);
        const bv = accessor(b);
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return dir === "desc" ? -cmp : cmp;
      });
    }
  });

  // pagination
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "25");
  const start = (page - 1) * pageSize;

  return {
    data: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
};

/** Mimics `GET .../compliance-risks/{id}`. */
export const complianceRiskDetailMock = async (
  key: string,
): Promise<DetailedComplianceRiskDTO> => {
  const id = key.split("?")[0].split("/").pop();
  const found = (await loadAll()).find((r) => r.id === id);
  if (!found) throw new Error("Compliance risk not found");
  return { ...found, events: [] };
};
