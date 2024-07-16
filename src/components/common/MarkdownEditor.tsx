import { DiffSourceToggleWrapper, MDXEditorProps } from "@mdxeditor/editor";
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

  BoldItalicUnderlineToggles,
  ListsToggle,
  CodeToggle,
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
      className="mdx-editor rounded border focus-within:ring focus:ring"
      onChange={(value) => setValue(value)}
      placeholder="Add your justification here..."
      markdown={value}
      contentEditableClassName="mdx-editor-content"
      plugins={[
        //    toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <DiffSourceToggleWrapper>
                <BoldItalicUnderlineToggles />
                <CodeToggle />
                <ListsToggle />
              </DiffSourceToggleWrapper>
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

        diffSourcePlugin({ viewMode: "rich-text" }),
        markdownShortcutPlugin(),
      ]}
    />
  );
};

export default MarkdownEditor;
