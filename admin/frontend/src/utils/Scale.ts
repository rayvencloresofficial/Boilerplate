/**
 * Screen Scaling & DPI Normalization Utility
 *
 * Provides functions to query DPI and control screen scaling cleanly on `:root`
 * without shrinking document.body or creating white margins/gaps on the sides.
 */

export interface ScreenScaleInfo {
  devicePixelRatio: number;
  currentZoom: number;
  estimatedOsScalePercent: number;
  isNormalized: boolean;
  isDesktop: boolean;
}

let isAutoScalingEnabled = false;
let resizeListenerAttached = false;
let currentMediaQuery: MediaQueryList | null = null;
let currentMediaListener: (() => void) | null = null;

/**
 * Checks if the current environment is a desktop/laptop display.
 */
export function isDesktopDevice(): boolean {
  if (typeof window === "undefined") return false;

  const isWideScreen =
    window.innerWidth >= 1024 ||
    (window.screen && window.screen.width >= 1024);

  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || "",
    );

  return isWideScreen && !isMobileUA;
}

/**
 * Computes the inverse zoom factor for high-DPI scaling if requested.
 */
export function calculateNormalizedZoom(): number {
  if (typeof window === "undefined") return 1;

  const isDesktop = isDesktopDevice();
  const dpr = window.devicePixelRatio || 1;

  if (isDesktop && dpr > 1) {
    return Number((1 / dpr).toFixed(4));
  }

  return 1;
}

/**
 * Retrieves current scale and DPI diagnostics.
 */
export function getScreenScale(): ScreenScaleInfo {
  if (typeof window === "undefined") {
    return {
      devicePixelRatio: 1,
      currentZoom: 1,
      estimatedOsScalePercent: 100,
      isNormalized: false,
      isDesktop: false,
    };
  }

  const dpr = window.devicePixelRatio || 1;
  const rootZoom =
    parseFloat(document.documentElement.style.zoom || "1") || 1;
  const isDesktop = isDesktopDevice();
  const estimatedOsScalePercent = Math.round(dpr * 100);
  const normalizedZoom = calculateNormalizedZoom();
  const isNormalized = isDesktop && Math.abs(rootZoom - normalizedZoom) < 0.02;

  return {
    devicePixelRatio: dpr,
    currentZoom: rootZoom,
    estimatedOsScalePercent,
    isNormalized,
    isDesktop,
  };
}

/**
 * Sets the zoom factor cleanly on document.documentElement (:root) so that the entire
 * viewport scales proportionally edge-to-edge with ZERO white spaces or borders.
 */
export function applyZoom(zoomFactor: number): void {
  if (typeof document === "undefined") return;

  const validZoom = Math.max(0.5, Math.min(2.0, zoomFactor));
  const zoomStr = String(validZoom);

  // Remove any zoom on body to prevent double-scaling and white margins
  if (document.body) {
    document.body.style.zoom = "";
    document.body.style.width = "100%";
    document.body.style.maxWidth = "100%";
  }

  const root = document.documentElement;
  if (root) {
    if (validZoom === 1) {
      root.style.zoom = "";
    } else {
      (root.style as unknown as Record<string, string>).zoom = zoomStr;
    }
    root.style.setProperty("--app-zoom", zoomStr);
    root.style.setProperty("--full-vh", `calc(100vh / ${zoomStr})`);
    root.style.setProperty("--full-dvh", `calc(100dvh / ${zoomStr})`);
    root.style.setProperty("--full-svh", `calc(100svh / ${zoomStr})`);
    root.style.setProperty("--app-dpr", String(window.devicePixelRatio || 1));
  }
}

/**
 * Normalizes the screen scale on desktop displays.
 *
 * @param enable Whether to enable or disable normalization (default: false)
 */
export function normalizeScreenScale(enable: boolean = true): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (!enable) {
    applyZoom(1);
    return;
  }

  const targetZoom = calculateNormalizedZoom();
  applyZoom(targetZoom);
}

/**
 * Forces a specific screen zoom percentage on the root element.
 *
 * Examples:
 * - forceScreenScale(75) -> 75% zoom factor (0.75)
 * - forceScreenScale(80) -> 80% zoom factor (0.80)
 * - forceScreenScale(100) -> 100% zoom factor (1.00)
 *
 * @param scalePercent Zoom percentage to force (e.g. 75, 80, 100)
 */
export function forceScreenScale(scalePercent: number = 100): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const zoomFactor = scalePercent > 2 ? scalePercent / 100 : scalePercent;
  applyZoom(zoomFactor);
}

/**
 * Resets the screen zoom back to default 1.0 (unzoomed).
 */
export function resetScreenScale(): void {
  applyZoom(1);
}

/**
 * Attaches real-time listeners for resolution changes and window resize events.
 */
function watchResolutionChanges(): void {
  if (typeof window === "undefined") return;

  if (currentMediaQuery && currentMediaListener) {
    if (currentMediaQuery.removeEventListener) {
      currentMediaQuery.removeEventListener("change", currentMediaListener);
    } else if (currentMediaQuery.removeListener) {
      currentMediaQuery.removeListener(currentMediaListener);
    }
  }

  try {
    const dpr = window.devicePixelRatio || 1;
    currentMediaQuery = window.matchMedia(`(resolution: ${dpr}dppx)`);
    currentMediaListener = () => {
      if (isAutoScalingEnabled) {
        normalizeScreenScale(true);
        watchResolutionChanges();
      }
    };

    if (currentMediaQuery.addEventListener) {
      currentMediaQuery.addEventListener("change", currentMediaListener);
    } else if (currentMediaQuery.addListener) {
      currentMediaQuery.addListener(currentMediaListener);
    }
  } catch {
    // Ignore unsupported matchMedia
  }
}

/**
 * Initializes the global screen scale helpers and cleans up previous body zoom.
 */
export function initScreenScaleAutoFix(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  // Ensure body zoom is reset to avoid any white margins on the sides
  if (document.body) {
    document.body.style.zoom = "";
  }

  applyZoom(1);

  if (!resizeListenerAttached) {
    const handleResize = () => {
      if (isAutoScalingEnabled) {
        normalizeScreenScale(true);
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    watchResolutionChanges();
    resizeListenerAttached = true;
  }

  // Expose global helpers to window for easy debugging & testing
  if (typeof window !== "undefined") {
    window.forceScreenScale = forceScreenScale;
    window.normalizeScreenScale = normalizeScreenScale;
    window.resetScreenScale = resetScreenScale;
    window.getScreenScale = getScreenScale;
  }

  return () => {
    isAutoScalingEnabled = false;
  };
}

// Global TypeScript declarations for window
declare global {
  interface Window {
    forceScreenScale?: typeof forceScreenScale;
    normalizeScreenScale?: typeof normalizeScreenScale;
    resetScreenScale?: typeof resetScreenScale;
    getScreenScale?: typeof getScreenScale;
  }
}
