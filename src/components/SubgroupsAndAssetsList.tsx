"use client";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssetDTO, ProjectDTO } from "../types/api/api";
import AssetOverviewListItem from "./AssetOverviewListItem";
import Avatar from "./Avatar";
import EmptyParty from "./common/EmptyParty";
import ListItem from "./common/ListItem";
import ListRenderer from "./common/ListRenderer";
import Markdown from "./common/Markdown";
import { ProjectBadge } from "./common/ProjectTitle";
import { Badge } from "./ui/badge";
import { randFloat } from "three/src/math/MathUtils.js";

export type SubGroupsAndAsset =
  | (AssetDTO & { resourceType: "asset" })
  | (ProjectDTO & { resourceType: "project" });

export function isProject(
  d: SubGroupsAndAsset,
): d is ProjectDTO & { resourceType: "project" } {
  return d.resourceType === "project";
}

export function checkType(data: SubGroupsAndAsset):
  | {
      asset: AssetDTO & { resourceType: "asset" };
      subgroup: null;
    }
  | {
      asset: null;
      subgroup: ProjectDTO & { resourceType: "project" };
    } {
  return isProject(data)
    ? { asset: null, subgroup: data }
    : { asset: data, subgroup: null };
}

interface Props {
  project?: ProjectDTO;
  subgroupsWithAssets?: SubGroupsAndAsset[];
  onFetchData(projectSlug: string, projectId: string): any;
  error?: Error;
  projectSlug: string;
}

export default function SubgroupsAndAssetsList({
  subgroupsWithAssets,
  onFetchData,
  error,
  projectSlug,
  project,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(project === undefined);
  const activeOrg = useActiveOrg();
  const router = useRouter();

  const toggleSubgroup = (slug: string, id: string) => {
    onFetchData(slug, id);
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      {project && (
        <ListItem
          reactOnHover
          Title={
            <div className="flex flex-row items-center gap-2">
              <button
                onClick={() => toggleSubgroup(projectSlug, project.id)}
                className="p-1 rounded hover:bg-muted flex-shrink-0"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div
                className="flex flex-row items-center gap-2 cursor-pointer"
                onClick={() =>
                  router.push(`/${activeOrg.slug}/projects/${project.slug}`)
                }
              >
                <Avatar {...project} />
                <span>{project?.name}</span>
                {project.state === "deleted" && (
                  <Badge variant={"destructive"}>Pending deletion</Badge>
                )}
              </div>
            </div>
          }
          Description={
            <div className="flex flex-col">
              <span>
                <Markdown
                  components={{
                    a: (props: React.ComponentPropsWithoutRef<"a">) => (
                      <span>{props.children}</span>
                    ),
                  }}
                >
                  {project.description}
                </Markdown>
              </span>
              {project.type !== "default" && (
                <div className="flex mt-4 flex-row items-center gap-2">
                  <ProjectBadge type={project.type} />
                </div>
              )}
            </div>
          }
        />
      )}
      {isExpanded && (
        <ListRenderer
          isLoading={subgroupsWithAssets === undefined}
          error={error}
          data={subgroupsWithAssets}
          Empty={<EmptyParty title={"No groups found"} description="" />}
          renderItem={(item) => {
            const { asset, subgroup } = checkType(item);

            if (asset) {
              return (
                <div
                  className={`${project == undefined ? "" : "ml-10 mt-4"}`}
                  key={asset.id}
                >
                  <AssetOverviewListItem
                    key={asset.id}
                    asset={asset}
                    projectSlug={projectSlug}
                  />
                </div>
              );
            }

            if (subgroup) {
              return (
                <div
                  className={`${project == undefined ? "" : "ml-10 mt-4"}`}
                  key={subgroup.id}
                >
                  <SubgroupsAndAssetsList
                    project={subgroup}
                    onFetchData={onFetchData}
                    projectSlug={subgroup.slug}
                    subgroupsWithAssets={subgroup.subGroupsAndAsset}
                  />
                </div>
              );
            }
          }}
        />
      )}
    </>
  );
}
