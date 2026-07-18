// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useFormContext } from "react-hook-form";

export function usePasswordMismatch(): boolean {
  const { watch, getValues } = useFormContext();
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const hasConfirmField = "confirmPassword" in getValues();

  if (!hasConfirmField) {
    return false;
  }
  return password !== confirmPassword;
}
