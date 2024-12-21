import { CollapsibleContent, Collapsible } from "@radix-ui/react-collapsible";
import { Link } from "lucide-react";
import { NextRouter } from "next/router";
import CollapsibleControlTrigger from "../common/CollapsibleControlTrigger";
import { Button } from "../ui/button";
import ProducerThreatsCollapsible from "./threats-mitigations/ProducerThreats";
import { AssetDTO } from "@/types/api/api";
import CompromiseDuringSourceCodeUploadCollapsible from "./threats-mitigations/CompromiseDuringSourceCodeUpload";
import CompromiseSourceRepoCollapsible from "./threats-mitigations/CompromiseSourceRepo";

interface Props {
  router: NextRouter;
  asset: AssetDTO;
}

export default function CollapsibleThreatsMitigations({
  router,
  asset,
}: Props) {
  return (
    <>
      <ProducerThreatsCollapsible router={router} asset={asset} />
      <CompromiseDuringSourceCodeUploadCollapsible
        router={router}
        asset={asset}
      />
      <CompromiseSourceRepoCollapsible router={router} asset={asset} />
      <Collapsible>
        <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
          <div className="w-full text-left">
            (D) Build from modified source code
          </div>
        </CollapsibleControlTrigger>
        <div className="border-b text-sm text-muted-foreground">
          <CollapsibleContent className="py-2">
            <p>
              <strong>Example</strong>: An attacker is able to compromise GitHub
              Actions and is able to modify the source code before the build
              process starts.
            </p>
            <p className="mt-2">
              DevGuard uses In-Toto to verify the integrity of the build
              process. In-Toto records the file hashes of the materials, like
              source code, and the produced artifacts. DevGuard verifies, that
              the input of the build equals the output of commit. Thus it is
              able to detect if the source code was modified before the build
              process.
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
          </CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
          <div className="w-full text-left">(E) Use compromised dependency</div>
        </CollapsibleControlTrigger>
        <div className="border-b text-sm text-muted-foreground">
          <CollapsibleContent className="py-2"></CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
          <div className="w-full text-left">(F) Compromise build process</div>
        </CollapsibleControlTrigger>
        <div className="border-b text-sm text-muted-foreground">
          <CollapsibleContent className="py-2"></CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
          <div className="w-full text-left">(G) Upload modified package</div>
        </CollapsibleControlTrigger>
        <div className="border-b text-sm text-muted-foreground">
          <CollapsibleContent className="py-2"></CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
          <div className="w-full text-left">
            (H) Compromise package registry
          </div>
        </CollapsibleControlTrigger>
        <div className="border-b text-sm text-muted-foreground">
          <CollapsibleContent className="py-2"></CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
          <div className="w-full text-left">(I) Use compromised package</div>
        </CollapsibleControlTrigger>
        <div className="border-b text-sm text-muted-foreground">
          <CollapsibleContent className="py-2"></CollapsibleContent>
        </div>
      </Collapsible>
      <Collapsible>
        <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
          <div className="w-full text-left">
            (J) Deploy compromised or noncompliant software
          </div>
        </CollapsibleControlTrigger>
        <div className="border-b text-sm text-muted-foreground">
          <CollapsibleContent className="py-2"></CollapsibleContent>
        </div>
      </Collapsible>
    </>
  );
}
