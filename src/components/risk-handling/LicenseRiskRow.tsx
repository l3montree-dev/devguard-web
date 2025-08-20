// components/license-risk/LicenseRiskRow.tsx
import { useRouter } from "next/router";
import { licenseRisk } from "@/types/api/api";
import { classNames } from "@/utils/common";

type Props = {
  risk: licenseRisk;
  index: number;
  arrLength: number;
};

export default function LicenseRiskRow({ risk, index, arrLength }: Props) {
  const router = useRouter();

  return (
    <tr
      onClick={() =>
        router.push(
          router.asPath.split("?")[0] + "/../license-risks/" + risk.scannerID,
        )
      }
      className={classNames(
        "relative cursor-pointer align-top transition-all",
        index === arrLength - 1 ? "" : "border-b",
        index % 2 !== 0 && "bg-card/50",
        "hover:bg-gray-50 dark:hover:bg-card",
      )}
    >
      <td className="py-4 text-center align-baseline"></td>
      <td className="p-4">{risk.scannerID}</td>
      <td className="p-4">{risk.licenseName}</td>
      <td className="p-4">{risk.packageName}</td>
      <td className="p-4">{risk.finalLicenseDecision}</td>
    </tr>
  );
}
