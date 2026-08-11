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

import type { Components } from "react-markdown";
import CopyCode from "./CopyCode";

// Shared prose styling for markdown rendered inside cards. Pass to the
// <Markdown> wrapper in @/components/common/Markdown so remark-gfm stays
// enabled -- the table components below only render with it.
export const markdownComponents: (linkBaseURL?: string) => Components = (
  linkBaseURL,
) => ({
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-xl font-semibold">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 text-lg font-semibold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1 mt-3 text-sm font-semibold">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed whitespace-pre-wrap">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-4 border-t border-[hsl(var(--grid-line-color))]" />
  ),
  a: ({ node: _, children, ...props }) => (
    <a
      {...props}
      href={
        props.href?.startsWith("http")
          ? props.href
          : `${linkBaseURL || ""}${props.href}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="text-link hover:underline dark:text-blue-400"
    >
      {children}
    </a>
  ),
  code: ({ children, node }) => {
    const isBlock = node?.position?.start.line !== node?.position?.end.line;
    return isBlock ? (
      <CopyCode codeString={children ? children.toString() : ""} />
    ) : (
      <code className="border rounded-sm bg-secondary p-1/4 before:content-none after:content-none">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 max-w-full overflow-x-auto rounded-md bg-muted p-4 font-mono text-xs leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-[hsl(var(--grid-line-color))] bg-muted/40 px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-[hsl(var(--grid-line-color))] px-3 py-2">
      {children}
    </td>
  ),
});
