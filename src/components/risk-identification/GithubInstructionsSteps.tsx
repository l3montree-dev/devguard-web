import { PatWithPrivKey } from "@/types/api/api";
import CopyCode from "../common/CopyCode";
import GithubTokenInstructions from "./GithubTokenInstructions";
import Steps from "./Steps";

const GithubInstructionsSteps = ({
  pat,
  codeString,
}: {
  pat?: PatWithPrivKey;
  codeString: string;
}) => {
  return (
    <Steps>
      <GithubTokenInstructions pat={pat?.privKey} />
      <div className="mb-10">
        <h3 className="mb-4 mt-2 font-semibold">
          Create or insert the yaml snippet inside a .github/workflows file
        </h3>
        <CopyCode language="yaml" codeString={codeString}></CopyCode>
      </div>
      <div>
        <h3 className="mb-4 mt-2 font-semibold">
          Commit and push the changes to the repository.
          <br /> You can also trigger the workflow manually
        </h3>
      </div>
    </Steps>
  );
};

export default GithubInstructionsSteps;
