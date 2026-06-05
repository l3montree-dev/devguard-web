// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { isAdmin, isLoggedIn, isMember } from "@/hooks/useUserRole";
import { useCurrentUserRole } from "@/hooks/useUserRole";
import type { FunctionComponent, ReactNode } from "react";

type Requirement = "loggedIn" | "member" | "admin";

interface Props {
  require: Requirement;
  children: ReactNode;
}

const AuthGuard: FunctionComponent<Props> = ({ require, children }) => {
  const role = useCurrentUserRole();

  if (require === "loggedIn" && !isLoggedIn(role)) return null;
  if (require === "member" && !isMember(role)) return null;
  if (require === "admin" && !isAdmin(role)) return null;

  return <>{children}</>;
};

export default AuthGuard;
