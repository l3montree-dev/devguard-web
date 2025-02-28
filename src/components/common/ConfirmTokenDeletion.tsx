import React, { FunctionComponent, PropsWithChildren } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
// For reference http://localhost:3000/l3montree/settings

interface Props {
  Button: React.ReactNode;
}
const ConfirmTokenDeletion: FunctionComponent<PropsWithChildren<Props>> = ({
  Button,
  children,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete your token?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The token will be permanently deleted. This action cannot be undone,
            and you will lose access to any services associated with it. Are you
            sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="" asChild>
            {Button}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmTokenDeletion;
