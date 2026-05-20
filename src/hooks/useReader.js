import { useState, useEffect } from "react";
import { saveSettings, loadSettings } from "../utils/storage";

export function useReader() {
  const saved = loadSettings();

  const [theme, setTheme] = useState(saved?.theme || "light");
  const [wpm, setWpm] = useState(saved?.wpm || 250);
  const [fontSize, setFontSize] = useState(saved?.fontSize || 19);
  const [fontFamily, setFontFamily] = useState(saved?.fontFamily || "serif");

  useEffect(() => {
    saveSettings({ theme, wpm, fontSize, fontFamily });
  }, [theme, wpm, fontSize, fontFamily]);

  function increaseFontSize() {
    setFontSize((s) => Math.min(32, s + 1));
  }
  function decreaseFontSize() {
    setFontSize((s) => Math.max(12, s - 1));
  }

  return {
    theme,
    setTheme,
    wpm,
    setWpm,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    fontFamily,
    setFontFamily,
    focusMode: true,
    flowMode: true,
  };
}
