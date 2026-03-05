// src/lib/theme-provider.tsx
import { useEffect, useState, ReactNode } from "react";
import { ThemeContext, Theme } from "./theme-context";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
};

const getAutoNightTheme = () => {
  const hour = new Date().getHours();

  // Dark antara 18:00 - 05:00
  if (hour >= 18 || hour < 5) {
    return "dark";
  }

  return "light";
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;

    const saved = localStorage.getItem("theme") as Theme | null;

    if (saved) return saved;

    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");

      const applyTheme = () => {
        root.classList.remove("light", "dark");
        root.classList.add(media.matches ? "dark" : "light");
      };

      applyTheme();

      media.addEventListener("change", applyTheme);
      return () => media.removeEventListener("change", applyTheme);
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
