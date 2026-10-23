// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { json, jsonParseLinter } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { linter, lintGutter } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";
import { autocompletion } from "@codemirror/autocomplete";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { vscodeDarkInit, vscodeLight } from "@uiw/codemirror-theme-vscode";
import tomlParser from "@iarna/toml";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { StreamLanguage } from "@codemirror/language";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { javascript } from "@codemirror/legacy-modes/mode/javascript";
import { load, YAMLException } from "js-yaml";
import { keymap, placeholder as placeholderExtension } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { cn } from "@/lib/utils";
import { celParseLinter, celCompletionSource } from "./celLinter";

const vscodeDark = vscodeDarkInit({
  settings: {
    background: "#0E1117",
    gutterBackground: "#0E1117",
  },
});
function tomlParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    try {
      tomlParser.parse(view.state.doc.toString());
      return [];
    } catch (e) {
      if (e instanceof Error) {
        const match = e.message.match(/pos (\d+)/i);
        const pos = match ? parseInt(match[1], 10) - 1 : 0;
        return [{ from: pos, to: pos, severity: "error", message: e.message }];
      }
      return [];
    }
  };
}

function yamlParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    try {
      load(view.state.doc.toString());
      return [];
    } catch (e) {
      if (e instanceof YAMLException) {
        const pos = e.mark?.position ?? 0;
        return [{ from: pos, to: pos, severity: "error", message: e.reason }];
      }
      return [];
    }
  };
}

export type Language = keyof typeof languageExtensions;

interface Props {
  value: string;
  language?: Language;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, diagnostics: Diagnostic[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  /** Wrap long lines instead of scrolling horizontally. */
  lineWrapping?: boolean;
  /** Extra classes for the wrapper (merged; can override the default border). */
  className?: string;
  /** Blend into the container: transparent editor/gutter background, no gutter border. */
  transparent?: boolean;
}

function buildPlaceholderNode(text: string): HTMLElement {
  const container = document.createElement("div");
  text.split("\n").forEach((line, i) => {
    if (i > 0) container.appendChild(document.createElement("br"));
    container.appendChild(document.createTextNode(line));
  });
  return container;
}

const languageExtensions = {
  yaml: yaml(),
  json: json(),
  toml: StreamLanguage.define(toml),
  // CEL has no dedicated grammar; JavaScript is close enough to colour strings,
  // numbers, booleans, operators, property access and function calls.
  cel: [
    StreamLanguage.define(javascript),
    autocompletion({ override: [celCompletionSource] }),
  ],
};

const languageLinters: Record<Language, (view: EditorView) => Diagnostic[]> = {
  yaml: yamlParseLinter(),
  json: jsonParseLinter(),
  toml: tomlParseLinter(),
  cel: celParseLinter(),
};

const CodeEditor = ({
  value,
  language = "json",
  onChange,
  onValidation,
  onSave,
  readOnly = false,
  placeholder,
  lineWrapping = false,
  className,
  transparent = false,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onValidationRef = useRef(onValidation);
  const onSaveRef = useRef(onSave);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
    onValidationRef.current = onValidation;
    onSaveRef.current = onSave;
    valueRef.current = value;
  });

  const { resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme === "dark" ? vscodeDark : vscodeLight;

  useEffect(() => {
    if (!containerRef.current) return;
    const tabExtension = keymap.of([indentWithTab]);

    const saveKeymap = keymap.of([
      {
        key: "Mod-s",
        preventDefault: true,
        run: () => {
          onSaveRef.current?.();
          return true;
        },
      },
    ]);

    const langLinter = languageLinters[language];

    const view = new EditorView({
      state: EditorState.create({
        doc: valueRef.current,
        extensions: [
          basicSetup,
          lineWrapping ? EditorView.lineWrapping : [],
          currentTheme,
          languageExtensions[language],
          linter((view) => {
            if (view.state.doc.toString() == "") {
              onValidationRef.current?.(true, []);
              return [];
            }
            const diagnostics = langLinter(view);
            onValidationRef.current?.(diagnostics.length === 0, diagnostics);
            return diagnostics;
          }),
          lintGutter(),
          EditorState.readOnly.of(readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "13px",
              ...(transparent ? { backgroundColor: "transparent" } : {}),
            },
            ".cm-scroller": { overflow: "auto", fontFamily: "monospace" },
            ".cm-placeholder": {
              color: "hsl(var(--muted-foreground))",
              fontStyle: "italic",
            },
            ...(transparent
              ? {
                  ".cm-gutters": {
                    backgroundColor: "transparent",
                    border: "none",
                  },
                  ".cm-activeLine": { backgroundColor: "transparent" },
                  ".cm-activeLineGutter": { backgroundColor: "transparent" },
                }
              : {}),
          }),
          placeholder
            ? placeholderExtension(buildPlaceholderNode(placeholder))
            : [],
          tabExtension,
          saveKeymap,
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [
    currentTheme,
    language,
    readOnly,
    placeholder,
    lineWrapping,
    transparent,
  ]);

  // Sync external value changes without recreating the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-hidden rounded-lg border",
        className,
      )}
    />
  );
};

export default CodeEditor;
