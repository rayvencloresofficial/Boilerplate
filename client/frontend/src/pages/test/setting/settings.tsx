import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  Stack,
  Box,
  Divider,
  Switch,
  Input,
  CircularProgress,
  Alert,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@mui/joy";
import {
  Settings as SettingsIcon,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Globe,
  Lock,
} from "lucide-react";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";
import PermissionGate from "../../../routes/PermissionGate";
import {
  getSettingsApi,
  updateSettingApi,
  createSettingApi,
  deleteSettingApi,
  type Setting,
} from "../../../services/settings.api";
import { ThemeColorSettings } from "../../../components/theme/ThemeColorSettings";
import { TypographyFontSettings } from "../../../components/theme/TypographyFontSettings";

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  // Active category filter: "all" | "general" | "security" | "appearance" | "system"
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Local draft values for edited settings
  const [draftValues, setDraftValues] = useState<Record<string, unknown>>({});
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});

  // Create Setting Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("general");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newIsPublic, setNewIsPublic] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setError(null);
      try {
        const data = await getSettingsApi();
        if (!ignore) {
          setSettings(data);
          const drafts: Record<string, unknown> = {};
          data.forEach((s) => {
            drafts[s.key] = s.value;
          });
          setDraftValues(drafts);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load system settings.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    settings.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [settings]);

  const filteredSettings = useMemo(() => {
    if (activeCategory === "all") return settings;
    return settings.filter((s) => s.category === activeCategory);
  }, [settings, activeCategory]);

  const handleUpdateBoolean = async (setting: Setting, newVal: boolean) => {
    setDraftValues((prev) => ({ ...prev, [setting.key]: newVal }));
    setSavingKeys((prev) => ({ ...prev, [setting.key]: true }));
    try {
      await updateSettingApi(setting.key, { value: newVal });
      setFeedbackMsg({
        type: "success",
        text: `Setting '${setting.key}' updated to ${newVal}.`,
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setFeedbackMsg({
        type: "danger",
        text:
          err instanceof Error
            ? err.message
            : `Failed to update '${setting.key}'.`,
      });
    } finally {
      setSavingKeys((prev) => ({ ...prev, [setting.key]: false }));
    }
  };

  const handleSaveSetting = async (setting: Setting) => {
    const val = draftValues[setting.key];
    setSavingKeys((prev) => ({ ...prev, [setting.key]: true }));
    try {
      await updateSettingApi(setting.key, { value: val });
      setFeedbackMsg({
        type: "success",
        text: `Setting '${setting.key}' saved successfully.`,
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setFeedbackMsg({
        type: "danger",
        text:
          err instanceof Error
            ? err.message
            : `Failed to save '${setting.key}'.`,
      });
    } finally {
      setSavingKeys((prev) => ({ ...prev, [setting.key]: false }));
    }
  };

  const handleDeleteSetting = async (setting: Setting) => {
    const confirmed = window.confirm(
      `Permanently delete configuration key '${setting.key}'?`,
    );
    if (!confirmed) return;

    try {
      await deleteSettingApi(setting.key);
      setFeedbackMsg({
        type: "success",
        text: `Setting '${setting.key}' deleted.`,
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setFeedbackMsg({
        type: "danger",
        text:
          err instanceof Error
            ? err.message
            : `Failed to delete '${setting.key}'.`,
      });
    }
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    let parsedVal: unknown = newValue.trim();
    try {
      parsedVal = JSON.parse(newValue.trim());
    } catch {
      // Treat as raw string if not valid JSON
    }

    try {
      await createSettingApi({
        key: newKey.trim().toLowerCase(),
        value: parsedVal,
        category: newCategory.trim().toLowerCase() || "general",
        description: newDescription.trim() || null,
        is_public: newIsPublic,
      });

      setIsCreateOpen(false);
      setNewKey("");
      setNewValue("");
      setNewDescription("");
      setNewIsPublic(false);
      setFeedbackMsg({
        type: "success",
        text: `Setting '${newKey.trim().toLowerCase()}' created successfully.`,
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create setting.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Container
        elevation={0}
        radius="12px"
        padding="1.75rem"
        style={{
          backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
          border:
            "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <SettingsIcon size={20} />
              <Typography variant="body" size="md" bold>
                System &amp; Workspace Configurations
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              Database-backed runtime environment parameters, security
              thresholds, and appearance settings.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              size="sm"
              variant="outlined"
              colorScheme="primary"
              onClick={() => {
                setIsLoading(true);
                setRefreshTrigger((prev) => prev + 1);
              }}
              startDecorator={<RefreshCw size={14} />}
              sx={{ borderRadius: "6px", fontSize: "0.775rem" }}
            >
              Reload
            </Button>

            <PermissionGate
              permission="settings:manage"
              disableOnly
              tooltipTitle="Requires 'settings:manage' permission"
            >
              <Button
                size="sm"
                variant="solid"
                colorScheme="primary"
                onClick={() => setIsCreateOpen(true)}
                startDecorator={<Plus size={15} />}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.775rem",
                  fontWeight: 600,
                }}
              >
                Add Setting
              </Button>
            </PermissionGate>
          </Stack>
        </Stack>

        {feedbackMsg && (
          <Alert
            color={feedbackMsg.type}
            variant="soft"
            sx={{ mb: 2, borderRadius: "6px", fontSize: "0.825rem" }}
            startDecorator={
              feedbackMsg.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : undefined
            }
          >
            {feedbackMsg.text}
          </Alert>
        )}

        {error && (
          <Alert
            color="danger"
            variant="soft"
            sx={{ mb: 2, borderRadius: "6px" }}
          >
            {error}
          </Alert>
        )}

        {/* Category Tabs */}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 2.5 }}>
          <Button
            size="sm"
            variant={activeCategory === "all" ? "solid" : "outlined"}
            colorScheme="primary"
            onClick={() => setActiveCategory("all")}
            sx={{
              borderRadius: "6px",
              fontSize: "0.775rem",
              fontWeight: activeCategory === "all" ? 700 : 500,
              py: 0.35,
              px: 1.25,
            }}
          >
            All Categories ({settings.length})
          </Button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <Button
                key={cat}
                size="sm"
                variant={isSelected ? "solid" : "outlined"}
                colorScheme="primary"
                onClick={() => setActiveCategory(cat)}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.775rem",
                  fontWeight: isSelected ? 700 : 500,
                  py: 0.35,
                  px: 1.25,
                  textTransform: "capitalize",
                }}
              >
                {cat}
              </Button>
            );
          })}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Theme Color Settings & Triad Presets */}
        {(activeCategory === "appearance" || activeCategory === "all") && (
          <>
            <ThemeColorSettings
              onSettingSaved={() => setRefreshTrigger((prev) => prev + 1)}
            />
            <TypographyFontSettings
              onSettingSaved={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </>
        )}

        {isLoading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress size="md" />
          </Box>
        ) : (
          <Stack spacing={1.75}>
            {filteredSettings.map((s) => {
              const isBool = typeof s.value === "boolean";
              const isSaving = !!savingKeys[s.key];
              const draftVal = draftValues[s.key];

              return (
                <Box
                  key={s.id}
                  sx={{
                    p: "1.15rem 1.25rem",
                    borderRadius: "8px",
                    bgcolor: "background.surface",
                    border:
                      "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    transition: "border-color 0.15s ease",
                    "&:hover": {
                      borderColor: "var(--color-primary, #185ee0)",
                    },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body"
                        size="xs"
                        bold
                        sx={{
                          fontFamily: "var(--font-code, monospace)",
                          color: "text.primary",
                        }}
                      >
                        {s.key}
                      </Typography>

                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{
                          fontSize: "0.68rem",
                          border:
                            "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                          px: 0.75,
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.category}
                      </Typography>

                      {s.is_public ? (
                        <Typography
                          variant="caption"
                          size="xs"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.4,
                            fontSize: "0.65rem",
                            color: "var(--color-primary, #185ee0)",
                            bgcolor: "rgba(24, 94, 224, 0.08)",
                            px: 0.6,
                            borderRadius: "4px",
                          }}
                        >
                          <Globe size={11} /> PUBLIC
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          size="xs"
                          color="secondary"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.4,
                            fontSize: "0.65rem",
                            opacity: 0.6,
                            px: 0.6,
                          }}
                        >
                          <Lock size={11} /> RESTRICTED
                        </Typography>
                      )}
                    </Stack>

                    <Typography
                      variant="caption"
                      size="xs"
                      color="secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {s.description ||
                        "System runtime configuration parameter."}
                    </Typography>
                  </Box>

                  {/* Setting Value Control */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    {isBool ? (
                      <PermissionGate
                        permission="settings:manage"
                        disableOnly
                        tooltipTitle="Requires 'settings:manage' permission"
                      >
                        <Switch
                          checked={Boolean(draftVal)}
                          disabled={isSaving}
                          onChange={(e) =>
                            handleUpdateBoolean(s, e.target.checked)
                          }
                          color={draftVal ? "primary" : "neutral"}
                        />
                      </PermissionGate>
                    ) : (
                      <>
                        <Input
                          size="sm"
                          value={
                            typeof draftVal === "object"
                              ? JSON.stringify(draftVal)
                              : String(draftVal ?? "")
                          }
                          onChange={(e) => {
                            let val: unknown = e.target.value;
                            if (typeof s.value === "number") {
                              val = Number(e.target.value);
                            }
                            setDraftValues((prev) => ({
                              ...prev,
                              [s.key]: val,
                            }));
                          }}
                          sx={{
                            borderRadius: "6px",
                            minWidth: 160,
                            fontFamily: "var(--font-code, monospace)",
                            fontSize: "0.78rem",
                          }}
                        />

                        <PermissionGate
                          permission="settings:manage"
                          disableOnly
                          tooltipTitle="Requires 'settings:manage' permission"
                        >
                          <Button
                            size="sm"
                            variant="outlined"
                            colorScheme="primary"
                            onClick={() => handleSaveSetting(s)}
                            disabled={isSaving}
                            startDecorator={<Save size={13} />}
                            sx={{
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              py: 0.35,
                            }}
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </Button>
                        </PermissionGate>
                      </>
                    )}

                    <PermissionGate
                      permission="settings:manage"
                      disableOnly
                      tooltipTitle="Requires 'settings:manage' permission"
                    >
                      <Button
                        size="sm"
                        variant="plain"
                        colorScheme="secondary"
                        onClick={() => handleDeleteSetting(s)}
                        sx={{
                          borderRadius: "6px",
                          p: 0.5,
                          "&:hover": { color: "var(--color-delete, #f43f5e)" },
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </PermissionGate>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* Add Custom Setting Modal */}
      <Modal
        open={isCreateOpen}
        onClose={() => !isCreating && setIsCreateOpen(false)}
      >
        <ModalDialog
          sx={{
            maxWidth: 520,
            width: "100%",
            p: 3,
            borderRadius: "12px",
          }}
        >
          <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>
            Add Custom Configuration Setting
          </DialogTitle>
          <DialogContent sx={{ fontSize: "0.825rem", color: "text.secondary" }}>
            Provision a new database setting with typed JSONB support and RBAC
            isolation.
          </DialogContent>

          {createError && (
            <Alert
              color="danger"
              variant="soft"
              sx={{ my: 1.5, borderRadius: "6px" }}
            >
              {createError}
            </Alert>
          )}

          <Divider sx={{ my: 1.5 }} />

          <form onSubmit={handleCreateSubmit}>
            <Stack spacing={2}>
              <FormControl required>
                <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Configuration Key
                </FormLabel>
                <Input
                  size="sm"
                  placeholder="e.g. system.timeout, auth.allow_registration"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  sx={{
                    borderRadius: "6px",
                    fontFamily: "var(--font-code, monospace)",
                  }}
                />
                <FormHelperText
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                >
                  Lowercase alphanumeric with dots or underscores.
                </FormHelperText>
              </FormControl>

              <FormControl required>
                <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Configuration Value
                </FormLabel>
                <Input
                  size="sm"
                  placeholder='e.g. true, 120, "production", {"debug": true}'
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  sx={{
                    borderRadius: "6px",
                    fontFamily: "var(--font-code, monospace)",
                  }}
                />
                <FormHelperText
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                >
                  Supports booleans (true/false), numbers, strings, or JSON
                  objects.
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Category
                </FormLabel>
                <Input
                  size="sm"
                  placeholder="e.g. general, security, appearance, system"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  sx={{ borderRadius: "6px" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Description
                </FormLabel>
                <Input
                  size="sm"
                  placeholder="Brief summary of setting behavior"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  sx={{ borderRadius: "6px" }}
                />
              </FormControl>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.25,
                  borderRadius: "6px",
                  border:
                    "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
                }}
              >
                <Box>
                  <Typography variant="body" size="xs" bold>
                    Public Visibility
                  </Typography>
                  <Typography variant="caption" size="xs" color="secondary">
                    Available without authentication via /settings/public
                  </Typography>
                </Box>
                <Switch
                  checked={newIsPublic}
                  onChange={(e) => setNewIsPublic(e.target.checked)}
                />
              </Box>
            </Stack>

            <DialogActions sx={{ mt: 3 }}>
              <Button
                variant="plain"
                colorScheme="primary"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
                sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid"
                colorScheme="primary"
                disabled={!newKey.trim() || !newValue.trim() || isCreating}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {isCreating ? "Creating..." : "Create Setting"}
              </Button>
            </DialogActions>
          </form>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
