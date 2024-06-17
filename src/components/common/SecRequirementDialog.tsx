import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import Button from "./Button";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { CreateAssetReq } from "@/types/api/req";
import { useForm } from "react-hook-form";

import { on } from "events";
import { AssetDTO, RequirementsLevel } from "@/types/api/api";
import { browserApiClient } from "@/services/flawFixApi";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";

interface props {
  Button: ReactNode;
  asset: AssetDTO;
}

export default function SecRequirementDialog(props: {
  Button: ReactNode;
  asset: AssetDTO;
}) {
  const [open, setOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const [confidentialityRequirement, setConfidentialityRequirement] = useState(
    props.asset?.confidentialityRequirement,
  );

  const [integrityRequirement, setIntegrityRequirement] = useState(
    props.asset?.integrityRequirement,
  );
  const [availabilityRequirement, setAvailabilityRequirement] = useState(
    props.asset?.availabilityRequirement,
  );

  const handleRequrimentChange = async (data: Partial<AssetDTO>) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project!.slug + // can never be null
        "/assets/" +
        props.asset.slug,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    if (!resp.ok) {
      console.error("Could not update asset");
    }
  };

  const handleActivate = () => {
    setOpen(false);

    handleRequrimentChange({
      confidentialityRequirement,
      integrityRequirement,
      availabilityRequirement,
    });
  };

  return (
    <>
      <div
        role="button"
        className="cursor-pointer"
        onClick={() => setOpen((s) => !s)}
      >
        {props.Button}
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-950 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="z-99 fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg  bg-gray-100 text-left leading-6 text-black shadow-lg ring-1 ring-gray-900/5 transition-all sm:my-8 sm:w-full sm:max-w-lg ">
                  <div className="bg-gray-100 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="flex w-full flex-1 flex-row sm:flex sm:items-start">
                      <div className="mt-3 w-full sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6"
                        >
                          Schutzbedarf
                        </Dialog.Title>
                        <div className="mt-2 w-full">
                          <p className="text-sm "></p>

                          {/* TODO: to function  */}
                          <div className="flex items-center justify-between">
                            <label className="text-sm md:text-base">
                              Vertraulichkeitsanforderungen
                            </label>
                            <select
                              value={confidentialityRequirement}
                              onChange={(e) =>
                                setConfidentialityRequirement(
                                  e.target.value as RequirementsLevel,
                                )
                              }
                              className="mb-2 rounded-sm border border-gray-300 bg-white text-sm shadow-sm"
                            >
                              <option value={"low"}>Gering</option>
                              <option value={"medium"}>Medium</option>
                              <option value={"high"}>Hoch</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm md:text-base">
                              Integritätsanforderungen
                            </label>
                            <select
                              value={integrityRequirement}
                              onChange={(e) =>
                                setIntegrityRequirement(
                                  e.target.value as RequirementsLevel,
                                )
                              }
                              className="mb-2 rounded-sm border border-gray-300 bg-white text-sm shadow-sm"
                            >
                              <option value={"low"}>Gering</option>
                              <option value={"medium"}>Medium</option>
                              <option value={"high"}>Hoch</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm md:text-base">
                              Anforderungen an die Verfügbarkeit
                            </label>
                            <select
                              value={availabilityRequirement}
                              onChange={(e) =>
                                setAvailabilityRequirement(
                                  e.target.value as RequirementsLevel,
                                )
                              }
                              className="mb-2 rounded-sm border border-gray-300 bg-white text-sm shadow-sm"
                            >
                              <option value={"low"}>Gering</option>
                              <option value={"medium"}>Medium</option>
                              <option value={"high"}>Hoch</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row justify-end gap-2 border-t bg-white px-4 py-3 sm:px-6">
                    <Button
                      intent="secondary"
                      variant="solid"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Zurück
                    </Button>
                    <Button
                      intent="primary"
                      variant="solid"
                      onClick={handleActivate}
                    >
                      Anwenden
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
