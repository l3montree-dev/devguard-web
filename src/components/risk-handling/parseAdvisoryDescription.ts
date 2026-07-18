// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

interface AdvisorySection {
  label: string | null; // can be null if no label can be determined
  content: string;
}

/** Segments are separated by a pipe, e.g. "Angriff: ... | Betroffene: ...". */
const SEGMENT_SEPARATOR = /\s*\|\s*/;
/** A prefix longer than this is treated as prose, not a label. */
const MAX_LABEL_LENGTH = 48;

/**
 * Splits an advisory description of the form
 *   "Category: text | Category2: text | ..."
 * into labelled sections. The remainder is renders
 * as plain paragraphs.
 */
export function parseAdvisoryDescription(
  description: string,
): AdvisorySection[] {
  if (!description?.trim()) return [];

  return description
    .split(SEGMENT_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const colonIndex = segment.indexOf(":");
      if (colonIndex === -1) {
        return { label: null, content: segment };
      }

      const label = segment.slice(0, colonIndex).trim();
      const content = segment.slice(colonIndex + 1).trim();

      // Only treat the prefix as a heading if it actually looks like one:
      // short, single-line, and with a non-empty body after the colon.
      const looksLikeLabel =
        label.length > 0 &&
        label.length <= MAX_LABEL_LENGTH &&
        !label.includes("\n") &&
        content.length > 0;

      return looksLikeLabel
        ? { label, content }
        : { label: null, content: segment };
    });
}
