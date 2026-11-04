"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check saved preference or default to dark
    const saved = localStorage.getItem("masky_theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      // Default to dark mode as requested by user
      setThemeState("dark");
      applyTheme("dark");
    }
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof document !== "undefined") {
      // If we are currently inside /admin, always enforce dark class on html root
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        document.documentElement.classList.add("dark");
        return;
      }
      if (t === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("masky_theme", t);
    } catch (_) {}
    applyTheme(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("masky_theme", next);
      } catch (_) {}
      applyTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
