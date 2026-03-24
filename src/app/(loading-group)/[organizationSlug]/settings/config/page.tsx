// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CodeEditor, { type Language } from "@/components/common/CodeEditor";
import Page from "@/components/Page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useOrganizationMenu } from "@/hooks/useOrganizationMenu";
import { browserApiClient } from "@/services/devGuardApi";
import { Pencil } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

const configFileTmp = [
  { value: "trivy", label: "Trivy", language: "yaml" },
  { value: "gitleaks-config", label: "Gitleaks", language: "json" },
  { value: "semgrep-config", label: "Semgrep", language: "toml" },
];

const Config = () => {
  const org = useActiveOrg();
  const orgMenu = useOrganizationMenu();

  const [selectedConfigId, setSelectedConfigId] = useState(
    configFileTmp[0].value,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  //const [configFile, setConfigFile] = useState<string | null>(null);

  const selectedLanguage = (configFileTmp.find(
    (c) => c.value === selectedConfigId,
  )?.language ?? "json") as Language;

  const configFileUrl = org
    ? "/organizations/" +
      org.slug +
      "/config-files/" +
      selectedConfigId +
      "." +
      selectedLanguage
    : null;

  const { data: configFile, mutate } = useSWR<string | null>(
    configFileUrl,
    async (url: string) => {
      const response = await browserApiClient(url);
      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to fetch config file");
      }
      const config = await response.text();
      return config;
    },
  );

  const handleSelectedConfigChange = (configId: string) => {
    setSelectedConfigId(configId);
    setIsEditing(false);
    setCodeError(null);
  };

  const handleConfigFileChange = async (newConfig: string) => {
    const resp = await browserApiClient(configFileUrl!, {
      method: "PUT",
      headers: {
        "Content-Type": "text/plain",
      },
      body: newConfig,
    });

    if (!resp.ok) {
      setCodeError(`Failed to save the new Configuration`);
      return;
    }
    setIsEditing(false);
    setCodeError(null);
    mutate();
  };

  const handleEditClick = () => {
    setEditorValue(configFile ?? "");
    setCodeError(null);
    setIsEditing(true);
  };

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
  };

  const handleEditorValidation = (isValid: boolean) => {
    setCodeError(isValid ? null : `Invalid ${selectedLanguage?.toUpperCase()}`);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCodeError(null);
  };

  return (
    <Page Title={null} title={""} Menu={orgMenu}>
      <div className="flex h-full w-full flex-col gap-4 p-4">
        <div>
          <Tabs
            value={selectedConfigId}
            onValueChange={handleSelectedConfigChange}
          >
            <TabsList>
              {configFileTmp.map((config) => (
                <TabsTrigger key={config.value} value={config.value}>
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedConfigId}>
              <p className="text-sm text-muted-foreground">
                Here you can view and edit the configuration file for{" "}
                {configFileTmp.find((c) => c.value === selectedConfigId)?.label}
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <div>
              <CodeEditor
                value={editorValue}
                onChange={handleEditorChange}
                onValidation={handleEditorValidation}
                language={selectedLanguage}
              />
            </div>
            {codeError && (
              <p className="text-sm text-destructive">{codeError}</p>
            )}
            <div className="flex gap-2 sticky bottom-0 bg-background/80 pt-2 justify-end">
              <Button
                onClick={() => handleConfigFileChange(editorValue)}
                disabled={!!codeError}
              >
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
              <CodeEditor
                value={configFile || ""}
                onChange={() => {}}
                readOnly
                language={selectedLanguage}
              />
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Config;
