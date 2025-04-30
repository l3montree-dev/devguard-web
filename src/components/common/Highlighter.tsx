// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import React, { FunctionComponent } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import shell from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import basic from "react-syntax-highlighter/dist/esm/languages/hljs/basic";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/an-old-hope";

SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("shell", shell);
SyntaxHighlighter.registerLanguage("rego", basic);

const Highlighter: FunctionComponent<{
  codeString: string;
  language?: "yaml" | "shell" | "rego";
  startingLineNumber?: number;
}> = (props) => {
  return (
    <div className="w-full bg-black">
      <SyntaxHighlighter
        showLineNumbers
        startingLineNumber={props.startingLineNumber ?? 1}
        lineNumberStyle={{ color: "rgba(255, 255, 255, 0.3)" }}
        language={props.language}
        style={docco}
      >
        {props.codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default Highlighter;
