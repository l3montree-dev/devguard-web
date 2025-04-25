import { PatWithPrivKey } from "@/types/api/api";
import CopyCode from "../common/CopyCode";
import Section from "../common/Section";
import { Button } from "../ui/button";
import Steps from "./Steps";
import GitlabTokenInstructions from "./GitlabTokenInstructions";
import Autosetup from "../Autosetup";
import { FunctionComponent } from "react";
import Link from "next/link";

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
}

const GitlabInstructionsSteps: FunctionComponent<Props> = ({
  isLoading,
  handleAutosetup,
  progress,
  Loader,
  pat,
  codeString,
}) => {
  return (
    <>
      <div className="mb-8">
        <div className="text-sm text-muted-foreground">
          To integrate Devguard&apos;s CI/CD pipeline with your GitLab project,
          follow the steps below. Once completed, you will see the results in
          the Devguard Dashboard.
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          To manage and create issues in your GitLab project, you need to
          generate a Token on GitLab, add it to Devguard, and configure a
          webhook for your GitLab project. Refer to the documentation for
          detailed instructions on setting up the GitLab integration.{" "}
          <Link
            href="https://devguard.org/getting-started/setup-gitlab-integration"
            target="_blank"
            className="mt-4"
          >
            Set Up GitLab Integration
          </Link>
        </div>
      </div>

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
