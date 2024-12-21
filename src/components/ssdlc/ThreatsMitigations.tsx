import { NextRouter } from "next/router";
import { producerThreats } from "./threats-mitigations/ProducerThreats";
import { AssetDTO } from "@/types/api/api";
import { compromiseDuringSourceCodeUpload } from "./threats-mitigations/CompromiseDuringSourceCodeUpload";
import { compromiseSourceRepo } from "./threats-mitigations/CompromiseSourceRepo";
import { buildFromModifiedSource } from "./threats-mitigations/BuildFromModifiedSourceCode";
import ThreatCollapsible from "./ThreatCollapsible";
import { useCompromisedDependency } from "./threats-mitigations/UseCompromisedDependency";
import { compromiseBuildProcess } from "./threats-mitigations/CompromiseBuildProcess";
import { uploadModifiedPackage } from "./threats-mitigations/UploadModifiedPackage";
import { compromisePackageRegistry } from "./threats-mitigations/CompromisePackageRegistry";
import { useCompromisedPackage } from "./threats-mitigations/UseCompromisedPackage";
import { deployCompromisedNoncompliantSoftware } from "./threats-mitigations/DeployCompromisedNonCompliantSoftware";

interface Props {
  router: NextRouter;
  asset: AssetDTO;
}

export default function ThreatsMitigationsCollapsibles({
  router,
  asset,
}: Props) {
  return (
    <>
      <ThreatCollapsible
        threatMitigationTopic={producerThreats(router, asset)}
      />
      <ThreatCollapsible
        threatMitigationTopic={compromiseDuringSourceCodeUpload(router)}
      />
      <ThreatCollapsible threatMitigationTopic={compromiseSourceRepo(router)} />
      <ThreatCollapsible
        threatMitigationTopic={buildFromModifiedSource(router)}
      />
      <ThreatCollapsible
        threatMitigationTopic={useCompromisedDependency(router)}
      />
      <ThreatCollapsible
        threatMitigationTopic={compromiseBuildProcess(router)}
      />
      <ThreatCollapsible
        threatMitigationTopic={uploadModifiedPackage(router)}
      />
      <ThreatCollapsible
        threatMitigationTopic={compromisePackageRegistry(router)}
      />
      <ThreatCollapsible
        threatMitigationTopic={useCompromisedPackage(router)}
      />
      <ThreatCollapsible
        threatMitigationTopic={deployCompromisedNoncompliantSoftware(router)}
      />
    </>
  );
}
