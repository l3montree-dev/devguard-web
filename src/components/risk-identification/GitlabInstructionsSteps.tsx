import { PatWithPrivKey } from "@/types/api/api";
import CopyCode from "../common/CopyCode";
import Section from "../common/Section";
import { Button } from "../ui/button";
import Steps from "./Steps";
import GitlabTokenInstructions from "./GitlabTokenInstructions";
import Autosetup from "../Autosetup";
import { FunctionComponent } from "react";
import GitlabWebhookInstructions from "./GitlabWebhookInstructions";

interface Props {
  isLoading: boolean;
  handleAutosetup: () => void;
  progress: {
    [key: string]: {
      status: "notStarted" | "pending" | "success";
      message: string;
      url?: string;
    };
  };
  Loader: () => React.ReactNode;

  pat?: PatWithPrivKey;
  codeString: string;
  apiUrl: string;
}

const GitlabInstructionsSteps: FunctionComponent<Props> = ({
  isLoading,
  handleAutosetup,
  progress,
  Loader,
  pat,
  codeString,
  apiUrl,
}) => {
  return (
    <>
      <Autosetup
        isLoading={isLoading}
        handleAutosetup={handleAutosetup}
        progress={progress}
        Loader={Loader}
      />

      <div className="my-8 flex flex-row items-center text-center text-muted-foreground">
        <div className="flex-1 border-t-2 border-dotted" />
        <span className="px-5">OR</span>
        <div className="flex-1 border-t-2 border-dotted" />
      </div>

      <Steps>
        <GitlabTokenInstructions pat={pat?.privKey} />
        <GitlabWebhookInstructions apiUrl={apiUrl} />
        <div className="mb-10">
          <h3 className="mb-4 mt-2 font-semibold">
            Create or insert the yaml snippet inside a .gitlab-ci.yml file
          </h3>
          <CopyCode language="yaml" codeString={codeString}></CopyCode>
        </div>
        <div>
          <h3 className="mb-4 mt-2 font-semibold">
            Commit and push the changes to the repository.
          </h3>
        </div>
      </Steps>
    </>
  );
};

export default GitlabInstructionsSteps;
