import {
  DiffSourceToggleWrapper,
  MDXEditorMethods,
  MDXEditorProps,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import styles from "../../styles/mdxeditor.module.scss";
import { FunctionComponent, useEffect, useRef } from "react";

import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  MDXEditor,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { classNames } from "../../utils/common";

interface Props extends Partial<MDXEditorProps> {
  value: string;
  setValue: (value?: string) => void;
  placeholder?: string;
}

const MarkdownEditor: FunctionComponent<Props> = ({
  value,
  setValue,
  placeholder,
  ...rest
}) => {
  const markdownRef = useRef<MDXEditorMethods>(null);

  useEffect(() => {
    markdownRef.current?.setMarkdown(value);
  }, [value]);
  return (
    <MDXEditor
      ref={markdownRef}
      className={classNames(
        "mdx-editor ring-primary focus:ring-2 focus-within:ring-2 rounded border",
        styles.mdxeditor,
      )}
      onChange={(value) => setValue(value)}
      placeholder={placeholder}
      markdown={value}
      contentEditableClassName="mdx-editor-content"
      plugins={[
        //    toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <ListsToggle />
            </>
          ),
        }),
        listsPlugin(),
        quotePlugin(),
        headingsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        frontmatterPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "go" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            js: "JavaScript",
            css: "CSS",
            txt: "text",
            tsx: "TypeScript",
            go: "Go",
          },
        }),

        markdownShortcutPlugin(),
      ]}
    />
  );
};

export default MarkdownEditor;
