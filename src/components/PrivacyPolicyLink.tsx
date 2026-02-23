"use client";
import React from "react";
import { useConfig } from "../context/ConfigContext";

const PrivacyPolicyLink = () => {
  const config = useConfig();
  return (
    <a
      href={config.privacyPolicyLink}
      target="_blank"
      rel="noreferrer"
      className="font-semibold hover:underline"
    >
      Privacy Policy
    </a>
  );
};

export default PrivacyPolicyLink;
