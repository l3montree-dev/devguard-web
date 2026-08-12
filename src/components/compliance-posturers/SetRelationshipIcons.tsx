import type { SVGProps } from "react";


const base: SVGProps<SVGSVGElement> = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};


const FILL_OPACITY = 1;


export function EquivalentToIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 9h14" />
      <path d="M5 15h14" />
    </svg>
  );
}


export function IntersectsWithIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
      <path
        d="M12 6.8a6 6 0 0 1 0 10.4 6 6 0 0 1 0-10.4Z"
        fill="currentColor"
        fillOpacity={FILL_OPACITY}
        stroke="none"
      />
    </svg>
  );
}


export function SubsetOfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6h-6a6 6 0 0 0 0 12h6" />
    </svg>
  );
}


export function SupersetOfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6h6a6 6 0 0 1 0 12H6" />
    </svg>
  );
}
