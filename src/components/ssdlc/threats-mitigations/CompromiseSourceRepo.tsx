import CollapsibleControlTrigger from "@/components/common/CollapsibleControlTrigger";
import { Button } from "@/components/ui/button";
import { AssetDTO } from "@/types/api/api";
import { Collapsible, CollapsibleContent } from "@radix-ui/react-collapsible";
import Link from "next/link";
import { NextRouter } from "next/router";

interface Props {
  router: NextRouter;
  asset: AssetDTO;
}

export default function CompromiseSourceRepoCollapsible({
  router,
  asset,
}: Props) {
  return (
    <Collapsible>
      <CollapsibleControlTrigger maxEvidence={1} currentEvidence={0}>
        <div className="w-full text-left">(C) Compromise source repository</div>
      </CollapsibleControlTrigger>
      <div className="border-b text-sm text-muted-foreground">
        <CollapsibleContent className="py-2">
          <p>
            <strong>Example</strong>: An adversary introduces a change to the
            source control repository, like GitLab, through an administrative
            interface, or through a compromise of the underlying infrastructure.
          </p>
          <p className="mt-2"></p>
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
