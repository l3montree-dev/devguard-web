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
"use client";

import { useRouter } from "next/navigation";
import { DependencyList, useState, useEffect } from "react";
import { ory } from "../services/ory";
import { AxiosError } from "axios";
import { useUpdateSession } from "../context/SessionContext";

// Returns a function which will log the user out
export function LogoutLink(deps: DependencyList = []) {
  const [logoutToken, setLogoutToken] = useState<string>("");
  const router = useRouter();
  const updateSession = useUpdateSession();

  useEffect(() => {
    ory
      .createBrowserLogoutFlow()
      .then(({ data }) => {
        setLogoutToken(data.logout_token);
      })
      .catch((err: AxiosError) => {
        switch (err.response?.status) {
          case 401:
            // do nothing, the user is not logged in
            return;
        }

        // Something else happened!
        return Promise.reject(err);
      });
  }, deps);

  return () => {
    if (logoutToken) {
      ory
        .updateLogoutFlow({ token: logoutToken })
        .then(() => {
          router.push("/login");
          setTimeout(() => {
            // ensure the session is cleared (client-side)
            updateSession({
              session: null,
              organizations: [],
            });
          }, 1000); // wait one second to ensure the redirect has started
        })
    }
  };
}
