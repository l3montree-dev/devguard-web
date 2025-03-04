import { expect } from "@jest/globals";
import { urlToBaseURL } from "./GitLabIntegrationDialog";

describe("url input tests, to check if format is correct", () => {
  it("should give formate urls and compare them if, they are equal ", () => {
    let domain_list: string[] = [
      "https://gitlab.com/l3montree/mein-wartezimmer",
      "https://gitlab.com/devguard-debug/DevGuard-Debug",
      "https://gitlab.com/5byuri/devguard-documentation",
      "https://gitlab.com/5byuri/forgetwithone-click",
      "https://gitlab.business-code-git.de/harald.wagener/bcd-gpt/",
      "https://gitlab.testinstance-instance-git.de/freddyfazbear.....a/repo/",
    ];

    const actual = "https://gitlab.com";
    for (var index of domain_list) {
      expect(urlToBaseURL(index)).toBe(actual);
    }
  });
});
