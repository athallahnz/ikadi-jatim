import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className={`
        relative w-14 h-8 flex items-center rounded-full
        transition-all duration-300
        border border-border
        ${isDark ? "bg-primary shadow-lg shadow-primary/30" : "bg-muted"}
      `}
    >
      {/* Sliding Knob */}
      <div
        className={`
          absolute left-1 w-6 h-6 rounded-full
          bg-background shadow-md
          flex items-center justify-center
          transition-all duration-300
          ${isDark ? "translate-x-6" : "translate-x-0"}
        `}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-foreground" />
        )}
      </div>
    </button>
  );
}
