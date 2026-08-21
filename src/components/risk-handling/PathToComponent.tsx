// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareIcon } from "@heroicons/react/24/outline";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
} from "react";
import PathEdge from "./PathEdge";
import PathNode, { type PathNodeRole } from "./PathNode";

interface PathToComponentProps {
  // Purls of the artifacts this vulnerability was found in - a vuln can show up
  // in more than one build (e.g. several container images), all sharing the
  // same first hop, so they're rendered as a cluster of root nodes.
  rootNames: string[];
  // Ordered purls from the direct dependency down to the vulnerable component.
  path: string[];
  // Number of dependency paths this vulnerability is reachable through.
  pathCount?: number;
  // When true, edges become actionable (dispute the call assumption).
  actionable?: boolean;
  // Called with the clicked edge's index — i.e. the index into `path` of the
  // edge's child node, so the caller can build a rule for that sub-path.
  onCallClick?: (edgeIndex: number) => void;
}

type Point = [number, number];

interface NodeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Builds an orthogonal path string with rounded corners through the points.
const roundedPath = (points: Point[], radius: number): string => {
  if (points.length === 0) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const d1 = Math.hypot(x1 - x0, y1 - y0) || 1;
    const d2 = Math.hypot(x2 - x1, y2 - y1) || 1;
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const ax = x1 - ((x1 - x0) / d1) * r;
    const ay = y1 - ((y1 - y0) / d1) * r;
    const bx = x1 + ((x2 - x1) / d2) * r;
    const by = y1 + ((y2 - y1) / d2) * r;
    d += ` L ${ax} ${ay} Q ${x1} ${y1} ${bx} ${by}`;
  }
  const [lx, ly] = points[points.length - 1];
  d += ` L ${lx} ${ly}`;
  return d;
};

// Turns the measured item rectangles into a serpentine connector: a centered
// horizontal line per row, and between rows a rounded bend down, a straight
// return in the gap, and a bend back up into the first item of the next row.
const buildLinePath = (rects: NodeRect[]): string => {
  if (rects.length < 2) return "";

  const tolerance = 12;
  interface Row {
    top: number;
    bottom: number;
    left: number;
    right: number;
    centerYSum: number;
    count: number;
  }
  const rows: Row[] = [];
  for (const r of rects) {
    const centerY = r.top + r.height / 2;
    const current = rows[rows.length - 1];
    // Group by vertical center, not top: short edges and tall nodes on the
    // same center-aligned line must land in one row so the line runs straight
    // through them instead of dipping into each edge.
    const currentCenterY = current ? current.centerYSum / current.count : 0;
    if (current && Math.abs(centerY - currentCenterY) <= tolerance) {
      current.bottom = Math.max(current.bottom, r.top + r.height);
      current.left = Math.min(current.left, r.left);
      current.right = Math.max(current.right, r.left + r.width);
      current.centerYSum += centerY;
      current.count += 1;
    } else {
      rows.push({
        top: r.top,
        bottom: r.top + r.height,
        left: r.left,
        right: r.left + r.width,
        centerYSum: centerY,
        count: 1,
      });
    }
  }

  const overshoot = 18;
  const points: Point[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const y = row.centerYSum / row.count;
    const isFirst = i === 0;
    const isLast = i === rows.length - 1;
    // Rows that continue onto a next line overshoot on the right before bending
    // down, and wrapped rows get a matching lead-in on the left — so the
    // vertical drop never sits flush against a node edge.
    const startX = isFirst ? row.left : row.left - overshoot;
    const endX = isLast ? row.right : row.right + overshoot;
    points.push([startX, y]);
    points.push([endX, y]);
    const next = rows[i + 1];
    if (next) {
      const gapY = (row.bottom + next.top) / 2;
      points.push([endX, gapY]);
      points.push([next.left - overshoot, gapY]);
    }
  }

  return roundedPath(points, 12);
};

type Item =
  | { key: string; kind: "roots"; labels: string[] }
  | { key: string; kind: "node"; label: string; role: PathNodeRole }
  | { key: string; kind: "edge"; index: number };

const PathToComponent: FunctionComponent<PathToComponentProps> = ({
  rootNames,
  path,
  pathCount,
  actionable = false,
  onCallClick,
}) => {
  const chainNodes: Array<{ key: string; label: string; role: PathNodeRole }> =
    path.map((purl, i) => ({
      key: `${purl}-${i}`,
      label: purl,
      role: (i === path.length - 1
        ? "vulnerable"
        : "dependency") as PathNodeRole,
    }));

  // The root cluster and the first chain edge share the semantics the single
  // root node used to have: edge index 0 disputes "does the first hop really
  // get called", regardless of which artifact's root it originates from.
  const items: Item[] = [{ key: "roots", kind: "roots", labels: rootNames }];
  chainNodes.forEach((node, i) => {
    items.push({ key: `edge-${i}`, kind: "edge", index: i });
    items.push({ kind: "node", ...node });
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [linePath, setLinePath] = useState("");

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const rects = itemRefs.current
      .filter((el): el is HTMLDivElement => el !== null)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        };
      });
    setLinePath(buildLinePath(rects));
  }, []);

  // Re-measure when the path changes or the container resizes, since resizing
  // is what makes the items re-wrap onto a different number of lines.
  const pathKey = [...rootNames, ...chainNodes.map((n) => n.label)].join("|");
  useEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure, pathKey, actionable]);

  return (
    <div className="">
      <div className="mb-2 flex flex-row items-center justify-between">
        <span className="block font-semibold">Path to component</span>
        {!!pathCount && pathCount > 0 && (
          <Tooltip>
            <TooltipTrigger className="flex items-center text-xs text-muted-foreground">
              <ShareIcon className="mr-1 inline-block h-4 w-4" />
              Reachable through {pathCount} {pathCount === 1 ? "path" : "paths"}
            </TooltipTrigger>
            <TooltipContent className="max-w-screen-sm font-normal">
              <p>
                This vulnerability exists in {pathCount} dependency{" "}
                {pathCount === 1 ? "path" : "paths"} within this asset. When
                marking as false positive, you can apply a rule to automatically
                mark all paths with matching suffixes.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative rounded-lg border bg-muted/30 p-6"
      >
        {/* Connector line, drawn behind the nodes and edges and centered
            through them. It follows the wrapped layout: straight per row, then
            a rounded bend down and back to the left for each new line. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </svg>
        <div className="relative flex flex-wrap items-center gap-x-3 gap-y-10 pl-6">
          {items.map((item, idx) => (
            <div
              key={item.key}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              // Hanging indent: pull the first node back to the left edge so
              // every wrapped line is nudged right, leaving room for the return.
              className={idx === 0 ? "-ml-6" : undefined}
            >
              {item.kind === "roots" ? (
                <div className="flex flex-wrap border items-center gap-2 rounded-lg bg-card p-2">
                  {item.labels.map((label, i) => (
                    <PathNode key={`${label}-${i}`} label={label} role="root" />
                  ))}
                </div>
              ) : item.kind === "node" ? (
                <PathNode label={item.label} role={item.role} />
              ) : (
                <PathEdge
                  actionable={actionable}
                  onClick={() => onCallClick?.(item.index)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathToComponent;
