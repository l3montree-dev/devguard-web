import {
  browserApiClient,
  multipartBrowserApiClient,
} from "@/services/devGuardApi";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";

export default function UploadSbomDialog() {
  const fileContent = useRef<any>();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const readerContent = reader.result as string;
        const sbomParsed = JSON.parse(readerContent);
        console.log(sbomParsed);
        console.log("this is the actual file)" + file);
        if (
          sbomParsed.bomFormat === "CycloneDX" &&
          sbomParsed.specVersion === "1.6"
        ) {
          console.log("yay it works");
          fileContent.current = file;
        } else console.log("this is not correct");
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
    console.log("this should be the actual file" + fileContent.current);
    formdata.append("file", fileContent.current);
    console.log("the data is" + formdata);
    console.log("i just appended the content of " + fileContent.current);
    console.log(
      "this is the actual data of the key value file " + formdata.get("file"),
    );
    const resp = await multipartBrowserApiClient(
      "/organizations/" +
        "l3montree/projects/devguard/assets/devguard/sbom-manual-scan/",
      {
        method: "POST",
        body: formdata,
        headers: { "X-Scanner": "test" },
      },
    );
    if (resp.ok) {
      console.log("Nice");
    } else {
      console.error("uploading the data doesnt work");
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
