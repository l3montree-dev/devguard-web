import {
  beautifyPurl,
  extractPurlQualifiers,
  formatPurlQualifiers,
} from "./common";

describe("beautifyPurl", () => {
  it("handles package names containing an '@' correct", () => {
    expect(beautifyPurl("pkg:npm/@ory/integrations@1.2.1")).toBe(
      "@ory/integrations",
    );
  });
});

describe("extractPurlQualifiers", () => {
  it("extracts npm mirror qualifiers without the package name or version", () => {
    expect(
      extractPurlQualifiers(
        "pkg:npm/dompurify@3.4.2?download_url=https%3A%2F%2Fregistry.example.com%2Fdompurify-3.4.2.tgz",
      ),
    ).toBe(
      "download_url=https%3A%2F%2Fregistry.example.com%2Fdompurify-3.4.2.tgz",
    );
  });

  it("returns an empty string when the purl has no qualifiers", () => {
    expect(extractPurlQualifiers("pkg:npm/dompurify@3.4.2")).toBe("");
  });
});

describe("formatPurlQualifiers", () => {
  it("keeps long npm mirror qualifiers to a bounded display length", () => {
    const formatted = formatPurlQualifiers(
      "pkg:npm/dompurify@3.4.2?download_url=https%3A%2F%2Ftotally-long-internal-download-url.de%2Fartifactory%2Fapi%2Fnpm%2Fnpm%2Fdompurify%2F-%2Fdompurify-3.4.2.tgz",
      48,
    );

    expect(formatted.length).toBeLessThanOrEqual(48);
    expect(formatted).toContain("...");
    expect(formatted.startsWith("download_url=")).toBe(true);
  });
});
