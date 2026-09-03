import { useNavigate, useLocation } from "react-router-dom";
import { Box, Stack, Divider } from "@mui/joy";
import { ShieldAlert, ArrowLeft, RefreshCw, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Typography from "../components/ui/Typography";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, quickLogin, demoAccounts } = useAuth();

  const state = location.state as {
    reason?: "role" | "permission";
    required?: string[];
  } | null;

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Container
        elevation={0}
        radius="12px"
        padding="2.5rem"
        style={{
          maxWidth: "500px",
          width: "100%",
          backgroundColor: "var(--joy-palette-background-surface, #ffffff)",
          border:
            "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.1))",
          textAlign: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "10px",
              bgcolor: "text.primary",
              color: "background.surface",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldAlert size={28} />
          </Box>

          <Box>
            <Typography
              variant="caption"
              align="center"
              color="error"
              size="sm"
              bold
            >
              403 Forbidden &bull; Clearance Required
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              align="center"
              sx={{ mt: 0.5, display: "block", opacity: 0.6 }}
            >
              Your account identity does not possess the requisite clearance to
              access this resource.
            </Typography>
          </Box>

          {state?.required && (
            <Box
              sx={{
                width: "100%",
                p: "0.85rem 1rem",
                textAlign: "left",
                borderRadius: "6px",
                border:
                  "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.1))",
                bgcolor: "background.surface",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Lock size={13} style={{ opacity: 0.6 }} />
                <Typography
                  variant="caption"
                  size="xs"
                  bold
                  sx={{
                    fontFamily: "var(--font-code, monospace)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Required {state.reason === "role" ? "Role" : "Permission"}{" "}
                  Constraints:
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                size="xs"
                sx={{
                  fontFamily: "var(--font-code, monospace)",
                  color: "var(--color-primary, #185ee0)",
                  fontWeight: 600,
                }}
              >
                {state.required.join(", ")}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              width: "100%",
              p: "0.85rem 1rem",
              textAlign: "left",
              borderRadius: "6px",
              border:
                "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.08))",
            }}
          >
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{
                fontFamily: "var(--font-code, monospace)",
                display: "block",
              }}
            >
              Identity: <b>{user?.email}</b>
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              color="secondary"
              sx={{
                fontFamily: "var(--font-code, monospace)",
                mt: 0.25,
                display: "block",
              }}
            >
              Granted: [{user?.roles?.join(", ").toUpperCase()}]
            </Typography>
          </Box>

          <Divider sx={{ width: "100%", my: 0.5 }} />

          <Typography
            variant="caption"
            size="xs"
            color="secondary"
            sx={{
              fontFamily: "var(--font-code, monospace)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Switch to an authorized identity:
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent="center"
          >
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                size="sm"
                variant="outlined"
                colorScheme="secondary"
                onClick={async () => {
                  await quickLogin(account.email);
                  navigate("/test", { replace: true });
                }}
                startDecorator={<RefreshCw size={11} />}
                sx={{
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  borderColor:
                    "var(--joy-palette-neutral-outlinedBorder, rgba(0,0,0,0.12))",
                  "&:hover": { borderColor: "text.primary" },
                }}
              >
                {account.title}
              </Button>
            ))}
          </Stack>

          <Button
            variant="plain"
            colorScheme="secondary"
            onClick={() => navigate("/test")}
            startDecorator={<ArrowLeft size={14} />}
            sx={{ mt: 1, fontSize: "0.8rem" }}
          >
            Return to Testpad
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
