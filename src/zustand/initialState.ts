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

import { GlobalStore } from "./globalStore";

// along with this program.  If not, see <http://www.gnu.org/licenses/>.
export const addToInitialZustandState = (
  resp: any,
  obj: Partial<GlobalStore>,
) => {
  // check if the response contains the props
  if ("props" in resp) {
    // check if the page does already define an initial zustand state
    if (resp.props.initialZustandState) {
      // merge the initial zustand state with the session data
      resp.props.initialZustandState = {
        ...resp.props.initialZustandState,
        ...obj,
      };
    } else {
      // at least provide the session data
      resp.props.initialZustandState = {
        ...obj,
      };
    }
  }
  return resp;
};
