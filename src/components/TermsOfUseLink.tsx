"use client";
import React from "react";
import { useConfig } from "../context/ConfigContext";

const TermsOfUseLink = () => {
  const config = useConfig();
  return (
    <a
      href={config.termsOfUseLink}
      target="_blank"
      rel="noreferrer"
      className="font-semibold hover:underline"
    >
      Terms of Use
    </a>
  );
};

export default TermsOfUseLink;
