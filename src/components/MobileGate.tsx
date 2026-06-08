import React from "react";
import NotSupported from "@/components/notsupported";

export default function MobileGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="contents max-md:hidden">{children}</div>
      <div className="hidden max-md:block">
        <NotSupported />
      </div>
    </>
  );
}
