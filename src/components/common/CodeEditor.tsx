"use client";

import { json, jsonParseLinter } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { linter, lintGutter } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { EditorView, basicSetup } from "codemirror";
import jsYaml from "js-yaml";
import tomlParser from "@iarna/toml";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { StreamLanguage } from "@codemirror/language";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import valid from "purl/valid";
import normalize from "purl/normalize";
import { after } from "lodash";

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

function isValidPkgLine(line: string): [boolean, string | null] {
  const trimmed = line.trim();
  // Comments are valid
  if (trimmed.startsWith("#")) return [true, null];
  // Strip optional negation prefix
  const stripped = trimmed.startsWith("!") ? trimmed.slice(1) : trimmed;
  if (stripped.trim() === "")
    return [
      false,
      "Empty line, use a purl (e.g. pkg:npm/next@13.4.4) or a wildcard (*)",
    ];

  // Valid PURL
  if (valid(stripped)) {
    const normalizedPurl = normalize(stripped);
    if (normalizedPurl !== stripped) {
      return [
        false,
        `Package URL is not normalized, did you mean "${normalizedPurl}"?`,
      ];
    }
    return [true, null];
  } else if (stripped.includes("*")) {
    const match = stripped.match(/\*+/);
    if (match && match[0].length > 2) {
      return [false, "Invalid wildcard pattern, only * or ** are allowed"];
    }
    const afterWildcard = stripped.slice(
      stripped.indexOf(match![0]) + match![0].length,
    );
    if (afterWildcard !== "" && !afterWildcard.startsWith("/")) {
      return [
        false,
        "Invalid wildcard pattern, wildcard must be followed by / or nothing",
      ];
    }

    if (afterWildcard.startsWith("/")) {
      const purlPart = afterWildcard.slice(1);
      if (purlPart === "") {
        return [
          false,
          "Invalid wildcard pattern, missing a package name. e.g. */next or **/next",
        ];
      }
    }

    return [true, null];
  } else if (stripped.startsWith("pkg")) {
    return [
      false,
      "Invalid package rule, expected format: pkg:<type>/<name>[@<version>], e.g. pkg:npm/next or pkg:npm/next@13.4.4",
    ];
  }
  return [
    false,
    "Invalid package rule, expected a purl (e.g. pkg:npm/next[@13.4.4]) or a wildcard pattern (e.g. */next or **/next)",
  ];
}

function packageParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    const text = view.state.doc.toString();
    const lines = text.split("\n");
    const diagnostics: Diagnostic[] = [];
    lines.forEach((line, index) => {
      if (line.trim() === "") return;
      const [isValid, errorMessage] = isValidPkgLine(line);
      if (!isValid) {
        const pos = view.state.doc.line(index + 1).from;
        diagnostics.push({
          from: pos,
          to: pos + line.length,
          severity: "error",
          message:
            errorMessage ||
            `Invalid package URL or pattern at line ${index + 1}`,
        });
      }
    });
    return diagnostics;
  };
}

function yamlParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    try {
      jsYaml.load(view.state.doc.toString());
      return [];
    } catch (e) {
      if (e instanceof jsYaml.YAMLException) {
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
  readOnly?: boolean;
}

const languageExtensions = {
  yaml: yaml(),
  json: json(),
  toml: StreamLanguage.define(toml),
  pkg: [],
};

const languageLinters: Record<Language, (view: EditorView) => Diagnostic[]> = {
  yaml: yamlParseLinter(),
  json: jsonParseLinter(),
  toml: tomlParseLinter(),
  pkg: packageParseLinter(),
};

const CodeEditor = ({
  value,
  language = "json",
  onChange,
  onValidation,
  readOnly = false,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onValidationRef = useRef(onValidation);
  onValidationRef.current = onValidation;
  const valueRef = useRef(value);
  valueRef.current = value;

  const { resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme === "dark" ? vscodeDark : vscodeLight;

  useEffect(() => {
    if (!containerRef.current) return;

    const langLinter = languageLinters[language];

    const view = new EditorView({
      state: EditorState.create({
        doc: valueRef.current,
        extensions: [
          basicSetup,
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
            "&": { height: "100%", fontSize: "13px" },
            ".cm-scroller": { overflow: "auto", fontFamily: "monospace" },
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [currentTheme, language, readOnly]);

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
      className="h-full w-full overflow-hidden rounded border"
    />
  );
};

export default CodeEditor;
