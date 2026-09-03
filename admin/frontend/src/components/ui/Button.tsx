import { Button as JoyButton } from "@mui/joy";
import type { ButtonProps as JoyButtonProps } from "@mui/joy";
import type { CSSProperties } from "react";
import { getColors } from "@/utils/Colors";
import { getColorStyles } from "@/utils/buttonColorStyles";
import { useThemeColors } from "@/hooks/useThemeColors";

type ColorScheme = keyof ReturnType<typeof getColors>;

interface CustomButtonProps extends Omit<JoyButtonProps, "color" | "variant"> {
  variant?: "solid" | "outlined" | "soft" | "plain";
  colorScheme?: ColorScheme;
  children: React.ReactNode;
}

const Button = ({
  variant = "solid",
  colorScheme = "primary",
  children,
  sx,
  ...props
}: CustomButtonProps) => {
  const { colors } = useThemeColors();
  const safeColorScheme =
    colorScheme === "secondary" || !colorScheme ? "primary" : colorScheme;
  const buttonStyles = getColorStyles(safeColorScheme, variant, colors);

  return (
    <JoyButton
      variant={
        variant === "solid"
          ? "solid"
          : variant === "outlined"
          ? "outlined"
          : variant === "soft"
          ? "soft"
          : "plain"
      }
      sx={
        {
          ...buttonStyles,
          ...sx,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </JoyButton>
  );
};

export default Button;
