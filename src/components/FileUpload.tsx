import { DropzoneState } from "react-dropzone";

interface Props {
  dropzone: DropzoneState;
  files: string[];
  id?: string;
}
export default function FileUpload({ dropzone, files, id }: Props) {
  return (
    <div
      id={id}
      className="border-muted-foreground border-2 border-dashed group p-1 rounded"
    >
      <div
        {...dropzone.getRootProps()}
        className="flex h-20 bg-card cursor-pointer items-center justify-center rounded dash-border"
      >
        <input {...dropzone.getInputProps()} />
        {files.length > 0 ? (
          <div className="flex flex-col items-center">
            {files.map((file, index) => (
              <p key={index} className="text-muted-foreground">
                {file}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground transition-all group-hover:text-primary">
            Drag and drop some file here, or click to select
          </p>
        )}
      </div>
    </div>
  );
}
