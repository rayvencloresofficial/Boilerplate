import { createContext } from "react";
import type {
  FontDefinition,
  TypographyPreset,
} from "../utils/Fonts";

export interface TypographyContextType {
  fontFamily: string;
  headingFontFamily: string;
  fontScale: number;
  activePresetId: string | null;
  availableFonts: FontDefinition[];
  presets: TypographyPreset[];
  setFontFamily: (font: string) => void;
  setHeadingFontFamily: (font: string) => void;
  setFontScale: (scale: number) => void;
  setTypographyPreset: (presetId: string) => void;
  resetToDefaults: () => void;
  saveToDatabase: () => Promise<void>;
  isSaving: boolean;
  isDirty: boolean;
}

export const TypographyContext = createContext<TypographyContextType | undefined>(
  undefined,
);
