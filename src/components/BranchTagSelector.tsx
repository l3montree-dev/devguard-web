import { AssetVersionDTO } from "@/types/api/api";
import { PlusCircleIcon, TagIcon } from "@heroicons/react/24/outline";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { GitBranchIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useDecodedParams from "../hooks/useDecodedParams";
import { browserApiClient } from "../services/devGuardApi";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { useUpdateAsset } from "../context/AssetContext";
import Link from "next/link";

export function BranchTagSelector({
  branches,
  tags,
  disableNavigateToRefInsteadCall,
}: {
  branches: AssetVersionDTO[];
  tags: AssetVersionDTO[];
  disableNavigateToRefInsteadCall?: (assetVersionDTO: AssetVersionDTO) => void;
}) {
  const router = useRouter();
  const params = useDecodedParams() as {
    assetVersionSlug: string;
    organizationSlug: string;
    assetSlug: string;
    projectSlug: string;
  };

  const initAssetVersion = branches
    .concat(tags)
    .find((i) => i.slug === params.assetVersionSlug);

  const [view, setView] = useState(
    initAssetVersion?.type === "tag" ? "tags" : "branches",
  );
  const items = view === "branches" ? branches : tags;

  const [selected, setSelected] = useState(
    initAssetVersion ? initAssetVersion.name : undefined,
  );
  const [filter, setFilter] = useState("");

  const filteredItems = useMemo(() => {
    items.sort((a, b) => a.name.localeCompare(b.name));
    const defaultBranch = items.findIndex((branch) => branch.defaultBranch);

    if (defaultBranch !== -1) {
      const defaultBranchItem = items.splice(defaultBranch, 1)[0];
      // add the default branch to the beginning of the list
      items.unshift(defaultBranchItem);
    }
    return items.filter((item) => item.name.includes(filter));
  }, [items, filter]);

  const pathname = usePathname();
  const updateAsset = useUpdateAsset();

  const handleBranchTagCreation = async () => {
    const body = {
      name: filter,
      tag: view === "tags",
    };

    const resp = await browserApiClient(
      "/organizations/" +
        params.organizationSlug +
        "/projects/" +
        params.projectSlug +
        "/assets/" +
        params.assetSlug +
        "/refs/",
      { method: "POST", body: JSON.stringify(body) },
    );

    if (!resp.ok) {
      return;
    }

    const newVersion = await resp.json();
    // add it to the state
    updateAsset((prev) =>
      !prev
        ? null
        : {
            ...prev,
            refs: [...prev.refs, newVersion],
          },
    );
    setFilter("");
    setSelected(newVersion.name);
    pushAssetRef(newVersion.slug);
  };

  const pushAssetRef = (refSlug: string) => {
    if (disableNavigateToRefInsteadCall) {
      disableNavigateToRefInsteadCall(
        branches.concat(tags).find((el) => el.slug === refSlug)!,
      );
      return;
    }
    if (!pathname) {
      return;
    }

    let pageArr = pathname.split("/refs/")[1].split("/");
    // the first element is the current refname
    pageArr = pageArr.slice(1);

    router?.push(
      `/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs/${refSlug}/${pageArr.join("/")}`,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {branches.concat(tags).find((el) => el.name === selected)?.type ===
          "tag" ? (
            <TagIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <GitBranchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          {selected ? selected : "Select Branch/Tag"}
          <CaretDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-50 w-56">
        <Input
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-1"
        />
        <div className="p-1">
          <div className="mb-0 flex space-x-2">
            <Button
              size={"sm"}
              variant={view === "branches" ? "outline" : "ghost"}
              onClick={() => setView("branches")}
            >
              Branches
            </Button>
            <Button
              size={"sm"}
              variant={view === "tags" ? "outline" : "ghost"}
              onClick={() => setView("tags")}
            >
              Tags
            </Button>
          </div>
        </div>

        {filteredItems.length === 0 && filter.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleBranchTagCreation}
              className="bg-card cursor-pointer mt-2 border flex flex-col items-start font-medium"
            >
              <div className="w-full flex flex-row justify-between">
                Create {view === "branches" ? "branch" : "tag"} {filter}
                <PlusCircleIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            </DropdownMenuItem>
          </>
        )}

        {filteredItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div style={{ maxHeight: "480px", overflowY: "auto" }}>
              {filteredItems.map((item) => (
                <DropdownMenuCheckboxItem
                  checked={selected === item.name}
                  key={item.slug}
                  onClick={() => {
                    pushAssetRef(item.slug);
                    setSelected(item.name);
                  }}
                >
                  {item.name}{" "}
                  {item.defaultBranch && (
                    <span className="text-muted-foreground ml-2">
                      (default branch)
                    </span>
                  )}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <Link
          href={`/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs`}
        >
          <DropdownMenuItem className="text-sm text-foreground block font-medium text-center w-full">
            View all branches and tags
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
