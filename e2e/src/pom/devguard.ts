import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { envConfig, LoggingAnalyzer } from "../utils";
import path from "path";
import { AuthFlow } from "./flows/auth";
import { OrgFlow } from "./flows/org";
import { GroupFlow } from "./flows/group";
import { RepoFlow } from "./flows/repo";
import { SetupFlow } from "./flows/setup";
import { VulnFlow } from "./flows/vuln";
import { ArtifactFlow } from "./flows/artifact";
import { ShareFlow } from "./flows/sharing";
import { ModalHelper } from "./flows/modal-helper";

export enum DevGuardNavigationLevel {
  Root = ".level-root",
  Organization = ".level-organization",
  Group = ".level-group",
  Repo = ".level-repo",
}

export class DevGuardPOM {
  readonly devGuardDomain = envConfig.devGuard.domain;

  constructor(public page: Page) {
    new LoggingAnalyzer(page);
    // page.on("close", () => expect(loggingAnalyzer.logs).toEqual([])); // todo!!
  }

  auth(): AuthFlow {
    return new AuthFlow(this.page, this.devGuardDomain);
  }

  org(): OrgFlow {
    return new OrgFlow(this.page);
  }

  group(): GroupFlow {
    return new GroupFlow(this.page);
  }

  repo(): RepoFlow {
    return new RepoFlow(this.page);
  }

  setup(): SetupFlow {
    return new SetupFlow(this.page);
  }

  vuln(): VulnFlow {
    return new VulnFlow(this.page);
  }

  artifacts(): ArtifactFlow {
    return new ArtifactFlow(this.page);
  }

  sharing(): ShareFlow {
    return new ShareFlow(this.page);
  }

  modal(): ModalHelper {
    return new ModalHelper(this.page);
  }

  async loadDevGuard() {
    await this.page.goto(this.devGuardDomain);
    await this.verifyOnDevGuardURL();
  }

  async verifyOnDevGuardURL() {
    await expect(this.page).toHaveURL(new RegExp(`^${this.devGuardDomain}/`), {
      timeout: 15_000,
    });
  }

  async verifyOnDevGuardLoginURL() {
    await expect(this.page).toHaveURL(
      new RegExp(`^${this.devGuardDomain}/login`),
      { timeout: 15_000 },
    );
  }

  async testLightDarkSystemMode(level: DevGuardNavigationLevel) {
    const themeChooser = this.page.locator(
      `${level} [data-testid="theme-chooser"]`,
    );
    await themeChooser.click();
    await this.page.getByTestId("light-mode").waitFor({ state: "visible" });
    await this.page.getByTestId("light-mode").click();
    await this.page.getByTestId("light-mode").waitFor({ state: "hidden" });
    await themeChooser.click({ timeout: 10_000 });
    await this.page.getByTestId("dark-mode").waitFor({ state: "visible" });
    await this.page.getByTestId("dark-mode").click();
  }

  async loadAndRegister() {
    await this.loadDevGuard();
    await this.registerNewUser();
  }

  async registerNewUser() {
    const username = envConfig.devGuard.uniqueUsername();
    const email = envConfig.devGuard.uniqueEMail();
    console.log(`Registering new user ${username}`);
    await this.auth().registerWithEmailAndPassword(
      email,
      username,
      envConfig.devGuard.password,
    );
  }

  async setupSbomUpload() {
    const inputFile = path.join(__dirname, "../../assets/", "sbom.json");
    await this.setup().setupOwnRiskScanning();
    await this.setup().uploadSbomFile(inputFile);
  }

  async createTestOrganizationGroupAndRepo(options?: {
  orgName?: string;
  groupName?: string;
  repoName?: string;
  }) {
    const orgName = options?.orgName ?? `Test Org ${Date.now()}`;
    const groupName = options?.groupName ?? `Test Group ${Date.now()}`;
    const repoName = options?.repoName ?? `Test Repo ${Date.now()}`;

    await this.org().createOrganization(orgName);
    await this.group().createGroup(groupName, "Test Group that contains very important projects!");
    await this.repo().createGitHubRepo(repoName, "This repo contains top secret information.");
  }
}
