import { Button } from "@/components/ui/button";
import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import Link from "next/link";
import { NextRouter } from "next/router";
import { AssetMetricsDTO } from "../../../types/api/api";

export const compromiseDuringSourceCodeUpload = (
  router: NextRouter,
  metrics: AssetMetricsDTO,
): ThreatMitigationTopic => {
  return {
    title: "(B) Compromise during source code upload",
    currentEvidence: Number(
      Boolean(metrics.verifiedSupplyChainsPercentage > 0),
    ),
    maxEvidence: 1,
    description: (
      <>
        <p>
          <strong>Example</strong>: An attacker who has gained access to the
          software developers network can manipulate the source code during the
          upload process by conducting a man-in-the-middle (MITM) attack.
        </p>
        <p className="mt-2">
          To mitigate this risk, Git supports secure upload methods using SSH or
          HTTPS. Additionally, the upload process can be further protected by
          leveraging In-Toto file hash recording, ensuring the integrity and
          authenticity of the source code.
        </p>

        <div className="mt-4">
          <Link
            href={
              router.asPath +
              "/security-control-center?highlight=in-toto-provenance"
            }
          >
            <Button size={"sm"} variant={"secondary"}>
              Enable In-Toto Provenance
            </Button>
          </Link>
        </div>
      </>
    ),
  };
};
