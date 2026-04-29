"use client";

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssetDTO, ProjectDTO, SubGroupsAndAsset } from "../types/api/api";
import AssetOverviewListItem from "./AssetOverviewListItem";
import Avatar from "./Avatar";
import EmptyParty from "./common/EmptyParty";
import ListItem from "./common/ListItem";
import ListRenderer from "./common/ListRenderer";
import Markdown from "./common/Markdown";
import { ProjectBadge } from "./common/ProjectTitle";
import { Badge } from "./ui/badge";
import Link from "next/link";

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
  const [isLoading, setIsLoading] = useState(false);
  const activeOrg = useActiveOrg();
  const router = useRouter();

  const toggleSubgroup = async (
    slug: string,
    id: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExpanded && subgroupsWithAssets === undefined) {
      setIsLoading(true);
      try {
        await onFetchData(slug, id);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      {project && (
        <Link
          key={project.id}
          href={`/${activeOrg.slug}/projects/${project.slug}`}
          className="flex flex-col gap-2 no-underline text-inherit"
        >
          <ListItem
            reactOnHover
            Title={
              <div className="flex flex-row items-center gap-2">
                <button
                  onClick={(e) => toggleSubgroup(projectSlug, project.id, e)}
                  className="p-1 rounded hover:bg-muted flex-shrink-0"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <Avatar {...project} />
                <span>{project?.name}</span>
                {project.state === "deleted" && (
                  <Badge variant={"destructive"}>Pending deletion</Badge>
                )}
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
        </Link>
      )}
      {isExpanded && (
        <ListRenderer
          isLoading={isLoading}
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
