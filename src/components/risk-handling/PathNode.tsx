"use client";

import EcosystemImage from "@/components/common/EcosystemImage";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { beautifyPurl, extractVersion } from "@/utils/common";
import { Boxes } from "lucide-react";
import type { FunctionComponent } from "react";

export type PathNodeRole = "root" | "dependency" | "vulnerable";

const roleDescription: Record<PathNodeRole, string> = {
  root: "Your application",
  dependency: "Dependency",
  vulnerable: "Vulnerable",
};

interface PathNodeProps {
  // Either a purl (dependency / vulnerable) or the application name (root).
  label: string;
  role: PathNodeRole;
}

const PathNode: FunctionComponent<PathNodeProps> = ({ label, role }) => {
  const isRoot = role === "root";
  const isVulnerable = role === "vulnerable";

  const name = isRoot ? label : beautifyPurl(label);
  const version = isRoot ? "" : extractVersion(label);

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn(
        "max-w-[15rem]",
        isVulnerable ? "border-destructive/40" : "border-muted-foreground/40",
      )}
    >
      <ItemMedia
        variant="icon"
        className={cn(isVulnerable && "border-destructive/40 text-destructive")}
      >
        {isRoot ? (
          <Boxes className="text-primary" />
        ) : (
          <EcosystemImage packageName={label} size={16} />
        )}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <span className="truncate">{name}</span>
          {version && (
            <Badge variant="outline" className="shrink-0 font-normal">
              {version}
            </Badge>
          )}
        </ItemTitle>
        <ItemDescription className={cn(isVulnerable && "text-destructive/80")}>
          {roleDescription[role]}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};

export default PathNode;
