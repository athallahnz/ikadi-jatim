import { useEffect, useState, ReactNode } from "react";
import { ThemeContext, Theme } from "./theme-context";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;

    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (dark: boolean) => {
      root.classList.toggle("dark", dark);
      root.classList.toggle("light", !dark);
    };

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");

      applyTheme(media.matches);

      const listener = () => applyTheme(media.matches);

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    applyTheme(theme === "dark");
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
