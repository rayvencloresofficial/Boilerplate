import { useContext } from "react";
import {
  TypographyContext,
  type TypographyContextType,
} from "../context/TypographyContext";
import {
  AVAILABLE_FONTS,
  TYPOGRAPHY_PRESETS,
  getStoredTypography,
  setStoredTypography,
} from "../utils/Fonts";

export type UseTypographyReturn = TypographyContextType;

/**
 * Hook to consume dynamic typography state, active font families, presets, and setters.
 */
export const useTypography = (): TypographyContextType => {
  const context = useContext(TypographyContext);
  if (context) {
    return context;
  }

  // Graceful fallback if invoked outside TypographyProvider
  const fallback = getStoredTypography();

  return {
    fontFamily: fallback.fontFamily,
    headingFontFamily: fallback.headingFontFamily,
    fontScale: fallback.fontScale,
    activePresetId: null,
    availableFonts: AVAILABLE_FONTS,
    presets: TYPOGRAPHY_PRESETS,
    setFontFamily: (font) => setStoredTypography({ fontFamily: font }),
    setHeadingFontFamily: (font) => setStoredTypography({ headingFontFamily: font }),
    setFontScale: (scale) => setStoredTypography({ fontScale: scale }),
    setTypographyPreset: () => {},
    resetToDefaults: () => {},
    saveToDatabase: async () => {},
    isSaving: false,
    isDirty: false,
  };
};
