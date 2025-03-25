import { useRouter } from "next/router";

import { config } from "@/config";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { Dispatch, FunctionComponent, SetStateAction, useEffect } from "react";

import CopyCode from "../common/CopyCode";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Steps from "./Steps";

import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import { PatWithPrivKey } from "@/types/api/api";
import Section from "../common/Section";
import { Button } from "../ui/button";
import PatSection from "./PatSection";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const InTotoProvenanceDialog: FunctionComponent<Props> = ({
  open,
  setOpen,
}) => {
  const router = useRouter();
  const activeOrg = useActiveOrg();

  const { personalAccessTokens, onCreatePat } = usePersonalAccessToken();
  const pat =
    personalAccessTokens.length > 0
      ? (personalAccessTokens[0] as PatWithPrivKey)
      : undefined;

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

  return (
    <Dialog open={open}>
      <DialogContent setOpen={setOpen}>
        <DialogHeader>
          <DialogTitle>In-Toto Provenance</DialogTitle>
          <DialogDescription>
            In-Toto is a framework to secure the software supply chain. It
            ensures that the software was built and delivered securely. We start
            at the developers machine. It will create a post-commit hook, which
            records all file hashes of the project. This information is send to
            devguard. During the continous integration process intoto will be
            used to record input and outputs. During operation the whole
            software supply chain will be end-to-end verified.
          </DialogDescription>
        </DialogHeader>
        <hr />
        <div>
          <PatSection
            pat={pat}
            onCreatePat={onCreatePat}
            description={`In-Toto Provenance Token generated am ${new Date().toLocaleString()}`}
          />
        </div>
        <hr />

        <Steps>
          <div className="mb-10">
            <h3 className="mb-4 mt-2 font-semibold">
              Install the Devguard CLI
            </h3>
            <CopyCode
              language="shell"
              codeString="go install github.com/l3montree-dev/devguard/cmd/devguard-scanner@latest"
            />
          </div>
          <div className="mb-10">
            <h3 className="mb-4 mt-2 font-semibold">Run the setup command</h3>
            <CopyCode
              language="shell"
              codeString={`devguard-scanner intoto setup \\
    --assetName=${activeOrg?.slug}/projects/${router.query.projectSlug}/assets/${router.query.assetSlug} \\
    --token=${pat?.privKey ?? "<YOU NEED TO CREATE A PERSONAL ACCESS TOKEN>"} \\
    --apiUrl=${config.devguardApiUrlPublicInternet} \\
    --step=post-commit`}
            ></CopyCode>
          </div>
        </Steps>
        <DialogFooter>
          <Button autoFocus variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InTotoProvenanceDialog;
