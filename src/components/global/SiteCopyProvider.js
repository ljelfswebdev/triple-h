"use client";

import { createContext, useContext } from "react";
import { defaultSiteCopy } from "@/lib/site-copy";

const SiteCopyContext = createContext(defaultSiteCopy);

export function SiteCopyProvider({ children, value }) {
  return <SiteCopyContext.Provider value={value}>{children}</SiteCopyContext.Provider>;
}

export function useSiteCopy() {
  return useContext(SiteCopyContext);
}
