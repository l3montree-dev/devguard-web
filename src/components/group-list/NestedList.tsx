import type { FunctionComponent } from "react";
import type { SubGroupsAndAsset } from "../../types/api/api";
import Err from "../common/Err";
import EmptyParty from "../common/EmptyParty";
import SkeletonListItems from "../common/SkeletonListItems";
import { Skeleton } from "../ui/skeleton";
import AssetRow from "./AssetRow";
import ProjectRow from "./ProjectRow";
import { checkType } from "./utils";

interface Props {
  items?: SubGroupsAndAsset[];
  onFetchData: (projectSlug: string, projectId: string) => any;
  error?: Error;
  isLoading?: boolean;
  parentProjectSlug: string;
  compact?: boolean;
}

const NestedRowSkeleton: FunctionComponent = () => (
  <div className="flex flex-row items-center gap-3 px-3 py-2">
    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
    <div className="flex flex-1 flex-col gap-1.5">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

const NestedList: FunctionComponent<Props> = ({
  items,
  onFetchData,
  error,
  isLoading = false,
  parentProjectSlug,
  compact = false,
}) => {
  if (isLoading) {
    if (compact) {
      return (
        <>
          <NestedRowSkeleton />
          <NestedRowSkeleton />
          <NestedRowSkeleton />
        </>
      );
    }
    return <SkeletonListItems variant="project" />;
  }

  if (error) {
    return <Err />;
  }

  if (!items || items.length === 0) {
    if (compact) {
      return null;
    }
    return <EmptyParty title="No groups found" description="" />;
  }

  return (
    <>
      {items.map((item, index) => {
        const { asset, subgroup } = checkType(item);
        if (asset) {
          return (
            <AssetRow
              key={asset.id}
              asset={asset}
              projectSlug={parentProjectSlug}
              variant={compact ? "nested" : "default"}
              isLast={index === items.length - 1}
            />
          );
        }
        return (
          <ProjectRow
            key={subgroup.id}
            project={subgroup}
            subgroupsWithAssets={subgroup.subGroupsAndAsset}
            onFetchData={onFetchData}
            depth="nested"
            isLast={index === items.length - 1}
          />
        );
      })}
    </>
  );
};

export default NestedList;
