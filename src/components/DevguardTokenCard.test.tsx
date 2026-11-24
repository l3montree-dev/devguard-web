// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { fireEvent, render, screen } from "@testing-library/react";

import DevguardTokenCard from "./DevguardTokenCard";

const mockOrg = jest.fn();
const mockProject = jest.fn();
const mockAsset = jest.fn();

jest.mock("@/hooks/useActiveOrg", () => ({
  useActiveOrg: () => mockOrg(),
}));
jest.mock("@/hooks/useActiveProject", () => ({
  useActiveProject: () => mockProject(),
}));
jest.mock("@/hooks/useActiveAsset", () => ({
  useActiveAsset: () => mockAsset(),
}));
jest.mock("@/hooks/useAccessToken", () => ({
  __esModule: true,
  default: () => ({
    accessToken: undefined,
    onCreateAccessToken: jest.fn(),
  }),
}));

const org = { id: "org-id", slug: "my-org" };
const project = { slug: "my-project" };
const asset = { slug: "my-asset" };

function openConfirmDialog() {
  render(<DevguardTokenCard />);
  fireEvent.click(screen.getByRole("button", { name: /generate token/i }));
  return screen.getByRole("alertdialog");
}

describe("DevguardTokenCard confirmation dialog", () => {
  beforeEach(() => {
    mockOrg.mockReturnValue(undefined);
    mockProject.mockReturnValue(undefined);
    mockAsset.mockReturnValue(undefined);
  });

  it.each([
    ["organization", org, undefined, undefined],
    ["project", org, project, undefined],
    ["asset", org, project, asset],
  ])(
    "names the %s access token instead of a personal access token",
    (scope, activeOrg, activeProject, activeAsset) => {
      mockOrg.mockReturnValue(activeOrg);
      mockProject.mockReturnValue(activeProject);
      mockAsset.mockReturnValue(activeAsset);

      const dialog = openConfirmDialog();

      expect(dialog).toHaveTextContent(`Create new ${scope} access token`);
      expect(dialog).toHaveTextContent(
        `Are you sure you want to create a new ${scope} access token?`,
      );
      expect(dialog).not.toHaveTextContent(/personal access token/i);
    },
  );

  it("keeps the personal access token wording without an organization", () => {
    const dialog = openConfirmDialog();

    expect(dialog).toHaveTextContent("Create new personal access token");
  });
});
