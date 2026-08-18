import { useEffect } from "react";

export default function useHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const anchor = window.location.hash.replace(/^#/, "");
      if (!anchor) return;

      document.getElementById(anchor)?.scrollIntoView();
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
}
