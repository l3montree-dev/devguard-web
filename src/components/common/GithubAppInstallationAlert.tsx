// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import React, { type FunctionComponent, type PropsWithChildren } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface Props {
  Button: React.ReactNode;
}
const GithubAppInstallationAlert: FunctionComponent<
  PropsWithChildren<Props>
> = ({ Button, children }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            An installed GitHub App will be available to the whole organization
          </AlertDialogTitle>
          <AlertDialogDescription>
            The GitHub App will be available to the whole organization. This
            means that all repositories and users in the organization will be
            able to use the app.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {Button}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GithubAppInstallationAlert;
