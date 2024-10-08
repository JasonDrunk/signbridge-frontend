import React from "react";
import "./Button.css";

const STYLES = [
  "btn--primary",
  "btn--outline",
  "btn--reset",
  "btn--submit",
  "btn--send",
  "btn--accept",
  "btn--cancel",
];
const SIZES = ["btn--medium", "btn--large"];

export const Button = ({
  children,
  type,
  onClick,
  buttonStyle,
  buttonSize,
}: {
  children: React.ReactNode;
  type: string;
  onClick?: () => void;
  buttonStyle: string;
  buttonSize: string;
}) => {
  const checkButtonStyle = STYLES.includes(buttonStyle)
    ? buttonStyle
    : STYLES[0];
  const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

  return (
    <button
      className={`btn ${checkButtonStyle} ${checkButtonSize}`}
      onClick={onClick}
      type={type as "submit" | "reset" | "button" | undefined}
      data-testid={`button-${buttonStyle}`}
    >
      {children}
    </button>
  );
};
