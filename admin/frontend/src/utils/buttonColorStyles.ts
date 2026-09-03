import { colors, getColors } from './Colors';

type ColorScheme = keyof ReturnType<typeof getColors>;
type Variant = 'solid' | 'outlined' | 'soft' | 'plain';

/**
 * Parses and normalizes any color (3-digit hex, 6-digit hex, rgb/rgba) to RGB components.
 */
const normalizeHexToRgb = (color: string): { r: number; g: number; b: number } => {
  if (!color || typeof color !== 'string') {
    return { r: 218, g: 80, b: 25 };
  }

  let clean = color.replace('#', '').trim();

  // 3-digit hex (#fff -> ffffff)
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  return { r: 218, g: 80, b: 25 };
};

/**
 * Generates hover color based on the base color
 * Darkens the color for solid variants and lightens for others
 *
 * @param baseColor - The base color in hex format (e.g., '#f6d33e')
 * @param variant - The button variant type
 * @returns A new color in hex format for the hover state
 */
const generateHoverColor = (baseColor: string, variant: Variant): string => {
  const { r, g, b } = normalizeHexToRgb(baseColor);

  const newR =
    variant === 'solid'
      ? Math.max(0, Math.floor(r * 0.8))
      : Math.min(255, Math.floor(r + (255 - r) * 0.3));
  const newG =
    variant === 'solid'
      ? Math.max(0, Math.floor(g * 0.8))
      : Math.min(255, Math.floor(g + (255 - g) * 0.3));
  const newB =
    variant === 'solid'
      ? Math.max(0, Math.floor(b * 0.8))
      : Math.min(255, Math.floor(b + (255 - b) * 0.3));

  const toHex = (num: number) => Math.round(num).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

/**
 * Generates background color for soft variants
 * Creates a subtle background that adapts to light/dark themes
 * Lightens the color significantly for light mode, darkens for dark mode
 *
 * @param baseColor - The base color in hex format
 * @param isDarkMode - Whether to generate color for dark mode (default: false)
 * @returns A new color in hex format suitable for soft/subtle backgrounds
 */
const generateSoftBackground = (baseColor: string, isDarkMode: boolean = false): string => {
  const { r, g, b } = normalizeHexToRgb(baseColor);

  let newR: number, newG: number, newB: number;

  if (isDarkMode) {
    newR = Math.max(0, Math.floor(r * 0.3));
    newG = Math.max(0, Math.floor(g * 0.3));
    newB = Math.max(0, Math.floor(b * 0.3));
  } else {
    newR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    newG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    newB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
  }

  const toHex = (num: number) => Math.round(num).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

/**
 * Gets the appropriate text color (white or dark) based on luminance
 * Ensures text is readable against the background color
 * Uses the relative luminance formula from WCAG guidelines
 *
 * @param baseColor - The background color in hex format
 * @returns Either black (#000000) or white (#ffffff) for optimal contrast
 */
const getTextColor = (baseColor: string): string => {
  const { r, g, b } = normalizeHexToRgb(baseColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Dynamically generates color styles for a given color scheme and variant
 * Returns theme-aware styles that respond to both light and dark modes
 * This is the main function that Button component uses to get all styling
 *
 * @param colorScheme - The color scheme from Colors.ts (e.g., 'primary', 'secondary')
 * @param variant - The button variant ('solid', 'outlined', 'soft', 'plain')
 * @param colors - The theme colors object (optional, defaults to light mode)
 * @returns An object containing all CSS styles for the button
 */
export const getColorStyles = (
  colorScheme: ColorScheme,
  variant: Variant,
  colors: ReturnType<typeof getColors> = getColors("light")
) => {
  // Step 1: Get the base color from the color palette
  const baseColor = colors[colorScheme];

  // Step 2: Validate that the color exists
  if (!baseColor) {
    console.warn(`Color scheme "${colorScheme}" not found in colors palette`);
    return {}; // Return empty object if color not found
  }

  // Step 3: Pre-generate all color variations we might need
  const hoverColor = generateHoverColor(baseColor, variant);        // Hover state color
  const softBg = generateSoftBackground(baseColor, false);          // Light mode soft background
  const softBgDark = generateSoftBackground(baseColor, true);       // Dark mode soft background
  const textColor = getTextColor(baseColor);                        // Contrasting text color

  // Step 4: Return styles based on variant type
  switch (variant) {
    // SOLID VARIANT: Full background color with contrasting text
    // Used for primary actions (e.g., "Login", "Submit")
    case 'solid':
      return {
        backgroundColor: baseColor,          // Full color background
        color: textColor,                    // Black or white text for contrast
        '&:hover': {                         // Hover state
          backgroundColor: hoverColor,       // Slightly darker version of base color
        },
      };

    // OUTLINED VARIANT: Border with transparent background
    // Used for secondary actions that need less emphasis
    case 'outlined':
      return {
        borderColor: baseColor,                // Border uses the base color
        color: baseColor,                      // Text also uses the base color
        border: `1px solid ${baseColor}`,      // Define border style
        '&:hover': {                           // Hover state
          backgroundColor: {                   // Responsive soft background on hover
            xs: softBg,                        // Light soft background for small screens
            md: softBg,                        // Same for medium+ screens
          },
          // Dark mode hover: use darker soft background
          // Note: [data-joy-color-scheme="dark"] is Joy UI's way of detecting theme
          '[data-joy-color-scheme="dark"] &': {
            backgroundColor: softBgDark,       // Darker soft background in dark mode
          },
        },
        // Dark mode base styles: keep same border and text colors
        '[data-joy-color-scheme="dark"] &': {
          borderColor: baseColor,              // Border stays same color in dark mode
          color: baseColor,                    // Text stays same color in dark mode
        },
      };

    // SOFT VARIANT: Subtle background color with colored text
    // Used for tertiary actions or active states (e.g., active nav button)
    case 'soft':
      return {
        backgroundColor: softBg,                 // Very light background in light mode
        color: baseColor,                        // Text uses full base color
        // Dark mode base styles
        '[data-joy-color-scheme="dark"] &': {
          backgroundColor: softBgDark,           // Dark subtle background in dark mode
          color: baseColor,                      // Text keeps base color
        },
        '&:hover': {                             // Hover state
          // Lighten the soft background even more on hover (light mode)
          backgroundColor: generateHoverColor(softBg, 'soft'),
          // Dark mode hover: lighten the dark soft background
          '[data-joy-color-scheme="dark"] &': {
            backgroundColor: generateHoverColor(softBgDark, 'soft'),
          },
        },
      };

    // PLAIN VARIANT: No background or border, just colored text
    // Used for minimal actions or links (e.g., navigation items)
    case 'plain':
      return {
        color: baseColor,                        // Only colored text
        backgroundColor: 'transparent',          // No background
        // Dark mode: text color stays the same
        '[data-joy-color-scheme="dark"] &': {
          color: baseColor,                      // Keep base color in dark mode
        },
        '&:hover': {                             // Hover state
          backgroundColor: softBg,               // Add soft background on hover (light mode)
          // Dark mode hover: use dark soft background
          '[data-joy-color-scheme="dark"] &': {
            backgroundColor: softBgDark,         // Dark soft background in dark mode
          },
        },
      };

    // DEFAULT: Return empty object if variant doesn't match
    default:
      return {};
  }
};

/*const colors = getColors("light");
  *
 * Gets all available color schemes from the colors palette
 * Filters out non-color properties and returns only valid color hex values
 */
export const getAvailableColorSchemes = (): ColorScheme[] => {
  return Object.entries(colors)
    .filter(([, value]) => typeof value === 'string' && value.startsWith('#'))
    .map(([key]) => key as ColorScheme);
};
