import { useRouter } from "next/router";

import { config } from "@/config";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { Dispatch, FunctionComponent, SetStateAction, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { PatWithPrivKey } from "@/types/api/api";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: any;
}
// hier müssen ins interface dann noch die anderen daten von row.row.* rein, die kann ich dann bei onClick denke ich mal auch mitgeben in useref maybe?

const DependencyDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
  data,
}) => {
  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>In-Toto Provenance</DialogTitle>
          <DialogDescription>{}</DialogDescription>
        </DialogHeader>
        <hr />

        <DialogFooter>
          <div>hi</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyDialog;
