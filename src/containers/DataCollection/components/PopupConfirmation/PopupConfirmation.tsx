import React from "react";
import "./PopupConfirmation.css";
import { Button } from "../../../../components/Button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import ButtonProcessing from "../../../../components/ButtonProcessing/ButtonProcessing";
import { useTranslation } from "react-i18next";

interface PopupConfirmationProps {
  name: string;
  email: string;
  text: string;
  video: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: any;
  isLoading: boolean;
  setIsLoading: any;
}

const PopupConfirmation: React.FC<PopupConfirmationProps> = ({
  name,
  email,
  text,
  video,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  setIsLoading,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className={`popup-confirmation ${isOpen ? "open" : ""}`}>
      <div className="popup-confirmation-content-header">
        <h2>{t("insAreYouSure")}</h2>
      </div>
      <div className="popup-confirmation-content">
        <div className="popup-confirmation-details">
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
            }}
          >
            <Table>
              <TableBody sx={{ backgroundColor: "#f2f2f2" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: "18px",
                      wordBreak: "break-word",
                      border: "none",
                      width: "20%",
                    }}
                  >
                    {t("insName")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: "16px",
                      wordBreak: "break-word",
                      border: "none",
                    }}
                  >
                    {name}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: "18px",
                      wordBreak: "break-word",
                      border: "none",
                      width: "20%",
                    }}
                  >
                    {t("insEmail")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: "16px",
                      wordBreak: "break-word",
                      border: "none",
                    }}
                  >
                    {email}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: "18px",
                      wordBreak: "break-word",
                      border: "none",
                      width: "20%",
                    }}
                  >
                    {t("insText")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: "16px",
                      wordBreak: "break-word",
                      border: "none",
                    }}
                  >
                    {text}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: "18px",
                      wordBreak: "break-word",
                      width: "20%",
                      border: "none",
                    }}
                  >
                    {t("insVideo")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: "16px",
                      wordBreak: "break-word",
                      border: "none",
                    }}
                  >
                    {video}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <div className="popup-confirmation-content-button">
          <Button
            type="button"
            onClick={onClose}
            buttonStyle="btn--reset"
            buttonSize="btn--large"
          >
            {t("cancel_btn")}
          </Button>
          <ButtonProcessing
            onClick={onSubmit}
            buttonStyle="btn-submit"
            buttonSize="btn-large"
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          >
            {t("submit_btn")}
          </ButtonProcessing>
        </div>
      </div>
    </div>
  );
};

export default PopupConfirmation;
