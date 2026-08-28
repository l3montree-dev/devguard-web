// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import {
  CheckCircleIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { Bug } from "lucide-react";
import type { FunctionComponent } from "react";
import type { DependencyVuln } from "../../types/api/api";
import { Badge } from "../ui/badge";

// Uses the shared Badge color variants (muted background + matching border and
// text) so vuln states read like every other status badge in the app.
const VulnState: FunctionComponent<{ state: DependencyVuln["state"] }> = ({
  state,
}) => {
  switch (state) {
    case "fixed":
      return (
        <Badge
          data-testid="vuln-state"
          variant="success"
          className="gap-1 py-1"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Fixed
        </Badge>
      );
    case "implemented":
      return (
        <Badge
          data-testid="vuln-state"
          variant="success"
          className="gap-1 py-1"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Implemented
        </Badge>
      );
    case "accepted":
      return (
        <Badge data-testid="vuln-state" variant="yellow" className="gap-1 py-1">
          <SpeakerXMarkIcon className="h-4 w-4" />
          Accepted
        </Badge>
      );
    case "falsePositive":
      return (
        <Badge
          data-testid="vuln-state"
          variant="success"
          className="gap-1 py-1"
        >
          <StopIcon className="h-4 w-4" />
          False Positive
        </Badge>
      );
    case "notApplicable":
      return (
        <Badge data-testid="vuln-state" variant="blue" className="gap-1 py-1">
          <StopIcon className="h-4 w-4" />
          Not Applicable
        </Badge>
      );
    case "open":
    default:
      return (
        <Badge data-testid="vuln-state" variant="danger" className="gap-1 py-1">
          <Bug className="h-4 w-4" />
          Open
        </Badge>
      );
  }
};

export default VulnState;
