import { FunctionComponent, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/data-fetcher/fetcher";
import useDecodedParams from "@/hooks/useDecodedParams";
import { browserApiClient } from "@/services/devGuardApi";
import { useSearchParams } from "next/navigation";
import { ExternalReference } from "@/types/api/api";

const SyncedUpstreamVexSources: FunctionComponent = () => {
  const params = useDecodedParams();
  const searchParams = useSearchParams();
  const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } = params;
  const [isOpen, setIsOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const selectedArtifact = searchParams?.get("artifact");

  const apiUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/external-references`;

  const {
    data: allRefs,
    error,
    mutate,
    isLoading,
  } = useSWR<ExternalReference[]>(apiUrl, fetcher);

  // Filter only VEX type references
  const vexSources = allRefs?.filter((ref) => ref.type === "vex") || [];

  const handleTriggerSync = async (source: ExternalReference) => {
    if (!selectedArtifact) {
      toast.error("Please select an artifact to sync");
      return;
    }

    const syncUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${assetVersionSlug}/artifacts/${encodeURIComponent(selectedArtifact)}/sync-external-sources/`;

    try {
      const response = await browserApiClient(syncUrl, { method: "POST" });
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      toast.success(`Syncing VEX data from ${source.url}`);
      mutate();
    } catch (error) {
      toast.error("Failed to trigger sync");
    }
  };

  const handleDelete = async (source: ExternalReference) => {
    try {
      const response = await browserApiClient(apiUrl, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
      toast.success(`Removed ${source.url}`);
      mutate();
    } catch (error) {
      toast.error("Failed to delete VEX source");
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsAdding(true);
    try {
      const response = await browserApiClient(`${apiUrl}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim(), type: "vex" }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add: ${response.statusText}`);
      }

      toast.success("VEX source added successfully");
      setNewUrl("");
      mutate();
    } catch (error) {
      toast.error("Failed to add VEX source");
    } finally {
      setIsAdding(false);
    }
  };

  if (error) {
    return (
      <Card className="px-4 py-3">
        <p className="text-sm text-destructive">Failed to load VEX sources</p>
      </Card>
    );
  }

  return (
    <Card className="px-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-2">
        <CollapsibleTrigger className="group flex items-center justify-between w-full rounded-md transition-colors p-2 -m-2">
          <div>
            <h3 className="flex items-center gap-2">
              Synced Upstream VEX Sources
              {vexSources.length > 0 && (
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
                </span>
              )}
            </h3>
          </div>
          <div className="hover:bg-muted/50 p-1 rounded-md transition-colors">
            <CaretDownIcon className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:rotate-[-90deg]" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <span className="text-sm text-muted-foreground mb-6 block">
            Upstream VEX sources are URLs, usally provided by your suppliers,
            that contain latest VEX data relevant to the components used in your
            software. By syncing these VEX URLs, DevGuard can automatically
            incorporate the latest VEX information into your vulnerability
            assessments, helping you to better understand the impact of known
            vulnerabilities on your software supply chain. The assessment
            results of the synced VEX data is transformed into VEX Rules that
            you can review and manage here.
          </span>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : vexSources.length === 0 ? (
            <div className="py-4">
              <p className="mb-4 text-muted-foreground">
                No upstream VEX sources configured.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/vex.json"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                  className="flex-1"
                />
                <Button onClick={handleAddUrl} disabled={isAdding}>
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">URL</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vexSources.map((source, index) => (
                      <tr
                        key={source.id}
                        className={
                          index !== vexSources.length - 1 ? "border-b" : ""
                        }
                      >
                        <td className="p-3">
                          <span className="font-mono text-xs break-all">
                            {source.url}
                          </span>
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleTriggerSync(source)}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://supplier.example.com/vex.json"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                  className="flex-1"
                />
                <Button onClick={handleAddUrl} disabled={isAdding} size="sm">
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SyncedUpstreamVexSources;
