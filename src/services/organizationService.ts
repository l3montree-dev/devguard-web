// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

export const patchOrganization = async (
  organization: string,
  body: Partial<components["schemas"]["dtos.OrgPatchRequest"]>,
) =>
  unwrap(
    await browserClient.PATCH("/organizations/{organization}", {
      params: { path: { organization } },
      // a PATCH body is partial by definition; the Go struct uses pointers
      body: body as components["schemas"]["dtos.OrgPatchRequest"],
    }),
  );

export const deleteOrganization = async (organization: string) =>
  unwrap(
    await browserClient.DELETE("/organizations/{organization}", {
      params: { path: { organization } },
    }),
  );

export const changeOrgMemberRole = async (
  organization: string,
  userID: string,
  role: "admin" | "member",
) =>
  unwrap(
    await browserClient.PUT("/organizations/{organization}/members/{userID}", {
      params: { path: { organization, userID } },
      body: { role },
    }),
  );

export const removeOrgMember = async (organization: string, userID: string) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/members/{userID}",
      { params: { path: { organization, userID } } },
    ),
  );

export const deleteGitlabIntegration = async (
  organization: string,
  gitlabIntegrationID: string,
) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/integrations/gitlab/{gitlab_integration_id}/",
      {
        params: {
          path: { organization, gitlab_integration_id: gitlabIntegrationID },
        },
      },
    ),
  );

export const deleteJiraIntegration = async (
  organization: string,
  jiraIntegrationID: string,
) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/integrations/jira/{jira_integration_id}/",
      {
        params: {
          path: { organization, jira_integration_id: jiraIntegrationID },
        },
      },
    ),
  );

export const revokeInvitation = async (organization: string, ID: string) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/invitation/{ID}",
      {
        params: { path: { organization, ID } },
      },
    ),
  );

export const saveGitlabIntegration = async (
  organization: string,
  body: { url: string; token: string; name: string },
) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/integrations/gitlab/test-and-save/",
      { params: { path: { organization } }, body },
    ),
  );

export const saveJiraIntegration = async (
  organization: string,
  body: { url: string; token: string; name: string; userEmail: string },
) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/integrations/jira/test-and-save/",
      { params: { path: { organization } }, body },
    ),
  );

export const inviteOrgMember = async (
  organization: string,
  body: components["schemas"]["dtos.InviteRequest"],
) =>
  unwrap(
    await browserClient.POST("/organizations/{organization}/members", {
      params: { path: { organization } },
      body,
    }),
  );

export const acceptInvitation = async (code: string) =>
  unwrap(
    await browserClient.POST("/accept-invitation", { body: { code } as never }),
  );

export const createOrganization = async (
  body: components["schemas"]["dtos.OrgCreateRequest"],
) => unwrap(await browserClient.POST("/organizations", { body }));

export const finishIntegrationInstallation = async (
  organization: string,
  installationId: string,
) =>
  unwrap(
    await browserClient.GET(
      "/organizations/{organization}/integrations/finish-installation/",
      {
        parseAs: "text",
        params: { path: { organization }, query: { installationId } },
      },
    ),
  );
