import { PatWithPrivKey } from "../../types/api/api";
import CopyCode from "../common/CopyCode";
import Section from "../common/Section";
import { Button } from "../ui/button";

const PatSection = ({
  pat,
  onCreatePat,
}: {
  pat?: PatWithPrivKey;
  onCreatePat: (data: { description: string }) => void;
}) => {
  return (
    <Section
      className="mb-0 mt-0 pb-0 pt-0"
      description="To use the Devguard-Scanner, you need to create a Personal Access
    Token. You can create such a token by clicking the button below."
      title="Create a Personal Access Token"
      forceVertical
    >
      {pat && (
        <div className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-row gap-2">
              <CopyCode language="shell" codeString={pat.privKey} />
            </div>

            <span className=" block text-right text-sm text-destructive">
              Make sure to copy the token. You won&apos;t be able to see it ever
              again!
            </span>
          </div>
        </div>
      )}
      {!pat && (
        <div>
          <Button
            variant={"default"}
            onClick={() => onCreatePat({ description: "SCA Analysis" })}
          >
            Create Personal Access Token
          </Button>
        </div>
      )}
    </Section>
  );
};

export default PatSection;
