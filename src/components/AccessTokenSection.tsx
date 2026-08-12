"use client";

import Link from "next/link";
import { useState } from "react";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import useAccessToken from "../hooks/useAccessToken";
import { DatePicker } from "./DatePicker";
import CopyCode from "./common/CopyCode";
import Section from "./common/Section";
import { Button } from "./ui/button";

const AccessTokenSection = ({ description }: { description: string }) => {
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const { accessToken: pat, onCreateAccessToken: onCreatePat } =
    useAccessToken();

  const manageTokensHref = `/${org.slug}/projects/${project.slug}/assets/${asset.slug}/settings#access-tokens`;

  return (
    <Section
      className="mb-0 mt-0 pb-0 pt-0"
      description="To use the Devguard-Scanner, you need to create an Repository Access Token. You can create such a token by clicking the button below."
      title="Create an Repository Access Token"
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
              href={manageTokensHref}
              target="_blank"
              className="mt-4 items-end justify-end flex text-sm"
            >
              <span>Create a new token or manage your existing ones</span>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 justify-between items-end">
            <DatePicker
              date={expiryDate}
              onDateChange={setExpiryDate}
              label="Expiry date"
            />
            <Button
              variant="outline"
              disabled={!expiryDate}
              onClick={() =>
                expiryDate &&
                onCreatePat({
                  description,
                  scopes: "scan",
                  expiryDateUnix: Math.floor(expiryDate.getTime() / 1000),
                })
              }
            >
              Create Repository Access Token
            </Button>
            <Link
              href={manageTokensHref}
              target="_blank"
              className="flex items-end justify-end align-super text-sm"
            >
              <span>Manage your tokens</span>
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
};

export default AccessTokenSection;
