// Copyright (C) 2023 Tim Bastin, Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiClientFromCookies } from "../../services/devGuardApi";
import { Paged, ProjectDTO } from "../../types/api/api";
import OrganizationHomePage from "./OrganizationHomePage";

interface Props {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page(props: Props) {
  const { organizationSlug } = await props.params;

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ory_kratos_session");

    // Create API client with server-side context
    const apiClient = getApiClientFromCookies(sessionCookie?.value);

    // Build query parameters
    const query = new URLSearchParams();
    const searchParams = await props.searchParams;
    const page = (searchParams.page || "1") as string;
    const pageSize = (searchParams.pageSize || "20") as string;

    query.set("page", page);
    query.set("pageSize", pageSize);

    if (searchParams.search) {
      query.set("search", searchParams.search as string);
    }

    // Fetch projects for this organization
    const resp = await apiClient(
      `/organizations/${organizationSlug.replace("%40", "@")}/projects/?${query.toString()}`,
    );

    if (!resp.ok) {
      if (resp.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch projects: ${resp.status}`);
    }

    const projectsPaged: Paged<ProjectDTO> = await resp.json();

    // Sort projects alphabetically
    projectsPaged.data = projectsPaged.data.sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return (
      <OrganizationHomePage
        projects={projectsPaged}
        organizationSlug={organizationSlug}
        searchParams={searchParams}
      />
    );
  } catch (error) {
    console.error("Error loading organization page:", error);
    notFound();
  }
}
