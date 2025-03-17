import { useState } from "react";
import { PatWithPrivKey } from "../../types/api/api";
import CopyCode from "../common/CopyCode";
import ListItem from "../common/ListItem";
import Section from "../common/Section";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import Link from "next/link";

const PatSection = ({
  description,
  pat,
  onCreatePat,
}: {
  description: string;
  pat?: PatWithPrivKey;
  onCreatePat: (data: {
    description: string;
    scanAsset: boolean;
    manageAsset: boolean;
  }) => void;
}) => {
  const [scanAsset, setScanAsset] = useState(false);
  const [manageAsset, setManageAsset] = useState(false);

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
            <Link
              href="/user-settings#pat"
              target="_blank"
              className="mt-4 text-sm"
            >
              <span>to create a new token or manage your existing ones</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div>
            <ListItem
              description="Use this token to scan your repositories"
              Title="scan Asset"
              Button={
                <Switch checked={scanAsset} onCheckedChange={setScanAsset} />
              }
            />
            <ListItem
              description="Use this token to manage your repositories"
              Title="manage Asset"
              Button={
                <Switch
                  checked={manageAsset}
                  onCheckedChange={setManageAsset}
                />
              }
            />
          </div>

          <Link
            href="/user-settings#pat"
            target="_blank"
            className="mt-4 text-sm"
          >
            <span>manage your existing tokens</span>
          </Link>
          <div>
            <Button
              variant="default"
              onClick={() =>
                onCreatePat({
                  description,
                  scanAsset,
                  manageAsset,
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
