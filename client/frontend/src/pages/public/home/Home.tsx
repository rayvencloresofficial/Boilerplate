import { useNavigate } from "react-router-dom";
import { Box, Stack, Link } from "@mui/joy";
import { UserCheck, Shield, ArrowRight, ExternalLink } from "lucide-react";
import Typography from "../../../components/ui/Typography";
import Button from "../../../components/ui/Button";
import Container from "../../../components/ui/Container";
import { useThemeColors } from "../../../hooks/useThemeColors";

export default function Home() {
  const navigate = useNavigate();
  const { mode, colors } = useThemeColors();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: mode === "dark" ? "#0b0d11" : "#f8fafc",
        p: 3,
      }}
    >
      <Container
        elevation={2}
        radius="16px"
        padding="2.5rem"
        style={{
          maxWidth: "540px",
          width: "100%",
          backgroundColor: mode === "dark" ? "#11131a" : "#ffffff",
          border:
            mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.09)"
              : "1px solid rgba(0, 0, 0, 0.08)",
          textAlign: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "14px",
              bgcolor: colors.accent,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(24, 94, 224, 0.3)",
            }}
          >
            <UserCheck size={32} />
          </Box>

          <Typography variant="header" size="sm" bold>
            Client Application
          </Typography>

          <Typography variant="body" size="sm" color="secondary">
            Welcome to the Client Application portal. This area is designated for regular user accounts.
          </Typography>

          <Stack spacing={1.5} sx={{ width: "100%", mt: 2 }}>
            <Button
              onClick={() => navigate("/login")}
              variant="solid"
              colorScheme="primary"
              endDecorator={<ArrowRight size={16} />}
              sx={{ py: 1.2, borderRadius: "8px", fontWeight: 600 }}
            >
              Sign In to Client Portal
            </Button>

            <Link
              href="http://localhost:5173/login"
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
              <Shield size={16} />
              Looking for Admin Console? (Port 5173)
              <ExternalLink size={13} />
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
