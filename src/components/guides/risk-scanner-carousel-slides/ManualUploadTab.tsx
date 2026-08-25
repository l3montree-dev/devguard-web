// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { FunctionComponent } from "react";
import FileUpload from "../../FileUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import ManualUploadOptionsFields from "./ManualUploadOptionsFields";
import type {
  ManualUploadOptions,
  ManualUploadTab as ManualUploadTabConfig,
} from "@/types/view/integration";

interface Props {
  tab: ManualUploadTabConfig;
  fileName?: string;
  dropzone: any;
  options: ManualUploadOptions;
}

const ManualUploadTab: FunctionComponent<Props> = ({
  tab,
  fileName,
  dropzone,
  options,
}) => (
  <>
    <Card>
      <CardHeader>
        <CardTitle className="text-md">{tab.title}</CardTitle>
        <CardDescription>{tab.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          id={`file-upload-${tab.value}`}
          files={fileName ? [fileName] : []}
          dropzone={dropzone}
        />
      </CardContent>
    </Card>
    <div className="flex flex-row gap-2 mb-4">
      <ManualUploadOptionsFields
        options={options}
        originLabel={tab.originLabel}
        originHint={tab.originHint}
        showArtifact={tab.showArtifact}
      />
    </div>
    {tab.docHref && (
      <div className="mt-2 flex text-link flex-row items-center">
        <QuestionMarkCircleIcon className="flex w-4 m-2" />
        <Link className="flex text-sm" href={tab.docHref} target="_blank">
          {tab.docLabel}
        </Link>
      </div>
    )}
  </>
);

export default ManualUploadTab;
