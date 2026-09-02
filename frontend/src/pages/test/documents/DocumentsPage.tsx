import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Box,
  Stack,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from "@mui/joy";
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Eye,
  RotateCcw,
  CheckCircle2,
  FolderArchive,
  Layers,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useThemeColors } from "../../../hooks/useThemeColors";
import {
  getDocumentsApi,
  createDocumentApi,
  deleteDocumentApi,
} from "../../../services/document.api";
import type { DocumentItem, CreateDocumentDto } from "../../../types/document";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";
import PermissionGate from "../../../routes/PermissionGate";

export default function DocumentsPage() {
  const { user } = useAuth();
  const { colors } = useThemeColors();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filtering State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("general");
  const [newStatus, setNewStatus] = useState<"draft" | "published" | "archived">("published");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // View / Inspect Modal State
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Delete Confirmation State
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const data = await getDocumentsApi();
        if (!ignore) {
          setDocuments(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load documents repository."
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

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        doc.title.toLowerCase().includes(q) ||
        (doc.content && doc.content.toLowerCase().includes(q)) ||
        (doc.creator_name && doc.creator_name.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "all" ||
        doc.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        doc.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [documents, searchQuery, categoryFilter, statusFilter]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = documents.length;
    const published = documents.filter((d) => d.status === "published").length;
    const categories = new Set(documents.map((d) => d.category.toLowerCase())).size;
    return { total, published, categories };
  }, [documents]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError("Document title is required.");
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const payload: CreateDocumentDto = {
        title: newTitle.trim(),
        content: newContent.trim() || null,
        category: newCategory.trim().toLowerCase(),
        status: newStatus,
      };

      await createDocumentApi(payload);
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("general");
      setNewStatus("published");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create document."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);
    try {
      await deleteDocumentApi(deletingDoc.id);
      setDeletingDoc(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete document."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "financial":
        return { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981" };
      case "security":
        return { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" };
      case "operations":
        return { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6" };
      case "product":
        return { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7" };
      default:
        return { bg: "rgba(107, 114, 128, 0.12)", text: "#6b7280" };
    }
  };

  return (
    <Stack spacing={3}>
      {/* 1. Header Banner */}
      <Container
        elevation={0}
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
                  width: 34,
                  height: 34,
                  borderRadius: "8px",
                  bgcolor: "text.primary",
                  color: "background.surface",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={18} />
              </Box>
              <Typography variant="header" size="xs" bold>
                Documents & Records Repository
              </Typography>
              <Box
                sx={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--font-code, monospace)",
                  fontWeight: 700,
                  px: 0.75,
                  py: 0.2,
                  borderRadius: "4px",
                  bgcolor: `${colors.accent}18`,
                  color: colors.accent,
                }}
              >
                SAMPLE MODULE
              </Box>
            </Stack>
            <Typography variant="caption" size="xs" color="secondary">
              Active identity: <b>{user?.first_name} {user?.last_name}</b> ({user?.email}) &bull; Enterprise repository guarded by fine-grained permissions (
              <span style={{ fontFamily: "var(--font-code, monospace)", fontWeight: 600 }}>
                documents:read, documents:create, documents:delete
              </span>
              ).
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              size="sm"
              variant="outlined"
              colorScheme="primary"
              onClick={() => {
                setIsLoading(true);
                setRefreshTrigger((prev) => prev + 1);
              }}
              startDecorator={<RotateCcw size={14} />}
              sx={{ borderRadius: "6px" }}
            >
              Refresh
            </Button>

            <PermissionGate
              permission="documents:create"
              disableOnly
              tooltipTitle="Requires 'documents:create' permission to draft documents"
            >
              <Button
                size="sm"
                variant="solid"
                colorScheme="primary"
                onClick={() => setIsCreateModalOpen(true)}
                startDecorator={<Plus size={15} />}
                sx={{ borderRadius: "6px" }}
              >
                New Document
              </Button>
            </PermissionGate>
          </Stack>
        </Stack>
      </Container>

      {/* 2. KPI Metrics Cards */}
      <Grid container spacing={2.5}>
        <Grid xs={12} sm={4}>
          <Container
            elevation={0}
            padding="1.25rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" size="xs" color="secondary">
                Total Documents
              </Typography>
              <FileText size={16} style={{ color: colors.accent, opacity: 0.8 }} />
            </Stack>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ mt: 1, fontFamily: "var(--font-code, monospace)" }}
            >
              {metrics.total}
            </Typography>
            <Typography variant="caption" size="xs" color="secondary" sx={{ mt: 0.5, display: "block" }}>
              Active records in repository
            </Typography>
          </Container>
        </Grid>

        <Grid xs={12} sm={4}>
          <Container
            elevation={0}
            padding="1.25rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" size="xs" color="secondary">
                Published Records
              </Typography>
              <CheckCircle2 size={16} style={{ color: "#10b981", opacity: 0.8 }} />
            </Stack>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ mt: 1, fontFamily: "var(--font-code, monospace)" }}
            >
              {metrics.published}
            </Typography>
            <Typography variant="caption" size="xs" color="secondary" sx={{ mt: 0.5, display: "block" }}>
              Accessible for audit & compliance
            </Typography>
          </Container>
        </Grid>

        <Grid xs={12} sm={4}>
          <Container
            elevation={0}
            padding="1.25rem"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" size="xs" color="secondary">
                Classification Domains
              </Typography>
              <Layers size={16} style={{ color: "#a855f7", opacity: 0.8 }} />
            </Stack>
            <Typography
              variant="header"
              size="sm"
              bold
              sx={{ mt: 1, fontFamily: "var(--font-code, monospace)" }}
            >
              {metrics.categories} Categories
            </Typography>
            <Typography variant="caption" size="xs" color="secondary" sx={{ mt: 0.5, display: "block" }}>
              Security, financial, operations, product
            </Typography>
          </Container>
        </Grid>
      </Grid>

      {/* 3. Error Alert */}
      {error && (
        <Alert color="danger" variant="soft" sx={{ borderRadius: "8px" }}>
          {error}
        </Alert>
      )}

      {/* 4. Filter Toolbar & Table Container */}
      <Container
        elevation={0}
        padding="1.5rem"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        {/* Filters */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ mb: 2.5 }}
        >
          <Input
            size="sm"
            placeholder="Search by title, creator, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startDecorator={<Search size={15} />}
            sx={{ flex: 1, borderRadius: "6px" }}
          />

          <Select
            size="sm"
            value={categoryFilter}
            onChange={(_e, val) => val && setCategoryFilter(val)}
            sx={{ minWidth: 150, borderRadius: "6px" }}
          >
            <Option value="all">All Categories</Option>
            <Option value="financial">Financial</Option>
            <Option value="security">Security</Option>
            <Option value="operations">Operations</Option>
            <Option value="product">Product</Option>
            <Option value="general">General</Option>
          </Select>

          <Select
            size="sm"
            value={statusFilter}
            onChange={(_e, val) => val && setStatusFilter(val)}
            sx={{ minWidth: 140, borderRadius: "6px" }}
          >
            <Option value="all">All Statuses</Option>
            <Option value="published">Published</Option>
            <Option value="draft">Draft</Option>
            <Option value="archived">Archived</Option>
          </Select>
        </Stack>

        {/* Documents Table */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size="md" />
          </Box>
        ) : filteredDocuments.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <FolderArchive size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <Typography variant="body" size="sm" color="secondary">
              No documents match your query or category filters.
            </Typography>
          </Box>
        ) : (
          <Table
            size="sm"
            aria-label="Documents repository"
            hoverRow
            sx={{
              "& th": { py: 1, px: 1.5, fontWeight: 600, fontSize: "0.78rem" },
              "& td": { py: 1.2, px: 1.5, fontSize: "0.82rem" },
            }}
          >
            <thead>
              <tr>
                <th>Document Details</th>
                <th>Classification</th>
                <th>Status</th>
                <th>Author / Creator</th>
                <th>Updated</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => {
                const catColor = getCategoryColor(doc.category);

                return (
                  <tr key={doc.id}>
                    <td>
                      <Box>
                        <Typography variant="body" size="xs" bold>
                          {doc.title}
                        </Typography>
                        {doc.content && (
                          <Typography
                            variant="caption"
                            size="xs"
                            color="secondary"
                            noWrap
                            sx={{ maxWidth: 320, display: "block", mt: 0.25 }}
                          >
                            {doc.content}
                          </Typography>
                        )}
                      </Box>
                    </td>
                    <td>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1,
                          py: 0.25,
                          borderRadius: "4px",
                          bgcolor: catColor.bg,
                          color: catColor.text,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {doc.category}
                      </Box>
                    </td>
                    <td>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1,
                          py: 0.25,
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          bgcolor:
                            doc.status === "published"
                              ? "rgba(16, 185, 129, 0.12)"
                              : doc.status === "draft"
                              ? "rgba(245, 158, 11, 0.12)"
                              : "rgba(107, 114, 128, 0.12)",
                          color:
                            doc.status === "published"
                              ? "#10b981"
                              : doc.status === "draft"
                              ? "#f59e0b"
                              : "#6b7280",
                        }}
                      >
                        {doc.status}
                      </Box>
                    </td>
                    <td>
                      <Typography variant="caption" size="xs">
                        {doc.creator_name || doc.creator_email || "System"}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        variant="caption"
                        size="xs"
                        color="secondary"
                        sx={{ fontFamily: "var(--font-code, monospace)" }}
                      >
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </Typography>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                        <Button
                          size="sm"
                          variant="outlined"
                          colorScheme="primary"
                          onClick={() => setSelectedDoc(doc)}
                          startDecorator={<Eye size={13} />}
                          sx={{ borderRadius: "5px", fontSize: "0.75rem", py: 0.3 }}
                        >
                          View
                        </Button>

                        <PermissionGate
                          permission="documents:delete"
                          disableOnly
                          tooltipTitle="Requires 'documents:delete' permission to purge records"
                        >
                          <Button
                            size="sm"
                            variant="outlined"
                            colorScheme="error"
                            onClick={() => setDeletingDoc(doc)}
                            startDecorator={<Trash2 size={13} />}
                            sx={{ borderRadius: "5px", fontSize: "0.75rem", py: 0.3 }}
                          >
                            Delete
                          </Button>
                        </PermissionGate>
                      </Stack>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Container>

      {/* 5. Create Document Modal */}
      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalDialog
          sx={{
            width: { xs: "90%", sm: 540 },
            borderRadius: "12px",
            p: 3,
            bgcolor: colors.surface,
          }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "6px",
                bgcolor: `${colors.accent}18`,
                color: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={18} />
            </Box>
            <Typography variant="body" size="md" bold>
              Draft New Document
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Typography variant="caption" size="xs" color="secondary" sx={{ mb: 2 }}>
              Publish a new official record to the enterprise document repository.
            </Typography>

            {createError && (
              <Alert color="danger" variant="soft" sx={{ mb: 2, borderRadius: "6px" }}>
                {createError}
              </Alert>
            )}

            <form onSubmit={handleCreateDocument} id="create-document-form">
              <Stack spacing={2}>
                <FormControl required>
                  <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Document Title</FormLabel>
                  <Input
                    size="sm"
                    placeholder="e.g. 2026 Disaster Recovery Protocol"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    sx={{ borderRadius: "6px" }}
                  />
                </FormControl>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Classification</FormLabel>
                    <Select
                      size="sm"
                      value={newCategory}
                      onChange={(_e, val) => val && setNewCategory(val)}
                      sx={{ borderRadius: "6px" }}
                    >
                      <Option value="general">General</Option>
                      <Option value="financial">Financial</Option>
                      <Option value="security">Security</Option>
                      <Option value="operations">Operations</Option>
                      <Option value="product">Product</Option>
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Status</FormLabel>
                    <Select
                      size="sm"
                      value={newStatus}
                      onChange={(_e, val) => val && setNewStatus(val as "draft" | "published" | "archived")}
                      sx={{ borderRadius: "6px" }}
                    >
                      <Option value="published">Published</Option>
                      <Option value="draft">Draft</Option>
                      <Option value="archived">Archived</Option>
                    </Select>
                  </FormControl>
                </Stack>

                <FormControl>
                  <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Body Content</FormLabel>
                  <Textarea
                    size="sm"
                    minRows={4}
                    placeholder="Enter full markdown or executive summary details..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    sx={{ borderRadius: "6px", fontFamily: "inherit" }}
                  />
                </FormControl>
              </Stack>
            </form>
          </DialogContent>

          <DialogActions sx={{ pt: 2 }}>
            <Button
              size="sm"
              variant="outlined"
              colorScheme="primary"
              onClick={() => setIsCreateModalOpen(false)}
              sx={{ borderRadius: "6px" }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="solid"
              colorScheme="primary"
              type="submit"
              form="create-document-form"
              disabled={isSubmitting}
              startDecorator={isSubmitting ? <CircularProgress size="sm" /> : <Plus size={15} />}
              sx={{ borderRadius: "6px" }}
            >
              {isSubmitting ? "Publishing..." : "Publish Record"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* 6. Document Reader / Inspect Modal */}
      <Modal open={!!selectedDoc} onClose={() => setSelectedDoc(null)}>
        <ModalDialog
          sx={{
            width: { xs: "90%", sm: 600 },
            borderRadius: "12px",
            p: 3,
            bgcolor: colors.surface,
          }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <FileText size={20} style={{ color: colors.accent }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body" size="md" bold noWrap>
                {selectedDoc?.title}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Stack direction="row" spacing={1} sx={{ my: 1.5 }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  bgcolor: `${colors.accent}18`,
                  color: colors.accent,
                }}
              >
                {selectedDoc?.category}
              </Box>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  bgcolor: "var(--joy-palette-neutral-softBg, rgba(0,0,0,0.05))",
                }}
              >
                Status: {selectedDoc?.status}
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                bgcolor: "var(--joy-palette-background-level1, rgba(0,0,0,0.02))",
                border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
                maxHeight: 280,
                overflowY: "auto",
              }}
            >
              <Typography variant="body" size="xs" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {selectedDoc?.content || "No textual body provided for this document."}
              </Typography>
            </Box>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
              <Typography variant="caption" size="xs" color="secondary">
                Author: <b>{selectedDoc?.creator_name || selectedDoc?.creator_email || "System"}</b>
              </Typography>
              <Typography variant="caption" size="xs" color="secondary" sx={{ fontFamily: "var(--font-code, monospace)" }}>
                ID: {selectedDoc?.id.slice(0, 8)}...
              </Typography>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ pt: 1 }}>
            <Button
              size="sm"
              variant="outlined"
              colorScheme="primary"
              onClick={() => setSelectedDoc(null)}
              sx={{ borderRadius: "6px" }}
            >
              Close
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* 7. Delete Confirmation Modal */}
      <Modal open={!!deletingDoc} onClose={() => setDeletingDoc(null)}>
        <ModalDialog
          variant="outlined"
          role="alertdialog"
          sx={{
            width: { xs: "90%", sm: 420 },
            borderRadius: "12px",
            p: 3,
            bgcolor: colors.surface,
          }}
        >
          <DialogTitle sx={{ color: "danger.main" }}>
            Confirm Document Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="caption" size="xs">
              Are you sure you want to permanently delete <b>"{deletingDoc?.title}"</b>? This action
              cannot be undone and requires <code>documents:delete</code> authorization.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pt: 2 }}>
            <Button
              size="sm"
              variant="outlined"
              colorScheme="primary"
              onClick={() => setDeletingDoc(null)}
              sx={{ borderRadius: "6px" }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="solid"
              colorScheme="error"
              disabled={isDeleting}
              onClick={handleDeleteDocument}
              startDecorator={isDeleting ? <CircularProgress size="sm" /> : <Trash2 size={14} />}
              sx={{ borderRadius: "6px" }}
            >
              {isDeleting ? "Deleting..." : "Purge Document"}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
