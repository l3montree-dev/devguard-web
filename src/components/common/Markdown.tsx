import dynamic from "next/dynamic";
import React from "react";
const BaseMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
});
const Markdown = (props: any) => {
  return <BaseMarkdown {...props} />;
};

export default Markdown;
