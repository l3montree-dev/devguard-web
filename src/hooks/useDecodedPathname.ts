import { usePathname } from "next/navigation";

export default function useDecodedPathname() {
  const pathname = usePathname();
  return decodeURIComponent(pathname || "");
}
