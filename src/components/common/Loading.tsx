import { Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="text-muted-foreground flex flex-row items-center">
      <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
      Loading...
    </div>
  );
};

export default Loading;
