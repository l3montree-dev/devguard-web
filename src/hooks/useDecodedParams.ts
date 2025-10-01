import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function useDecodedParams() {
  const params = useParams();
  const decodedParams = useMemo(() => {
    return Object.fromEntries(
      Object.entries(params || {}).map(([key, value]) => [
        key,
        decodeURIComponent(value as string),
      ]),
    );
  }, [params]);
  return decodedParams;
}
