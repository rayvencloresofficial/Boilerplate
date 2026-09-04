import React from "react";
import ReactDOM from "react-dom/client";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import App from "@/App";
import "@/index.css";
import { initScreenScaleAutoFix } from "@/utils/Scale";
import { ThemeProvider } from "@/context/ThemeProvider";
import { TypographyProvider } from "@/context/TypographyProvider";

// Initialize global screen scale auto-normalization for high-DPI (e.g. 125%, 150%) Windows displays
initScreenScaleAutoFix();

// ─── Global Console Error Sanitization ───────────────────
// Protects production logs from exposing internal database schemas and details.
const originalConsoleError = console.error;

function maskSensitiveWords(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/table "[^"]+"/gi, "a database resource")
    .replace(/column "[^"]+"/gi, "a field")
    .replace(
      /violates foreign key constraint [^\s]+/gi,
      "violates relationship constraints",
    )
    .replace(
      /violates check constraint [^\s]+/gi,
      "violates validation constraints",
    )
    .replace(/relation "[^"]+"/gi, "database relation");
}

function sanitizeError(err: unknown): unknown {
  if (!err) return err;
  if (typeof err === "string") {
    return maskSensitiveWords(err);
  }
  if (err instanceof Error) {
    return {
      name: err.name,
      message: maskSensitiveWords(err.message),
    };
  }
  if (typeof err === "object") {
    const errObj = err as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    if (errObj.message)
      sanitized.message = maskSensitiveWords(String(errObj.message));
    if (errObj.code) sanitized.code = errObj.code;
    if (errObj.details) sanitized.details = "Redacted for security";
    if (errObj.hint) sanitized.hint = "Redacted for security";
    if (Object.keys(sanitized).length > 0) return sanitized;

    try {
      const stringified = JSON.stringify(err);
      return JSON.parse(maskSensitiveWords(stringified));
    } catch {
      return "[Unserializable Object]";
    }
  }
  return err;
}

if (import.meta.env.PROD) {
  console.error = (message?: unknown, ...optionalParams: unknown[]) => {
    const sanitizedMsg = sanitizeError(message);
    const sanitizedParams = optionalParams.map((param) => sanitizeError(param));
    originalConsoleError(sanitizedMsg, ...sanitizedParams);
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CssVarsProvider defaultMode="light">
      <CssBaseline />
      <ThemeProvider>
        <TypographyProvider>
          <App />
        </TypographyProvider>
      </ThemeProvider>
    </CssVarsProvider>
  </React.StrictMode>,
);
