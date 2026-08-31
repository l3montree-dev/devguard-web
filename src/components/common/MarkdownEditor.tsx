// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { FunctionComponent } from "react";
import { useRef } from "react";
import { classNames } from "../../utils/common";
import Markdown from "../common/Markdown";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import {
  Bold,
  Code,
  CodeXml,
  Heading,
  Italic,
  Link,
  List,
  ListCheck,
  ListOrdered,
  Quote,
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface MardownEditorProps {
  value: string;
  setValue: (value?: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const MarkdownEditor: FunctionComponent<MardownEditorProps> = ({
  value,
  setValue,
  placeholder,
  maxLength,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = value.length;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = e.currentTarget;
      const value = textarea.value;
      const cursor = textarea.selectionStart;
      const lineStart = value.lastIndexOf("\n", cursor - 1) + 1;
      const lineEnd = value.indexOf("\n", cursor);
      const line = value.slice(
        lineStart,
        lineEnd === -1 ? value.length : lineEnd,
      );

      const ordered = line.match(/^(\s*)(\d+)\.\s(.*)$/);
      if (ordered) {
        e.preventDefault();
        const [, indent, number, text] = ordered;
        if (text.length === 0) {
          textarea.setRangeText("", lineStart, cursor, "end");
        } else {
          textarea.setRangeText(
            `\n${indent}${Number(number) + 1}. `,
            cursor,
            cursor,
            "end",
          );
        }
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      const checklist = line.match(/^(\s*)([-*+])\s\[( |x|X)\]\s(.*)$/);
      if (checklist) {
        e.preventDefault();
        const [, indent, bullet, , text] = checklist;
        if (text.length === 0) {
          textarea.setRangeText("", lineStart, cursor, "end");
        } else {
          textarea.setRangeText(
            `\n${indent}${bullet} [ ] `,
            cursor,
            cursor,
            "end",
          );
        }
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }

      const unordered = line.match(/^(\s*)([-*+])\s(.*)$/);
      if (unordered) {
        e.preventDefault();
        const [, indent, bullet, text] = unordered;
        if (text.length === 0) {
          textarea.setRangeText("", lineStart, cursor, "end");
        } else {
          textarea.setRangeText(`\n${indent}${bullet} `, cursor, cursor, "end");
        }
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setValue(value.substring(0, start) + "\t" + value.substring(end));
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      });
    }
  };

  function toggleWrap(
    textarea: HTMLTextAreaElement,
    before: string,
    after = before,
  ) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const selected = value.slice(start, end);

    const hasWrap =
      value.slice(start - before.length, start) === before &&
      value.slice(end, end + after.length) === after;

    if (hasWrap) {
      textarea.setRangeText(
        selected,
        start - before.length,
        end + after.length,
        "select",
      );
      textarea.setSelectionRange(start - before.length, end - before.length);
    } else {
      textarea.setRangeText(before + selected + after, start, end, "select");
      textarea.setSelectionRange(start + before.length, end + before.length);
    }

    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function format(before: string, after: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    toggleWrap(textarea, before, after);
  }

  const tabs = [
    {
      name: "Write",
      value: "write",
      content: (
        <>
          <Textarea
            ref={textareaRef}
            className="focus:outline-hidden resize-none rounded-tr-none rounded-tl-none border-0 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={10}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        </>
      ),
    },
    {
      name: "Preview",
      value: "preview",
      content: (
        <>
          <Card className="min-h-[8lh] border-none rounded-tr-none rounded-tl-none scroll-y-auto py-2 px-3">
            <Markdown>{value}</Markdown>
          </Card>
        </>
      ),
    },
  ];

  const formatButtons = [
    {
      icon: <Heading className="size-4" />,
      label: "Heading",
      wrap: ["### ", ""],
    },
    { icon: <Bold className="size-4" />, label: "Bold", wrap: ["**", "**"] },
    { icon: <Italic className="size-4" />, label: "Italic", wrap: ["_", "_"] },
    { icon: <Quote className="size-4" />, label: "Quote", wrap: ["> ", ""] },
    {
      icon: <Code className="size-4" />,
      label: "Inline Code",
      wrap: ["`", "`"],
    },
    {
      icon: <CodeXml className="size-4" />,
      label: "Codeblock",
      wrap: ["```\n", "\n```\n"],
    },
    { icon: <Link className="size-4" />, label: "Link", wrap: ["[](url)", ""] },
  ];

  const listButtons = [
    {
      icon: <List className="size-4" />,
      label: "Unordered List",
      wrap: ["- ", ""],
    },
    {
      icon: <ListOrdered className="size-4" />,
      label: "Ordered List",
      wrap: ["1. ", ""],
    },
    {
      icon: <ListCheck className="size-4" />,
      label: "Checklist",
      wrap: ["- [ ] ", ""],
    },
  ];

  return (
    <div className="border border-border rounded-lg bg-card">
      <TooltipProvider delayDuration={100}>
        <Tabs defaultValue="write">
          <TabsList className="justify-start border-card! bg-secondary rounded-br-none rounded-bl-none text-foreground border-0 pt-2 px-2 pb-0 w-full">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                className="data-[state=active]:bg-card! shadow-none! data-[state=active]:border-b-card shadow-none rounded-b-none"
                value={tab.value}
              >
                {tab.name}
              </TabsTrigger>
            ))}
            <div className="flex items-center justify-end w-full! gap-1 h-5">
              {formatButtons.map((button) => (
                <Tooltip key={button.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onMouseDown={(e) => e.preventDefault()}
                      className="border-0"
                      size="xs"
                      onClick={() => format(button.wrap[0], button.wrap[1])}
                    >
                      {button.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{button.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              <Separator orientation="vertical" className="bg-foreground" />
              {listButtons.map((button) => (
                <Tooltip key={button.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onMouseDown={(e) => e.preventDefault()}
                      className="border-0"
                      size="xs"
                      onClick={() => format(button.wrap[0], button.wrap[1])}
                    >
                      {button.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{button.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              className="text-muted-foreground text-sm p-0 m-0"
              value={tab.value}
            >
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>

        {maxLength !== undefined && (
          <p
            className={classNames(
              "m-1 text-right text-xs",
              isOverLimit ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {charCount} / {maxLength}
          </p>
        )}
      </TooltipProvider>
    </div>
  );
};

export default MarkdownEditor;
