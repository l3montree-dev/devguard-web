import React, { FunctionComponent } from "react";

const P: FunctionComponent<{ value: string | null }> = ({ value }) => {
  if (!value) {
    return null;
  }
  return value.split("\n").map((line, i) => <p key={i}>{line}</p>);
};

export default P;
