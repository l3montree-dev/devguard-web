// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { User } from "@/types/auth";

export const getUserFullName = (user: User) => {
  if (typeof user.traits.name === "string") {
    return user.traits.name;
  } else {
    const { first, last } = user.traits.name;
    return `${first ?? ""} ${last ?? ""}`.trim();
  }
};

const order = ["name", "email", "confirmedTerms"];

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
