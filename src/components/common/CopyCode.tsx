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
import dynamic from "next/dynamic";
import { toast } from "sonner";
const Highlighter = dynamic(() => import("./Highlighter"), { ssr: false });

interface Props {
  codeString: string;
  language: "yaml" | "shell";
}
const CopyCode: FunctionComponent<Props> = (props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(props.codeString);
    toast("Copied to clipboard", {
      description: "The code has been copied to your clipboard.",
    });
  };
  return (
    <div
      style={{
        height: 14 /*padding*/ + props.codeString.split("\n").length * 20,
      }}
      className="relative w-full overflow-hidden  rounded-lg border"
    >
      <div className="absolute bottom-0 left-0 right-0 top-0 animate-pulse bg-card" />
      <button
        onClick={handleCopy}
        className="absolute right-1 top-1 z-10 rounded-lg bg-gray-700 p-1 px-2 text-xs text-white transition-all hover:bg-white/40"
      >
        Copy
      </button>
      <div className="relative">
        <Highlighter codeString={props.codeString} language={props.language} />
      </div>
    </div>
  );
};

export default CopyCode;
