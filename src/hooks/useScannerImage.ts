import { useEffect, useState } from "react";
import { fetchLatestScannerImage } from "../data-fetcher/fetchLatestScannerImage";

let scannerImage: string = "ghcr.io/l3montree-dev/devguard/scanner:main";

export default function useScannerImage() {
  const [image, setScannerImage] = useState<string>(scannerImage);
  useEffect(() => {
    if (scannerImage !== "ghcr.io/l3montree-dev/devguard/scanner:main") {
      setScannerImage(scannerImage);
    } else {
      fetchLatestScannerImage().then((img) => {
        scannerImage = img;
        setScannerImage(img);
      });
    }
  }, []);
  return image;
}
