import { Loader2 } from "lucide-react";
import { useState } from "react";

export function useLoader() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    waitFor<T>(fn: (() => Promise<T>) | Promise<T>): () => Promise<T> {
      return async () => {
        console.log("LOADING");
        setIsLoading(true);
        let res: T;
        if (typeof fn === "function") {
          res = await fn();
          setIsLoading(false);
        } else {
          res = await fn;
          setIsLoading(false);
        }
        console.log("DONE LOADING");
        return res;
      };
    },
    isLoading,
    Loader: () => {
      return isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null;
    },
  };
}
