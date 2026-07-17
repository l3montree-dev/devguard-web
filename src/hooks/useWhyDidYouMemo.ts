import { useEffect, useRef } from "react";

export function useWhyDidYouMemo(name: string, deps: any[]) {
  const prevDeps = useRef<any[]>(deps);

  useEffect(() => {
    if (!prevDeps.current) {
      prevDeps.current = deps;
      return;
    }

    deps.forEach((dep, i) => {
      if (dep !== prevDeps.current![i]) {
        console.log("[dependency changed]", name, {
          index: i,
          before: prevDeps.current![i],
          after: dep,
        });
      }
    });

    prevDeps.current = deps;
  });
}
