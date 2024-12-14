// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import React, { FunctionComponent, ReactNode } from "react";
import { CollapsibleTrigger as BaseCollapsibleTrigger } from "../ui/collapsible";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
  maxEvidence: number;
  currentEvidence: number;
}

const CollapsibleControlTrigger: FunctionComponent<Props> = ({
  children,
  maxEvidence,
  currentEvidence,
}) => {
  return (
    <BaseCollapsibleTrigger className="w-full  py-2">
      <div className="grid w-full grid-cols-12 flex-row justify-between">
        <div className="col-span-10">{children}</div>
        <div className="col-span-1 flex flex-row justify-end gap-2">
          {currentEvidence}/{maxEvidence}{" "}
          {maxEvidence !== 0 && currentEvidence === maxEvidence ? (
            <CheckCircleIcon className="w-5 text-green-500" />
          ) : (
            <CheckCircleIcon className="w-5 text-muted-foreground" />
          )}
        </div>
        <div className="col-span-1 flex flex-row justify-end text-right">
          <CaretDownIcon width={24} height={24} />
        </div>
      </div>
    </BaseCollapsibleTrigger>
  );
};

export default CollapsibleControlTrigger;
