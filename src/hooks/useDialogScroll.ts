import { useEffect } from "react";

export default function useDialogScroll(open: boolean) {
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const elements = document.querySelectorAll('[data-state="open"]');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          // check if it has a role="dialog" as direct child
          if (el && el.children.length > 0) {
            const hasDialogRole = Array.from(el.children).some(
              (child) => child.getAttribute("role") === "dialog",
            );
            if (hasDialogRole) {
              el.scrollTo({ behavior: "instant", top: 0 });
            }
          }
        }
      });
    }
  }, [open]);
}
