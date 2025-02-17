import { CopyIcon } from "lucide-react";
import { FunctionComponent } from "react";
import { toast } from "sonner";

const InlineCopy: FunctionComponent<{ content: string }> = ({ content }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };
  return (
    <span className="inline-flex items-center gap-1">
      {content}
      <button
        onClick={handleCopy}
        type="button"
        className="rounded-lg p-1 transition-all hover:bg-white/20"
      >
        <CopyIcon className="h-4 w-4" />
      </button>
    </span>
  );
};

export default InlineCopy;
