import React, { useState } from "react";
import { Button } from "antd";
import "./ButtonProcessing.css";

interface ButtonProcessingProps {
  type?: "text" | "link" | "default" | "dashed" | "primary"; // Adjusted to match Ant Design's expected values
  onClick?: () => any;
  buttonStyle: string;
  buttonSize: string;
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: any;
}

const ButtonProcessing: React.FC<ButtonProcessingProps> = ({
  type,
  onClick,
  buttonStyle,
  buttonSize,
  children,
  isLoading,
  setIsLoading,
}) => {
  // const [isLoading, setIsLoading] = useState(false);
  // const handleClick = async () => {
  //   if (onClick) {
  //     setIsLoading(true);
  //     try {
  //       const response = await onClick();
  //       if (response) {
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       setIsLoading(false);
  //       console.error("Error:", error);
  //     }
  //   }
  // };
  return (
    <Button
      className={`${buttonStyle} ${buttonSize}`}
      onClick={onClick}
      type={type}
      loading={isLoading}
      style={{ height: "auto", fontSize: "20px", position: "relative" }}
      data-testid="submit_btn2"
    >
      {isLoading}
      {children}
    </Button>
  );
};

export default ButtonProcessing;
