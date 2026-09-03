import { createContext } from "react";
import { getColors, type ThemeColorPreset, type ThemeColorVariant } from "../utils/Colors";

export interface ThemeContextType {
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark" | "system") => void;
  colors: ReturnType<typeof getColors>;
  activePreset: ThemeColorPreset;
  activePresetId: string;
  presets: ThemeColorPreset[];
  setThemePreset: (presetId: string) => void;
  setCustomThemeColors: (
    mode: "light" | "dark",
    custom: Partial<ThemeColorVariant>,
  ) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
