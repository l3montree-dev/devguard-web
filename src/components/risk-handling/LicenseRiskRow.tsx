// components/license-risk/LicenseRiskRow.tsx
import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import { usePathname, useRouter } from "next/navigation";
import { LicenseRiskDTO } from "../../types/api/api";
import EcosystemImage from "../common/EcosystemImage";
import { Badge } from "../ui/badge";
import { getSeverityClassNames } from "../common/Severity";

type Props = {
  risk: LicenseRiskDTO;
  index: number;
  arrLength: number;
};

export default function LicenseRiskRow({ risk, index, arrLength }: Props) {
  const router = useRouter();

  const pathname = usePathname();
  return (
    <tr
      onClick={() => router.push(pathname + "/../license-risks/" + risk.id)}
      className={classNames(
        "relative cursor-pointer align-top transition-all",
        index === arrLength - 1 ? "" : "border-b",
        index % 2 !== 0 && "bg-card/50",
        "hover:bg-gray-50 dark:hover:bg-card",
      )}
    >
      <td className="p-4 flex flex-row items-center gap-2">
        <EcosystemImage packageName={risk.componentPurl} size={16} />
        <span className="font-medium truncate">
          {beautifyPurl(risk.componentPurl)}
        </span>
        <span className="text-xs text-muted-foreground">
          {extractVersion(risk.componentPurl)}
        </span>
      </td>

      <td className="p-4">
        {!risk.component.license ||
        risk.component.license.toLowerCase() === "unknown" ? (
          <Badge className={getSeverityClassNames("MEDIUM", false)}>
            Unknown
          </Badge>
        ) : (
          risk.component.license
        )}
      </td>
      <td className="p-4">
        {risk.finalLicenseDecision ?? (
          <span className="text-muted-foreground">Not yet corrected</span>
        )}
      </td>
    </tr>
  );
}
