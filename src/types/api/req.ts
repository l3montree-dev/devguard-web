import { RequirementsLevel } from "./api";

export interface CreateAssetReq {
  name: string;
  description: string;

  importance: number;

  confidentialityRequirement: RequirementsLevel;
  integrityRequirement: RequirementsLevel;
  availabilityRequirement: RequirementsLevel;
}

export interface CreateProjectReq {
  name: string;
  description?: string;
}
