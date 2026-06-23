"use client";

import AssetTitle from "@/components/common/AssetTitle";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type FunctionComponent } from "react";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDecodedParams from "@/hooks/useDecodedParams";
import { browserApiClient } from "@/services/devGuardApi";
const Index: FunctionComponent = () => {
  const assetMenu = useAssetMenu();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
    useDecodedParams() as {
      organizationSlug: string;
      projectSlug: string;
      assetSlug: string;
      assetVersionSlug: string;
    };
  const [data, setData] = useState<string>("");
  const handleClick = async () => {
    const resp = await browserApiClient(
      "/organizations/" +
        organizationSlug +
        "/projects/" +
        projectSlug +
        "/assets/" +
        assetSlug +
        "/refs/" +
        assetVersionSlug +
        "/advisory/submit",
      {
        method: "POST",
        body: JSON.stringify({
          name: data,
        }),
      },
    );
  };
  return (
    <Page Menu={assetMenu} title={"Security Advisory"} Title={<AssetTitle />}>
      <div className="flex flex-row items-center justify-between">
        <Input value={data} onChange={(e) => setData(e.target.value)} />
      </div>
      <div className="my-2">
        <Button onClick={handleClick}>Submit</Button>
      </div>
    </Page>
  );
};

export default Index;
