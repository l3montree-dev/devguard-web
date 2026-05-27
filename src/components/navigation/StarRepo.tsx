// Copyright (C) 2026 Lars Hermges, l3montree GmbH
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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Star } from "lucide-react";

export default function StarRepo() {
  return (
    <div className="flex h-7 overflow-hidden rounded-md border border-[#d0d7de] bg-[#f1f3f5] text-[#59636e] shadow-sm dark:border-[#3d444d] dark:bg-[#212830] dark:text-[#f0f6fc]">
      <a
        href={`https://github.com/l3montree-dev/devguard`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 text-sm font-semibold !text-[#59636e] hover:bg-[#e9ecef] hover:no-underline dark:!text-[#f0f6fc] dark:hover:bg-[#2a313c]"
        aria-label="Star DevGuard on GitHub"
        data-umami-event="Github Star Button Clicked"
      >
        <Star className="h-4 w-4 text-[#535c66] dark:text-[#9198a1]" />
        <span>Star</span>
      </a>
    </div>
  );
}
