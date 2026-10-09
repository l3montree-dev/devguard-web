// Copyright 2025 L3montree GmbH.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { FunctionComponent } from "react";
import type { AssetDTO, OrganizationDetailsDTO, ProjectDTO } from "@/types/dto";

import { Button } from "../../ui/button";
import { CarouselItem } from "../../ui/carousel";
import { DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import PipelineSnippet, {
  pipelineFileHint,
  type PipelineSnippetProps,
} from "./PipelineSnippet";

interface YamlGeneratorSlideProps extends PipelineSnippetProps {
  activeOrg: OrganizationDetailsDTO;
  activeProject: ProjectDTO | null;
  asset: AssetDTO | null;
  prevIndex: number;
  api?: {
    scrollTo: (index: number) => void;
  };
  onClose: () => void;
}

const YamlGeneratorSlide: FunctionComponent<YamlGeneratorSlideProps> = ({
  prevIndex,
  api,
  onClose,
  activeOrg: _activeOrg,
  activeProject: _activeProject,
  asset: _asset,
  ...snippetProps
}) => {
  const { gitInstance, config } = snippetProps;
  return (
    <CarouselItem className="">
      <DialogHeader>
        {gitInstance === "GitHub" && (
          <DialogTitle>Add the snippet to your GitHub Actions File</DialogTitle>
        )}
        {gitInstance === "Gitlab" && (
          <DialogTitle>Add the snippet to your GitLab CI/CD File</DialogTitle>
        )}
        <DialogDescription>{pipelineFileHint}</DialogDescription>
      </DialogHeader>
      <div className="mt-10 px-1">
        <PipelineSnippet {...snippetProps} />
      </div>
      <div className="mt-10 flex flex-row gap-2 justify-end">
        <Button
          variant={"secondary"}
          id="yaml-generator-back"
          onClick={() => api?.scrollTo(prevIndex)}
        >
          Back
        </Button>
        <Button
          disabled={Object.values(config).every((v) => v === false)}
          id="yaml-generator-continue"
          onClick={async () => {
            onClose();
          }}
        >
          {Object.values(config).every((v) => v === false)
            ? "Select Option"
            : "Finish Setup"}
        </Button>
      </div>
    </CarouselItem>
  );
};

export default YamlGeneratorSlide;
