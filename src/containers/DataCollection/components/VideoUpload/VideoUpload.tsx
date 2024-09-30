import React, { useState } from "react";
import { Upload, message, Space, Button } from "antd";
import { UploadOutlined, CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface VideoUploadProps {
  videoInfo: any;
  setVideoInfo: any;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  videoInfo,
  setVideoInfo,
}) => {
  const { t, i18n } = useTranslation();
  const [uploadedVideo, setUploadedVideo] = useState<string | null>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const handleChange = (info: any) => {
    if (info.file.status !== "uploading") {
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} ` + t("fileUploadSuccess"));
      setUploadedVideo(info.file.name); // Set the uploaded video name
      setVideoInfo(info.file.originFileObj); // Set video info when upload is successful
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} ` + t("fileUploadFailed"));
      setUploadedVideo(null); // Reset uploaded video name on error
    }
  };

  const handleRemove = () => {
    setUploadedVideo(null);
    setVideoInfo(null);
  };

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div>
      {videoInfo ? (
        <Space>
          <p>
            <span style={{ color: "blue" }}>{uploadedVideo}</span>
          </p>
          <span
            onClick={handleRemove}
            style={{
              cursor: "pointer",
              color: isHovered ? "red" : "black",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CloseOutlined />
          </span>
        </Space>
      ) : (
        <Upload
          name="video"
          action="/upload/video"
          onChange={handleChange}
          maxCount={1}
          accept=".mp4"
          showUploadList={false}
          beforeUpload={() => {
            setUploading(true);
            return true;
          }}
          customRequest={({ file, onSuccess, onError }) => {
            setTimeout(() => {
              onSuccess?.("ok");
              setUploading(false);
            }, 1000);
          }}
        >
          <Button
            icon={<UploadOutlined />}
            size="large"
            loading={uploading}
            style={{ width: "175px", height: "40px" }}
          >
            {uploading ? t("uploading") : t("choose_a_video")}
          </Button>
        </Upload>
      )}
    </div>
  );
};

export default VideoUpload;
