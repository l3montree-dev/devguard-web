"use client";

import { FunctionComponent, useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { BranchTagSelector } from "../BranchTagSelector";
import { useAssetBranchesAndTags } from "@/hooks/useActiveAssetVersion";
import { useDropzone } from "react-dropzone";
import { classNames } from "@/utils/common";
import { LinkIcon } from "@heroicons/react/24/outline";
import {
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  CloudUpload,
} from "lucide-react";
import useDecodedParams from "@/hooks/useDecodedParams";
import { browserApiClient } from "@/services/devGuardApi";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import { ExternalReference } from "@/types/api/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "../FileUpload";
import AutoHeight from "embla-carousel-auto-height";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import Fade from "embla-carousel-fade";

interface VexUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (params: {
    file: File;
    branchOrTagName: string;
    branchOrTagSlug: string;
    isTag: boolean;
  }) => Promise<void>;
}

type UploadMethod = "file" | "source-url" | undefined;

const VexUploadModal: FunctionComponent<VexUploadModalProps> = ({
  open,
  onOpenChange,
  onUpload,
}) => {
  const { branches, tags } = useAssetBranchesAndTags();
  const params = useDecodedParams();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } = params;

  const [uploadMethod, setUploadMethod] = useState<UploadMethod>();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [branchOrTagName, setBranchOrTagName] = useState("");
  const [branchOrTagSlug, setBranchOrTagSlug] = useState("");
  const [isTag, setIsTag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [vexFile, setVexFile] = useState<File | null>(null);

  // Upstream VEX sources state
  const [newVexUrl, setNewVexUrl] = useState("");
  const [newCsafUrl, setNewCsafUrl] = useState("");
  const [csafPackageScope, setCsafPackageScope] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"cyclonedxvex" | "csaf">(
    "cyclonedxvex",
  );

  // Use a proxy API like RiskScannerDialog does
  const setProxyApi = useCallback((emblaApi: CarouselApi) => {
    setCarouselApi(emblaApi);
  }, []);

  const apiUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/external-references`;

  const {
    data: allRefs,
    mutate: refsMutate,
    isLoading: refsLoading,
  } = useSWR<ExternalReference[]>(open ? apiUrl : null, fetcher);

  const vexSources =
    allRefs?.filter(
      (ref) => ref.type === "cyclonedxvex" || ref.type === "csaf",
    ) || [];

  // Initialize branch/tag from URL or default to main
  useEffect(() => {
    if (branches.length > 0) {
      const defaultBranch = branches[0];
      setBranchOrTagName(defaultBranch.name);
      setBranchOrTagSlug(defaultBranch.slug);
      setIsTag(false);
    } else if (tags.length > 0) {
      const defaultTag = tags[0];
      setBranchOrTagName(defaultTag.name);
      setBranchOrTagSlug(defaultTag.slug);
      setIsTag(true);
    }
  }, [branches, tags, open]);

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
  }, [uploadMethod, carouselApi, activeTab]);

  const handleUploadClick = async () => {
    if (!vexFile) return;

    setIsUploading(true);
    try {
      await onUpload({
        file: vexFile,
        branchOrTagName,
        branchOrTagSlug,
        isTag,
      });
      // Reset form
      setVexFile(null);
      setUploadMethod(undefined);
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
          type: "cyclonedxvex",
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

    if (!csafPackageScope.trim()) {
      toast.error("Please enter a CSAF package scope (PURL)");
      return;
    }

    if (!isPurlValid(csafPackageScope.trim())) {
      toast.error(
        "Invalid PURL format. Must start with 'pkg:' (e.g., pkg:npm/express@4.0.0)",
      );
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
          csafPackageScope: csafPackageScope.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add: ${response.statusText}`);
      }

      toast.success("CSAF source added successfully");
      setNewCsafUrl("");
      setCsafPackageScope("");
      refsMutate();
    } catch (error) {
      toast.error("Failed to add CSAF source");
    } finally {
      setIsAdding(false);
    }
  };

  const handleTriggerSync = async (source: ExternalReference) => {
    const syncUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/external-references/sync/`;

    try {
      const response = await browserApiClient(syncUrl, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      toast.success(`Syncing VEX data from ${source.url}`);
      refsMutate();
    } catch (error) {
      toast.error("Failed to trigger sync");
    }
  };

  const handleDelete = async (source: ExternalReference) => {
    try {
      const response = await browserApiClient(apiUrl + "/" + source.id, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
      toast.success(`Removed ${source.url}`);
      refsMutate();
    } catch (error) {
      toast.error("Failed to delete VEX source");
    }
  };

  const isPurlValid = (purl: string): boolean => {
    const purlRegex =
      /^pkg:[a-z][a-z0-9+.-]*\/[a-zA-Z0-9._~%@/-]+[a-zA-Z0-9](?:[@?#].*)?$/;
    return purlRegex.test(purl);
  };

  const isFileUploadDisabled = !vexFile || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
              <div className="px-1">
                <DialogHeader>
                  <DialogTitle>Manage VEX</DialogTitle>
                  <DialogDescription>
                    Choose how you want to provide VEX information to your
                    project
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-6">
                  <Card
                    onClick={() => setUploadMethod("file")}
                    className={`cursor-pointer ${
                      uploadMethod === "file"
                        ? "border border-primary"
                        : "border border-transparent"
                    }`}
                  >
                    <CardHeader>
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
                    onClick={() => setUploadMethod("source-url")}
                    className={`cursor-pointer ${
                      uploadMethod === "source-url"
                        ? "border border-primary"
                        : "border border-transparent"
                    }`}
                  >
                    <CardHeader>
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

                <div className="mt-8 flex flex-wrap flex-row gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={uploadMethod === undefined}
                    onClick={() => {
                      if (uploadMethod === "file") {
                        carouselApi?.scrollTo(1);
                      } else {
                        carouselApi?.scrollTo(2);
                      }
                    }}
                  >
                    {uploadMethod === undefined
                      ? "Select an option"
                      : "Continue"}
                  </Button>
                </div>
              </div>
            </CarouselItem>

            {/* Step 2: File Upload */}
            <CarouselItem>
              <div className="px-1">
                <DialogHeader>
                  <DialogTitle>Upload VEX File</DialogTitle>
                  <DialogDescription>
                    Select a VEX file in CycloneDX format and the branch/tag to
                    apply it to
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-6">
                  <div>
                    <Label className="mb-2 block">Branch/Tag</Label>
                    <BranchTagSelector
                      branches={branches}
                      tags={tags}
                      disableNavigateToRefInsteadCall={(v) => {
                        setBranchOrTagName(v.name);
                        setBranchOrTagSlug(v.slug);
                        setIsTag(v.type === "tag");
                      }}
                    />
                  </div>

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
                      setUploadMethod(undefined);
                      setVexFile(null);
                      carouselApi?.scrollTo(0);
                    }}
                    disabled={isUploading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleUploadClick}
                    disabled={isFileUploadDisabled}
                    isSubmitting={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload VEX"}
                  </Button>
                </div>
              </div>
            </CarouselItem>

            {/* Step 3: Source URL Management */}
            <CarouselItem>
              <div className="px-1">
                <DialogHeader>
                  <DialogTitle>Manage VEX Sources</DialogTitle>
                  <DialogDescription>
                    Add and manage upstream VEX and CSAF sources
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {refsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading...
                    </div>
                  ) : (
                    <>
                      {/* Existing Sources Section */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                          Configured Sources
                        </Label>
                        {vexSources.length > 0 ? (
                          <div className="space-y-2">
                            {vexSources.map((source) => (
                              <Card
                                key={source.id}
                                className="flex flex-row items-center justify-between"
                              >
                                <CardHeader className="flex-1">
                                  <CardTitle className="text-sm font-mono break-all">
                                    {source.url}
                                  </CardTitle>
                                  <CardDescription>
                                    {source.type === "csaf"
                                      ? "CSAF Source"
                                      : "CycloneDX VEX Source"}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleTriggerSync(source)
                                        }
                                      >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Trigger Sync
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(source)}
                                        className="text-red-600 dark:text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            No upstream VEX sources configured yet.
                          </p>
                        )}
                      </div>

                      {/* Add New Source Section */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          Add New Source
                        </Label>
                        <Tabs
                          value={activeTab}
                          onValueChange={(v) => {
                            setActiveTab(v as "cyclonedxvex" | "csaf");
                          }}
                        >
                          <TabsList>
                            <TabsTrigger value="cyclonedxvex">
                              CycloneDX VEX
                            </TabsTrigger>
                            <TabsTrigger value="csaf">CSAF</TabsTrigger>
                          </TabsList>
                          <TabsContent value="cyclonedxvex" className="mt-3">
                            <Card>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <div>
                                    <Label
                                      htmlFor="vex-url"
                                      className="text-xs"
                                    >
                                      VEX Source URL
                                    </Label>
                                    <div className="flex gap-2 mt-2">
                                      <Input
                                        id="vex-url"
                                        placeholder="https://supplier.example.com/vex.json"
                                        value={newVexUrl}
                                        onChange={(e) =>
                                          setNewVexUrl(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleAddVexUrl();
                                          }
                                        }}
                                        className="flex-1"
                                      />
                                      <Button
                                        onClick={handleAddVexUrl}
                                        disabled={isAdding}
                                        size="icon"
                                      >
                                        {isAdding ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Plus className="h-4 w-4" />
                                        )}
                                      </Button>
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
                                    <Label
                                      htmlFor="csaf-url"
                                      className="text-xs"
                                    >
                                      CSAF Provider URL
                                    </Label>
                                    <Input
                                      id="csaf-url"
                                      placeholder="https://supplier.example.com/csaf/provider-metadata.json"
                                      value={newCsafUrl}
                                      onChange={(e) =>
                                        setNewCsafUrl(e.target.value)
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="purl" className="text-xs">
                                      Package URL (PURL)
                                    </Label>
                                    <div className="flex gap-2 mt-2">
                                      <Input
                                        id="purl"
                                        placeholder="pkg:npm/express@4.0.0"
                                        value={csafPackageScope}
                                        onChange={(e) =>
                                          setCsafPackageScope(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleAddCsafUrl();
                                          }
                                        }}
                                        className="flex-1"
                                      />
                                      <Button
                                        onClick={handleAddCsafUrl}
                                        disabled={isAdding}
                                        size="icon"
                                      >
                                        {isAdding ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Plus className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap flex-row gap-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setUploadMethod(undefined);
                      setNewVexUrl("");
                      setNewCsafUrl("");
                      setCsafPackageScope("");
                      carouselApi?.scrollTo(0);
                    }}
                  >
                    Back
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
