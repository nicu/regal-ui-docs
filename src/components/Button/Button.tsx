import React, { CSSProperties, PropsWithChildren } from "react";
import clsx from "clsx";

const sizeMap = {
  sm: "sm",
  small: "sm",
  lg: "lg",
  large: "lg",
  medium: null,
} as const;

type ButtonProps = PropsWithChildren & {
  size?: keyof typeof sizeMap; // The size of the button (e.g., 'sm', 'lg', or null)
  outline?: boolean; // Whether the button should be an outline button
  variant?: string; // The color variant of the button
  disabled?: boolean; // Whether the button should be disabled
  className?: string; // Custom classes for the button
  onClick?: () => void;
};

// Build the Button component with the specified props
const Button = ({
  size = null, // The size of the button (e.g., 'sm', 'lg', or null)
  outline = false, // Whether the button should be an outline button
  variant = "primary", // The color variant of the button
  disabled = false, // Whether the button should be disabled
  className, // Custom classes for the button
  onClick,
  children,
}: ButtonProps) => {
  const buttonSize = size ? sizeMap[size] : "";
  const sizeClass = buttonSize ? `button--${buttonSize}` : "";
  const outlineClass = outline ? "button--outline" : "";
  const variantClass = variant ? `button--${variant}` : "";
  const disabledClass = disabled ? "disabled" : "";

  return (
    <button
      className={clsx(
        "button",
        sizeClass,
        outlineClass,
        variantClass,
        disabledClass,
        className
      )}
      role="button"
      aria-disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
