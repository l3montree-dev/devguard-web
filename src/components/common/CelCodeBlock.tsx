// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CodeEditor from "@/components/common/CodeEditor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Diagnostic } from "@codemirror/lint";
import { Check, Copy, FileCode2 } from "lucide-react";
import type { FunctionComponent } from "react";
import { useState } from "react";

interface CelCodeBlockProps {
  value: string;
  /** Read-only display (no editing). */
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onValidation?: (isValid: boolean, diagnostics: Diagnostic[]) => void;
  placeholder?: string;
  /** Header label; defaults to "CEL". */
  label?: string;
  /** Fixed editor body height in px. Omit to fit the content (read-only). */
  height?: number;
  className?: string;
}

const noop = () => {};

// A reusable, syntax-highlighted CEL block with copy-to-clipboard. Backed by the
// CodeMirror-based CodeEditor (which knows the "cel" language), so it highlights,
// wraps long expressions, and lints — in both editable and read-only modes.
const CelCodeBlock: FunctionComponent<CelCodeBlockProps> = ({
  value,
  readOnly = false,
  onChange,
  onValidation,
  placeholder,
  label = "CEL",
  height,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={cn("overflow-hidden rounded-lg border bg-muted/50", className)}
    >
      <div className="flex h-9 items-center justify-between gap-2 border-b px-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCode2 className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono text-xs">{label}</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={copy}
          aria-label="Copy CEL expression"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <div style={height ? { height } : undefined} className="!bg-card">
        <CodeEditor
          value={value}
          language="cel"
          readOnly={readOnly}
          lineWrapping
          transparent
          onChange={onChange ?? noop}
          onValidation={onValidation}
          placeholder={placeholder}
          className="rounded-none border-0 [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent [&_.cm-scroller]:!bg-transparent [&_.cm-activeLineGutter]:!bg-transparent [&_.cm-activeLine]:!bg-transparent"
        />
      </div>
    </div>
  );
};

export default CelCodeBlock;
