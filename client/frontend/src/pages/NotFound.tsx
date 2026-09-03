import { useNavigate } from "react-router-dom";
import { Box, Stack } from "@mui/joy";
import { Compass, ArrowLeft } from "lucide-react";
import Typography from "../components/ui/Typography";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import { colors } from "@/utils/Colors";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Container
        elevation={0}
        variant="outlined"
        padding="2.5rem"
        style={{
          maxWidth: "460px",
          width: "100%",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "10px",
              bgcolor: colors.error + "30",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Compass size={28} style={{ color: colors.error }} />
          </Box>

          <Box>
            <Typography
              variant="header"
              color="error"
              align="center"
              size="sm"
              bold
            >
              404 &bull; Resource Not Found
            </Typography>
            <Typography
              variant="caption"
              size="xs"
              sx={{ mt: 0.5, display: "block", opacity: 0.6 }}
              align="center"
            >
              The endpoint or route you requested could not be located in this
              runtime workspace.
            </Typography>
          </Box>

          <Button
            colorScheme="primary"
            onClick={() => navigate("/")}
            startDecorator={<ArrowLeft size={14} />}
          >
            Return to Home
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
