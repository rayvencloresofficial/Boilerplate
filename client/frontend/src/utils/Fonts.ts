export type FontCategory = "sans-serif" | "serif" | "monospace";

export interface FontDefinition {
  id: string;
  name: string;
  category: FontCategory;
  description: string;
  weights: number[];
  googleFontFamily: string;
  previewText?: string;
}

export interface TypographyPreset {
  id: string;
  name: string;
  description: string;
  primaryFont: string;
  headingFont: string;
  fontScale: number;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily: string;
  fontScale: number;
}

export const AVAILABLE_FONTS: FontDefinition[] = [
  // ─── Sans-Serif / Clean UI ────────────────────────────────
  {
    id: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    category: "sans-serif",
    description: "Modern, geometric, and balanced. The SaaS industry gold standard.",
    weights: [300, 400, 500, 600, 700, 800],
    googleFontFamily: "Plus+Jakarta+Sans:wght@300;400;500;600;700;800",
  },
  {
    id: "inter",
    name: "Inter",
    category: "sans-serif",
    description: "Ultra-legible, crisp, and neutral. Engineered specifically for computer screens.",
    weights: [300, 400, 500, 600, 700, 800],
    googleFontFamily: "Inter:wght@300;400;500;600;700;800",
  },
  {
    id: "outfit",
    name: "Outfit",
    category: "sans-serif",
    description: "Contemporary, sleek, and brand-forward with distinctive geometric curves.",
    weights: [300, 400, 500, 600, 700, 800],
    googleFontFamily: "Outfit:wght@300;400;500;600;700;800",
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "sans-serif",
    description: "Friendly, geometric sans with circular forms. High personality for headers.",
    weights: [300, 400, 500, 600, 700, 800],
    googleFontFamily: "Poppins:wght@300;400;500;600;700;800",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "sans-serif",
    description: "Low-contrast, warm, and highly readable for dense dashboards and data.",
    weights: [300, 400, 500, 600, 700, 800],
    googleFontFamily: "DM+Sans:wght@300;400;500;600;700;800",
  },
  {
    id: "manrope",
    name: "Manrope",
    category: "sans-serif",
    description: "Semi-geometric modern crossover. Open letters with high legibility.",
    weights: [300, 400, 500, 600, 700, 800],
    googleFontFamily: "Manrope:wght@300;400;500;600;700;800",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "sans-serif",
    description: "Tech-focused, idiosyncratic, and modern. Excellent for developer-first products.",
    weights: [300, 400, 500, 600, 700],
    googleFontFamily: "Space+Grotesk:wght@300;400;500;600;700",
  },
  {
    id: "roboto",
    name: "Roboto",
    category: "sans-serif",
    description: "Classic neo-grotesque sans-serif with natural reading rhythm.",
    weights: [300, 400, 500, 700],
    googleFontFamily: "Roboto:wght@300;400;500;700",
  },

  // ─── Modern Serif / Editorial & Luxury ─────────────────────
  {
    id: "playfair-display",
    name: "Playfair Display",
    category: "serif",
    description: "High-contrast editorial serif. Exudes sophistication and editorial prestige.",
    weights: [400, 500, 600, 700, 800],
    googleFontFamily: "Playfair+Display:ital,wght@0,400..800;1,400..800",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    category: "serif",
    description: "Pleasant to read on screens with mildly condensed letterforms and sturdy serifs.",
    weights: [300, 400, 700],
    googleFontFamily: "Merriweather:wght@300;400;700",
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    description: "Well-balanced contemporary serif with brushed curves and poetic typography.",
    weights: [400, 500, 600, 700],
    googleFontFamily: "Lora:ital,wght@0,400..700;1,400..700",
  },

  // ─── Monospace / Technical ────────────────────────────────
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    category: "monospace",
    description: "Engineered specifically for developers. Increased letter height and crisp shapes.",
    weights: [400, 500, 600, 700],
    googleFontFamily: "JetBrains+Mono:wght@400;500;600;700",
  },
  {
    id: "fira-code",
    name: "Fira Code",
    category: "monospace",
    description: "Beloved technical monospace with clean geometry and clear digit distinction.",
    weights: [400, 500, 600, 700],
    googleFontFamily: "Fira+Code:wght@400;500;600;700",
  },
];

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: "modern-saas",
    name: "Modern SaaS (Default)",
    description: "Plus Jakarta Sans for both headings and body. Clean, contemporary, and cohesive.",
    primaryFont: "Plus Jakarta Sans",
    headingFont: "Plus Jakarta Sans",
    fontScale: 1.0,
  },
  {
    id: "clean-minimalist",
    name: "Clean Minimalist",
    description: "Inter throughout the entire UI. Neutral, surgical, and maximum data legibility.",
    primaryFont: "Inter",
    headingFont: "Inter",
    fontScale: 1.0,
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Distinctive Space Grotesk headings paired with ultra-crisp Inter body copy.",
    primaryFont: "Inter",
    headingFont: "Space Grotesk",
    fontScale: 1.0,
  },
  {
    id: "editorial-prestige",
    name: "Editorial Prestige",
    description: "Sophisticated Playfair Display titles with Plus Jakarta Sans body ergonomics.",
    primaryFont: "Plus Jakarta Sans",
    headingFont: "Playfair Display",
    fontScale: 1.02,
  },
  {
    id: "friendly-brand",
    name: "Friendly Geometric",
    description: "Rounded, welcoming Poppins headings paired with warm, accessible DM Sans body.",
    primaryFont: "DM Sans",
    headingFont: "Poppins",
    fontScale: 1.0,
  },
  {
    id: "futuristic-studio",
    name: "Futuristic Studio",
    description: "Cutting-edge Outfit headings anchored by versatile Manrope body typography.",
    primaryFont: "Manrope",
    headingFont: "Outfit",
    fontScale: 1.0,
  },
  {
    id: "developer-terminal",
    name: "Developer Terminal",
    description: "JetBrains Mono for titles and code paired with Inter for interface clarity.",
    primaryFont: "Inter",
    headingFont: "JetBrains Mono",
    fontScale: 0.98,
  },
];

const DEFAULT_PRIMARY = "Plus Jakarta Sans";
const DEFAULT_HEADING = "Plus Jakarta Sans";
const DEFAULT_SCALE = 1.0;

const loadedFontFamilies = new Set<string>();

/**
 * Dynamically injects Google Font link element if not already present in the DOM.
 */
export function loadGoogleFont(fontName: string): void {
  if (typeof document === "undefined" || !fontName) return;

  const fontDef = AVAILABLE_FONTS.find(
    (f) => f.name.toLowerCase() === fontName.toLowerCase(),
  );

  const googleQuery = fontDef
    ? fontDef.googleFontFamily
    : `${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800`;

  const linkId = `google-font-${fontName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  if (document.getElementById(linkId) || loadedFontFamilies.has(fontName)) {
    return;
  }

  try {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${googleQuery}&display=swap`;
    document.head.appendChild(link);
    loadedFontFamilies.add(fontName);
  } catch {
    // Graceful fallback
  }
}

/**
 * Applies typography CSS variables to :root / documentElement.
 */
export function applyTypographyCssVariables(config: TypographyConfig): void {
  if (typeof document === "undefined") return;

  try {
    loadGoogleFont(config.fontFamily);
    if (config.headingFontFamily && config.headingFontFamily !== config.fontFamily) {
      loadGoogleFont(config.headingFontFamily);
    }

    const root = document.documentElement;
    const primaryFallback = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    const primaryStack = `'${config.fontFamily}', ${primaryFallback}`;
    const headingStack = config.headingFontFamily
      ? `'${config.headingFontFamily}', ${primaryStack}`
      : primaryStack;

    root.style.setProperty("--font-primary", primaryStack);
    root.style.setProperty("--font-heading", headingStack);
    root.style.setProperty("--joy-fontFamily-body", primaryStack);
    root.style.setProperty("--joy-fontFamily-display", headingStack);
    root.style.setProperty("--app-font-scale", String(config.fontScale || 1.0));
  } catch {
    // ignore
  }
}

/**
 * Retrieves the currently active typography settings from localStorage or fallback defaults.
 */
export function getStoredTypography(): TypographyConfig {
  if (typeof window === "undefined") {
    return {
      fontFamily: DEFAULT_PRIMARY,
      headingFontFamily: DEFAULT_HEADING,
      fontScale: DEFAULT_SCALE,
    };
  }

  try {
    const primary = localStorage.getItem("typography_font_family") || DEFAULT_PRIMARY;
    const heading = localStorage.getItem("typography_heading_font") || primary;
    const rawScale = localStorage.getItem("typography_font_scale");
    const scale = rawScale ? parseFloat(rawScale) : DEFAULT_SCALE;

    return {
      fontFamily: primary,
      headingFontFamily: heading,
      fontScale: isNaN(scale) ? DEFAULT_SCALE : scale,
    };
  } catch {
    return {
      fontFamily: DEFAULT_PRIMARY,
      headingFontFamily: DEFAULT_HEADING,
      fontScale: DEFAULT_SCALE,
    };
  }
}

/**
 * Persists typography config to localStorage, applies CSS variables, and broadcasts an event.
 */
export function setStoredTypography(config: Partial<TypographyConfig>): TypographyConfig {
  const current = getStoredTypography();
  const next: TypographyConfig = {
    fontFamily: config.fontFamily || current.fontFamily,
    headingFontFamily: config.headingFontFamily || current.headingFontFamily || config.fontFamily || current.fontFamily,
    fontScale: config.fontScale !== undefined ? config.fontScale : current.fontScale,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("typography_font_family", next.fontFamily);
      localStorage.setItem("typography_heading_font", next.headingFontFamily);
      localStorage.setItem("typography_font_scale", String(next.fontScale));
      applyTypographyCssVariables(next);
      window.dispatchEvent(
        new CustomEvent("typography-change", { detail: next }),
      );
    } catch {
      // ignore
    }
  }

  return next;
}

// Auto-apply stored typography on initial module evaluation in browser
if (typeof window !== "undefined") {
  try {
    const initial = getStoredTypography();
    applyTypographyCssVariables(initial);
  } catch {
    // ignore
  }
}
