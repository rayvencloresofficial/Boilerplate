export interface ThemeColorVariant {
  /** Neutral background color (white, off-white, or dark charcoal) */
  dominant: string;
  /** Structural elements like cards, headers, or text (dark gray, navy, or secondary tones) */
  secondary: string;
  /** Call-to-action buttons, links, and highlights (bright blue, orange, or green) */
  accent: string;
  /** Container/card surface color */
  surface: string;
}

export interface ThemeColorPreset {
  id: string;
  name: string;
  description: string;
  light: ThemeColorVariant;
  dark: ThemeColorVariant;
}

export interface BrandColorPreset {
  id: string;
  name: string;
  light: string;
  dark: string;
  description: string;
}

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  {
    id: "modern-azure",
    name: "Ocean Azure",
    description: "Slate neutral canvas, deep navy structural headers, and electric azure CTAs.",
    light: {
      dominant: "#f8fafc",
      secondary: "#334155",
      accent: "#0284c7",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#0b0f19",
      secondary: "#94a3b8",
      accent: "#38bdf8",
      surface: "#111827",
    },
  },
  {
    id: "sunset-terracotta",
    name: "Sunset Terracotta",
    description: "Warm neutral ivory, structural stone bronze, and bold terracotta orange.",
    light: {
      dominant: "#faf8f5",
      secondary: "#44403c",
      accent: "#da5019",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#120f0d",
      secondary: "#a8a29e",
      accent: "#ff6b3d",
      surface: "#1c1714",
    },
  },
  {
    id: "emerald-sanctuary",
    name: "Emerald Lagoon",
    description: "Gentle sage mint canvas, deep pine structural accents, and radiant emerald highlights.",
    light: {
      dominant: "#f6faf7",
      secondary: "#1e3a2b",
      accent: "#059669",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#09140f",
      secondary: "#6ee7b7",
      accent: "#10b981",
      surface: "#102018",
    },
  },
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    description: "Pearl lavender canvas, midnight indigo structural headers, and electric violet-indigo.",
    light: {
      dominant: "#f8f9ff",
      secondary: "#1e1b4b",
      accent: "#4f46e5",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#0c0c17",
      secondary: "#a5b4fc",
      accent: "#818cf8",
      surface: "#151426",
    },
  },
  {
    id: "island-amber",
    name: "Island Amber",
    description: "Warm sand neutral canvas, dark espresso headers, and rich sunrise amber gold.",
    light: {
      dominant: "#fafaf9",
      secondary: "#292524",
      accent: "#d97706",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#14120f",
      secondary: "#d6d3d1",
      accent: "#f59e0b",
      surface: "#1f1b16",
    },
  },
  {
    id: "tropical-coral",
    name: "Tropical Coral",
    description: "Porcelain blush canvas, dark garnet structural headers, and dynamic crimson coral.",
    light: {
      dominant: "#fff8f8",
      secondary: "#3b1219",
      accent: "#e11d48",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#170b0e",
      secondary: "#fda4af",
      accent: "#fb7185",
      surface: "#241217",
    },
  },
  {
    id: "forest-pine",
    name: "Forest Pine",
    description: "Crisp mint off-white canvas, deep evergreen structure, and vivid spring green.",
    light: {
      dominant: "#f5f8f5",
      secondary: "#14331d",
      accent: "#15803d",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#09120b",
      secondary: "#86efac",
      accent: "#4ade80",
      surface: "#111c13",
    },
  },
  {
    id: "plum-orchid",
    name: "Plum Orchid",
    description: "Lavender pearl canvas, midnight plum structure, and luminous neon orchid.",
    light: {
      dominant: "#faf7fd",
      secondary: "#3b1359",
      accent: "#9333ea",
      surface: "#ffffff",
    },
    dark: {
      dominant: "#130a1c",
      secondary: "#d8b4fe",
      accent: "#c084fc",
      surface: "#1e112b",
    },
  },
];

// Backward-compatible export for existing callers
export const BRAND_COLOR_PRESETS: BrandColorPreset[] = THEME_COLOR_PRESETS.map((p) => ({
  id: p.id,
  name: p.name,
  light: p.light.accent,
  dark: p.dark.accent,
  description: p.description,
}));

// In-memory module state for theme preset and custom overrides
let globalThemePresetId: string = (() => {
  if (typeof window !== "undefined") {
    try {
      const storedPreset = localStorage.getItem("theme_preset");
      if (storedPreset && THEME_COLOR_PRESETS.some((p) => p.id === storedPreset)) {
        return storedPreset;
      }
      const storedBrand = localStorage.getItem("brand_color");
      if (storedBrand) {
        const matched = THEME_COLOR_PRESETS.find(
          (p) =>
            p.light.accent.toLowerCase() === storedBrand.toLowerCase() ||
            p.dark.accent.toLowerCase() === storedBrand.toLowerCase() ||
            p.id.toLowerCase() === storedBrand.toLowerCase(),
        );
        if (matched) return matched.id;
      }
    } catch {
      // ignore
    }
  }
  return "modern-azure";
})();

let customThemeOverrides: {
  light?: Partial<ThemeColorVariant>;
  dark?: Partial<ThemeColorVariant>;
} = (() => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("theme_custom");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return {};
})();

/**
 * Gets the list of all available theme color presets.
 */
export const getThemePresets = (): ThemeColorPreset[] => {
  return THEME_COLOR_PRESETS;
};

/**
 * Gets the currently active theme preset ID.
 */
export const getActiveThemePresetId = (): string => {
  return globalThemePresetId;
};

/**
 * Gets the currently active theme preset configuration object.
 */
export const getActiveThemePreset = (): ThemeColorPreset => {
  return (
    THEME_COLOR_PRESETS.find((p) => p.id === globalThemePresetId) ||
    THEME_COLOR_PRESETS[0]
  );
};

/**
 * Gets the current active global brand color hex.
 */
export const getGlobalBrandColor = (): string => {
  const active = getActiveThemePreset();
  return active.light.accent;
};

/**
 * Adjusts a custom hex color for dark mode by increasing luminance if it's too dark.
 */
function adjustHexForDarkMode(hex: string): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return hex;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Perceived luminance (ITU-R BT.709)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  if (luminance < 0.45) {
    const factor = 0.35;
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));

    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }

  return hex;
}

/**
 * Resolves the primary brand accent color for the given mode.
 */
export const resolveBrandColor = (
  brandColor?: string | null,
  mode?: "light" | "dark" | "system" | undefined,
): string => {
  const isDark = mode === "dark";
  if (brandColor && brandColor.trim()) {
    const target = brandColor.trim().toLowerCase();
    const matched = THEME_COLOR_PRESETS.find(
      (p) =>
        p.id.toLowerCase() === target ||
        p.light.accent.toLowerCase() === target ||
        p.dark.accent.toLowerCase() === target,
    );
    if (matched) {
      return isDark ? matched.dark.accent : matched.light.accent;
    }
    return isDark ? adjustHexForDarkMode(target) : target;
  }

  const active = getActiveThemePreset();
  return isDark ? active.dark.accent : active.light.accent;
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

export const injectThemeCssRules = (
  preset: ThemeColorPreset,
  overrides?: { light?: Partial<ThemeColorVariant>; dark?: Partial<ThemeColorVariant> },
): void => {
  if (typeof window === "undefined") return;

  const light = { ...preset.light, ...(overrides?.light || {}) };
  const dark = { ...preset.dark, ...(overrides?.dark || {}) };

  const lightSoftBg = hexToRgba(light.accent, 0.12);
  const lightSoftHoverBg = hexToRgba(light.accent, 0.2);
  const darkSoftBg = hexToRgba(dark.accent, 0.16);
  const darkSoftHoverBg = hexToRgba(dark.accent, 0.26);

  const css = `
:root, [data-joy-color-scheme="light"] {
  --color-dominant: ${light.dominant} !important;
  --color-background: ${light.dominant} !important;
  --color-secondary: ${light.secondary} !important;
  --color-accent: ${light.accent} !important;
  --color-primary: ${light.accent} !important;
  --color-primary-hover: ${hoverColor(light.accent)} !important;
  --color-surface: ${light.surface} !important;
  --brand-primary: ${light.accent} !important;
  --brand-primary-light: ${light.accent} !important;

  /* Joy UI Palette Dynamic Overrides */
  --joy-palette-primary-50: ${lightSoftBg} !important;
  --joy-palette-primary-500: ${light.accent} !important;
  --joy-palette-primary-600: ${hoverColor(light.accent)} !important;
  --joy-palette-primary-solidBg: ${light.accent} !important;
  --joy-palette-primary-solidHoverBg: ${hoverColor(light.accent)} !important;
  --joy-palette-primary-solidActiveBg: ${hoverColor(light.accent)} !important;
  --joy-palette-primary-outlinedBorder: ${light.accent} !important;
  --joy-palette-primary-outlinedColor: ${light.accent} !important;
  --joy-palette-primary-plainColor: ${light.accent} !important;
  --joy-palette-primary-softColor: ${light.accent} !important;
  --joy-palette-primary-softBg: ${lightSoftBg} !important;
  --joy-palette-primary-softHoverBg: ${lightSoftHoverBg} !important;
  --joy-palette-background-body: ${light.dominant} !important;
  --joy-palette-background-surface: ${light.surface} !important;
  --joy-palette-text-secondary: ${light.secondary} !important;
}

[data-joy-color-scheme="dark"] {
  --color-dominant: ${dark.dominant} !important;
  --color-background: ${dark.dominant} !important;
  --color-secondary: ${dark.secondary} !important;
  --color-accent: ${dark.accent} !important;
  --color-primary: ${dark.accent} !important;
  --color-primary-hover: ${hoverColor(dark.accent)} !important;
  --color-surface: ${dark.surface} !important;
  --brand-primary: ${dark.accent} !important;
  --brand-primary-dark: ${dark.accent} !important;

  /* Joy UI Palette Dynamic Overrides */
  --joy-palette-primary-500: ${dark.accent} !important;
  --joy-palette-primary-600: ${hoverColor(dark.accent)} !important;
  --joy-palette-primary-solidBg: ${dark.accent} !important;
  --joy-palette-primary-solidHoverBg: ${hoverColor(dark.accent)} !important;
  --joy-palette-primary-solidActiveBg: ${hoverColor(dark.accent)} !important;
  --joy-palette-primary-outlinedBorder: ${dark.accent} !important;
  --joy-palette-primary-outlinedColor: ${dark.accent} !important;
  --joy-palette-primary-plainColor: ${dark.accent} !important;
  --joy-palette-primary-softColor: ${dark.accent} !important;
  --joy-palette-primary-softBg: ${darkSoftBg} !important;
  --joy-palette-primary-softHoverBg: ${darkSoftHoverBg} !important;
  --joy-palette-background-body: ${dark.dominant} !important;
  --joy-palette-background-surface: ${dark.surface} !important;
  --joy-palette-text-secondary: ${dark.secondary} !important;
}

[data-joy-color-scheme="dark"] body {
  background-color: ${dark.dominant} !important;
}

[data-joy-color-scheme="light"] body {
  background-color: ${light.dominant} !important;
}
`;

  let styleEl = document.getElementById("app-dynamic-theme-css") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "app-dynamic-theme-css";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
};

/**
 * Applies CSS custom properties for the active theme colors onto the document root.
 */
export const applyThemeCssVariables = (
  mode?: "light" | "dark" | "system" | undefined,
): void => {
  if (typeof window === "undefined") return;

  try {
    const preset = getActiveThemePreset();
    injectThemeCssRules(preset, customThemeOverrides);

    const isDark =
      mode === "dark" ||
      (!mode &&
        document.documentElement.getAttribute("data-joy-color-scheme") === "dark");

    const variant = isDark ? preset.dark : preset.light;
    const overrides = isDark ? customThemeOverrides.dark : customThemeOverrides.light;

    const dominant = overrides?.dominant || variant.dominant;
    const secondary = overrides?.secondary || variant.secondary;
    const accent = overrides?.accent || variant.accent;
    const surface = overrides?.surface || variant.surface;

    const root = document.documentElement;
    root.style.setProperty("--color-dominant", dominant);
    root.style.setProperty("--color-background", dominant);
    root.style.setProperty("--color-secondary", secondary);
    root.style.setProperty("--color-accent", accent);
    root.style.setProperty("--color-primary", accent);
    root.style.setProperty("--color-primary-hover", hoverColor(accent));
    root.style.setProperty("--color-surface", surface);

    // Backward-compatible properties
    root.style.setProperty("--brand-primary-light", preset.light.accent);
    root.style.setProperty("--brand-primary-dark", preset.dark.accent);
    root.style.setProperty("--brand-primary", accent);
  } catch {
    // ignore
  }
};

/**
 * Sets the active global theme preset, updates localStorage, and broadcasts changes.
 */
export const setThemePreset = (
  presetId: string,
  mode?: "light" | "dark" | "system",
): void => {
  const found = THEME_COLOR_PRESETS.find((p) => p.id === presetId);
  if (!found) return;

  globalThemePresetId = presetId;
  // Clear custom overrides when switching presets
  customThemeOverrides = {};

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("theme_preset", presetId);
      localStorage.setItem("brand_color", found.light.accent);
      localStorage.removeItem("theme_custom");
      applyThemeCssVariables(mode);
      window.dispatchEvent(
        new CustomEvent("theme-color-change", {
          detail: { presetId, preset: found },
        }),
      );
    } catch {
      // ignore
    }
  }
};

/**
 * Sets custom dominant, secondary, or accent overrides for the current mode.
 */
export const setCustomThemeColors = (
  mode: "light" | "dark",
  custom: Partial<ThemeColorVariant>,
): void => {
  customThemeOverrides[mode] = {
    ...customThemeOverrides[mode],
    ...custom,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("theme_custom", JSON.stringify(customThemeOverrides));
      applyThemeCssVariables(mode);
      window.dispatchEvent(
        new CustomEvent("theme-color-change", {
          detail: { custom: customThemeOverrides },
        }),
      );
    } catch {
      // ignore
    }
  }
};

/**
 * Sets the active global brand color (backward compatibility), mapping to presets where possible.
 */
export const setGlobalBrandColor = (color: string | null | undefined): void => {
  if (!color) return;
  const target = color.trim().toLowerCase();
  const matched = THEME_COLOR_PRESETS.find(
    (p) =>
      p.id.toLowerCase() === target ||
      p.light.accent.toLowerCase() === target ||
      p.dark.accent.toLowerCase() === target,
  );

  if (matched) {
    setThemePreset(matched.id);
  } else {
    // Treat as custom accent
    setCustomThemeColors("light", { accent: color });
    setCustomThemeColors("dark", { accent: adjustHexForDarkMode(color) });
  }
};

/**
 * Returns the comprehensive theme color tokens for the specified color mode.
 *
 * Implements the triad:
 * - dominant: Neutral background color (white, off-white, or dark charcoal).
 * - secondary: Structural elements like cards, headers, or text (dark gray, navy, or secondary tones).
 * - accent: Call-to-action buttons, links, and highlights (bright blue, orange, or green).
 *
 * Mapping requested by design:
 * - background: dominant
 * - primary: accent
 * - secondary: secondary
 */
export const getColors = (
  mode?: "light" | "dark" | "system" | undefined,
  overrideBrandColor?: string | null,
) => {
  const isDark = mode === "dark";
  const preset = getActiveThemePreset();
  const baseVariant = isDark ? preset.dark : preset.light;
  const overrides = isDark ? customThemeOverrides.dark : customThemeOverrides.light;

  const dominant = overrides?.dominant || baseVariant.dominant;
  const secondary = overrides?.secondary || baseVariant.secondary;
  let accent = overrides?.accent || baseVariant.accent;

  if (overrideBrandColor && overrideBrandColor.trim()) {
    accent = resolveBrandColor(overrideBrandColor, mode);
  }

  const surface = overrides?.surface || baseVariant.surface;

  return {
    // Core design triad
    dominant,
    secondary,
    accent,

    // Design system aliases
    background: dominant,
    primary: accent,

    // Structural elements & surfaces
    surface,
    cardBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    textPrimary: isDark ? "#f8fafc" : "#0f172a",
    textSecondary: secondary,
    textMuted: isDark ? "#64748b" : "#94a3b8",

    // Semantic palette
    white: "#ffffff",
    black: "#1a1a1a",
    error: isDark ? "#ff4757" : "#c70030",
    success: isDark ? "#2ecc71" : "#28a745",
    warning: isDark ? "#ff6b6b" : "#ff4545",
    info: isDark ? "#74d4f5" : "#5BC0DE",
    undefined: undefined,
    transparentWhite:
      isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.5)",
    transparentBlack:
      isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(40, 40, 40, 0.5)",
    transparent: "transparent",
    light: isDark ? "#1a1a1a" : "#ffffff",
    dark: isDark ? "#f5f5f5" : "#1a1a1a",
  };
};

// Default light mode colors for backward compatibility
export const colors = getColors("light");

export const hoverColor = (color: string) => {
  return color + "CC";
};

// Apply CSS variables on module load
if (typeof window !== "undefined") {
  try {
    applyThemeCssVariables();
  } catch {
    // ignore
  }
}