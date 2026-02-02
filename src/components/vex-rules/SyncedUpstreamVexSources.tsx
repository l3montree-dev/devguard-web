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
import { MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface VexSource {
  id: string;
  url: string;
  lastSynced: string;
}

// Mock data - will be replaced with real data from API
const mockVexSources: VexSource[] = [
  {
    id: "1",
    url: "https://example.com/vex/security-advisories.json",
    lastSynced: "2026-02-02T10:30:00Z",
  },
  {
    id: "2",
    url: "https://supplier.example.org/vex/2026-02.csaf",
    lastSynced: "2026-02-01T14:20:00Z",
  },
  {
    id: "3",
    url: "https://upstream-vendor.com/security/vex-data.json",
    lastSynced: "2026-01-31T08:15:00Z",
  },
];

const SyncedUpstreamVexSources: FunctionComponent = () => {
  const [sources, setSources] = useState<VexSource[]>(mockVexSources);
  const [isOpen, setIsOpen] = useState(false);

  const handleTriggerSync = (source: VexSource) => {
    toast.info(`Triggering sync for ${source.url}`);
    // TODO: Implement actual sync trigger
  };

  const handleDelete = (source: VexSource) => {
    setSources(sources.filter((s) => s.id !== source.id));
    toast.success(`Removed ${source.url}`);
    // TODO: Implement actual deletion
  };

  const handleAddUrl = () => {
    toast.info("Add URL dialog would open here");
    // TODO: Implement add URL dialog
  };

  const formatLastSynced = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  return (
    <Card className="px-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Synced Upstream VEX Sources
              {sources.length > 0 && (
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
                </span>
              )}
            </h3>
          </div>
          <CollapsibleTrigger className="p-2 hover:bg-muted rounded-md transition-colors">
            <CaretDownIcon className="h-5 w-5 text-muted-foreground transition-transform duration-200 data-[state=closed]:rotate-[-90deg]" />
          </CollapsibleTrigger>
        </div>
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
          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No upstream VEX sources configured.</p>
              <Button onClick={handleAddUrl} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add VEX Source URL
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">URL</th>
                      <th className="text-left p-3 font-medium w-40">
                        Last Synced
                      </th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source, index) => (
                      <tr
                        key={source.id}
                        className={
                          index !== sources.length - 1 ? "border-b" : ""
                        }
                      >
                        <td className="p-3">
                          <span className="font-mono text-xs break-all">
                            {source.url}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {formatLastSynced(source.lastSynced)}
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
              <div className="flex justify-end">
                <Button onClick={handleAddUrl} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add VEX URL
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
