// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { classNames } from "@/utils/common";
import React, { type FunctionComponent, type ReactNode } from "react";

interface Props {
  title?: string;
  description?: ReactNode;
  children: React.ReactNode;
  id?: string;
  Title?: ReactNode;
  Button?: ReactNode;
  forceVertical?: boolean;
  Icon?: ReactNode;
  primaryHeadline?: boolean;
  className?: string;
  "data-tour"?: string;
}
const Section: FunctionComponent<Props> = (props) => {
  return (
    <div
      id={props.id}
      className={classNames(props.className ?? "mb-6 mt-4 pb-6")}
      data-tour={props["data-tour"]}
    >
      <div
        className={classNames(
          "flex",
          props.forceVertical ? "flex-col gap-4" : "flex-row gap-8",
        )}
      >
        <div
          className={classNames(
            props.forceVertical
              ? "flex flex-row items-end justify-between gap-6"
              : "w-96",
          )}
        >
          <div className="flex-1">
            <h2
              className={classNames(
                "flex flex-row items-center gap-2 font-semibold leading-7 text-foreground",
                props.primaryHeadline ? "text-2xl" : "text-base",
              )}
            >
              {props.Icon}
              {props.title ?? props.Title}
            </h2>
            {props.description !== undefined && (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {props.description}
              </p>
            )}
          </div>
          {props.Button}
        </div>
        <div className="flex flex-1 flex-col justify-end gap-4">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Section;
