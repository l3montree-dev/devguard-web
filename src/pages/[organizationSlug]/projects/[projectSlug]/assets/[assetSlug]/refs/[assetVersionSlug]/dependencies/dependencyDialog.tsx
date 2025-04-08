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
import { toast } from "sonner";
import { ScoreCard } from "@/types/api/api";
import { withProject } from "@/decorators/withProject";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  purl: string;
  scoreCard?: ScoreCard;
}

const DependencyDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
  scoreCard,
  purl,
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
    handleGraphFetch(purl);
  }, [purl]);

  return (
    <Dialog open={open}>
      <DialogContent className={"w-full"} setOpen={setOpen}>
        <DialogHeader>{purl}</DialogHeader>
        <hr />
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>score</th>
              <th>reason</th>

              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {scoreCard?.checks.map((e) => (
              <tr key={e.name}>
                <td>
                  {/* <td>{e.reason}</td> */}
                  {e.name}
                </td>
                <td>{e.score}</td>
                <td>{e.reason}</td>

                <td>{e.documentation.shortDescription}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
