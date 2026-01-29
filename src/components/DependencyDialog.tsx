import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import DependencyGraph from "@/components/DependencyGraph";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { browserApiClient } from "@/services/devGuardApi";
import { Project, ScoreCard } from "@/types/api/api";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { GitBranch, ScaleIcon, StarIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import useDecodedParams from "../hooks/useDecodedParams";
import { beautifyPurl } from "../utils/common";
import OpenSsfDetails from "./OpenSsfDetails";
import DateString from "./common/DateString";
import ListItem from "./common/ListItem";
import OpenSsfScore from "./common/OpenSsfScore";
import { convertPathsToTree } from "../utils/dependencyGraphHelpers";

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
  const search = useSearchParams();

  const [graphData, setGraphData] = useState<ViewDependencyTreeNode | null>(
    null,
  );

  //read artifactName from url query params
  const artifactName = (search?.get("artifact") as string) || "";

  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };

  const handleGraphFetch = useCallback(
    async (data: string) => {
      const query = new URLSearchParams({
        purl: data,
      });
      // check if artifact is set
      if (artifactName) {
        query.append("artifact", artifactName);
      }

      const resp = await browserApiClient(
        `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/path-to-component?${query.toString()}`,
        {
          method: "GET",
        },
      );

      if (resp.ok) {
        const json2 = await resp.json();
        const graphData = convertPathsToTree(json2, []);
        setGraphData(graphData);
      } else {
        toast.error("Could not fetch Graph Data from Endpoint");
      }
    },
    [artifactName, organizationSlug, projectSlug, assetSlug, assetVersionSlug],
  );

  useEffect(() => {
    handleGraphFetch(purl);
  }, [purl, handleGraphFetch]);

  return (
    <Dialog open={open}>
      <DialogContent className={"w-full"} setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle className="flex">{beautifyPurl(purl)}</DialogTitle>
          <DialogDescription className="">
            Details of package: {componentProject.description}
          </DialogDescription>
        </DialogHeader>
        <div className="mr-5 flex space-x-2">
          <Badge variant="outline" className="flex">
            <ScaleIcon className="mr-1 h-4 w-4 text-muted-foreground" />
            {componentProject.license}
          </Badge>
          <Badge variant={"outline"} className="mr-1">
            <StarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
            {componentProject.starsCount}
          </Badge>
          <Badge variant={"outline"}>
            <GitBranch className="mr-1 h-4 w-4 text-muted-foreground" />
            {componentProject.forksCount}
          </Badge>
          <Badge variant={"outline"}>
            {componentProject.openIssuesCount} Open Issues
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <InformationCircleIcon className="h-7 w-7 shrink-0" />
          <span className="text-xs">
            Please note that the data shown is for the whole project{" "}
            {beautifyPurl(purl)} and not a specific version of the component.
            Data can therefore be different from specific info in the
            dependencies table.
          </span>
        </div>
        {graphData && (
          <div className="mt-4">
            <span className="font-semibold mb-2 block">Path to component</span>
            <div className="h-40 w-full rounded-lg border bg-black">
              <DependencyGraph
                variant="compact"
                width={100}
                height={100}
                vulns={[]}
                graph={graphData}
              />
            </div>
          </div>
        )}
        <div className="mt-2">
          <ListItem
            Title={
              <div className="flex items-center gap-2 justify-between flex-row">
                <div className="flex flex-row gap-2">
                  <div>OpenSSF Scorecard</div>
                  <OpenSsfScore score={scoreCard?.overallScore ?? 0} />
                </div>
                <div className="text-xs flex flex-row text-muted-foreground items-center gap-2">
                  {scoreCard?.date && (
                    <div>
                      <DateString date={parseDateOnly(scoreCard.date)} />
                    </div>
                  )}
                </div>
              </div>
            }
            Description={
              <div>
                <div className="pb-2">
                  The Open Source Security Foundation (OpenSSF) Scorecard is a
                  tool that helps open source projects assess their security
                  posture. It provides a set of metrics and scores to evaluate
                  the security practices of a project, helping maintainers
                  identify areas for improvement.
                </div>
                <hr className="pb-2" />
                <OpenSsfDetails scoreCard={scoreCard}></OpenSsfDetails>
              </div>
            }
          />
        </div>

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DependencyDialog;
