"use client";
import React from "react";
import { config } from "../config";

const ConfigContext = React.createContext<typeof config>({
  ...config,
});
export const ConfigProvider = ConfigContext.Provider;
export const useConfig = () => React.useContext(ConfigContext);
