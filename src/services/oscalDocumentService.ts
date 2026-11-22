// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { ApiError, apiFetch, readErrorMessage } from "@/services/apiClient";
import type { ComplianceScope } from "@/services/compliancePostureService";
import { complianceScopeBaseUrl } from "@/services/compliancePostureService";

export interface DefaultOscalDocument {
  name: string;
  url: string;
}

export const DEFAULT_CATALOGS: DefaultOscalDocument[] = [
  {
    name: "Grundschutz++",
    url: "https://raw.githubusercontent.com/BSI-Bund/Stand-der-Technik-Bibliothek/10b43f9031a4e55ee60ddee43ad3ff1fe448a483/Anwenderkataloge/Grundschutz%2B%2B/Grundschutz%2B%2B-catalog.json",
  },
  {
    name: "BSI-Anforderungen-zum-Risikomanagement",
    url: "https://raw.githubusercontent.com/BSI-Bund/Stand-der-Technik-Bibliothek/13f3b11dbd5c6947155abc8bcc14877749542f2c/control_layer/Risikomanagement/BSI-Anforderungen-zum-Risikomanagement-catalog.json",
  },
  {
    name: "Lieferkettensicherheit",
    url: "https://raw.githubusercontent.com/BSI-Bund/Stand-der-Technik-Bibliothek/13f3b11dbd5c6947155abc8bcc14877749542f2c/control_layer/Lieferkettensicherheit/Lieferkettensicherheit-resolved_catalog.json",
  },
];

export const DEFAULT_COMPONENT_DEFINITIONS: DefaultOscalDocument[] = [
  {
    name: "Grundschutz++ Compliance Mapping",
    url: "/oscal/component-definition-gs-mapping.json",
  },
];

export const catalogsUrl = (scope: ComplianceScope) =>
  `${complianceScopeBaseUrl(scope)}compliance-postures/catalogs/`;

const componentDefinitionsUrl = (scope: ComplianceScope) =>
  `${complianceScopeBaseUrl(scope)}compliance-components/definitions/`;

const send = async (path: string, init: RequestInit) => {
  const resp = await apiFetch(path, init);
  if (!resp.ok) {
    throw new ApiError(await readErrorMessage(resp), resp.status);
  }
};

export const fetchOscalDocument = async (url: string): Promise<unknown> => {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`could not load ${url}: ${resp.status}`);
  }
  return resp.json();
};

export const saveCatalog = (
  scope: ComplianceScope,
  name: string | undefined,
  catalog: unknown,
) =>
  send(catalogsUrl(scope), {
    method: "POST",
    body: JSON.stringify({ name, catalog }),
  });

export const deleteCatalog = (scope: ComplianceScope, name: string) =>
  send(`${catalogsUrl(scope)}${encodeURIComponent(name)}/`, {
    method: "DELETE",
  });

export const saveComponentDefinition = (
  scope: ComplianceScope,
  name: string | undefined,
  componentDefinition: unknown,
) =>
  send(componentDefinitionsUrl(scope), {
    method: "POST",
    body: JSON.stringify({ name, componentDefinition }),
  });

export const deleteComponentDefinition = (
  scope: ComplianceScope,
  name: string,
) =>
  send(`${componentDefinitionsUrl(scope)}${encodeURIComponent(name)}/`, {
    method: "DELETE",
  });
