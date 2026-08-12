"use client";

import { useEffect, useState, useCallback } from "react";
import type { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useDropzone } from "react-dropzone";
import { LinkIcon } from "@heroicons/react/24/outline";
import { Loader2, CloudUpload } from "lucide-react";
import useDecodedParams from "@/hooks/useDecodedParams";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "@/lib/toast";
import useSWR from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import type { ExternalReference } from "@/types/api/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "../FileUpload";
import AutoHeight from "embla-carousel-auto-height";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import type { CarouselApi } from "../ui/carousel";
import Fade from "embla-carousel-fade";

interface VexUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (params: { file: File }) => Promise<void>;
}

const VexUploadModal: FunctionComponent<VexUploadModalProps> = ({
  open,
  onOpenChange,
  onUpload,
}) => {
  const params = useDecodedParams();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } = params;

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isUploading, setIsUploading] = useState(false);
  const [vexFile, setVexFile] = useState<File | null>(null);

  // Upstream VEX sources state
  const [newVexUrl, setNewVexUrl] = useState("");
  const [newCsafUrl, setNewCsafUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"cyclonedx" | "csaf">("cyclonedx");

  // Use a proxy API like RiskScannerDialog does
  const setProxyApi = useCallback((emblaApi: CarouselApi) => {
    setCarouselApi(emblaApi);
  }, []);

  const apiUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/external-references`;

  // Only for its mutate: revalidating this key refreshes the sources list on the
  // VEX rules page once a source is added here.
  const { mutate: refsMutate } = useSWR<ExternalReference[]>(
    open ? apiUrl : null,
    fetcher,
  );

  const vexDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setVexFile(acceptedFiles[0]);
      }
    },
    accept: {
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  useEffect(() => {
    setTimeout(() => {
      carouselApi?.reInit();
    }, 0);
  }, [carouselApi, activeTab]);

  const handleUploadClick = async () => {
    if (!vexFile) return;

    setIsUploading(true);
    try {
      await onUpload({
        file: vexFile,
      });
      // Reset form
      setVexFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddVexUrl = async () => {
    if (!newVexUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsAdding(true);
    try {
      const response = await browserApiClient(`${apiUrl}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newVexUrl.trim(),
          type: "cyclonedx",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add: ${response.statusText}`);
      }

      toast.success("VEX source added successfully");
      setNewVexUrl("");
      refsMutate();
    } catch (error) {
      toast.error("Failed to add VEX source");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddCsafUrl = async () => {
    if (!newCsafUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsAdding(true);
    try {
      const response = await browserApiClient(`${apiUrl}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newCsafUrl.trim(),
          type: "csaf",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add: ${response.statusText}`);
      }
      toast.success("CSAF source added successfully");
      setNewCsafUrl("");
      refsMutate();
    } catch (error) {
      toast.error("Failed to add CSAF source");
    } finally {
      setIsAdding(false);
    }
  };

  // The footer button submits whichever tab is open.
  const handleAddSource = () =>
    activeTab === "csaf" ? handleAddCsafUrl() : handleAddVexUrl();
  const canAddSource =
    !isAdding &&
    (activeTab === "csaf" ? newCsafUrl.trim() : newVexUrl.trim()) !== "";

  const isPurlValid = (purl: string): boolean => {
    const purlRegex =
      /^pkg:[a-z][a-z0-9+.-]*\/[a-zA-Z0-9._~%@/-]+[a-zA-Z0-9](?:[@?#].*)?$/;
    return purlRegex.test(purl);
  };

  const isFileUploadDisabled = !vexFile || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Carousel
          opts={{
            watchDrag: false,
            containScroll: false,
          }}
          plugins={[AutoHeight(), Fade()]}
          setApi={setProxyApi}
        >
          <CarouselContent className="border-0">
            {/* Step 1: Method Selection */}
            <CarouselItem>
              <div className="px-1 pb-2">
                <DialogHeader>
                  <DialogTitle>Add VEX information</DialogTitle>
                  <DialogDescription>
                    Choose how you want to provide VEX information to your
                    project
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-6">
                  <Card
                    onClick={() => {
                      carouselApi?.scrollTo(1);
                    }}
                    className="cursor-pointer hover:border-primary border"
                  >
                    <CardHeader data-testid="upload-vex-file">
                      <CardTitle className="text-lg flex items-center gap-2 leading-tight">
                        <CloudUpload className="w-5 h-5" />
                        Upload a VEX File
                      </CardTitle>
                      <CardDescription>
                        Upload a CycloneDX VEX file (JSON format) directly to
                        define vulnerability exploitability for your components
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card
                    onClick={() => {
                      carouselApi?.scrollTo(2);
                    }}
                    className="cursor-pointer hover:border-primary border"
                  >
                    <CardHeader data-testid="supply-vex-source-url">
                      <CardTitle className="text-lg flex items-center gap-2 leading-tight">
                        <LinkIcon className="w-5 h-5" />
                        Supply a source URL
                      </CardTitle>
                      <CardDescription>
                        Configure upstream VEX sources that will be periodically
                        synced to fetch the latest vulnerability exploitability
                        information
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </CarouselItem>

            {/* Step 2: File Upload */}

            <CarouselItem>
              <div className="px-1">
                <DialogHeader>
                  <DialogTitle>Upload VEX File</DialogTitle>
                  <DialogDescription>
                    Select a VEX file in CycloneDX format - rules are created
                    based on the given VEX decisions.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">VEX File</CardTitle>
                      <CardDescription>
                        Select a VEX file in CycloneDX format (JSON)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FileUpload
                        id="file-upload-vex"
                        files={vexFile ? [vexFile.name] : []}
                        dropzone={vexDropzone}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 flex flex-wrap flex-row gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setVexFile(null);
                      carouselApi?.scrollTo(0);
                    }}
                    disabled={isUploading}
                  >
                    Back
                  </Button>
                  <Button
                    data-testid="upload-vex-file-selected-button"
                    onClick={handleUploadClick}
                    disabled={isFileUploadDisabled}
                    isSubmitting={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload VEX"}
                  </Button>
                </div>
              </div>
            </CarouselItem>

            {/* Step 3: Add a source URL */}
            <CarouselItem>
              <div className="px-1">
                <DialogHeader>
                  <DialogTitle>Add a VEX source</DialogTitle>
                  <DialogDescription>
                    Point DevGuard at an upstream VEX or CSAF URL.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) => {
                        setActiveTab(v as "cyclonedx" | "csaf");
                      }}
                    >
                      <TabsList>
                        <TabsTrigger value="cyclonedx">
                          CycloneDX VEX
                        </TabsTrigger>
                        <TabsTrigger value="csaf">CSAF</TabsTrigger>
                      </TabsList>
                      <TabsContent value="cyclonedx" className="mt-3">
                        <Card>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="vex-url" className="text-xs">
                                  VEX Source URL
                                </Label>
                                <div className="mt-2">
                                  <Input
                                    id="vex-url"
                                    data-testid="vex-source-url-input"
                                    placeholder="https://supplier.example.com/vex.json"
                                    value={newVexUrl}
                                    onChange={(e) =>
                                      setNewVexUrl(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddSource();
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="csaf" className="mt-3">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="csaf-url" className="text-xs">
                                  CSAF URL
                                </Label>
                                <div className="mt-2">
                                  <Input
                                    id="csaf-url"
                                    data-testid="csaf-source-url-input"
                                    placeholder="https://supplier.example.com/csaf.json"
                                    value={newCsafUrl}
                                    onChange={(e) =>
                                      setNewCsafUrl(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddSource();
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap flex-row gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setNewVexUrl("");
                      setNewCsafUrl("");
                      carouselApi?.scrollTo(0);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    data-testid="add-vex-source-submit-button"
                    onClick={handleAddSource}
                    disabled={!canAddSource}
                  >
                    {isAdding && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add VEX source
                  </Button>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default VexUploadModal;
