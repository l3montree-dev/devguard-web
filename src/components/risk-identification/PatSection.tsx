import { useState } from "react";
import { PatWithPrivKey } from "../../types/api/api";
import CopyCode from "../common/CopyCode";
import ListItem from "../common/ListItem";
import Section from "../common/Section";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

const PatSection = ({
  description,
  pat,
  onCreatePat,
}: {
  description: string;
  pat?: PatWithPrivKey;
  onCreatePat: (data: {
    description: string;
    forScanning: boolean;
    forManagement: boolean;
  }) => void;
}) => {
  const [forScanning, setForScanning] = useState(false);
  const [forManagement, setForManagement] = useState(false);

  return (
    <Section
      className="mb-0 mt-0 pb-0 pt-0"
      description="To use the Devguard-Scanner, you need to create a Personal Access Token. You can create such a token by clicking the button below."
      title="Create a Personal Access Token"
      forceVertical
    >
      {pat ? (
        <div className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-row gap-2">
              <CopyCode language="shell" codeString={pat.privKey} />
            </div>
            <span className="block text-right text-sm text-destructive">
              Make sure to copy the token. You won&apos;t be able to see it ever
              again!
            </span>
          </div>
        </div>
      ) : (
        <>
          <div>
            <ListItem
              description="Use this token to scan your repositories"
              Title="For Scanning"
              Button={
                <Switch
                  checked={forScanning}
                  onCheckedChange={setForScanning}
                />
              }
            />
            <ListItem
              description="Use this token to manage your repositories"
              Title="For Management"
              Button={
                <Switch
                  checked={forManagement}
                  onCheckedChange={setForManagement}
                />
              }
            />
          </div>
          <div>
            <Button
              variant="default"
              onClick={() =>
                onCreatePat({
                  description,
                  forScanning,
                  forManagement,
                })
              }
            >
              Create Personal Access Token
            </Button>
          </div>
        </>
      )}
    </Section>
  );
};

export default PatSection;
