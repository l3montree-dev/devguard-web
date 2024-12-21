interface Threat {
  threat: string;
  maxEvidence: number;
  currentEvidence: number;
  Message: JSX.Element;
}

export interface ThreatMitigationTopic {
  title: string; //e.g. "Producer Threats"
  description: JSX.Element;
  threats?: Threat[];
}
