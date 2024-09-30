import './SLROutput.css';
import { useTranslation } from "react-i18next";

const SLROutput = ({ responseData }: { responseData: string | null }) => {
    const { t, i18n } = useTranslation();
    return (
        <div className="slr-output-container">
            <h1>{t("slr_model_output")}</h1>
            {responseData ? (
                <div className="output-content">
                    <p>{t("received_output")}: {responseData}</p>
                </div>
            ) : (
                <div className="output-content">
                    <p>{t("no_output_available")}</p>
                </div>
            )}
        </div>
    );
}

export default SLROutput;