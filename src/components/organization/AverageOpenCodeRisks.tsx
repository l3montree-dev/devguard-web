// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  amount: number | undefined;
}

const AverageOpenCodeRisks: FunctionComponent<Props> = ({ amount }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">Open Code Risks</CardTitle>
        <CardDescription>
          Average amount of open code risk per project
        </CardDescription>
      </CardHeader>
      <CardContent className="items-center mt-8">
        <div className="flex flex-col items-center">
          <p className="text-4xl font-semibold">
            {(amount ?? 0).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
          <CardDescription className="pt-4 text-center max-w-xs border-t mt-8">
            Code risks are findings in your code (e.g. from SAST, IaC or Secret
            scanning)
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageOpenCodeRisks;
