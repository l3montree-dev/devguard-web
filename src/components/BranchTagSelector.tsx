import {
  DropdownMenu,
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

export function BranchTagSelector({
  branches,
  tags,
}: {
  branches: string[];
  tags: string[];
}) {
  const router = useRouter();

  const [selected, setSelected] = useState(
    router.query.assetVersionSlug as string,
  );
  const [filter, setFilter] = useState("");
  const [view, setView] = useState("branches");

  const items = view === "branches" ? branches : tags;
  const filteredItems = items.filter((item) => item.includes(filter));

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
            <DropdownMenuItem
              key={item}
              className="px-1"
              onClick={() => {
                router.push(
                  {
                    query: { ...router.query, assetVersionSlug: item },
                  },
                  undefined,
                  { shallow: false },
                );

                setSelected(item);
              }}
            >
              {item}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No items found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
