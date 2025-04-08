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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Progress } from "@/components/ui/progress";
import { classNames } from "@/utils/common";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

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
        <div className="grid grid-cols-3 rounded-lg border">
          {scoreCard?.checks.map((e, i, arr) => (
            <div className={classNames("border text-sm")} key={e.name}>
              <div className="p-2 text-left">
                <Tooltip>
                  <div className="flex flex-row ">
                    <TooltipTrigger className="">
                      {e.name}
                      <InformationCircleIcon className="ml-1 inline-block h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                  </div>
                  <TooltipContent>
                    <p>{e.documentation.shortDescription}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="p-2 text-left">
                <div className="flex flex-row">
                  <Tooltip>
                    <div className="text flex-ro flex flex-1">
                      <TooltipTrigger className="text-left">
                        {e.score === -1 ? 0 : e.score}
                        <InformationCircleIcon className="ml-1 inline-block h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                    </div>
                    <TooltipContent>
                      <p>{e.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Progress className={""} value={e.score * 10}></Progress>
                </div>
              </div>
              <div className="p-2 text-left"></div>
            </div>
          ))}
        </div>

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
