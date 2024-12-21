import CollapsibleControlTrigger from "@/components/common/CollapsibleControlTrigger";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { AssetDTO } from "@/types/api/api";
import Link from "next/link";
import { NextRouter } from "next/router";

interface Props {
  router: NextRouter;
  asset: AssetDTO;
}

export default function CompromiseDuringSourceCodeUploadCollapsible({
  router,
  asset,
}: Props) {
  return (
    <Collapsible>
      <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
        <div className="w-full text-left">
          (B) Compromise during source code upload
        </div>
      </CollapsibleControlTrigger>
      <div className="border-b text-sm text-muted-foreground">
        <CollapsibleContent className="py-2">
          <p>
            <strong>Example</strong>: An attacker who has gained access to the
            software developers network can manipulate the source code during
            the upload process by conducting a man-in-the-middle (MITM) attack.
          </p>
          <p className="mt-2">
            To mitigate this risk, Git supports secure upload methods using SSH
            or HTTPS. Additionally, the upload process can be further protected
            by leveraging In-Toto file hash recording, ensuring the integrity
            and authenticity of the source code.
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
  );
}
