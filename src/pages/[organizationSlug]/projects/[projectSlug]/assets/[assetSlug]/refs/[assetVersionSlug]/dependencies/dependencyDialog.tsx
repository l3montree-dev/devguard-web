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
import { toast } from "sonner";
import { Project, ScoreCard } from "@/types/api/api";
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
import { Badge } from "@/components/ui/badge";
import ListItem from "@/components/common/ListItem";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Podium } from "./Podium";
import OpenSSFtable from "./SSFtable";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  purl: string;
  scoreCard?: ScoreCard;
  project: Project;
}

const DependencyDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
  scoreCard,
  purl,
  project: componentProject,
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
        <DialogHeader>
          <div className="flex justify-between">
            <DialogTitle className="flex">{purl}</DialogTitle>
            <div className="mr-5 flex flex-row-reverse space-x-5">
              <Badge variant="success" className="flex">
                {componentProject.license}
              </Badge>
              <div className="flex">
                <div className="">
                  <Image
                    src={"/assets/openssf-horizontal-black.svg"}
                    alt="openssf logo"
                    width={100}
                    height={100}
                    className="mr-2 dark:invert"
                  ></Image>
                </div>
              </div>
            </div>
          </div>
          <DialogDescription className="">
            Details of package: {componentProject.description}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div>Priority</div>
          <Podium></Podium>
          <div className="mt-5">
            <div className="border border-2 border-red-500">
              <table>
                <tr>
                  <th>Compnay</th>
                </tr>
                <tr>
                  <td>l3montree</td>
                </tr>
              </table>
            </div>
            <div className="border-2 border-t-0 border-dashed border-gray-500">
              Veery good
            </div>
            {/* https://hillmann.cc/tailwindcss-bg-patterns/ try to look for some good patterns here*/}
            <OpenSSFtable scoreCard={scoreCard}></OpenSSFtable>
          </div>
        </div>

        {graphData && (
          <div
            className="h-52 w-full rounded-lg border bg-black"
            style={{ height: 500 }}
          >
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
