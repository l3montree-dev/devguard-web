import { browserApiClient } from "@/services/devGuardApi";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";

export default function UploadSbomDialog() {
  const fileContent = useRef<any>();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const readerContent = reader.result as string;
        const sbomParsed = JSON.parse(readerContent);
        if (
          sbomParsed.bomFormat === "CycloneDX" &&
          sbomParsed.specVersion === "1.6"
        ) {
          console.log("yay it works");
          fileContent.current = file;
        } else console.log("this is not correct");
      };
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  const uploadSBOM = async () => {
    const formdata = new FormData();
    formdata.append("sbom", fileContent.current);
    console.log("i just appended the content of " + fileContent.current);
    console.log(formdata.get("sbom"));
    const resp = await browserApiClient(
      "/organizations/" +
        "l3montree/projects/devguard/assets/devguard/sbom-manual-scan/",
      {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formdata.get("sbom"),
        //body: fileContent.current,
      },
    );
    if (resp.ok) {
      console.log("Nice");
    } else {
      console.error("Failed to update member role");
    }
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button onClick={() => uploadSBOM()}>Upload</Button>
    </div>
  );
}
