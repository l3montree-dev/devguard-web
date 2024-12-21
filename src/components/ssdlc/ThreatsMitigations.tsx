import { AssetDTO, AssetMetricsDTO } from "@/types/api/api";
import { NextRouter } from "next/router";
import ThreatCollapsible from "./ThreatCollapsible";
import { buildFromModifiedSource } from "./threats-mitigations/BuildFromModifiedSourceCode";
import { compromiseBuildProcess } from "./threats-mitigations/CompromiseBuildProcess";
import { compromiseDuringSourceCodeUpload } from "./threats-mitigations/CompromiseDuringSourceCodeUpload";
import { compromisePackageRegistry } from "./threats-mitigations/CompromisePackageRegistry";
import { compromiseSourceRepo } from "./threats-mitigations/CompromiseSourceRepo";
import { deployCompromisedNoncompliantSoftware } from "./threats-mitigations/DeployCompromisedNonCompliantSoftware";
import { producerThreats } from "./threats-mitigations/ProducerThreats";
import { uploadModifiedPackage } from "./threats-mitigations/UploadModifiedPackage";
import { useCompromisedDependency } from "./threats-mitigations/UseCompromisedDependency";
import { useCompromisedPackage } from "./threats-mitigations/UseCompromisedPackage";

interface Props {
  router: NextRouter;
  asset: AssetDTO;
  metrics: AssetMetricsDTO;
}

export default function ThreatsMitigationsCollapsibles({
  router,
  metrics,
  asset,
}: Props) {
  return (
    <>
      <ThreatCollapsible
        threatMitigationTopic={producerThreats(router, asset, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={compromiseDuringSourceCodeUpload(
          router,
          metrics,
        )}
      />
      <ThreatCollapsible
        threatMitigationTopic={compromiseSourceRepo(router, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={buildFromModifiedSource(router, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={useCompromisedDependency(router, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={compromiseBuildProcess(router, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={uploadModifiedPackage(router, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={compromisePackageRegistry(router, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={useCompromisedPackage(router, metrics)}
      />
      <ThreatCollapsible
        threatMitigationTopic={deployCompromisedNoncompliantSoftware(
          router,
          metrics,
        )}
      />
    </>
  );
}
