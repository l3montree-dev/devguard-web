import { RequirementsLevel } from "./api";

export interface CreateAssetReq {
  name: string;
  description: string;

  Importance: number;

  ReachableFromInternet: boolean;

  ConfidentialityRequirement: RequirementsLevel;
  IntegrityRequirement: RequirementsLevel;
  AvailabilityRequirement: RequirementsLevel;
}

export interface CreateProjectReq {
  name: string;
  description: string;
}
