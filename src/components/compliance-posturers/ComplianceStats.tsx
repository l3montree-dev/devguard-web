"use client";

import type { FunctionComponent, ReactNode } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { classNames } from "@/utils/common";
import { EventTypeIcon } from "../risk-assessment/RiskAssessmentFeed";
import type { VulnEventDTO } from "@/types/api/api";

interface Props {
  open: number;
  implemented: number;
  notApplicable: number;
  isLoading: boolean;
}

interface TileProps {
  amount: number;
  variant: VulnEventDTO["type"];
  isLoading: boolean;
}

const StatTile: FunctionComponent<TileProps> = ({
  amount,
  variant,
  isLoading,
}) => {
  var label = "";
  var numberClass = "";

  switch (variant) {
    case "detected":
      label = "Not Implemented";
      numberClass = "text-red-500";
      break;
    case "implemented":
      label = "Implemented";
      numberClass = "text-green-500";
      break;
    case "notApplicable":
      label = "Not applicable";
      numberClass = "text-muted-foreground";
      break;
  }
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        {isLoading ? (
          <Skeleton className="h-10 w-12" />
        ) : (
          <CardTitle className={classNames("text-3xl font-bold ", numberClass)}>
            {amount}
          </CardTitle>
        )}
      </CardHeader>
    </Card>
  );
};

const ComplianceStats: FunctionComponent<Props> = ({
  open,
  implemented,
  notApplicable,
  isLoading,
}) => {
  return (
    <div className="grid w-full grid-cols-3 gap-4">
      <StatTile
        variant="implemented"
        amount={implemented}
        isLoading={isLoading}
      />
      <StatTile
        variant="notApplicable"
        amount={notApplicable}
        isLoading={isLoading}
      />
      <StatTile variant="detected" amount={open} isLoading={isLoading} />
    </div>
  );
};

export default ComplianceStats;
