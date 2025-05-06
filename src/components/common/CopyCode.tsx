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

import { CopyIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { FunctionComponent, useMemo } from "react";
import { toast } from "sonner";
const Highlighter = dynamic(() => import("./Highlighter"), { ssr: false });

export const CopyCodeFragment: FunctionComponent<{ codeString: string }> = ({
  codeString,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    toast("Copied to clipboard", {
      description: "The code has been copied to your clipboard.",
    });
  };
  return (
    <div className="inline-flex">
      <div className="relative w-full overflow-hidden rounded-lg border px-1.5 py-0.5">
        <button
          onClick={handleCopy}
          type="button"
          className="absolute right-1 top-1 z-10 rounded-lg p-0.5  text-xs hover:text-foreground text-muted-foreground transition-all"
        >
          <CopyIcon className="w-3.5 h-3.5" />
        </button>
        <div className="relative font-mono text-sm pr-6">{codeString}</div>
      </div>
    </div>
  );
};

interface Props {
  codeString: string;
  language?: "yaml" | "shell" | "rego";
  startingLineNumber?: number;
  highlightRegexPattern?: RegExp;
}
const CopyCode: FunctionComponent<Props> = (props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(props.codeString);
    toast("Copied to clipboard", {
      description: "The code has been copied to your clipboard.",
    });
  };

  // check if we need to highlight some lines
  const { codeStr, highlightLineNumbers } = useMemo(() => {
    // something like /\+\+\+(.+)\+\+\+/gms
    if (!props.highlightRegexPattern)
      return { codeStr: props.codeString, highlightLineNumbers: null };
    // we need the starting and ending line numbers of the match - and remove the special characters just with the match content

    const reg = new RegExp(
      props.highlightRegexPattern,
      props.highlightRegexPattern.flags,
    );
    const matches = reg.exec(props.codeString);

    if (matches === null) {
      console.log("No matches found", props.codeString, matches);
      return { codeStr: props.codeString, highlightLineNumbers: null };
    }

    let str = props.codeString;
    const before = matches[0];
    const withoutRegex = matches[1];
    // get the line number of the match

    // Get the start and end index of the match
    const matchStartIndex = matches.index;
    const matchEndIndex = reg.lastIndex;

    // Split the code string by newline to calculate line numbers
    const codeLines = props.codeString.slice(0, matchStartIndex).split("\n");
    const startLine = codeLines.length + 1; // Line number where the match starts

    // To calculate the end line, we need the end index and split by newline again
    const codeLinesAfterMatch = props.codeString
      .slice(0, matchEndIndex)
      .split("\n");
    const endLine = codeLinesAfterMatch.length - 1; // Line number where the match ends

    return {
      codeStr: str.replace(before, withoutRegex),
      highlightLineNumbers: [startLine, endLine],
    };
  }, [props.codeString, props.highlightRegexPattern]);

  return (
    <div
      style={{
        height: 14 /*padding*/ + codeStr.split("\n").length * 20,
      }}
      className="relative w-full overflow-hidden rounded-lg border"
    >
      <div className="absolute bottom-0 left-0 right-0 top-0 animate-pulse bg-card" />
      <button
        onClick={handleCopy}
        className="absolute right-1 top-1 z-10 rounded-lg bg-gray-700 p-1 px-2 text-xs text-white transition-all hover:bg-white/40"
      >
        Copy
      </button>
      <div className="relative">
        <Highlighter
          startingLineNumber={props.startingLineNumber}
          codeString={codeStr}
          language={props.language}
        />
        {highlightLineNumbers && (
          <div
            className="absolute pointer-events-none left-0 right-0 top-0 z-10 w-full bg-white/10 bg-blend-darken"
            style={{
              top: `${7 + (highlightLineNumbers[0] - 1) * 20}px`,
              height:
                (highlightLineNumbers[1] - highlightLineNumbers[0] + 1) * 20,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CopyCode;
