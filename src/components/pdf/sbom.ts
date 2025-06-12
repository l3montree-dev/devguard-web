// Copyright 2025 rafaeishikho.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export interface SBOM {
  bomFormat: string;
  specVersion: string;
  version: number;
  metadata: Metadata;
  components: Components[];
  dependencies: Dependency[];
}

export interface Metadata {
  timestamp: string;
  component: Component;
}

export interface Component {
  type: string;
  author: string;
  publisher: string;
  name: string;
  version: string;
}

export interface Components {
  type: string;
  name: string;
  version?: string;
  licenses: Licenses[];
  purl: string;
}

export interface Licenses {
  license: License;
}

export interface License {
  id?: string;
  name?: string;
}

export interface Dependency {
  ref: string;
  dependsOn: string[];
}
