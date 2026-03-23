"use client";

import { json, jsonParseLinter } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { Diagnostic, linter, lintGutter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { EditorView, basicSetup } from "codemirror";
import jsYaml from "js-yaml";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

function yamlParseLinter() {
  return (view: EditorView): Diagnostic[] => {
    try {
      jsYaml.load(view.state.doc.toString());
      return [];
    } catch (e) {
      if (e instanceof jsYaml.YAMLException) {
        const pos = (e as jsYaml.YAMLException).mark?.position ?? 0;
        return [
          {
            from: pos,
            to: pos,
            severity: "error",
            message: (e as jsYaml.YAMLException).reason,
          },
        ];
      }
      return [];
    }
  };
}

interface Props {
  value: string;
  language?: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean) => void;
  readOnly?: boolean;
}

const CodeEditor = ({
  value,
  language = "json",
  onChange,
  onValidation,
  readOnly = false,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onValidationRef = useRef(onValidation);
  onValidationRef.current = onValidation;

  const { theme } = useTheme();

  const currentTheme = theme === "dark" ? vscodeDark : vscodeLight;

  useEffect(() => {
    if (!containerRef.current) return;

    const langExtension = language === "yaml" ? yaml() : json();
    const langLinter =
      language === "yaml" ? yamlParseLinter() : jsonParseLinter();

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          currentTheme,
          langExtension,
          linter((view) => {
            const diagnostics = langLinter(view);
            onValidationRef.current?.(diagnostics.length === 0);
            return diagnostics;
          }),
          lintGutter(),
          EditorState.readOnly.of(readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTheme]);

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
