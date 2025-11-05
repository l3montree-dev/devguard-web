import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

interface DelayedDownloadButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function DelayedDownloadButton({
  href,
  icon,
  label,
  className = "",
}: DelayedDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    setTimeout(() => {
      const link = document.createElement("a");
      link.href = href;
      // get the basename of the file from the href
      const parts = href.split("/");
      const filename = parts[parts.length - 1].split("?")[0];

      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
    }, 1500);
  };

  return (
    <Button
      onClick={handleDownload}
      variant="secondary"
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2Icon className="animate-spin h-5 w-auto inline-block mr-2" />
      ) : (
        <span className="mr-2">{icon}</span>
      )}
      {label}
    </Button>
  );
}
