// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { readErrorMessage } from "./apiClient";

const fakeResponse = (
  body: string,
  { status = 500, statusText = "", contentType = "" } = {},
) =>
  ({
    status,
    statusText,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" && contentType
          ? contentType
          : null,
    },
    text: async () => body,
  }) as unknown as Response;

describe("readErrorMessage", () => {
  it("returns the message of a JSON error", async () => {
    const resp = fakeResponse('{"message":"invalid SBOM format"}', {
      status: 400,
      contentType: "application/json",
    });
    expect(await readErrorMessage(resp)).toBe("invalid SBOM format");
  });

  it("returns a short plain text error as is", async () => {
    const resp = fakeResponse("file too large", {
      status: 413,
      contentType: "text/plain",
    });
    expect(await readErrorMessage(resp)).toBe("file too large");
  });

  it("does not return an HTML error page", async () => {
    const resp = fakeResponse(
      "<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center></body></html>",
      { status: 502, statusText: "Bad Gateway", contentType: "text/html" },
    );
    expect(await readErrorMessage(resp)).toBe("Bad Gateway");
  });

  it("does not return HTML sent without a content type", async () => {
    const resp = fakeResponse(
      "<!DOCTYPE html><html><body>error</body></html>",
      {
        status: 500,
      },
    );
    expect(await readErrorMessage(resp)).toBe("HTTP 500");
  });
});
