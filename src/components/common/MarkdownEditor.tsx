import { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { FunctionComponent, useEffect, useRef } from "react";
import styles from "../../styles/mdxeditor.module.scss";

import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  MDXEditor,
  codeBlockPlugin,
  codeMirrorPlugin,
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
  maxLength?: number;
}

const MarkdownEditor: FunctionComponent<Props> = ({
  value,
  setValue,
  placeholder,
  maxLength,
  ...rest
}) => {
  const markdownRef = useRef<MDXEditorMethods>(null);

  useEffect(() => {
    markdownRef.current?.setMarkdown(value);
  }, [value]);

  const charCount = value.length;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;

  return (
    <div>
      <MDXEditor
        ref={markdownRef}
        className={classNames(
          "ring-primary focus:ring-2 focus-within:ring-2 rounded border",
          isOverLimit ? "border-destructive" : "",
          styles.mdxeditor,
          rest.className || "",
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
      {maxLength !== undefined && (
        <p
          className={classNames(
            "mt-1 text-right text-xs",
            isOverLimit ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {charCount} / {maxLength}
        </p>
      )}
    </div>
  );
};

export default MarkdownEditor;
