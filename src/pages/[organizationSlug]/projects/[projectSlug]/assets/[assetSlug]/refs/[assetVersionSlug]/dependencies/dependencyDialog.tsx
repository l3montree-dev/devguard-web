import { useRouter } from "next/router";

import { config } from "@/config";
import { Dispatch, FunctionComponent, SetStateAction, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DependencyGraph from "@/components/DependencyGraph";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { browserApiClient } from "@/services/devGuardApi";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: any;
}
// hier müssen ins interface dann noch die anderen daten von row.row.* rein, die kann ich dann bei onClick denke ich mal auch mitgeben in useref maybe?

// localhost:8080/api/v1/organizations/bizarreorganization/projects/adventurousproject/assets/joasset/refs/main/path-to-component/?scanner=SBOM-File-Upload&purl=pkg%3Anpm%2Feslint-module-utils%402.11.1

const DependencyDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
  data,
}) => {
  const asset = useActiveAsset();
  const router = useRouter();
  const organization = useActiveOrg();
  const project = useActiveProject();

  const handleGraphFetch = async (data: string) => {
    const resp = await browserApiClient(
      `/organizations/${organization.slug}/projects/${project.slug}/assets/${asset?.slug}/refs/main/path-to-component/?scanner=SBOM-File-Upload&purl=${encodeURIComponent(data)}`,
      {
        method: "GET",
      },
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>reason {data.reason}</DialogTitle>
          <DialogTitle>details {data.details}</DialogTitle>
          <DialogTitle>name {data.name}</DialogTitle>
          <DialogTitle>score {data.score}</DialogTitle>
          <DialogTitle>shortDescription {data.shortDescription}</DialogTitle>
          <DialogTitle>dependencyPurl {data.purl}</DialogTitle>
        </DialogHeader>
        <Button onClick={() => handleGraphFetch(data.purl)}></Button>
        <hr />
        {/* <DependencyGraph
          width={100}
          height={100}
          flaws={}
          graph={}
        ></DependencyGraph> */}
        <DialogFooter>
          <div>hi</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyDialog;
