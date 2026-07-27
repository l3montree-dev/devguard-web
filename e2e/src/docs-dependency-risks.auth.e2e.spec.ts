import { test } from "@playwright/test";
import { DevGuardPOM } from "./pom/devguard";
import { docShot } from "./doc-shot";

test.use({ viewport: { width: 1440, height: 900 } });

const ORG_NAME = "Demo Organisation";
const GROUP_NAME = "Demo Group";
const REPO_NAME = "Demo Repository";


test.describe("Doku: Dependency Risk Tabelle aufrufen", () => {
    test("Erzeugt Screenshot für DokuSeite", async ({page,}, testInfo) => {
        const devguardPOM = new DevGuardPOM(page);
        await devguardPOM.loadDevGuard();
        await devguardPOM.createTestOrganizationGroupAndRepo({
        orgName: ORG_NAME,
        groupName: GROUP_NAME,
        repoName: REPO_NAME,
        });
        await devguardPOM.setupSbomUpload();
        await page.waitForTimeout(5_000);
        await docShot(page, testInfo, "01-dependency-risk-table");
    });
});