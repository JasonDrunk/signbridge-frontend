import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface DownloadButtonProps {
  type: string;
  downloadVideo: (name: string) => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  type,
  downloadVideo,
}) => {
  const { t, i18n } = useTranslation();
  return (
    <Button
      style={{ width: "175px", height: "40px" }}
      onClick={() => downloadVideo(type)}
    >
      <span>
        <DownloadOutlined />
      </span>
      <span style={{ marginLeft: "8px" }}>{t("download_btn")}</span>
    </Button>
  );
};

export default DownloadButton;
