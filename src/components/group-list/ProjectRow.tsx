"use client";

import {
  ChevronDownIcon,
  RectangleGroupIcon as RectangleGroupIconOutline,
} from "@heroicons/react/24/outline";
import { RectangleGroupIcon as RectangleGroupIconSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FunctionComponent,
  type KeyboardEvent,
} from "react";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import type { ProjectDTO, SubGroupsAndAsset } from "../../types/api/api";
import { classNames } from "../../utils/common";
import Markdown from "../common/Markdown";
import { ProjectBadge } from "../common/ProjectTitle";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import EmptyGroupState from "./EmptyGroupState";
import NestedList from "./NestedList";

interface Props {
  project: ProjectDTO;
  subgroupsWithAssets?: SubGroupsAndAsset[];
  onFetchData: (projectSlug: string, projectId: string) => any;
  error?: Error;
  depth: "root" | "nested";
  isLast?: boolean;
}

const ProjectRow: FunctionComponent<Props> = ({
  project,
  subgroupsWithAssets,
  onFetchData,
  isLast,
  error,
  depth,
}) => {
  const activeOrg = useActiveOrg();
  const isRoot = depth === "root";
  const isFetched = subgroupsWithAssets != null;
  const hasContent = isFetched && (subgroupsWithAssets?.length ?? 0) > 0;
  const [isOpen, setIsOpen] = useState(hasContent);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchCompleted, setFetchCompleted] = useState(isFetched);
  const inFlight = useRef(false);

  const fetchChildren = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsLoading(true);
    setFetchCompleted(false);
    try {
      await onFetchData(project.slug, project.id);
      setFetchCompleted(true);
    } finally {
      setIsLoading(false);
      inFlight.current = false;
    }
  }, [onFetchData, project.slug, project.id]);

  useEffect(() => {
    if (hasContent) setIsOpen(true);
  }, [hasContent]);

  useEffect(() => {
    if (isOpen && !isFetched && !inFlight.current) {
      fetchChildren();
    }
  }, [isOpen, isFetched, fetchChildren]);

  const toggle = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !isFetched) {
      await fetchChildren();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const Icon = isRoot ? RectangleGroupIconSolid : RectangleGroupIconOutline;

  const body = (
    <Collapsible
      className={classNames(isLast ? "" : "border-b", "-ml-2 pl-2")}
      open={isOpen}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={classNames(
          "flex flex-row items-center gap-3 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isRoot ? "px-4 py-3" : "rounded-md px-2 py-2",
        )}
      >
        {project.avatar ? (
          <img
            src={`data:image/png;base64,${project.avatar}`}
            alt={project.name}
            className="h-8 w-8 shrink-0 rounded-lg border border-foreground/20 bg-muted object-cover"
          />
        ) : (
          <div className="h-8 w-8 shrink-0 rounded-lg border border-foreground/20 bg-muted flex items-center justify-center">
            <Icon
              className={classNames(
                "h-5 w-5",
                isRoot ? "!text-foreground" : "text-muted-foreground",
              )}
            />
          </div>
        )}
        <div className="flex flex-1 min-w-0 flex-col">
          <div className="flex flex-row items-center gap-2">
            <Link
              href={`/${activeOrg.slug}/projects/${project.slug}`}
              onClick={(e) => e.stopPropagation()}
              className={classNames(
                "!text-foreground truncate hover:underline",
                isRoot ? "font-semibold text-base" : "font-medium",
              )}
            >
              {project.name}
            </Link>
            {project.type !== "default" && <ProjectBadge type={project.type} />}
            {project.state === "deleted" && (
              <Badge variant="destructive">Pending deletion</Badge>
            )}
          </div>
          {Boolean(project.description) && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              <Markdown
                components={{
                  a: (props: ComponentPropsWithoutRef<"a">) => (
                    <span>{props.children}</span>
                  ),
                }}
              >
                {project.description}
              </Markdown>
            </div>
          )}
        </div>
        <ChevronDownIcon
          className={classNames(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isRoot && "mr-3",
            isOpen && "rotate-180",
          )}
        />
      </div>
      <CollapsibleContent>
        {(isLoading || Boolean(error) || hasContent) && (
          <div
            className={
              isRoot ? "relative px-4 pl-10" : "relative ml-3 mt-1 pl-6 pb-1"
            }
          >
            <div
              className={classNames(
                "absolute border-l border-border",
                isRoot
                  ? "left-[31px] -top-3 bottom-0"
                  : "left-[14px] top-0 bottom-2",
              )}
            />
            <div className="flex flex-col gap-1">
              <NestedList
                items={subgroupsWithAssets}
                onFetchData={onFetchData}
                error={error}
                isLoading={isLoading}
                parentProjectSlug={project.slug}
                compact
              />
            </div>
          </div>
        )}
        {!isLoading &&
          !error &&
          (isFetched || fetchCompleted) &&
          !hasContent && <EmptyGroupState variant={isRoot ? "card" : "row"} />}
      </CollapsibleContent>
    </Collapsible>
  );

  if (isRoot) {
    return <div>{body}</div>;
  }
  return body;
};

export default ProjectRow;
