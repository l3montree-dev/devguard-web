import { useState } from "react";
import useSWR from "swr";
import { vexRuleRecommendationsURL } from "../components/vex-rules/useVexRuleRecommendations";
import { fetcher } from "../data-fetcher/fetcher";
import type {
  Paged,
  VexRulePrefill,
  VexRuleRecommendation,
} from "../types/api/api";
import { useCurrentUserRole, isMember } from "./useUserRole";
import useDecodedParams from "./useDecodedParams";

export default function useVexRuleRecommendations(
  recommendationsQuery?: URLSearchParams | null,
) {
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
  const [rulePrefill, setRulePrefill] = useState<VexRulePrefill>();
  const [addRuleDialogOpen, setAddRuleDialogOpen] = useState(false);
  const currentUserRole = useCurrentUserRole();
  const canSeeRecommendations = isMember(currentUserRole);
  const recommendationsUrl = vexRuleRecommendationsURL({
    organizationSlug,
    projectSlug,
    assetSlug,
  });
  const { data: recommendationsResponse, isLoading: isRecommendationsLoading } =
    useSWR<Paged<VexRuleRecommendation>>(
      canSeeRecommendations
        ? `${recommendationsUrl}/?${recommendationsQuery?.toString()}`
        : null,
      fetcher,
    );

  const createRuleFromRecommendation = (
    recommendation: VexRuleRecommendation,
  ) => {
    setRulePrefill({
      celExpression: recommendation.celExpression,
      justification: recommendation.justification,
      mechanicalJustification: recommendation.mechanicalJustification,
      wasRecommended: true,
      title: recommendation.title,
    });
    setAddRuleDialogOpen(true);
  };

  return {
    rulePrefill,
    setRulePrefill,
    addRuleDialogOpen,
    setAddRuleDialogOpen,
    recommendationsResponse,
    isRecommendationsLoading,
    createRuleFromRecommendation,
    canSeeRecommendations,
  };
}
