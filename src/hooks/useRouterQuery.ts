import { usePathname, useRouter, useSearchParams } from "next/navigation";

const useRouterQuery = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  return (
    newQuery: Record<string, string | number | boolean | undefined | null>,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    Object.entries(newQuery).forEach(([k, v]) => {
      if (v === undefined || v === null) {
        newSearchParams.delete(k);
      } else {
        newSearchParams.set(k, String(v));
      }
    });
    router.push(pathname + "?" + newSearchParams.toString());
  };
};

export default useRouterQuery;
