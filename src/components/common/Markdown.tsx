import dynamic from "next/dynamic";
import React from "react";
import type { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
const BaseMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
});

const Markdown = (props: Options & { linkBaseURL?: string }) => {
  const { linkBaseURL, ...rest } = props;
  return (
    <BaseMarkdown
      components={{
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
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {children}
          </a>
        ),
        code: ({ children, ...props }) => (
          <code {...props} className="!text-foreground">
            {children}
          </code>
        ),
      }}
      remarkPlugins={[remarkGfm]}
      {...rest}
    />
  );
};

export default Markdown;
