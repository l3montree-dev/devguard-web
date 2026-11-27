// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { VerifiableIdentityAddress } from "@ory/client-fetch";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Props {
  addresses: VerifiableIdentityAddress[];
}

const EmailVerificationStatus = ({ addresses }: Props) => (
  <div className="mb-6 flex flex-col gap-2">
    {addresses.map(({ id, value, verified }) => (
      <div key={id ?? value} className="flex items-center gap-2 text-sm">
        <span>{value}</span>
        <Badge variant={verified ? "success" : "yellow"}>
          {verified ? "Verified" : "Not verified"}
        </Badge>
        {verified ? null : (
          <Link className="font-medium underline" href="/verification">
            Verify now
          </Link>
        )}
      </div>
    ))}
  </div>
);

export default EmailVerificationStatus;
