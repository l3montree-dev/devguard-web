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
import { TriangleAlert } from "lucide-react";
// For reference http://localhost:3000/l3montree/settings

interface Props {
  title: string;
  description: string;
  onConfirm?: () => void;
}
const Alert: FunctionComponent<PropsWithChildren<Props>> = ({
  children,
  title,
  description,
  onConfirm,
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            <span>Confirm</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
