import React from "react";

const Avatar = (props: { avatar?: string; name: string }) => {
  if (props.avatar) {
    return (
      <img
        src={`data:image/png;base64,${props.avatar}`}
        alt={props.name}
        className="h-8 w-8 border-foreground/20 border rounded-lg bg-muted"
      />
    );
  }
  return (
    <div className="h-8 w-8 border border-foreground/20 rounded-lg bg-muted flex items-center justify-center">
      <span className="text-foreground/50 font-semibold">
        {props.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

export default Avatar;
