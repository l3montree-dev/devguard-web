// Copyright 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useRouter } from "next/router";
import { DependencyList, useState, useEffect } from "react";
import { ory } from "../services/ory";
import { AxiosError } from "axios";

// Returns a function which will log the user out
export function LogoutLink(deps?: DependencyList) {
  const [logoutToken, setLogoutToken] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    /*
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
      */
  }, deps);

  return () => {
    if (logoutToken) {
      ory
        .updateLogoutFlow({ token: logoutToken })
        .then(() => router.push("/login"))
        .then(() => router.reload());
    }
  };
}
