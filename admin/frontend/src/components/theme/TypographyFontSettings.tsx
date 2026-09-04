import React, { useState } from "react";
import {
  Box,
  Stack,
  Grid,
  Alert,
  Input,
  Sheet,
  Switch,
  Chip,
  Divider,
} from "@mui/joy";
import {
  Type,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { useTypography } from "../../hooks/useTypography";
import { useThemeColors } from "../../hooks/useThemeColors";
import Typography from "../ui/Typography";
import Button from "../ui/Button";
import Container from "../ui/Container";
import type { FontCategory } from "../../utils/Fonts";

interface TypographyFontSettingsProps {
  onSettingSaved?: (key: string, value: unknown) => void;
}

export const TypographyFontSettings: React.FC<TypographyFontSettingsProps> = ({
  onSettingSaved,
}) => {
  const {
    fontFamily,
    headingFontFamily,
    fontScale,
    activePresetId,
    availableFonts,
    presets,
    setFontFamily,
    setHeadingFontFamily,
    setFontScale,
    setTypographyPreset,
    resetToDefaults,
    saveToDatabase,
    isSaving,
    isDirty,
  } = useTypography();

  const { colors } = useThemeColors();

  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  // Filter category for font list
  const [selectedCategory, setSelectedCategory] = useState<FontCategory | "all">("all");

  // Separate heading toggle state
  const isSeparateHeading = fontFamily !== headingFontFamily;
  const [useSeparateHeading, setUseSeparateHeading] = useState<boolean>(isSeparateHeading);

  // Live playground editable text
  const [previewHeadline, setPreviewHeadline] = useState<string>(
    "Enterprise Access Control & Modern Cloud Infrastructure",
  );
  const [previewBody, setPreviewBody] = useState<string>(
    "Experience next-generation role-based security, instant authorization decisions, and real-time observability engineered for high-performance distributed systems.",
  );

  const handleSelectPrimaryFont = (name: string) => {
    setFontFamily(name);
    if (!useSeparateHeading) {
      setHeadingFontFamily(name);
    }
  };

  const handleToggleSeparateHeading = (checked: boolean) => {
    setUseSeparateHeading(checked);
    if (!checked) {
      setHeadingFontFamily(fontFamily);
    }
  };

  const handleSaveDefault = async () => {
    try {
      await saveToDatabase();
      onSettingSaved?.("appearance.font_family", fontFamily);
      onSettingSaved?.("appearance.heading_font_family", headingFontFamily);
      setFeedbackMsg({
        type: "success",
        text: `Workspace typography saved! Primary font: "${fontFamily}", Heading font: "${headingFontFamily}".`,
      });
      setTimeout(() => setFeedbackMsg(null), 4500);
    } catch (err) {
      setFeedbackMsg({
        type: "danger",
        text:
          err instanceof Error
            ? err.message
            : "Failed to persist typography setting to database.",
      });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setUseSeparateHeading(false);
    setFeedbackMsg({
      type: "success",
      text: "Typography reverted to factory defaults (Plus Jakarta Sans).",
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const filteredFonts = availableFonts.filter((f) =>
    selectedCategory === "all" ? true : f.category === selectedCategory,
  );

  return (
    <Stack spacing={3} sx={{ mb: 4 }}>
      {/* ─── 1. Header Banner & Quick Controls ───────────────────── */}
      <Container
        elevation={0}
        radius="12px"
        padding="1.5rem"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: colors.accent,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Type size={18} />
              </Box>
              <Typography variant="header" size="md" bold>
                Website Typography &amp; Dynamic Font Settings
              </Typography>
            </Stack>
            <Typography variant="body" size="xs" color="secondary">
              Select, test, and apply Google Font typefaces dynamically across the
              entire web application. Changes take effect in real-time.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button
              size="sm"
              variant="outlined"
              colorScheme="secondary"
              onClick={handleReset}
              startDecorator={<RotateCcw size={14} />}
              sx={{ borderRadius: "6px", fontSize: "0.775rem" }}
            >
              Reset Default
            </Button>

            <Button
              size="sm"
              variant="solid"
              colorScheme="primary"
              disabled={isSaving}
              onClick={handleSaveDefault}
              startDecorator={<Save size={14} />}
              sx={{
                borderRadius: "6px",
                fontSize: "0.775rem",
                fontWeight: 600,
                boxShadow: isDirty ? "0 0 10px rgba(24, 94, 224, 0.4)" : "none",
              }}
            >
              {isSaving ? "Saving..." : isDirty ? "Save as Default *" : "Save Default"}
            </Button>
          </Stack>
        </Stack>

        {feedbackMsg && (
          <Alert
            color={feedbackMsg.type}
            variant="soft"
            sx={{ mt: 2, borderRadius: "6px", fontSize: "0.825rem" }}
            startDecorator={
              feedbackMsg.type === "success" ? <CheckCircle2 size={16} /> : undefined
            }
          >
            {feedbackMsg.text}
          </Alert>
        )}

        {/* Current Typography Badges */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: `1px solid ${colors.cardBorder}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" size="xs" color="secondary" bold>
              ACTIVE BODY FONT:
            </Typography>
            <Chip
              size="sm"
              variant="soft"
              color="primary"
              sx={{
                fontFamily: `var(--font-primary)`,
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            >
              {fontFamily}
            </Chip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" size="xs" color="secondary" bold>
              ACTIVE HEADINGS FONT:
            </Typography>
            <Chip
              size="sm"
              variant="soft"
              color="primary"
              sx={{
                fontFamily: `var(--font-heading)`,
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {headingFontFamily}
            </Chip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
            <Typography variant="caption" size="xs" color="secondary">
              Scale:
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              bold
              sx={{ fontFamily: "var(--font-code)" }}
            >
              {Math.round(fontScale * 100)}%
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* ─── 2. Curated Typography Pairings (Presets) ────────────── */}
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Sparkles size={16} color={colors.accent} />
            <Typography variant="body" size="sm" bold>
              Curated Pairing Presets
            </Typography>
            <Typography variant="caption" size="xs" color="secondary">
              (One-click harmonious typeface combinations)
            </Typography>
          </Stack>
        </Stack>

        <Grid container spacing={1.5}>
          {presets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <Grid key={preset.id} xs={12} sm={6} md={4}>
                <Sheet
                  component="button"
                  type="button"
                  onClick={() => {
                    setTypographyPreset(preset.id);
                    setUseSeparateHeading(preset.primaryFont !== preset.headingFont);
                  }}
                  variant={isSelected ? "solid" : "outlined"}
                  color={isSelected ? "primary" : "neutral"}
                  sx={{
                    width: "100%",
                    textAlign: "left",
                    p: 1.75,
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    bgcolor: isSelected ? "primary.softBg" : colors.surface,
                    borderColor: isSelected
                      ? colors.accent
                      : "var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
                    borderWidth: isSelected ? "2px" : "1px",
                    "&:hover": {
                      borderColor: colors.accent,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.75 }}
                  >
                    <Typography
                      variant="body"
                      size="xs"
                      bold
                      sx={{
                        color: isSelected ? colors.accent : "text.primary",
                      }}
                    >
                      {preset.name}
                    </Typography>
                    {isSelected && (
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          bgcolor: colors.accent,
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={12} />
                      </Box>
                    )}
                  </Stack>

                  <Typography
                    variant="caption"
                    size="xs"
                    color="secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.35,
                      mb: 1.25,
                      minHeight: "2.5rem",
                    }}
                  >
                    {preset.description}
                  </Typography>

                  {/* Visual Typeface Specimen inside Preset Tile */}
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "6px",
                      bgcolor:
                        isSelected
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(120, 120, 120, 0.06)",
                      border: "1px dashed rgba(120, 120, 120, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: `'${preset.headingFont}', sans-serif`,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: colors.accent,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {preset.headingFont}
                    </div>
                    <div
                      style={{
                        fontFamily: `'${preset.primaryFont}', sans-serif`,
                        fontSize: "0.75rem",
                        color: colors.textSecondary,
                        marginTop: "2px",
                      }}
                    >
                      Body: {preset.primaryFont}
                    </div>
                  </Box>
                </Sheet>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* ─── 3. Primary & Heading Font Selectors ──────────────────── */}
      <Grid container spacing={3}>
        {/* Left Column: Font Family Picker */}
        <Grid xs={12} lg={7}>
          <Container
            elevation={0}
            radius="12px"
            padding="1.5rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
              height: "100%",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="header" size="xs" bold>
                  1. Choose Primary Body Font
                </Typography>
                <Typography variant="caption" size="xs" color="secondary">
                  Applies to application text, buttons, navigation, and form inputs.
                </Typography>
              </Box>

              {/* Category Filter Chips */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {(["all", "sans-serif", "serif", "monospace"] as const).map((cat) => (
                  <Chip
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? "solid" : "outlined"}
                    color="neutral"
                    onClick={() => setSelectedCategory(cat)}
                    sx={{
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat}
                  </Chip>
                ))}
              </Stack>
            </Stack>

            {/* Font Grid */}
            <Grid container spacing={1.25} sx={{ mb: 3 }}>
              {filteredFonts.map((f) => {
                const isCurrent = fontFamily.toLowerCase() === f.name.toLowerCase();
                return (
                  <Grid key={f.id} xs={12} sm={6}>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => handleSelectPrimaryFont(f.name)}
                      sx={{
                        width: "100%",
                        p: "0.9rem 1rem",
                        textAlign: "left",
                        borderRadius: "8px",
                        bgcolor: isCurrent ? "rgba(24, 94, 224, 0.08)" : "transparent",
                        border: isCurrent
                          ? `2px solid ${colors.accent}`
                          : "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.1))",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: colors.accent,
                          bgcolor: "rgba(24, 94, 224, 0.04)",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <span
                          style={{
                            fontFamily: `'${f.name}', sans-serif`,
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: isCurrent ? colors.accent : colors.textPrimary,
                          }}
                        >
                          {f.name}
                        </span>
                        <Chip
                          size="sm"
                          variant="plain"
                          sx={{ fontSize: "0.65rem", textTransform: "uppercase" }}
                        >
                          {f.category}
                        </Chip>
                      </Stack>
                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{
                          fontSize: "0.72rem",
                          mt: 0.3,
                          display: "block",
                          lineHeight: 1.3,
                        }}
                      >
                        {f.description}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Separate Heading Font Configuration */}
            <Box sx={{ mb: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Box>
                  <Typography variant="body" size="xs" bold>
                    2. Distinct Heading Font Pair
                  </Typography>
                  <Typography variant="caption" size="xs" color="secondary">
                    Optionally use a specialized display, serif, or grotesk typeface for
                    titles and headers.
                  </Typography>
                </Box>
                <Switch
                  checked={useSeparateHeading}
                  onChange={(e) => handleToggleSeparateHeading(e.target.checked)}
                  color="primary"
                />
              </Stack>

              {useSeparateHeading && (
                <Grid container spacing={1}>
                  {availableFonts.map((f) => {
                    const isHeadActive =
                      headingFontFamily.toLowerCase() === f.name.toLowerCase();
                    return (
                      <Grid key={f.id} xs={6} sm={4}>
                        <Button
                          size="sm"
                          fullWidth
                          variant={isHeadActive ? "solid" : "outlined"}
                          colorScheme="primary"
                          onClick={() => setHeadingFontFamily(f.name)}
                          sx={{
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            justifyContent: "flex-start",
                            fontFamily: `'${f.name}', sans-serif`,
                            fontWeight: isHeadActive ? 700 : 500,
                            py: 0.6,
                          }}
                        >
                          {f.name}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Font Scale Multiplier */}
            <Box>
              <Typography variant="body" size="xs" bold sx={{ mb: 0.5 }}>
                3. Base Typography Scale
              </Typography>
              <Typography variant="caption" size="xs" color="secondary" sx={{ mb: 1.5 }}>
                Proportionally scale application type sizing for higher density or
                increased legibility.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {[
                  { label: "Compact (95%)", value: 0.95 },
                  { label: "Standard (100%)", value: 1.0 },
                  { label: "Spacious (105%)", value: 1.05 },
                ].map((s) => (
                  <Button
                    key={s.value}
                    size="sm"
                    variant={Math.abs(fontScale - s.value) < 0.01 ? "solid" : "outlined"}
                    colorScheme="primary"
                    onClick={() => setFontScale(s.value)}
                    sx={{ borderRadius: "6px", fontSize: "0.75rem" }}
                  >
                    {s.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Container>
        </Grid>

        {/* Right Column: Interactive Live Typography Studio */}
        <Grid xs={12} lg={5}>
          <Container
            elevation={0}
            radius="12px"
            padding="1.5rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
              borderLeft: `4px solid ${colors.accent}`,
              height: "100%",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Eye size={16} color={colors.accent} />
              <Typography variant="body" size="sm" bold>
                Live Typography Studio
              </Typography>
              <Chip size="sm" variant="soft" color="success" sx={{ fontSize: "0.65rem" }}>
                REAL-TIME
              </Chip>
            </Stack>

            <Typography variant="caption" size="xs" color="secondary" sx={{ mb: 2 }}>
              Type custom text to evaluate readability, letterforms, and weight
              proportions in real-time.
            </Typography>

            {/* Custom Input Editor */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="label" size="xs" color="secondary" bold>
                  Test Custom Title:
                </Typography>
                <Input
                  size="sm"
                  value={previewHeadline}
                  onChange={(e) => setPreviewHeadline(e.target.value)}
                  placeholder="Enter custom title..."
                  sx={{ mt: 0.5, borderRadius: "6px", fontSize: "0.8rem" }}
                />
              </Box>

              <Box>
                <Typography variant="label" size="xs" color="secondary" bold>
                  Test Custom Body Copy:
                </Typography>
                <Input
                  size="sm"
                  value={previewBody}
                  onChange={(e) => setPreviewBody(e.target.value)}
                  placeholder="Enter custom body..."
                  sx={{ mt: 0.5, borderRadius: "6px", fontSize: "0.8rem" }}
                />
              </Box>
            </Stack>

            {/* Live Render Canvas */}
            <Box
              sx={{
                p: 2.25,
                borderRadius: "10px",
                bgcolor: colors.dominant,
                border: `1px solid ${colors.cardBorder}`,
                mb: 2.5,
              }}
            >
              {/* Heading Specimen */}
              <div
                style={{
                  fontFamily: `var(--font-heading)`,
                  fontSize: `clamp(1.25rem, 2vw, 1.6rem)`,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  color: colors.textPrimary,
                  marginBottom: "0.65rem",
                  letterSpacing: "-0.015em",
                }}
              >
                {previewHeadline || "Headline Specimen"}
              </div>

              {/* Subheading */}
              <div
                style={{
                  fontFamily: `var(--font-primary)`,
                  fontSize: `0.85rem`,
                  fontWeight: 600,
                  color: colors.accent,
                  marginBottom: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Typography Preview &bull; {headingFontFamily} + {fontFamily}
              </div>

              {/* Body Specimen */}
              <div
                style={{
                  fontFamily: `var(--font-primary)`,
                  fontSize: `0.875rem`,
                  lineHeight: 1.6,
                  color: colors.textSecondary,
                  marginBottom: "1.25rem",
                }}
              >
                {previewBody}
              </div>

              {/* Sample UI Components */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Button
                  size="sm"
                  variant="solid"
                  colorScheme="primary"
                  sx={{
                    fontFamily: `var(--font-primary)`,
                    borderRadius: "6px",
                    fontSize: "0.775rem",
                  }}
                >
                  Action Button
                </Button>

                <Button
                  size="sm"
                  variant="outlined"
                  colorScheme="secondary"
                  sx={{
                    fontFamily: `var(--font-primary)`,
                    borderRadius: "6px",
                    fontSize: "0.775rem",
                  }}
                >
                  Secondary Action
                </Button>

                <Chip
                  size="sm"
                  variant="soft"
                  color="primary"
                  sx={{
                    fontFamily: `var(--font-primary)`,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                >
                  Verified 99.9%
                </Chip>
              </Stack>
            </Box>

            {/* Font Weight Specimen Strip */}
            <Box>
              <Typography variant="label" size="xs" color="secondary" bold sx={{ mb: 1 }}>
                Weight Scale ({fontFamily}):
              </Typography>
              <Stack spacing={0.5}>
                {[
                  { weight: 300, label: "Light 300" },
                  { weight: 400, label: "Regular 400" },
                  { weight: 500, label: "Medium 500" },
                  { weight: 600, label: "SemiBold 600" },
                  { weight: 700, label: "Bold 700" },
                  { weight: 800, label: "ExtraBold 800" },
                ].map((w) => (
                  <Stack
                    key={w.weight}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      p: "0.35rem 0.6rem",
                      borderRadius: "4px",
                      bgcolor: "rgba(120, 120, 120, 0.04)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-code)",
                        fontSize: "0.7rem",
                        color: colors.textSecondary,
                      }}
                    >
                      {w.label}
                    </span>
                    <span
                      style={{
                        fontFamily: `var(--font-primary)`,
                        fontWeight: w.weight,
                        fontSize: "0.85rem",
                        color: colors.textPrimary,
                      }}
                    >
                      Sphinx of black quartz, judge my vow.
                    </span>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Container>
        </Grid>
      </Grid>
    </Stack>
  );
};
