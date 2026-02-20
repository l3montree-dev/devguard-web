// Copyright (C) 2023 Tim Bastin, l3montree GmbH
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

import { Identity } from "@ory/client-fetch";

export interface User extends Omit<Identity, "traits"> {
  traits: {
    name:
      | {
          last?: string;
          first?: string;
        }
      | string;
    email: string;
  };
}

export const getUserFullName = (user: User) => {
  if (typeof user.traits.name === "string") {
    return user.traits.name;
  } else {
    const { first, last } = user.traits.name;
    return `${first ?? ""} ${last ?? ""}`.trim();
  }
};

const order = ["email", "name", "confirmedTerms"];

export const rewriteFlow = (flow: any) => {
  let first: string;
  let last: string;
  return {
    ...flow,
    ui: {
      ...flow.ui,
      nodes: flow.ui.nodes
        .filter((node: any) => {
          if (
            "name" in node.attributes &&
            node.attributes.name === "traits.name.first"
          ) {
            first = node.attributes.value;
            return false;
          } else if (
            "name" in node.attributes &&
            node.attributes.name === "traits.name.last"
          ) {
            last = node.attributes.value;
            return false;
          }
          return node;
        })
        .map((node: any) => {
          if (
            "name" in node.attributes &&
            node.attributes.name === "traits.name" &&
            node.attributes.value === undefined
          ) {
            return {
              ...node,
              attributes: {
                ...node.attributes,
                value: `${first ?? ""} ${last ?? ""}`.trim(),
              },
            };
          }
          return node;
        })
        .sort((a: any, b: any) => {
          const aIndex = order.findIndex(
            (field) =>
              "name" in a.attributes && a.attributes.name === `traits.${field}`,
          );
          const bIndex = order.findIndex(
            (field) =>
              "name" in b.attributes && b.attributes.name === `traits.${field}`,
          );
          return aIndex - bIndex;
        }),
    },
  };
};
