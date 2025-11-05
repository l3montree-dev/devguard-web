"use client";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { TagIcon } from "@heroicons/react/24/outline";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { GitBranchIcon, TriangleAlert } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import Page from "../../../../../../../../components/Page";
import AssetTitle from "../../../../../../../../components/common/AssetTitle";
import DateString from "../../../../../../../../components/common/DateString";
import Section from "../../../../../../../../components/common/Section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../../../../../components/ui/alert-dialog";
import { Badge } from "../../../../../../../../components/ui/badge";
import { Button } from "../../../../../../../../components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../../../components/ui/dropdown-menu";
import { useUpdateAsset } from "../../../../../../../../context/AssetContext";
import { useAssetBranchesAndTags } from "../../../../../../../../hooks/useActiveAssetVersion";
import { useAssetMenu } from "../../../../../../../../hooks/useAssetMenu";
import useDecodedParams from "../../../../../../../../hooks/useDecodedParams";
import { browserApiClient } from "../../../../../../../../services/devGuardApi";
import { AssetVersionDTO } from "../../../../../../../../types/api/api";
import CreateRefDialog from "../../../../../../../../components/CreateBranchDialog";
import { classNames } from "../../../../../../../../utils/common";

const RefsPage = () => {
  const assetMenu = useAssetMenu();
  const assetVersions = useAssetBranchesAndTags();
  const updateAsset = useUpdateAsset();
  const params = useDecodedParams() as {
    organizationSlug: string;
    projectSlug: string;
    assetSlug: string;
  };
  const [open, setOpen] = React.useState<AssetVersionDTO | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState<
    false | "tag" | "branch"
  >(false);

  const handleDeleteRef = async () => {
    if (!open) return;
    const resp = await browserApiClient(
      `/organizations/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs/` +
        open.slug,
      {
        method: "DELETE",
      },
    );

    if (resp.ok) {
      toast.success("Ref deleted successfully");
      updateAsset((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          refs: prev.refs.filter((ref) => ref.slug !== open.slug),
        };
      });
      setOpen(null);
    } else {
      toast.error("Failed to delete ref");
    }
  };

  const handleMakeDefault = async (item: AssetVersionDTO) => {
    const resp = await browserApiClient(
      `/organizations/${params.organizationSlug}/projects/${params.projectSlug}/assets/${params.assetSlug}/refs/${item.slug}/make-default`,
      {
        method: "POST",
      },
    );

    if (resp.ok) {
      toast.success("Default ref updated successfully");

      updateAsset((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          refs: prev.refs.map((ref) => ({
            ...ref,
            defaultBranch: ref.slug === item.slug ? true : false,
          })),
        };
      });
    } else {
      toast.error("Failed to update default ref");
    }
  };
  return (
    <Page
      Menu={assetMenu}
      title="Overview"
      description="Overview of the repository"
      Title={<AssetTitle />}
    >
      <Section
        forceVertical
        primaryHeadline
        Button={
          <Button onClick={() => setCreateDialogOpen("tag")}>Create Tag</Button>
        }
        title="Tags"
      >
        <div className="overflow-hidden rounded-lg border shadow-sm">
          <div className="overflow-auto">
            <table className="w-full table-fixed overflow-x-auto text-sm">
              <thead className="border-b bg-card text-foreground">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Last scan received</th>
                  <th className="p-4 text-left" />
                </tr>
              </thead>
              <tbody>
                {assetVersions.tags.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-4 text-left text-muted-foreground"
                    >
                      No tags available.
                    </td>
                  </tr>
                )}
                {assetVersions.tags.map((tag, i) => (
                  <tr
                    key={tag.name}
                    className={classNames(
                      "border-b",
                      i % 2 !== 0 && "bg-card/50",
                    )}
                  >
                    <td className="px-4 py-2">
                      <Badge variant={"outline"}>
                        <TagIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                        {tag.name}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <DateString date={new Date(tag.lastAccessedAt)} />
                    </td>
                    <td className="px-4 py-2 flex flex-row justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size={"icon"} variant={"ghost"}>
                            <EllipsisHorizontalIcon className="text-muted-foreground w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setOpen(tag)}>
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
        </div>
      </Section>
      <Section
        forceVertical
        primaryHeadline
        title="Branches"
        Button={
          <Button onClick={() => setCreateDialogOpen("branch")}>
            Create Branch
          </Button>
        }
      >
        <div className="overflow-hidden rounded-lg border shadow-sm">
          <div className="overflow-auto">
            <table className="w-full table-fixed overflow-x-auto text-sm">
              <thead className="border-b bg-card text-foreground">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Default</th>
                  <th className="p-4 text-left">Last scan received</th>
                  <th className="p-4 text-left" />
                </tr>
              </thead>
              <tbody>
                {assetVersions.branches.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-4 text-left text-muted-foreground"
                    >
                      No branches available.
                    </td>
                  </tr>
                )}
                {assetVersions.branches.map((branch, i) => (
                  <>
                    <tr
                      key={branch.name}
                      className={classNames(
                        "border-b",
                        i % 2 !== 0 && "bg-card/50",
                      )}
                    >
                      <td className="px-4 py-2">
                        <Badge variant={"outline"}>
                          <GitBranchIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                          {branch.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {branch.defaultBranch && (
                          <Badge variant={"success"}>Default</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <DateString date={new Date(branch.lastAccessedAt)} />
                      </td>
                      <td className="px-4 py-2 flex flex-row justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size={"icon"} variant={"ghost"}>
                              <EllipsisHorizontalIcon className="text-muted-foreground w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {!branch.defaultBranch && (
                              <DropdownMenuItem
                                onClick={() => handleMakeDefault(branch)}
                              >
                                Make default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setOpen(branch)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
      <CreateRefDialog
        isOpen={Boolean(createDialogOpen)}
        isTag={createDialogOpen === "tag"}
        onOpenChange={() => setCreateDialogOpen(false)}
      />
      <AlertDialog open={Boolean(open)} onOpenChange={(open) => setOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <TriangleAlert className="mr-2 inline-block h-6 w-6 text-destructive" />
              Are you sure you want to delete this ref?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data associated with this ref
              will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteRef()}>
              <span>Confirm</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default RefsPage;
