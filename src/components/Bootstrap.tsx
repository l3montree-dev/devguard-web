// Copyright (C) 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
import React, { FunctionComponent, PropsWithChildren, useEffect } from "react";
import useGlobalStore from "../zustand/globalStore";
import { ory } from "../services/ory";

// this component is used to bootstrap the app
// it initializes the global store based on the current user session
// it checks if bootstrapping needs to be performed
const Bootstrap: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const globalStore = useGlobalStore();
  useEffect(() => {
    if (!globalStore) return;

    const bootstrap = async () => {
      if (!globalStore.user) {
        console.log("bootstrapping");
        const session = await ory.toSession();
        if (session) {
          globalStore.setUser(session.data.identity);
        }
      }
    };
    bootstrap();
  }, [globalStore]);
  return <>{children}</>;
};

export default Bootstrap;
