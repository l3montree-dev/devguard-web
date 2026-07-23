import dynamic from "next/dynamic";
import React from "react";
import type { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./markdownComponents";
const BaseMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
});

const Markdown = (props: Options & { linkBaseURL?: string }) => {
  const { linkBaseURL, ...rest } = props;
  return (
    <BaseMarkdown
      components={markdownComponents(linkBaseURL)}
      remarkPlugins={[remarkGfm]}
      {...rest}
    />
  );
};

export default Markdown;
