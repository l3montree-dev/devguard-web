// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { config as appConfig } from "@/config";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

function ProductManagement({
  orgName,
  orgProductName,
  orgID,
}: {
  orgName: string;
  orgProductName: string;
  orgID: string;
}) {
  return (
    <div className="flex  flex-col  items-center">
      <div className="m-8 text-center dark:text-white">
        <h1>
          {orgName} is currently using the {orgProductName}
        </h1>
      </div>
      <div>
        <Link
          href={
            appConfig.devGuardApiUrl + `/billing/create-portal-session/${orgID}`
          }
          className={buttonVariants({ variant: "default" })}
        >
          Manage subscription
        </Link>
      </div>
    </div>
  );
}

export default ProductManagement;
