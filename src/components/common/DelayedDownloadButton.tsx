import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2Icon, FileCode, ImageIcon } from "lucide-react";

interface DelayedDownloadButtonProps {
  href: string;
  format: "json" | "xml";
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function DelayedDownloadButton({
  href,
  format,
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
      link.download = `sbom.${format}`;
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
