interface Threat {
  threat: string;
  maxEvidence: number;
  currentEvidence: number;
  Message: JSX.Element;
}

export type ThreatMitigationTopic =
  | {
      title: string; //e.g. "Producer Threats"
      description: JSX.Element;
      threats: Threat[];
    }
  | {
      title: string; //e.g. "Producer Threats"
      description: JSX.Element;
      currentEvidence: number;
      maxEvidence: number;
    };
