import { useRouter } from "next/router";

import { config } from "@/config";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { Tab } from "@headlessui/react";
import Image from "next/image";
import { Dispatch, FunctionComponent, SetStateAction, useEffect } from "react";

import CopyCode from "../common/CopyCode";
import CustomTab from "../common/CustomTab";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Steps from "./Steps";

import { useLoader } from "@/hooks/useLoader";
import Autosetup from "../Autosetup";
import { Button } from "../ui/button";
import GithubTokenInstructions from "./GithubTokenInstructions";
import GitlabTokenInstructions from "./GitlabTokenInstructions";
import Link from "next/link";
import { useActiveAsset } from "@/hooks/useActiveAsset";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const VerificationDialog: FunctionComponent<Props> = ({ open, setOpen }) => {
  const asset = useActiveAsset()!;

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const el = document.querySelector('[data-state="open"]');
        if (el) {
          el.scrollTo({ behavior: "instant", top: 0 });
        }
      });
    }
  }, [open]);

  const downloadPublicKey = () => {
    if (!asset.signingPubKey) return;

    const element = document.createElement("a");
    const file = new Blob([asset.signingPubKey], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "cosign.pub";
    document.body.appendChild(element);
    element.click();
  };

  if (!asset.signingPubKey) {
    return (
      <Dialog open={open}>
        <DialogContent setOpen={setOpen}>
          <DialogHeader>
            <DialogTitle>Image Verification</DialogTitle>
            <DialogDescription>
              Ensure the integrity and authenticity of your container images.
              You can either verify the images using the cosign CLI or integrate
              Kyverno into your operations.
            </DialogDescription>
          </DialogHeader>
          <hr />
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">
              You never signed an image using devguard
            </h3>
            <p>
              Start by closing this dialog and open the image signing dialog.
              This contains instructions how to use devguard to sign oci images.
            </p>
          </div>
          <DialogFooter>
            <Button
              autoFocus
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>Image Verification</DialogTitle>
          <DialogDescription>
            Ensure the integrity and authenticity of your container images. You
            can either verify the images using the cosign CLI or integrate
            Kyverno into your operations.
          </DialogDescription>
        </DialogHeader>
        <hr />

        <Tab.Group>
          <Tab.List>
            <CustomTab>Using Cosign CLI</CustomTab>
            <CustomTab>
              <Image
                src="/assets/kyverno.png"
                width={20}
                className="mr-2 inline"
                height={20}
                alt="GitLab"
              />
              Using Kyverno
            </CustomTab>
          </Tab.List>
          <Tab.Panels className={"mt-2"}>
            <Tab.Panel>
              <Steps>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Install the cosign cli
                  </h3>
                  <p>
                    <Link
                      target="_blank"
                      href={
                        "https://docs.sigstore.dev/cosign/system_config/installation/"
                      }
                    >
                      https://docs.sigstore.dev/cosign/system_config/installation/
                    </Link>
                  </p>
                </div>
                <div className="mb-10">
                  <h3 className="mb-4 mt-2 font-semibold">
                    Save the public key on your machine
                  </h3>
                  <CopyCode language="shell" codeString={asset.signingPubKey} />
                  <div className="mt-2 flex flex-row justify-end">
                    <Button onClick={downloadPublicKey} variant={"secondary"}>
                      Download
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 mt-2 font-semibold">Verify the image</h3>
                  <CopyCode
                    language="shell"
                    codeString={`cosign verify <IMAGE_NAME> --key cosign.pub --insecure-ignore-tlog=true`}
                  />
                </div>
              </Steps>
            </Tab.Panel>
            <Tab.Panel>
              <CopyCode
                language="yaml"
                codeString={`apiVersion: kyverno.io/v1
kind: Policy
metadata:
  name: check-signature
  # namespace: <namespace>
spec:
  validationFailureAction: Enforce
  background: false
  webhookTimeoutSeconds: 30
  failurePolicy: Fail
  rules:
  - name: check-image-signature
    match:
      any:
      - resources:
          kinds:
          - Pod
    verifyImages:
    - imageReferences:
      # Example image reference. Checks all tags of the image
      # - "ghcr.io/l3montree-dev/devguard:*"
      - <IMAGE_NAME> # needs to be changed!
      required: true
      verifyDigest: false
      mutateDigest: true
      attestors:
      - count: 1
        entries:
        - keys:
            publicKeys: |-
${asset.signingPubKey
  .split("\n")
  .map((k) => `              ${k}`)
  // remove empty lines
  .filter((k) => k.trim() !== "")
  .join("\n")}
            rekor:
              ignoreTlog: true`}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <DialogFooter>
          <Button autoFocus variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationDialog;
