import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Typography from "@/components/ui/Typography";
import { Box, Stack, Link } from "@mui/joy";
import { Shield, ExternalLink, ArrowRight, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Home() {
  const navigate = useNavigate();
  const { colors } = useThemeColors();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Container variant="outlined" elevation={2} radius="16px" padding="2.5rem" style={{ maxWidth: "520px", width: "100%" }}>
        <Stack direction="column" alignItems="center" spacing={3}>
          {/* Header */}
          <Stack direction="column" spacing={1} alignItems="center" sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                bgcolor: "text.primary",
                color: "background.surface",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                mb: 1,
              }}
            >
              <Shield size={32} />
            </Box>
            <Typography variant="header" size="sm" bold>
              Admin Console
            </Typography>
            <Typography variant="body" size="sm" color="secondary">
              Central management console for administrative roles (Super Admin, Admin, Manager).
            </Typography>
          </Stack>

          {/* Action Buttons */}
          <Stack spacing={1.5} sx={{ width: "100%", mt: 1 }}>
            <Button
              variant="solid"
              colorScheme="primary"
              onClick={() => navigate("/login")}
              endDecorator={<ArrowRight size={16} />}
              fullWidth
              sx={{ py: 1.2, borderRadius: "8px", fontWeight: 600 }}
            >
              Sign In to Admin Console
            </Button>

            <Link
              href="http://localhost:5174/login"
              underline="none"
              sx={{
                py: 1,
                borderRadius: "8px",
                border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                fontSize: "0.875rem",
                fontWeight: 500,
                "&:hover": {
                  borderColor: colors.accent,
                },
              }}
            >
              <UserCheck size={16} />
              Looking for Client Portal? (Port 5174)
              <ExternalLink size={13} />
            </Link>
          </Stack>

          {/* Footer */}
          <Typography variant="caption" size="xs" color="secondary" sx={{ textAlign: "center" }}>
            Designed exclusively for administrative staff &bull; Regular users access port 5174
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
