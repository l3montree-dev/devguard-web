import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

const useRouterQuery = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  return (
    newQuery: Record<string, string | number | boolean | undefined | null>,
  ) => {
    const newSearchParams = new URLSearchParams(
      searchParamsRef.current?.toString(),
    );
    Object.entries(newQuery).forEach(([k, v]) => {
      if (v === undefined || v === null) {
        newSearchParams.delete(k);
      } else {
        newSearchParams.set(k, String(v));
      }
    });
    router.replace(pathname + "?" + newSearchParams.toString(), {
      scroll: false,
    });
  };
};

export default useRouterQuery;
