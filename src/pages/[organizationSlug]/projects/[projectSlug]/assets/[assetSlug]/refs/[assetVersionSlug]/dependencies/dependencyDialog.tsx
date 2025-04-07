import { useRouter } from "next/router";
import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
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
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: any;
}

const DependencyDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
  data,
}) => {
  const asset = useActiveAsset();
  const router = useRouter();
  const organization = useActiveOrg();
  const project = useActiveProject();

  const [graphData, setGraphData] = useState<any>(null);

  const handleGraphFetch = async (data: string) => {
    const resp = await browserApiClient(
      `/organizations/${organization.slug}/projects/${project.slug}/assets/${asset?.slug}/refs/main/path-to-component/?scanner=SBOM-File-Upload&purl=${encodeURIComponent(data)}`,
      {
        method: "GET",
      },
    );

    if (resp.ok) {
      const json2 = await resp.json();
      setGraphData(json2);
    } else {
      toast.error("Could not fetch Graph Data from Endpoint");
    }
  };

  useEffect(() => {
    handleGraphFetch(data.purl);
  }, [data.purl]);

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>reason: {data.reason}</DialogTitle>
          <DialogTitle>details: {data.details}</DialogTitle>
          <DialogTitle>name: {data.name}</DialogTitle>
          <DialogTitle>score: {data.score}</DialogTitle>
          <DialogTitle>shortDescription: {data.shortDescription}</DialogTitle>
          <DialogTitle>dependencyPurl: {data.purl}</DialogTitle>
        </DialogHeader>
        <hr />

        {graphData && (
          <div className="h-52 w-full" style={{ height: 500 }}>
            <DependencyGraph
              variant="compact"
              width={100}
              height={100}
              flaws={[]}
              graph={graphData}
            />
          </div>
        )}
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyDialog;
