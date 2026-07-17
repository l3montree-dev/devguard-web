"use client";

import { DelayedDownloadButton } from "../common/DelayedDownloadButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { classNames } from "../../utils/common";

const ALL_FRAMEWORKS = "__all__";

interface OscalDownloadModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  oscalBaseUrl: string;
  frameworks: string[];
}

export default function OscalDownloadModal({
  open,
  setOpen,
  oscalBaseUrl,
  frameworks,
}: OscalDownloadModalProps) {
  const [selected, setSelected] = useState(ALL_FRAMEWORKS);
  const [search, setSearch] = useState("");

  const filtered = frameworks.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );

  const downloadUrl =
    selected === ALL_FRAMEWORKS
      ? oscalBaseUrl
      : `${oscalBaseUrl}?framework=${encodeURIComponent(selected)}`;

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>Download OSCAL</DialogTitle>
          <DialogDescription>
            Download the compliance posture in OSCAL JSON format. You can
            optionally filter by a specific framework to include only its
            controls in the export.
          </DialogDescription>
        </DialogHeader>
        <hr />
        {frameworks.length > 0 && (
          <>
            <h4 className="font-semibold">Filter by Framework</h4>
            <p className="text-sm text-muted-foreground">
              Select a framework to include in the OSCAL export. If no framework
              is selected, all frameworks are included.
            </p>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All frameworks" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search frameworks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value={ALL_FRAMEWORKS}>All frameworks</SelectItem>
                {filtered.map((framework) => (
                  <SelectItem key={framework} value={framework}>
                    {framework}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <hr />
          </>
        )}
        <DialogFooter>
          <Link
            className={classNames(
              buttonVariants({ variant: "default" }),
              "text-primary-foreground!",
            )}
            href={downloadUrl}
            target="_blank"
          >
            Download in JSON-Format
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
