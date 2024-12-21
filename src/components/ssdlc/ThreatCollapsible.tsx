import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import CollapsibleControlTrigger from "../common/CollapsibleControlTrigger";

interface Props {
  threatMitigationTopic: ThreatMitigationTopic;
}

export default function ThreatCollapsible({ threatMitigationTopic }: Props) {
  return (
    <Collapsible>
      <CollapsibleControlTrigger
        maxEvidence={
          threatMitigationTopic.threats
            ? threatMitigationTopic.threats.reduce(
                (acc, curr) => acc + curr.maxEvidence,
                0,
              )
            : 0
        }
        currentEvidence={
          threatMitigationTopic.threats
            ? threatMitigationTopic.threats.reduce(
                (acc, curr) => acc + curr.currentEvidence,
                0,
              )
            : 0
        }
      >
        <div className="w-full text-left">{threatMitigationTopic.title}</div>
      </CollapsibleControlTrigger>
      <div className="border-b">
        <CollapsibleContent className="py-2">
          <div className="text-sm text-muted-foreground">
            {threatMitigationTopic.description}
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            {threatMitigationTopic.threats
              ? threatMitigationTopic.threats.map((threat, i) => (
                  <Collapsible
                    className="rounded-lg border bg-sidebar px-2 py-0"
                    key={threat.threat}
                  >
                    <CollapsibleControlTrigger
                      maxEvidence={threat.maxEvidence}
                      currentEvidence={threat.currentEvidence}
                    >
                      <div className="w-full text-left">{threat.threat}</div>
                    </CollapsibleControlTrigger>
                    <CollapsibleContent className="py-2">
                      <div className="text-sm text-muted-foreground">
                        {threat.Message}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              : null}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
