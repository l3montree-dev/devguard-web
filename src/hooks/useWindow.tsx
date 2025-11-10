"use client";

import React from "react";

function useWindow() {
  const [windowObj, setWindowObj] = React.useState<Window | null>(null);
  React.useEffect(() => {
    setWindowObj(window);
  }, []);
  return windowObj;
}

export default useWindow;
