import { CodeBlockEditorDescriptor, MDXEditorProps } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { FunctionComponent } from "react";

const {
  MDXEditor,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  useCodeBlockEditorContext,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,

  codeMirrorPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  diffSourcePlugin,
  // @ts-expect-error
} = await import("@mdxeditor/editor");

interface Props extends Partial<MDXEditorProps> {
  value: string;
  setValue: (value?: string) => void;
}

const MarkdownEditor: FunctionComponent<Props> = ({
  value,
  setValue,
  ...rest
}) => {
  return (
    <MDXEditor
      className="mdx-editor"
      onChange={(value) => setValue(value)}
      markdown={value}
      contentEditableClassName="mdx-editor-content"
      plugins={[
        //    toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
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
        codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),

        codeMirrorPlugin({
          codeBlockLanguages: {
            js: "JavaScript",
            css: "CSS",
            txt: "text",
            tsx: "TypeScript",
          },
        }),

        diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
        markdownShortcutPlugin(),
      ]}
    />
  );
};

export default MarkdownEditor;
