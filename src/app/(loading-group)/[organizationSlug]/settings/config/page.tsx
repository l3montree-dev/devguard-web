// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import JsonCodeEditor from "@/components/common/JsonCodeEditor";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { Pencil } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

const allry = [
  { value: "trivy-config", label: "Trivy" },
  { value: "gitleaks-config", label: "Gitleaks" },
  { value: "semgrep-config", label: "Semgrep" },
];

export type ConfigFile = Record<string, unknown>;

const Config = () => {
  const org = useActiveOrg();
  const orgMenu = useOrganizationMenu();

  const [selectedConfigId, setSelectedConfigId] = useState(allry[0].value);
  const [isEditing, setIsEditing] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const configFileUrl = org
    ? "/organizations/" + org.slug + "/config-files/" + selectedConfigId
    : null;

  const { data: configFile, mutate } = useSWR<ConfigFile>(
    configFileUrl,
    fetcher,
  );

  const handleConfigChange = (configId: string) => {
    setSelectedConfigId(configId);
    setIsEditing(false);
    setJsonError(null);
  };

  const handleConfigFileChange = async (newConfig: ConfigFile) => {
    const resp = await fetcher(configFileUrl!, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    });

    if (!resp) {
      return;
    }

    mutate(resp, false);
  };

  const handleEditClick = () => {
    setEditorValue(JSON.stringify(configFile, null, 2));
    setJsonError(null);
    setIsEditing(true);
  };

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(editorValue) as ConfigFile;
      await handleConfigFileChange(parsed);
      setIsEditing(false);
    } catch {
      setJsonError("Invalid JSON — cannot save");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setJsonError(null);
  };

  return (
    <Page Title={null} title={""} Menu={orgMenu}>
      <div className="flex h-full w-full flex-col gap-4 p-4">
        <div>
          <Tabs value={selectedConfigId} onValueChange={handleConfigChange}>
            <TabsList>
              {allry.map((config) => (
                <TabsTrigger key={config.value} value={config.value}>
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedConfigId}>
              <p className="text-sm text-muted-foreground">
                Here you can view and edit the configuration file for{" "}
                {selectedConfigId}.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <div>
              <JsonCodeEditor
                value={editorValue}
                onChange={handleEditorChange}
              />
            </div>
            {jsonError && (
              <p className="text-sm text-destructive">{jsonError}</p>
            )}
            <div className="flex gap-2 sticky bottom-0 bg-background/80 pt-2 justify-end">
              <Button onClick={handleSave} disabled={!!jsonError}>
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex justify-end sticky top-0 bg-background/80 pt-2 z-10">
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
            <div>
              <JsonCodeEditor
                value={JSON.stringify(configFile, null, 2)}
                onChange={() => {}}
                readOnly
              />
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Config;
