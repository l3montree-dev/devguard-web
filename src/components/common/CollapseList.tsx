// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { classNames } from "@/utils/common";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import ListItem from "./ListItem";

interface Props {
  Items?: {
    Title: React.ReactNode;
    Description?: string | React.ReactElement;
    Button?: React.ReactNode;
    className?: string;
  }[];
  Title: React.ReactNode;
  Description?: string | React.ReactElement;
  Button?: React.ReactNode;
  reactOnHover?: boolean;
  className?: string;
}

const CollapseList = ({
  Items,
  Title,
  Description,
  Button,
  reactOnHover,
  className,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className={classNames(
        "flex flex-col bg-muted/30",
        reactOnHover && "transition-all hover:bg-accent",
        className,
      )}
    >
      <div
        className="flex flex-row items-center justify-between cursor-pointer"
        onClick={toggleExpanded}
      >
        <CardHeader className="justify-center w-full">
          <CardTitle className="text-base flex items-center gap-2">
            {Items &&
              Items.length > 0 &&
              (isExpanded ? (
                <span className="text-sm font-normal transform rotate-90 transition-transform">
                  &gt;
                </span>
              ) : (
                <span className="text-sm font-normal">&gt;</span>
              ))}
            {Title}
          </CardTitle>
          {Boolean(Description) && (
            <CardDescription>{Description}</CardDescription>
          )}
        </CardHeader>
        {Boolean(Button) && (
          <CardContent className="p-6">
            <div className="flex flex-none items-center gap-x-4">{Button}</div>
          </CardContent>
        )}
      </div>

      {Items && Items.length > 0 && isExpanded && (
        <CardContent className="p-6 pt-0">
          <div>
            {Items.map((item, index) => (
              <div key={index} className={classNames("mt-4")}>
                <ListItem
                  Title={item.Title}
                  Description={item.Description}
                  Button={item.Button}
                  className={(item.className, "bg-muted/50")}
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CollapseList;
