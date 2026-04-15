// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import CodeEditor, { type Language } from "@/components/common/CodeEditor";
import type { Diagnostic } from "@codemirror/lint";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { browserApiClient } from "@/services/devGuardApi";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

const defaultConfigFiles = [
  { value: "trivy", label: "Trivy", language: "yaml" },
  { value: "gitleaks-config", label: "Gitleaks", language: "json" },
  { value: "semgrep-config", label: "Semgrep", language: "toml" },
  { value: "checkov-config", label: "Checkov", language: "yaml" },
];

export type ConfigFile = (typeof defaultConfigFiles)[number];

interface Props {
  baseUrl: string | null;
  configFiles?: ConfigFile[];
}

const ConfigFileEditor = ({
  baseUrl,
  configFiles = defaultConfigFiles,
}: Props) => {
  const [selectedConfigId, setSelectedConfigId] = useState(
    configFiles[0].value,
  );
  const [editorValue, setEditorValue] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const selectedLanguage = (configFiles.find(
    (c) => c.value === selectedConfigId,
  )?.language ?? "json") as Language;

  const configFileUrl = baseUrl
    ? baseUrl + "/config-files/" + selectedConfigId + "." + selectedLanguage
    : null;

  const { data: configFile, mutate } = useSWR<string | null>(
    configFileUrl,
    async (url: string) => {
      const response = await browserApiClient(url);
      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to fetch config file");
      }
      return response.text();
    },
  );

  useEffect(() => {
    if (configFile) {
      setEditorValue(configFile);
    } else {
      setEditorValue("");
    }
  }, [configFile]);

  const handleSelectedConfigChange = (configId: string) => {
    setSelectedConfigId(configId);
    setCodeError(null);
  };

  const handleConfigFileChange = async (newConfig: string) => {
    if (!configFileUrl) {
      return;
    }
    const resp = await browserApiClient(configFileUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: newConfig,
    });

    if (!resp.ok) {
      setCodeError("Failed to save the new Configuration");
      return;
    }
    setEditorValue(newConfig);
    setCodeError(null);
    mutate();
  };

  const handleEditorValidation = (
    isValid: boolean,
    diagnostics: Diagnostic[],
  ) => {
    if (isValid) {
      setCodeError(null);
    } else {
      setCodeError(diagnostics[0]?.message ?? "Invalid configuration");
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div>
        <Tabs
          value={selectedConfigId}
          onValueChange={handleSelectedConfigChange}
        >
          <TabsList>
            {configFiles.map((config) => (
              <TabsTrigger key={config.value} value={config.value}>
                {config.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={selectedConfigId}>
            <p className="text-sm text-muted-foreground">
              Here you can view and edit the configuration file for{" "}
              {configFiles.find((c) => c.value === selectedConfigId)?.label}
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <CodeEditor
          value={editorValue}
          onChange={setEditorValue}
          onValidation={handleEditorValidation}
          language={selectedLanguage}
        />
        {codeError && <p className="text-sm text-destructive">{codeError}</p>}
        <div className="sticky bottom-0 flex justify-end gap-2 bg-background/80 pt-2">
          <Button
            onClick={() => handleConfigFileChange(editorValue)}
            disabled={!!codeError || editorValue === configFile}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigFileEditor;
