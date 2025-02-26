import { multipartBrowserApiClient } from "@/services/devGuardApi";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { toast } from "sonner";

export default function UploadSbomDialog() {
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const fileContent = useRef<any>();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        try {
          const readerContent = reader.result as string;
          let sbomParsed; //is this good code practice? probably not :c
          sbomParsed = JSON.parse(readerContent);
          console.log(sbomParsed);
          if (
            sbomParsed.bomFormat === "CycloneDX" &&
            sbomParsed.specVersion === "1.6"
          ) {
            fileContent.current = file;
          } else
            toast.error(
              "SBOM does not follow CycloneDX format or Version is <1.6",
            );
        } catch (e) {
          toast.error(
            "JSON format is not recognized, make sure it is the proper format",
          );
          return;
        }
      };

      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  const uploadSBOM = async () => {
    const formdata = new FormData();
    formdata.append("file", fileContent.current);
    const resp = await multipartBrowserApiClient(
      `/organizations/${org.slug}/projects/${project?.slug}/assets/${asset?.slug}/sbom-file`,

      {
        method: "POST",
        body: formdata,
        headers: { "X-Scanner": "SBOM-DATA" },
      },
    );
    if (resp.ok) {
      toast.success("SBOM has successfully been send!");
    } else {
      toast.error("SBOM has not been send successfully");
    }
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className="mb-10 h-20 cursor-pointer rounded border border-dashed"
      >
        <input {...getInputProps()} />
      </div>
      <Button onClick={() => uploadSBOM()}>Upload</Button>
    </div>
  );
}
