"use client";

import { json, jsonParseLinter } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { Diagnostic, linter, lintGutter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { EditorView, basicSetup } from "codemirror";
import jsYaml from "js-yaml";
import tomlParser from "@iarna/toml";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { StreamLanguage } from "@codemirror/language";
import { toml } from "@codemirror/legacy-modes/mode/toml";

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
  onValidation?: (isValid: boolean) => void;
  readOnly?: boolean;
}

const languageExtensions = {
  yaml: yaml(),
  json: json(),
  toml: StreamLanguage.define(toml),
};

const languageLinters: Record<Language, (view: EditorView) => Diagnostic[]> = {
  yaml: yamlParseLinter(),
  json: jsonParseLinter(),
  toml: tomlParseLinter(),
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

  const { theme } = useTheme();
  const currentTheme = theme === "dark" ? vscodeDark : vscodeLight;

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
              onValidationRef.current?.(true);
              return [];
            }
            const diagnostics = langLinter(view);
            onValidationRef.current?.(diagnostics.length === 0);
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
