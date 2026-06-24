import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../utils/storage";

export function useTheme(defaultTheme = "theme-mori") {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || defaultTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  return { theme, setTheme };
}
