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
import { DetailedFlawDTO, Paged } from "@/types/api/api";
import { classNames } from "@/utils/common";
import React, { FunctionComponent, useMemo } from "react";
import DateString from "./DateString";
import { useRouter } from "next/router";
import { normalizeContentTree } from "@/zustand/globalStore";
import { useStore } from "@/zustand/globalStoreProvider";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { Badge } from "../ui/badge";
import Link from "next/link";

interface Props {
  flaws: Paged<DetailedFlawDTO>;
}

const AcceptedVulnerabilitiesTable: FunctionComponent<Props> = ({ flaws }) => {
  const router = useRouter();
  const contentTree = useStore((s) => s.contentTree);
  const assetMap = useMemo(
    () => normalizeContentTree(contentTree ?? []),
    [contentTree],
  );
  const activeOrg = useActiveOrg();

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className={classNames("w-full text-left", "border-b bg-card")}>
          <tr className="">
            <th className="p-4">CVE</th>
            <th className="p-4">Risk</th>
            <th className="p-4">Asset</th>
            <th className="p-4">Accepted at</th>
            <th className="p-4">Automatically reopened for revalidation</th>
            <th className="p-4">Justification</th>
          </tr>
        </thead>
        <tbody>
          {flaws.data.map((flaw, i) => {
            const acceptedEvent = flaw.events.findLast(
              (e) => e.type === "accepted",
            );

            const revalidationDate = acceptedEvent
              ? new Date(acceptedEvent.createdAt).setDate(
                  new Date(acceptedEvent.createdAt).getDate() + 4 * 30,
                )
              : null;
            return (
              <tr
                className={classNames(
                  "cursor-pointer",
                  i % 2 !== 0 ? "bg-card/75 hover:bg-card" : "hover:bg-card/50",
                  i + 1 !== flaws.data.length && "border-b",
                )}
                key={flaw.id}
                onClick={() => {
                  router.push(
                    `/${activeOrg.slug}/projects/${assetMap[flaw.assetId].project.slug}/assets/${assetMap[flaw.assetId]?.slug}/flaws/${flaw.id}`,
                  );
                }}
              >
                <td className="p-4">{flaw.cveId}</td>
                <td className="p-4">{flaw.rawRiskAssessment}</td>
                <td className="p-4">
                  <Link
                    onClick={(e) => e.stopPropagation()}
                    href={`/${activeOrg.slug}/projects/${assetMap[flaw.assetId].project.slug}/assets/${assetMap[flaw.assetId]?.slug}`}
                  >
                    <Badge variant={"outline"}>
                      {assetMap[flaw.assetId]?.title}
                    </Badge>
                  </Link>
                </td>
                <td className="p-4">
                  {acceptedEvent && (
                    <DateString date={new Date(acceptedEvent.createdAt)} />
                  )}
                </td>
                <td className="p-4">
                  {revalidationDate && (
                    <DateString date={new Date(revalidationDate)} />
                  )}
                </td>
                <td className="p-4">{acceptedEvent?.justification}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AcceptedVulnerabilitiesTable;
