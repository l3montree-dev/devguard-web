import { ThreatMitigationTopic } from "@/types/view/threatMitigationsTypes";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import CollapsibleControlTrigger from "../common/CollapsibleControlTrigger";

interface Props {
  threatMitigationTopic: ThreatMitigationTopic;
}

export default function ThreatCollapsible({ threatMitigationTopic }: Props) {
  const maxEvidence =
    "threats" in threatMitigationTopic
      ? threatMitigationTopic.threats.reduce(
          (acc, curr) => acc + curr.maxEvidence,
          0,
        )
      : threatMitigationTopic.maxEvidence;

  const currentEvidence =
    "threats" in threatMitigationTopic
      ? threatMitigationTopic.threats.reduce(
          (acc, curr) => acc + curr.currentEvidence,
          0,
        )
      : threatMitigationTopic.currentEvidence;

  return (
    <Collapsible>
      <CollapsibleControlTrigger
        maxEvidence={maxEvidence}
        currentEvidence={currentEvidence}
      >
        <div className="w-full text-left">{threatMitigationTopic.title}</div>
      </CollapsibleControlTrigger>
      <div className="border-b border-b-muted">
        <CollapsibleContent className="py-2">
          <div className="text-sm text-muted-foreground">
            {threatMitigationTopic.description}
          </div>
          {"threats" in threatMitigationTopic && (
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {threatMitigationTopic.threats.map((threat, i) => (
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
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
