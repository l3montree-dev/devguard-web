// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Button } from "@/components/ui/button";
import { CarouselItem } from "@/components/ui/carousel";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import RepositorySelector from "./RepositorySelector";

interface StartSlideProps {
  api?: {
    scrollTo: (index: number) => void;
  };
  repositories: Array<{ value: string; label: string }> | null;
  repositoryName?: string;
  repositoryId?: string;
  afterSuccessfulConnectionSlideIndex: number;
  prevIndex: number;
}

export default function SelectRepoSlide({
  repositoryName,
  repositoryId,
  api,
  afterSuccessfulConnectionSlideIndex,
  prevIndex,
}: StartSlideProps) {
  const asset = useActiveAsset()!;

  return (
    <CarouselItem>
      <DialogHeader>
        <DialogTitle>
          Select your Repository to connect with DevGuard
        </DialogTitle>
      </DialogHeader>
      <div className="mt-10 px-1">
        <RepositorySelector
          repositoryName={repositoryName}
          repositoryId={repositoryId}
        />
      </div>
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button onClick={() => api?.scrollTo(prevIndex)} variant={"secondary"}>
          Back
        </Button>
        <Button
          data-testid="continue-connect-repository-button"
          disabled={!asset.repositoryId}
          onClick={() => api?.scrollTo(afterSuccessfulConnectionSlideIndex)}
        >
          Continue
        </Button>
      </div>
    </CarouselItem>
  );
}
