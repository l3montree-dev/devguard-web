import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { GitBranchIcon } from "lucide-react";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { AssetVersionDTO } from "@/types/api/api";

export function BranchTagSelector({
  branches,
  tags,
}: {
  branches: AssetVersionDTO[];
  tags: AssetVersionDTO[];
}) {
  const router = useRouter();

  const [selected, setSelected] = useState(
    router.query.assetVersionSlug as string,
  );
  const [filter, setFilter] = useState("");
  const [view, setView] = useState("branches");

  const items = view === "branches" ? branches : tags;
  const filteredItems = items.filter((item) => item.name.includes(filter));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <GitBranchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {selected}
          <CaretDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-50 w-56">
        <div className="p-1">
          <Input
            placeholder="Search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-2"
          />

          <div className="mb-2 flex space-x-2">
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
        <DropdownMenuSeparator />
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <DropdownMenuCheckboxItem
              checked={selected === item.name}
              key={item.slug}
              onClick={() => {
                router.push(
                  {
                    query: { ...router.query, assetVersionSlug: item.slug },
                  },
                  undefined,
                  { shallow: false },
                );

                setSelected(item.name);
              }}
            >
              {item.name}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No items found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
