"use client";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { PolicyEvaluation } from "@/types/api/api";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FunctionComponent } from "react";
import useSWR from "swr";
import ColoredBadge from "../../../../../../../../../components/common/ColoredBadge";
import EmptyParty from "../../../../../../../../../components/common/EmptyParty";
import ListItem from "../../../../../../../../../components/common/ListItem";
import ListRenderer from "../../../../../../../../../components/common/ListRenderer";
import { fetcher } from "../../../../../../../../../data-fetcher/fetcher";
import useDecodedParams from "../../../../../../../../../hooks/useDecodedParams";
import { violationLengthToLevel } from "../../../../../compliance/page";
interface Props {
  compliance: PolicyEvaluation[];
}

const ComplianceIndex: FunctionComponent<Props> = () => {
  const menu = useAssetMenu();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const {
    data: compliance,
    isLoading,
    error,
  } = useSWR<PolicyEvaluation[]>(
    `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/compliance`,
    fetcher,
  );

  const pathname = usePathname();

  return (
    <Page Menu={menu} Title={<AssetTitle />} title="Compliance Controls">
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="This section contains all compliance controls that are available for your repositories."
            title="Compliance Controls"
            forceVertical
          >
            <ListRenderer
              isLoading={isLoading}
              error={error}
              Empty={
                <EmptyParty
                  title="No compliance controls found"
                  description="Create compliance controls and inspect their evaluation."
                />
              }
              data={compliance || []}
              renderItem={(control) => (
                <Link key={control.id} href={pathname + "/" + control.id}>
                  <ListItem
                    reactOnHover
                    Title={
                      <span className="flex flex-row items-center gap-2">
                        {control.title}
                        {control.compliant === null ? (
                          <ColoredBadge variant="high">
                            <TriangleAlert className="h-4 w-4 mr-1" />
                            Could not evaluate control
                          </ColoredBadge>
                        ) : (
                          <ColoredBadge
                            variant={violationLengthToLevel(
                              control.violations?.length ?? 0,
                            )}
                          >
                            {control.violations?.length ?? 0} Violations
                          </ColoredBadge>
                        )}
                      </span>
                    }
                    Description={<div>{control.description}</div>}
                    Button={<div className="whitespace-nowrap"></div>}
                  />
                </Link>
              )}
            />
          </Section>
        </div>
      </div>
    </Page>
  );
};

export default ComplianceIndex;
