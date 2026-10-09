// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React, { type FunctionComponent, type ReactNode, type JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { classNames } from "@/utils/common";

interface Props {
  Button?: React.ReactNode;
  Title: ReactNode;
  reactOnHover?: boolean;
  Description?: string | JSX.Element;
  className?: string;
  // rendered below the title row, so the Button stays aligned with title and description
  children?: ReactNode;
}
const ListItem: FunctionComponent<Props> = ({
  Button,
  Title,
  Description: Description,
  reactOnHover,
  className,
  children,
}) => {
  const header = (
    <CardHeader className="justify-center w-full">
      <CardTitle className="text-base">{Title}</CardTitle>
      {Boolean(Description) && <CardDescription>{Description}</CardDescription>}
    </CardHeader>
  );
  const button = Boolean(Button) && (
    <CardContent className="p-6 shrink-0">
      <div className="flex flex-none items-center gap-x-4">{Button}</div>
    </CardContent>
  );

  if (children) {
    return (
      <Card
        className={classNames(
          "flex flex-col",
          reactOnHover && "transition-all hover:bg-accent",
          className,
        )}
      >
        <div className="flex flex-row items-center justify-between">
          {header}
          {button}
        </div>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={classNames(
        "flex flex-row items-center justify-between",
        reactOnHover && "transition-all hover:bg-accent",
        className,
      )}
    >
      {header}
      {button}
    </Card>
  );
};

export default ListItem;
