import { DropzoneState } from "react-dropzone/.";

interface Props {
  dropzone: DropzoneState;
}
export default function FileUpload({ dropzone }: Props) {
  return (
    <div>
      <div
        {...dropzone.getRootProps()}
        className="mb-5 mt-5 flex h-20 cursor-pointer items-center justify-center rounded border-2 border-dashed"
      >
        <input {...dropzone.getInputProps()} />
        <p className="text-muted-foreground">
          Drag and drop some file here, or click to select
        </p>
      </div>
    </div>
  );
}
