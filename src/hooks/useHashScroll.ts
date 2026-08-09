import { useEffect } from "react";

export default function useHashScroll(id: string) {
  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash !== `#${id}`) return;

      document.getElementById(id)?.scrollIntoView();
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [id]);
}
