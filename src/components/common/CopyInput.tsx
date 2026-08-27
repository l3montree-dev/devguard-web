// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";
import { toast } from "@/lib/toast";
import { Input } from "../ui/input";
import { Copy } from "lucide-react";

interface Props {
  value: string;
}
const CopyInput: FunctionComponent<Props> = (props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(props.value);
    toast("Copied to clipboard", {
      description: "The value has been copied to your clipboard.",
    });
  };
  return (
    <div className="relative w-full overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-card p-2 text-xs text-foreground transition-all hover:opacity-80"
      >
        <Copy className="h-4 w-4" />
      </button>
      <div className="relative">
        <Input className="bg-muted" value={props.value} readOnly />
      </div>
    </div>
  );
};

export default CopyInput;
