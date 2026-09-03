import React, { useState } from "react";
import { Box, Stack, Grid, Alert, Input } from "@mui/joy";
import {
  Palette,
  Sun,
  Moon,
  Check,
  Sparkles,
  Sliders,
  Save,
  RotateCcw,
  Layers,
  Zap,
} from "lucide-react";
import { useThemeColors } from "../../hooks/useThemeColors";
import { updateSettingApi } from "../../services/settings.api";
import Typography from "../ui/Typography";
import Button from "../ui/Button";
import Container from "../ui/Container";

interface ThemeColorSettingsProps {
  onSettingSaved?: (key: string, value: unknown) => void;
}

export const ThemeColorSettings: React.FC<ThemeColorSettingsProps> = ({
  onSettingSaved,
}) => {
  const {
    mode,
    setMode,
    colors,
    activePreset,
    activePresetId,
    presets,
    setThemePreset,
    setCustomThemeColors,
  } = useThemeColors();

  const [isSavingDb, setIsSavingDb] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [showCustomTuning, setShowCustomTuning] = useState<boolean>(false);

  // Custom fine tuning states initialized from active preset
  const activeVariant = mode === "dark" ? activePreset.dark : activePreset.light;
  const [customDominant, setCustomDominant] = useState<string>(activeVariant.dominant);
  const [customSecondary, setCustomSecondary] = useState<string>(activeVariant.secondary);
  const [customAccent, setCustomAccent] = useState<string>(activeVariant.accent);

  const handleSelectPreset = (presetId: string) => {
    setThemePreset(presetId);
    const chosen = presets.find((p) => p.id === presetId);
    if (chosen) {
      const v = mode === "dark" ? chosen.dark : chosen.light;
      setCustomDominant(v.dominant);
      setCustomSecondary(v.secondary);
      setCustomAccent(v.accent);
    }
  };

  const handleApplyCustom = () => {
    setCustomThemeColors(mode, {
      dominant: customDominant,
      secondary: customSecondary,
      accent: customAccent,
      surface: mode === "dark" ? "#111827" : "#ffffff",
    });
    setSaveSuccessMsg(`Custom ${mode} mode colors applied locally.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveToDatabase = async () => {
    setIsSavingDb(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);
    try {
      // Save active preset light accent color to database setting appearance.brand_color
      await updateSettingApi("appearance.brand_color", {
        value: activePreset.light.accent,
      });
      onSettingSaved?.("appearance.brand_color", activePreset.light.accent);
      setSaveSuccessMsg(
        `Workspace default theme updated to "${activePreset.name}" (${activePreset.light.accent}).`,
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      setSaveErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to persist theme setting to database.",
      );
    } finally {
      setIsSavingDb(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ mb: 4 }}>
      {/* 1. Header Banner & Mode Quick Switch */}
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
                <Palette size={18} />
              </Box>
              <Typography variant="header" size="md" bold>
                Theme Color Settings &amp; Triad Presets
              </Typography>
            </Stack>
            <Typography variant="body" size="xs" color="secondary">
              Theme architecture based on <b>Dominant</b> (canvas background),{" "}
              <b>Secondary</b> (structural headers &amp; cards), and <b>Accent</b>{" "}
              (primary CTA buttons &amp; links).
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Quick Dark/Light Switcher */}
            <Button
              size="sm"
              variant="outlined"
              colorScheme="secondary"
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              startDecorator={mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              sx={{
                borderRadius: "6px",
                fontSize: "0.775rem",
                textTransform: "capitalize",
              }}
            >
              Mode: {mode}
            </Button>

            <Button
              size="sm"
              variant={showCustomTuning ? "solid" : "outlined"}
              colorScheme="primary"
              onClick={() => setShowCustomTuning((prev) => !prev)}
              startDecorator={<Sliders size={14} />}
              sx={{ borderRadius: "6px", fontSize: "0.775rem" }}
            >
              Fine-Tune
            </Button>

            <Button
              size="sm"
              variant="solid"
              colorScheme="primary"
              disabled={isSavingDb}
              onClick={handleSaveToDatabase}
              startDecorator={<Save size={14} />}
              sx={{ borderRadius: "6px", fontSize: "0.775rem" }}
            >
              {isSavingDb ? "Saving..." : "Save Default"}
            </Button>
          </Stack>
        </Stack>

        {saveSuccessMsg && (
          <Alert color="success" variant="soft" sx={{ mt: 2, borderRadius: "6px" }}>
            {saveSuccessMsg}
          </Alert>
        )}

        {saveErrorMsg && (
          <Alert color="danger" variant="soft" sx={{ mt: 2, borderRadius: "6px" }}>
            {saveErrorMsg}
          </Alert>
        )}
      </Container>

      {/* 2. Triad Architectural Concept Legend */}
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <Container
            elevation={0}
            radius="10px"
            padding="1.25rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
              borderLeft: `4px solid ${colors.dominant}`,
            }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    bgcolor: colors.dominant,
                    border: "1px solid rgba(120, 120, 120, 0.4)",
                  }}
                />
                <Typography variant="body" size="xs" bold>
                  1. Dominant (Background)
                </Typography>
              </Stack>
              <Typography variant="caption" size="xs" color="secondary">
                Neutral background canvas: white or off-white in light mode, dark charcoal in dark mode.
              </Typography>
              <Typography
                variant="caption"
                size="xs"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  fontSize: "0.72rem",
                  color: colors.accent,
                  fontWeight: 600,
                }}
              >
                Current: {colors.dominant}
              </Typography>
            </Stack>
          </Container>
        </Grid>

        <Grid xs={12} md={4}>
          <Container
            elevation={0}
            radius="10px"
            padding="1.25rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
              borderLeft: `4px solid ${colors.secondary}`,
            }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "4px",
                    bgcolor: colors.secondary,
                  }}
                />
                <Typography variant="body" size="xs" bold>
                  2. Secondary (Structural)
                </Typography>
              </Stack>
              <Typography variant="caption" size="xs" color="secondary">
                Structural elements: card headers, subheadings, subtle borders, and medium-contrast text.
              </Typography>
              <Typography
                variant="caption"
                size="xs"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  fontSize: "0.72rem",
                  color: colors.secondary,
                  fontWeight: 600,
                }}
              >
                Current: {colors.secondary}
              </Typography>
            </Stack>
          </Container>
        </Grid>

        <Grid xs={12} md={4}>
          <Container
            elevation={0}
            radius="10px"
            padding="1.25rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
              borderLeft: `4px solid ${colors.accent}`,
            }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "4px",
                    bgcolor: colors.accent,
                  }}
                />
                <Typography variant="body" size="xs" bold>
                  3. Accent (Primary CTA)
                </Typography>
              </Stack>
              <Typography variant="caption" size="xs" color="secondary">
                Interactive actions: call-to-action buttons, active navigation, hyperlinks, and badges.
              </Typography>
              <Typography
                variant="caption"
                size="xs"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  fontSize: "0.72rem",
                  color: colors.accent,
                  fontWeight: 700,
                }}
              >
                Current: {colors.accent}
              </Typography>
            </Stack>
          </Container>
        </Grid>
      </Grid>

      {/* 3. Custom Fine-Tuning Drawer (Collapsible) */}
      {showCustomTuning && (
        <Container
          elevation={0}
          radius="10px"
          padding="1.25rem"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <Typography variant="body" size="sm" bold sx={{ mb: 1.5 }}>
            Fine-Tune Mode Colors ({mode.toUpperCase()} MODE)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} sm={4}>
              <Typography variant="caption" size="xs" color="secondary" sx={{ mb: 0.5 }}>
                Dominant Canvas:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <input
                  type="color"
                  value={customDominant}
                  onChange={(e) => setCustomDominant(e.target.value)}
                  style={{
                    width: 38,
                    height: 38,
                    padding: 0,
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                />
                <Input
                  size="sm"
                  value={customDominant}
                  onChange={(e) => setCustomDominant(e.target.value)}
                  sx={{ fontFamily: "var(--font-code, monospace)" }}
                />
              </Stack>
            </Grid>

            <Grid xs={12} sm={4}>
              <Typography variant="caption" size="xs" color="secondary" sx={{ mb: 0.5 }}>
                Secondary Structure:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <input
                  type="color"
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  style={{
                    width: 38,
                    height: 38,
                    padding: 0,
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                />
                <Input
                  size="sm"
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  sx={{ fontFamily: "var(--font-code, monospace)" }}
                />
              </Stack>
            </Grid>

            <Grid xs={12} sm={4}>
              <Typography variant="caption" size="xs" color="secondary" sx={{ mb: 0.5 }}>
                Accent CTA:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  style={{
                    width: 38,
                    height: 38,
                    padding: 0,
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                />
                <Input
                  size="sm"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  sx={{ fontFamily: "var(--font-code, monospace)" }}
                />
              </Stack>
            </Grid>

            <Grid xs={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="sm"
                  variant="outlined"
                  colorScheme="secondary"
                  onClick={() => {
                    const v = mode === "dark" ? activePreset.dark : activePreset.light;
                    setCustomDominant(v.dominant);
                    setCustomSecondary(v.secondary);
                    setCustomAccent(v.accent);
                  }}
                  startDecorator={<RotateCcw size={13} />}
                >
                  Reset to Preset
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  colorScheme="primary"
                  onClick={handleApplyCustom}
                  startDecorator={<Zap size={13} />}
                >
                  Apply Custom Tuning
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      )}

      {/* 4. Theme Color Presets Grid */}
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="body" size="sm" bold>
            Available Theme Color Presets ({presets.length})
          </Typography>
          <Typography variant="caption" size="xs" color="secondary">
            Click any palette card to activate live in both Light &amp; Dark modes
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {presets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            const currentVariant = mode === "dark" ? preset.dark : preset.light;

            return (
              <Grid key={preset.id} xs={12} sm={6} md={3}>
                <Box
                  onClick={() => handleSelectPreset(preset.id)}
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    cursor: "pointer",
                    position: "relative",
                    bgcolor: colors.surface,
                    border: isSelected
                      ? `2px solid ${colors.accent}`
                      : `1px solid ${colors.cardBorder}`,
                    boxShadow: isSelected
                      ? `0 0 0 2px ${colors.accent}20`
                      : "none",
                    transition: "all 0.18s ease-in-out",
                    "&:hover": {
                      borderColor: colors.accent,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: colors.accent,
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </Box>
                  )}

                  <Typography variant="body" size="xs" bold sx={{ mb: 0.5 }}>
                    {preset.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    size="xs"
                    color="secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.5em",
                      mb: 1.5,
                      fontSize: "0.72rem",
                    }}
                  >
                    {preset.description}
                  </Typography>

                  {/* Live Mini Preview Box */}
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: "6px",
                      bgcolor: currentVariant.dominant,
                      border: "1px solid rgba(120, 120, 120, 0.2)",
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: "55%",
                        height: 7,
                        borderRadius: "2px",
                        bgcolor: currentVariant.secondary,
                        mb: 1,
                      }}
                    />
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1,
                        py: 0.25,
                        borderRadius: "3px",
                        bgcolor: currentVariant.accent,
                        color: "#ffffff",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                      }}
                    >
                      CTA Button
                    </Box>
                  </Box>

                  {/* Swatch Chips: Dominant | Secondary | Accent */}
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Box
                      title={`Dominant: ${currentVariant.dominant}`}
                      sx={{
                        flex: 1,
                        height: 18,
                        borderRadius: "4px",
                        bgcolor: currentVariant.dominant,
                        border: "1px solid rgba(120, 120, 120, 0.3)",
                      }}
                    />
                    <Box
                      title={`Secondary: ${currentVariant.secondary}`}
                      sx={{
                        flex: 1,
                        height: 18,
                        borderRadius: "4px",
                        bgcolor: currentVariant.secondary,
                      }}
                    />
                    <Box
                      title={`Accent: ${currentVariant.accent}`}
                      sx={{
                        flex: 1,
                        height: 18,
                        borderRadius: "4px",
                        bgcolor: currentVariant.accent,
                      }}
                    />
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* 5. Live UI Component Sandbox */}
      <Container
        elevation={0}
        radius="10px"
        padding="1.5rem"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Sparkles size={16} style={{ color: colors.accent }} />
          <Typography variant="body" size="xs" bold>
            Live Component Preview Harness
          </Typography>
        </Stack>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "8px",
            bgcolor: colors.dominant,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="header"
                size="sm"
                bold
                sx={{ color: colors.secondary, mb: 0.5 }}
              >
                Sample Structural Header (Secondary Tone)
              </Typography>
              <Typography variant="body" size="xs" sx={{ color: colors.secondary }}>
                This card canvas renders the neutral <b>Dominant</b> background.
                All text elements adapt to the calibrated <b>Secondary</b> tone.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="sm"
                variant="solid"
                colorScheme="primary"
                startDecorator={<Layers size={13} />}
              >
                Primary Accent Button
              </Button>
              <Button size="sm" variant="outlined" colorScheme="primary">
                Outlined Accent
              </Button>
              <Button size="sm" variant="soft" colorScheme="primary">
                Soft Accent
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Stack>
  );
};
