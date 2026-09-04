import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AVAILABLE_FONTS,
  TYPOGRAPHY_PRESETS,
  getStoredTypography,
  setStoredTypography,
  applyTypographyCssVariables,
  type TypographyConfig,
} from "../utils/Fonts";
import { TypographyContext, type TypographyContextType } from "./TypographyContext";
import { updateSettingApi, getSettingsApi } from "../services/settings.api";

export const TypographyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<TypographyConfig>(() => getStoredTypography());
  const [persistedConfig, setPersistedConfig] = useState<TypographyConfig>(() =>
    getStoredTypography(),
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Derive active preset if current fonts match a predefined preset
  const activePresetId = useMemo(() => {
    const matched = TYPOGRAPHY_PRESETS.find(
      (p) =>
        p.primaryFont.toLowerCase() === config.fontFamily.toLowerCase() &&
        p.headingFont.toLowerCase() === config.headingFontFamily.toLowerCase() &&
        Math.abs(p.fontScale - config.fontScale) < 0.01,
    );
    return matched ? matched.id : null;
  }, [config]);

  // Synchronize CSS variables and Google Fonts whenever config changes
  useEffect(() => {
    applyTypographyCssVariables(config);
  }, [config]);

  // Listen to external broadcast events (e.g. from other tabs or components)
  useEffect(() => {
    const handleTypographyEvent = (e: Event) => {
      const customEvent = e as CustomEvent<TypographyConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };

    window.addEventListener("typography-change", handleTypographyEvent);
    return () => {
      window.removeEventListener("typography-change", handleTypographyEvent);
    };
  }, []);

  // Fetch initial database settings on mount to sync with backend if available
  useEffect(() => {
    let ignore = false;
    const fetchRemoteSettings = async () => {
      try {
        const settings = await getSettingsApi();
        if (ignore) return;

        const fontSetting = settings.find((s) => s.key === "appearance.font_family");
        const headingSetting = settings.find(
          (s) => s.key === "appearance.heading_font_family",
        );

        if (fontSetting && typeof fontSetting.value === "string") {
          const remotePrimary = fontSetting.value;
          const remoteHeading =
            headingSetting && typeof headingSetting.value === "string"
              ? headingSetting.value
              : remotePrimary;

          const updated: TypographyConfig = {
            fontFamily: remotePrimary,
            headingFontFamily: remoteHeading,
            fontScale: config.fontScale,
          };

          setStoredTypography(updated);
          setConfig(updated);
          setPersistedConfig(updated);
        }
      } catch {
        // Backend not reachable or unauthorized; use local cache gracefully
      }
    };

    fetchRemoteSettings();
    return () => {
      ignore = true;
    };
  }, []);

  const setFontFamily = useCallback((newFont: string) => {
    setConfig((prev) => {
      const syncHeading = prev.fontFamily === prev.headingFontFamily;
      const next: TypographyConfig = {
        ...prev,
        fontFamily: newFont,
        headingFontFamily: syncHeading ? newFont : prev.headingFontFamily,
      };
      setStoredTypography(next);
      return next;
    });
  }, []);

  const setHeadingFontFamily = useCallback((newHeadingFont: string) => {
    setConfig((prev) => {
      const next: TypographyConfig = {
        ...prev,
        headingFontFamily: newHeadingFont,
      };
      setStoredTypography(next);
      return next;
    });
  }, []);

  const setFontScale = useCallback((newScale: number) => {
    setConfig((prev) => {
      const next: TypographyConfig = {
        ...prev,
        fontScale: newScale,
      };
      setStoredTypography(next);
      return next;
    });
  }, []);

  const setTypographyPreset = useCallback((presetId: string) => {
    const preset = TYPOGRAPHY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const next: TypographyConfig = {
      fontFamily: preset.primaryFont,
      headingFontFamily: preset.headingFont,
      fontScale: preset.fontScale,
    };
    setStoredTypography(next);
    setConfig(next);
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaultPreset = TYPOGRAPHY_PRESETS[0];
    const next: TypographyConfig = {
      fontFamily: defaultPreset.primaryFont,
      headingFontFamily: defaultPreset.headingFont,
      fontScale: defaultPreset.fontScale,
    };
    setStoredTypography(next);
    setConfig(next);
  }, []);

  const saveToDatabase = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateSettingApi("appearance.font_family", {
        value: config.fontFamily,
      });
      await updateSettingApi("appearance.heading_font_family", {
        value: config.headingFontFamily,
      });
      setPersistedConfig(config);
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const isDirty = useMemo(() => {
    return (
      config.fontFamily !== persistedConfig.fontFamily ||
      config.headingFontFamily !== persistedConfig.headingFontFamily ||
      Math.abs(config.fontScale - persistedConfig.fontScale) > 0.01
    );
  }, [config, persistedConfig]);

  const value = useMemo<TypographyContextType>(
    () => ({
      fontFamily: config.fontFamily,
      headingFontFamily: config.headingFontFamily,
      fontScale: config.fontScale,
      activePresetId,
      availableFonts: AVAILABLE_FONTS,
      presets: TYPOGRAPHY_PRESETS,
      setFontFamily,
      setHeadingFontFamily,
      setFontScale,
      setTypographyPreset,
      resetToDefaults,
      saveToDatabase,
      isSaving,
      isDirty,
    }),
    [
      config,
      activePresetId,
      setFontFamily,
      setHeadingFontFamily,
      setFontScale,
      setTypographyPreset,
      resetToDefaults,
      saveToDatabase,
      isSaving,
      isDirty,
    ],
  );

  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
};
