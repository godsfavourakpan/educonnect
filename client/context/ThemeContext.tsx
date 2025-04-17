/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: {
    name: Theme;
    label: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
    };
  }[];
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  themes: [
    {
      name: "light",
      label: "Light",
      colors: {
        primary: "#0f172a",
        secondary: "#1e293b",
        accent: "#3b82f6",
        background: "#ffffff",
        foreground: "#0f172a",
      },
    },
    {
      name: "dark",
      label: "Dark",
      colors: {
        primary: "#f8fafc",
        secondary: "#e2e8f0",
        accent: "#3b82f6",
        background: "#0f172a",
        foreground: "#f8fafc",
      },
    },
  ],
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme || ("light" as Theme));

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(
      "light",
      "dark",
      "purple",
      "blue",
      "green",
      "orange",
      "pink"
    );

    if (theme === "light") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    themes: initialState.themes,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
