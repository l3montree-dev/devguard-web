// Copyright (C) 2024 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { FunctionComponent, useMemo } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import shell from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import basic from "react-syntax-highlighter/dist/esm/languages/hljs/basic";
import github from "react-syntax-highlighter/dist/esm/styles/hljs/github";
import anOldHope from "react-syntax-highlighter/dist/esm/styles/hljs/an-old-hope";
import { useTheme } from "next-themes";

SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("shell", shell);
SyntaxHighlighter.registerLanguage("rego", basic);

const githubLightTheme = {
  ...github,
  hljs: {
    ...(github.hljs || {}),
    background: "transparent",
  },
};

const Highlighter: FunctionComponent<{
  codeString: string;
  language?: "yaml" | "shell" | "rego";
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
    <div className="w-full bg-white dark:bg-black">
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
