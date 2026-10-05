// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React, { type FunctionComponent, useMemo } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import shell from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import basic from "react-syntax-highlighter/dist/esm/languages/hljs/basic";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import github from "react-syntax-highlighter/dist/esm/styles/hljs/github";
import anOldHope from "react-syntax-highlighter/dist/esm/styles/hljs/an-old-hope";
import { useTheme } from "next-themes";

SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("shell", shell);
SyntaxHighlighter.registerLanguage("rego", basic);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);

const githubLightTheme = {
  ...github,
  hljs: {
    ...(github.hljs || {}),
    background: "transparent",
  },
};

const Highlighter: FunctionComponent<{
  codeString: string;
  language?:
    "yaml" | "shell" | "rego" | "xml" | "json" | "typescript" | "javascript";
  startingLineNumber?: number;
  startingHighlightLineNumber?: number | null;
}> = ({
  codeString,
  language,
  startingLineNumber,
  startingHighlightLineNumber,
}) => {
  let startLine = 1;
  if (startingLineNumber && startingHighlightLineNumber) {
    startLine = startingLineNumber - startingHighlightLineNumber + 1;
  }

  const { theme, resolvedTheme } = useTheme();
  const isDark = useMemo(() => {
    const current = theme || resolvedTheme;
    if (current === "system") {
      return resolvedTheme === "dark";
    }
    return current === "dark";
  }, [resolvedTheme, theme]);

  const textColor = isDark ? "#E2E8F0" : (github.hljs?.color ?? "#24292E");
  const lineNumberColor = isDark
    ? "rgba(255, 255, 255, 0.35)"
    : "rgba(71, 85, 105, 0.75)";
  const syntaxTheme = isDark ? anOldHope : githubLightTheme;

  return (
    <div className="w-full py-0.5 bg-muted">
      <SyntaxHighlighter
        showLineNumbers
        startingLineNumber={startLine}
        lineNumberStyle={{ color: lineNumberColor }}
        language={language}
        style={syntaxTheme}
        customStyle={{
          background: "transparent",
          margin: 0,
          color: textColor,
        }}
        codeTagProps={{
          style: {
            color: textColor,
            background: "transparent",
          },
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default Highlighter;
