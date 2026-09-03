import { useContext } from "react";
import { ThemeContext, type ThemeContextType } from "../context/ThemeContext";
import {
  getColors,
  getActiveThemePreset,
  getActiveThemePresetId,
  getThemePresets,
  setThemePreset as setGlobalThemePreset,
  setCustomThemeColors as setGlobalCustomThemeColors,
} from "../utils/Colors";

export type UseThemeColorsReturn = ThemeContextType;

/**
 * Hook to consume reactive theme colors and controls across any component.
 */
export const useThemeColors = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }

  // Fallback if rendered outside ThemeProvider
  const mode =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-joy-color-scheme") === "dark"
      ? "dark"
      : "light";

  return {
    mode,
    setMode: () => {},
    colors: getColors(mode),
    activePreset: getActiveThemePreset(),
    activePresetId: getActiveThemePresetId(),
    presets: getThemePresets(),
    setThemePreset: (id) => setGlobalThemePreset(id, mode),
    setCustomThemeColors: (m, c) => setGlobalCustomThemeColors(m, c),
  };
};
