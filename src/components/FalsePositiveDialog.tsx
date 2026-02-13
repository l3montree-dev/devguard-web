"use client";

import { FunctionComponent, useState } from "react";
import { AsyncButton, Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDown } from "lucide-react";
import { removeUnderscores, vexOptionMessages } from "@/utils/view";
import dynamic from "next/dynamic";
import Link from "next/link";
import { documentationLinks } from "../const/documentationLinks";
import { Badge } from "./ui/badge";
import { beautifyPurl } from "../utils/common";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface FalsePositiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    justification: string;
    mechanicalJustification: string;
    pathPattern?: string[];
  }) => Promise<boolean>;
  pathPatternOptions?: Array<[string, number]>;
  vulnState?: string;
  /** Optional custom description for bulk actions */
  description?: React.ReactNode;
  /** Optional URL to the VEX rules page */
  vexRulesUrl?: string;
}

const FalsePositiveDialog: FunctionComponent<FalsePositiveDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  pathPatternOptions = [],
  vulnState = "",
  description,
  vexRulesUrl,
}) => {
  const [justification, setJustification] = useState<string>("");
  const [selectedPathPattern, setSelectedPathPattern] = useState<
    string | undefined
  >();
  const [selectedOption, setSelectedOption] = useState<string>(
    Object.keys(vexOptionMessages)[2],
  );

  const handleSubmit = async () => {
    const success = await onSubmit({
      justification,
      mechanicalJustification: selectedOption,
      pathPattern: selectedPathPattern?.split(" > ") ?? undefined,
    });
    if (success) {
      setJustification("");
      setSelectedPathPattern(undefined);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as False Positive</DialogTitle>
          <DialogDescription>
            {description ?? (
              <>
                Mark this vulnerability as a false positive if it does not apply
                to your project. This could be because the vulnerable code path
                is not reachable, the vulnerability is not exploitable in your
                context, or the detection is incorrect. You can find more
                information about marking false positives in our{" "}
                <Link
                  href={documentationLinks.markFalsePositive}
                  target="_blank"
                  className="underline hover:text-primary"
                >
                  documentation
                </Link>
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          {pathPatternOptions.length > 0 && vulnState === "open" && (
            <div className="mt-4 rounded-lg border bg-card p-4">
              <div className="flex flex-row items-start gap-2">
                <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="mb-2 text-sm font-medium">
                    Apply VEX rules to matching paths
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Select a path pattern to automatically mark all
                    vulnerabilities with matching dependency paths as false
                    positive. This rule will also apply to future
                    vulnerabilities with matching paths in your repository. You
                    can manage VEX rules in the{" "}
                    {vexRulesUrl ? (
                      <Link href={vexRulesUrl}>VEX rules page</Link>
                    ) : (
                      <span>VEX rules page</span>
                    )}
                    .
                  </p>

                  <Select
                    value={selectedPathPattern ?? "none"}
                    onValueChange={(value) => {
                      setSelectedPathPattern(value);
                    }}
                  >
                    <SelectTrigger className="w-full text-left bg-background h-auto py-3">
                      <SelectValue placeholder="Select a rule" />
                    </SelectTrigger>
                    <SelectContent className="max-w-2xl">
                      <SelectItem value="none" className="border-b pb-3 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Handle only this path
                          </span>
                        </div>
                      </SelectItem>
                      {pathPatternOptions
                        .slice(0, 10)
                        .map(([suffix, count], idx, arr) => (
                          <SelectItem
                            key={suffix}
                            value={suffix}
                            className={`py-3 ${idx < arr.length - 1 ? "border-b" : ""}`}
                          >
                            <div className="flex flex-col gap-1.5 w-full">
                              <span className="text-xs text-muted-foreground">
                                Matches {count} {count === 1 ? "path" : "paths"}
                              </span>
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="pt-1 text-xs text-muted-foreground">
                                  *
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  →
                                </span>
                                {suffix.split(" > ").map((el, idx, arr) => (
                                  <div
                                    key={el + idx}
                                    className="flex items-center gap-1"
                                  >
                                    {beautifyPurl(el)}

                                    {idx < arr.length - 1 && (
                                      <span className="text-xs text-muted-foreground">
                                        →
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Justification
            </label>
            <MarkdownEditor
              className="!bg-card"
              placeholder="Add your comment here..."
              value={justification}
              setValue={(value) => setJustification(value ?? "")}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex flex-row items-center justify-end">
              <div className="flex flex-row items-center">
                <AsyncButton
                  onClick={handleSubmit}
                  variant={"default"}
                  className="mr-0 rounded-r-none pr-0 capitalize"
                >
                  {removeUnderscores(selectedOption)}
                </AsyncButton>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"default"}
                    className="flex items-center rounded-l-none pl-1 pr-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(vexOptionMessages).map(
                    ([option, description]) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSelectedOption(option)}
                      >
                        <div className="flex flex-col">
                          <span className="capitalize">
                            {removeUnderscores(option)}{" "}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {description}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FalsePositiveDialog;
