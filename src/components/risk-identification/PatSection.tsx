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
  onCreatePat: (data: { description: string; scopes: string }) => void;
}) => {
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
              className="mt-4 items-end justify-end flex text-sm"
            >
              <span>Create a new token or manage your existing ones</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <Button
              variant="default"
              className=""
              onClick={() =>
                onCreatePat({
                  description,
                  scopes: "scan",
                })
              }
            >
              Create Personal Access Token
            </Button>
            <Link
              href="/user-settings#pat"
              target="_blank"
              className="flex items-end justify-end align-super text-sm"
            >
              <span>Manage your tokens</span>
            </Link>
          </div>
        </>
      )}
    </Section>
  );
};

export default PatSection;
