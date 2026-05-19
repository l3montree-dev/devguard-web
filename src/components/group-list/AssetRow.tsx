import { CodeBracketSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { ComponentPropsWithoutRef, FunctionComponent } from "react";
import { useActiveOrg } from "../../hooks/useActiveOrg";
import { cn } from "../../lib/utils";
import type { AssetDTO } from "../../types/api/api";
import Markdown from "../common/Markdown";
import { Badge } from "../ui/badge";

interface Props {
  asset: AssetDTO;
  projectSlug: string;
  variant?: "default" | "nested";
  isLast?: boolean;
}

const AssetRow: FunctionComponent<Props> = ({
  asset,
  projectSlug,
  variant = "default",
  isLast = false,
}) => {
  const activeOrg = useActiveOrg();

  return (
    <div
      className={
        variant === "nested"
          ? cn("-ml-2 pl-1 pb-1", isLast ? "" : "border-b")
          : "border-b pb-4"
      }
    >
      <Link
        href={`/${activeOrg.slug}/projects/${projectSlug}/assets/${asset.slug}/`}
        className="block no-underline text-inherit"
      >
        <div className="flex flex-row items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent">
          {asset.avatar ? (
            <img
              src={`data:image/png;base64,${asset.avatar}`}
              alt={asset.name}
              className="h-8 w-8 shrink-0 rounded-lg border border-foreground/20 bg-muted object-cover"
            />
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-lg border border-foreground/20 bg-muted flex items-center justify-center">
              <CodeBracketSquareIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-row items-center gap-2">
              <span className="font-medium text-foreground truncate">
                {asset.name}
              </span>
              {asset.state === "archived" && (
                <Badge variant="outline">Archived</Badge>
              )}
              {asset.state === "deleted" && (
                <Badge variant="destructive">Pending deletion</Badge>
              )}
            </div>
            {Boolean(asset.description) && (
              <div className="text-sm text-muted-foreground">
                <Markdown
                  components={{
                    a: (props: ComponentPropsWithoutRef<"a">) => (
                      <span>{props.children}</span>
                    ),
                  }}
                >
                  {asset.description}
                </Markdown>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AssetRow;
