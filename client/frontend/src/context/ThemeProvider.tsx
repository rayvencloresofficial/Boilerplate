import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useColorScheme } from "@mui/joy";
import {
  getColors,
  getActiveThemePreset,
  getActiveThemePresetId,
  getThemePresets,
  setThemePreset as setGlobalThemePreset,
  setCustomThemeColors as setGlobalCustomThemeColors,
  applyThemeCssVariables,
  type ThemeColorVariant,
} from "../utils/Colors";
import { ThemeContext, type ThemeContextType } from "./ThemeContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode, setMode } = useColorScheme();
  const [activePresetId, setActivePresetId] = useState<string>(() => getActiveThemePresetId());
  const [, setRevision] = useState<number>(0);

  const resolvedMode: "light" | "dark" = mode === "dark" ? "dark" : "light";

  // Synchronize CSS rules on mount and whenever mode or preset changes
  useEffect(() => {
    applyThemeCssVariables(mode);
  }, [mode, activePresetId]);

  // Listen for external events
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ presetId?: string }>;
      if (customEvent.detail?.presetId) {
        setActivePresetId(customEvent.detail.presetId);
      }
      setRevision((prev) => prev + 1);
    };

    window.addEventListener("theme-color-change", handleThemeChange);
    return () => {
      window.removeEventListener("theme-color-change", handleThemeChange);
    };
  }, []);

  const changePreset = useCallback(
    (presetId: string) => {
      setGlobalThemePreset(presetId, mode);
      setActivePresetId(presetId);
      setRevision((prev) => prev + 1);
    },
    [mode],
  );

  const changeCustomColors = useCallback(
    (targetMode: "light" | "dark", custom: Partial<ThemeColorVariant>) => {
      setGlobalCustomThemeColors(targetMode, custom);
      setRevision((prev) => prev + 1);
    },
    [],
  );

  const activePreset = useMemo(() => {
    return (
      getThemePresets().find((p) => p.id === activePresetId) ||
      getActiveThemePreset()
    );
  }, [activePresetId]);

  const colors = useMemo(() => {
    return getColors(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activePreset]);

  const presets = useMemo(() => {
    return getThemePresets();
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      mode: resolvedMode,
      setMode,
      colors,
      activePreset,
      activePresetId,
      presets,
      setThemePreset: changePreset,
      setCustomThemeColors: changeCustomColors,
    }),
    [
      resolvedMode,
      setMode,
      colors,
      activePreset,
      activePresetId,
      presets,
      changePreset,
      changeCustomColors,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
