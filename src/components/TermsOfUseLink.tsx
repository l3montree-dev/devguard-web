// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
