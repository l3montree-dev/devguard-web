// components/license-risk/LicenseRiskRow.tsx
import { useRouter } from "next/router";
import { beautifyPurl, classNames } from "@/utils/common";
import { LicenseRiskDTO } from "../../types/api/api";
import { defaultScanner } from "../../utils/view";
import EcosystemImage from "../common/EcosystemImage";
import ArtifactBadge from "../ArtifactBadge";

type Props = {
  risk: LicenseRiskDTO;
  index: number;
  arrLength: number;
};

export default function LicenseRiskRow({ risk, index, arrLength }: Props) {
  const router = useRouter();

  return (
    <tr
      onClick={() =>
        router.push(
          router.asPath.split("?")[0] + "/../license-risks/" + risk.id,
        )
      }
      className={classNames(
        "relative cursor-pointer align-top transition-all",
        index === arrLength - 1 ? "" : "border-b",
        index % 2 !== 0 && "bg-card/50",
        "hover:bg-gray-50 dark:hover:bg-card",
      )}
    >
      <td className="p-4 flex flex-row items-center gap-2">
        <EcosystemImage packageName={risk.componentPurl} />{" "}
        {beautifyPurl(risk.componentPurl)}
      </td>

      <td className="p-4">{risk.component.license}</td>
      <td className="p-4">
        {risk.artifacts.map((artifact) => (
          <ArtifactBadge
            key={artifact.artifactName}
            artifactName={artifact.artifactName}
          />
        ))}
      </td>
      <td className="p-4">{risk.finalLicenseDecision}</td>
    </tr>
  );
}
