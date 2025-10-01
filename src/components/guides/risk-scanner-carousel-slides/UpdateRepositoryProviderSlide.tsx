import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { browserApiClient } from "../../../services/devGuardApi";
import { AssetDTO } from "../../../types/api/api";
import { classNames } from "../../../utils/common";
import { useStore } from "../../../zustand/globalStoreProvider";
import { AsyncButton } from "../../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { CarouselItem } from "../../ui/carousel";
import { DialogHeader, DialogTitle } from "../../ui/dialog";
import useDecodedParams from "../../../hooks/useDecodedParams";
import { useUpdateAsset } from "../../../context/AssetContext";

interface Props {
  api?: {
    scrollTo: (index: number) => void;
  };
  nextIndex: number;
}

const UpdateRepositoryProviderSlide = ({ api, nextIndex }: Props) => {
  const [selectedProvider, setSelectedProvider] = React.useState<
    AssetDTO["repositoryProvider"] | undefined
  >();
  const { organizationSlug, projectSlug, assetSlug } = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
  const updateAsset = useUpdateAsset();

  const handleProviderUpdate = async () => {
    // update the asset provider
    const resp = await browserApiClient(
      `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}`,
      {
        method: "PATCH",
        body: JSON.stringify({ repositoryProvider: selectedProvider }),
      },
    );

    if (resp.ok) {
      const updatedAsset = await resp.json();
      updateAsset(updatedAsset); // this should move slides on its own - sideeffect
      toast.success("Repository provider updated successfully");
      api?.scrollTo(nextIndex); // scroll to next slide
    } else {
      toast.error("Failed to update repository provider");
    }
  };
  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>What Repository Provider do you use?</DialogTitle>
      </DialogHeader>
      <div className="mt-10">
        <Card
          className={classNames(
            "cursor-pointer",
            selectedProvider === "gitlab"
              ? "border border-primary"
              : "border border-transparent",
          )}
          onClick={() => setSelectedProvider("gitlab")}
        >
          <CardHeader>
            <CardTitle className="text-lg flex flex-row items-center leading-tight">
              <Image
                src="/assets/gitlab.svg"
                alt="Devguard Logo"
                width={24}
                height={24}
                className="inline-block mr-2 w-5 h-5"
              />
              GitLab
            </CardTitle>
            <CardDescription>
              Any gitlab instance, including self-hosted ones.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          className={classNames(
            "cursor-pointer mt-2",
            selectedProvider === "github"
              ? "border border-primary"
              : "border border-transparent",
          )}
          onClick={() => setSelectedProvider("github")}
        >
          <CardHeader>
            <CardTitle className="text-lg items-center flex flex-row leading-tight">
              <Image
                src="/assets/github.svg"
                alt="Devguard Logo"
                width={24}
                height={24}
                className="inline-block dark:invert mr-2 w-5 h-5"
              />
              GitHub
            </CardTitle>
            <CardDescription>
              Currently we only support the official GitHub.com instance.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="mt-10 flex flex-wrap flex-row gap-2 justify-end">
        <AsyncButton
          disabled={selectedProvider === undefined}
          onClick={handleProviderUpdate}
        >
          {selectedProvider === undefined
            ? "Please select a Provider"
            : "Set provider"}
        </AsyncButton>
      </div>
    </CarouselItem>
  );
};

export default UpdateRepositoryProviderSlide;
