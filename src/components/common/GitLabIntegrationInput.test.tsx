import { urlToBaseURL } from "../../utils/url";

describe("url input tests, to check if format is correct", () => {
  it("should give formate urls and compare them if, they are equal ", () => {
    /*let domain_list: string[] = [
      "https://gitlab.freedesktop.org/explore/groups/",
      "https://gitlab.com/l3montree/mein-wartezimmer",
      "https://gitlab.com/devguard-debug/DevGuard-Debug",
      "https://gitlab.com/5byuri/devguard-documentation",
      "https://gitlab.com/5byuri/forgetwithone-click",
      "https://gitlab.business-code-git.de/harald.wagener/bcd-gpt/",
      "https://gitlab.testinstance-instance-git.de/freddyfazbear.....a/repo/",
      "https://fedi.network/moved",
    ];*/

    // {....} ......

    const table = {
      "https://gitlab.freedesktop.org/explore/groups/":
        "https://gitlab.freedesktop.org",
      "123123123": undefined,
    };

    for (const index of Object.entries(table)) {
      const actual = urlToBaseURL(index[0]);

      expect(actual).toEqual(index[1]);
    }
  });
});
