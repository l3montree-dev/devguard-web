"use client";

import { json, jsonParseLinter } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { linter, lintGutter } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import jsYaml from "js-yaml";
import tomlParser from "@iarna/toml";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { StreamLanguage } from "@codemirror/language";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import valid from "purl/valid";
import normalize from "purl/normalize";

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

function purlParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    const text = view.state.doc.toString();
    const lines = text.split("\n");
    const diagnostics: Diagnostic[] = [];
    lines.forEach((line, index) => {
      if (line.trim() === "") return;
      if (line.trim().startsWith("#")) return;
      const tokens = line.trim().split(/\s+/);
      const pos = view.state.doc.line(index + 1).from;
      if (tokens.length > 1) {
        diagnostics.push({
          from: pos,
          to: pos + line.length,
          severity: "error",
          message: `Each line must contain exactly one package URL (e.g. pkg:npm/lodash@4.17.21)`,
        });
        return;
      }
      const purl = tokens[0];
      const validPurl = valid(purl);
      if (!validPurl) {
        diagnostics.push({
          from: pos,
          to: pos + line.length,
          severity: "error",
          message: `Invalid package URL, expected format: pkg:<ecosystem>/<name>@<version> (e.g. pkg:npm/lodash@4.17.21)`,
        });
        return;
      } else {
        const normalizedPurl = normalize(purl);
        if (normalizedPurl !== purl) {
          diagnostics.push({
            from: pos,
            to: pos + line.length,
            severity: "error",
            message: `Package URL is not normalized, did you mean "${normalizedPurl}"?`,
          });
        }
      }
      // Check that a version is present (PURL version comes after @)
      const versionMatch = purl.match(/@([^?#]+)/);
      if (!versionMatch || versionMatch[1].trim() === "") {
        diagnostics.push({
          from: pos,
          to: pos + line.length,
          severity: "error",
          message: `Package URL must include a version (e.g. pkg:npm/lodash@4.17.21)`,
        });
      }
    });
    return diagnostics;
  };
}

function isValidDependencyProxyRule(line: string): [boolean, string | null] {
  const trimmed = line.trim();
  // Comments are valid
  if (trimmed.startsWith("#")) return [true, null];
  // Strip optional negation prefix
  const stripped = trimmed.startsWith("!") ? trimmed.slice(1) : trimmed;
  if (stripped.trim() === "")
    return [
      false,
      "Empty line, use a package pattern (e.g. pkg:npm/lodash@4.17.21) or a wildcard (*)",
    ];

  if (stripped.startsWith("pkg:")) {
    // Valid fully-qualified PURL (pkg:npm/lodash@4.17.21)
    if (valid(stripped)) {
      const normalizedPurl = normalize(stripped);
      if (normalizedPurl !== stripped) {
        return [
          false,
          `Package URL is not normalized, did you mean "${normalizedPurl}"?`,
        ];
      }
      const hasVersionOrWildcard =
        stripped.includes("@") || stripped.includes("*");
      if (!hasVersionOrWildcard) {
        return [
          false,
          "Package rule must specify a version or wildcard (e.g. pkg:npm/lodash@4.17.21 or pkg:npm/lodash@*)",
        ];
      }
      return [true, null];
    }
    return [
      false,
      "Invalid package URL, expected format: pkg:<ecosystem>/<name>@<version>, e.g. pkg:npm/lodash@4.17.21 or pkg:npm/react*",
    ];
  } else if (stripped.startsWith("*")) {
    const segments = stripped.split("/");
    for (const segment of segments) {
      if (segment === "") {
        return [
          false,
          "Invalid wildcard pattern, path segments cannot be empty (e.g. avoid trailing or double /)",
        ];
      }
    }
    return [true, null];
  }

  return [
    false,
    "Invalid package rule, expected a package pattern (e.g. pkg:npm/lodash@4.17.21) or a wildcard (e.g. *lodash* or **lodash**)",
  ];
}

function dependencyProxyRuleParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    const text = view.state.doc.toString();
    const lines = text.split("\n");
    const diagnostics: Diagnostic[] = [];
    lines.forEach((line, index) => {
      if (line.trim() === "") return;
      const [isValid, errorMessage] = isValidDependencyProxyRule(line);
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
  onSave?: () => void;
  readOnly?: boolean;
}

const languageExtensions = {
  yaml: yaml(),
  json: json(),
  toml: StreamLanguage.define(toml),
  dependencyProxyRule: [],
  purl: [],
};

const languageLinters: Record<Language, (view: EditorView) => Diagnostic[]> = {
  yaml: yamlParseLinter(),
  json: jsonParseLinter(),
  toml: tomlParseLinter(),
  dependencyProxyRule: dependencyProxyRuleParseLinter(),
  purl: purlParseLinter(),
};

const CodeEditor = ({
  value,
  language = "json",
  onChange,
  onValidation,
  onSave,
  readOnly = false,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onValidationRef = useRef(onValidation);
  onValidationRef.current = onValidation;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const valueRef = useRef(value);
  valueRef.current = value;

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
