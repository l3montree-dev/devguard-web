// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export default function FourSideGridPattern() {
  return (
    <>
      {/* Top edge grid pattern */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-8 border-t border-b border-t-(--grid-line-color) border-b-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px]" />
      {/* Bottom edge grid pattern */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-8 border-t border-b border-t-(--grid-line-color) border-b-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px]" />
      {/* Left edge grid pattern */}
      <div className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden w-8 border-r border-r-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />
      {/* Right edge grid pattern */}
      <div className="pointer-events-none fixed inset-y-0 right-0 z-50 hidden w-8 border-l border-l-(--grid-line-color) bg-[repeating-linear-gradient(315deg,var(--grid-line-color)_0,var(--grid-line-color)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] sm:block" />
    </>
  );
}
