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

import { FunctionComponent } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";

interface Props {
  value: string;
}
const CopyInput: FunctionComponent<Props> = (props) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(props.value);
    toast("Copied to clipboard", {
      description: "The value has been copied to your clipboard.",
    });
  };
  return (
    <div className="relative w-full overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-gray-700 p-1 px-2 text-xs text-white transition-all hover:bg-white/40"
      >
        Copy
      </button>
      <div className="relative">
        <Input className="bg-muted" value={props.value} />
      </div>
    </div>
  );
};

export default CopyInput;
