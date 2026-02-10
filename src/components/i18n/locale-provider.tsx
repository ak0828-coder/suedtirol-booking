"use client";

import { createContext, useContext, useMemo } from "react";
import type { Dictionary } from "@/lib/translator";
import { createTranslator } from "@/lib/translator";

type I18nContextValue = {
  dict: Dictionary;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    return { dict: dictionary, t: createTranslator(dictionary) };
  }, [dictionary]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { t: (key: string, fallback?: string) => fallback ?? key };
  }
  return { t: ctx.t };
}
