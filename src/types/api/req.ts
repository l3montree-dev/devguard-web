import { RequirementsLevel } from "./api";

export interface CreateAssetReq {
  name: string;
  description: string;

  importance: number;

  reachableFromTheInternet: boolean;

  confidentialityRequirement: RequirementsLevel;
  integrityRequirement: RequirementsLevel;
  availabilityRequirement: RequirementsLevel;
}

export interface CreateProjectReq {
  name: string;
  description?: string;
}
