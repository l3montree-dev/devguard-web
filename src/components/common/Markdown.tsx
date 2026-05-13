import dynamic from "next/dynamic";
import React from "react";
import remarkGfm from "remark-gfm";
const BaseMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
});

const Markdown = (props: { children: string; linkBaseURL?: string }) => {
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
      }}
      remarkPlugins={[remarkGfm]}
      {...rest}
    />
  );
};

export default Markdown;
