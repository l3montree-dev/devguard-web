// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export const encodeObjectBase64 = (input: Record<string, string>) => {
  // first, we convert the input to a string
  const inputString = JSON.stringify(input);
  return Buffer.from(inputString).toString("base64");
};

export const decodeObjectBase64 = (input: string) => {
  const decodedString = Buffer.from(input, "base64").toString("utf-8");
  return JSON.parse(decodedString);
};
