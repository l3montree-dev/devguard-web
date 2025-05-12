import { DropzoneState } from "react-dropzone/.";

interface Props {
  dropzone: DropzoneState;
  files: string[];
}
export default function FileUpload({ dropzone, files }: Props) {
  return (
    <div>
      <div
        {...dropzone.getRootProps()}
        className="mb-5 mt-5 flex h-20 cursor-pointer items-center justify-center rounded border-2 border-dashed"
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
          <p className="text-muted-foreground">
            Drag and drop some file here, or click to select
          </p>
        )}
      </div>
    </div>
  );
}
