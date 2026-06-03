import type { ReactNode } from "react";

export function TourLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-link underline hover:opacity-80"
    >
      {children}
    </a>
  );
}
