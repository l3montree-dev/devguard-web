import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { useRouter } from "next/router";

export function BranchTagSelector({
  branches,
  tags,
}: {
  branches: string[];
  tags: string[];
}) {
  const [selected, setSelected] = useState("main");
  const [filter, setFilter] = useState("");
  const [view, setView] = useState("branches");

  const router = useRouter();

  const items = view === "branches" ? branches : tags;
  const filteredItems = items.filter((item) => item.includes(filter));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{selected}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 w-56 bg-black">
        <div className="p-2">
          <Input
            placeholder="Search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-2"
          />
          <div className="mb-2 flex space-x-2">
            <Button
              variant={view === "branches" ? "default" : "outline"}
              onClick={() => setView("branches")}
            >
              Branches
            </Button>
            <Button
              variant={view === "tags" ? "default" : "outline"}
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
              onClick={() => {
                setSelected(item);

                let cleanPath = router.asPath.split("?")[0];

                cleanPath = cleanPath.split("/asset-version")[0];

                router.push(`${cleanPath}/asset-version/${item}/risk-handling`);
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
