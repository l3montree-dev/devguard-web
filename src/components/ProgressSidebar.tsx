// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";

interface Props {
  steps: StepItem[];
}

interface StepItem {
  name: string;
  status: "complete" | "current" | "upcoming";
}

export default function ProgressSidebar({ steps }: Props) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h2 className="text-base font-semibold leading-7 text-white">
          Setup Progress
        </h2>
      </header>
      <ol role="list" className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {steps.map((step) => (
          <li key={step.name}>
            {step.status === "complete" ? (
              <span className="group">
                <span className="flex items-start">
                  <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    <CheckCircleIcon
                      className="h-full w-full text-amber-500"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="ml-3 text-sm font-medium text-blue-100 ">
                    {step.name}
                  </span>
                </span>
              </span>
            ) : step.status === "current" ? (
              <span className="flex items-start" aria-current="step">
                <span
                  className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="absolute h-4 w-4 rounded-full bg-amber-300" />
                  <span className="relative block h-2 w-2 rounded-full bg-amber-600" />
                </span>
                <span className="ml-3 text-sm font-medium text-amber-500">
                  {step.name}
                </span>
              </span>
            ) : (
              <span className="group">
                <div className="flex items-start">
                  <div
                    className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <div className="h-2 w-2 rounded-full bg-gray-500 " />
                  </div>
                  <p className="ml-3 text-sm font-medium text-blue-100 ">
                    {step.name}
                  </p>
                </div>
              </span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
