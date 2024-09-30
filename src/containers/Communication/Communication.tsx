// Communication.jsx
// General Imports
import "regenerator-runtime/runtime";
import "./Communication.css";
import { useRef, useState, useEffect, SetStateAction } from "react";
import Cookies from "js-cookie";

import { createLogsByUser} from "../../services/communication.service";

// SLP Imports
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { ConstantAlphaFactor } from "three";
import handImage from "../../../public/images/hand.png";
import handColoredImage from "../../../public/images/handcolored.png";
// @ts-ignore
import { CharacterAnimationsProvider } from "../../components/SLP/CharacterAnimations";
// @ts-ignore
import Experience from "../../components/SLP/Experience";
// @ts-ignore
import Man from "../../components/AvatarModels/Man";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FPSCounter from "./FPSCounter"; // Adjust the import path as necessary
import Communicationlog from "./Communicationlog"; // Adjust the import path as necessary
// SLR Imports
import SLRInput from "../../components/SLRInput/SLRInput";
import SLROutput from "../../components/SLROutput/SLROutput";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { create } from "domain";

function Communication() {
    const { t, i18n } = useTranslation();
    const [isListening, setIsListening] = useState(false);
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition({});

    const renderMicrophoneButton = () => {
        if (browserSupportsSpeechRecognition) {
            return (
                <button
                    className="avatar-microphone-btn"
                    onClick={() => {
                        if (!isListening) {
                            resetTranscript();
                            setCustomTranscript("");
                            SpeechRecognition.startListening({
                                language: "ms-MY",
                                continuous: true,
                            });
                            setIsListening(true);
                            toast(t("listening"), {
                                icon: "🎤",
                                style: {
                                    borderRadius: "10px",
                                    background: "#333",
                                    color: "#fff",
                                },
                            });
                        } else {
                            SpeechRecognition.stopListening();
                            setIsListening(false);
                            toast(t("stopped"), {
                                icon: "✋",
                                style: {
                                    borderRadius: "10px",
                                    background: "#333",
                                    color: "#fff",
                                },
                            });
                        }
                    }}
                >
                    <i
                        className={`fa ${
                            isListening ? "fa-stop faStopBtn" : "fa-microphone"
                        }`}
                    ></i>
                </button>
            );
        } else {
            return (
                <button
                    className="avatar-microphone-btn disabled"
                    disabled={true}
                >
                    <i className="fa fa-microphone"></i>
                    <span className="tooltip2">
                        {t("voice_input_not_supported")}
                    </span>
                </button>
            );
        }
    };

    const [customTranScript, setCustomTranscript] = useState("");

    useEffect(() => {
        setCustomTranscript(transcript);
    }, [transcript]);

    // States to manage the application
    // General states
    const [activeButton, setActiveButton] = useState(() => {
        // Retrieve the activeButton value from localStorage on initial Frender
        return localStorage.getItem("activeButton") || "SLP";
    });

    // SLP states
    const [inputText, setInputText] = useState(""); // State to hold the input text
    const [speed, setSpeed] = useState(1); // State to hold the speed value
    const [handFocus, setHandFocus] = useState(false); // State to manage hand focus mode
    const [showSkeleton, setShowSkeleton] = useState(false); // State to manage skeleton visibility
    const [currentAnimationName, setCurrentAnimationName] = useState(""); // State to hold the current animation name
    const [currentSignFrame, setCurrentSignFrame] = useState("Sign / Frame : 0 / 90"); // State to hold the current animation name
    const [isPaused, setPaused] = useState(false); // State to manage pause/play
    const [leftHandedMode, setLeftHandedMode] = useState(false); // State to manage left-handed mode
    const [currentStatus, setCurrentStatus] = useState(""); // State to hold the current animation name
    // SLR states
    const [SLRResponse, setSLRResponse] = useState<string>("");

    //////////////////////////////////////////
    // General functions

    // @ts-ignore
    const handleButtonValue = (event) => {
        const { value } = event.target;
        setActiveButton(value);
        localStorage.setItem("activeButton", value); // Save the activeButton value to localStorage
    };

    // @ts-ignore
    const isButtonActive = (buttonValue) => {
        return activeButton === buttonValue;
    };

    const isUserLoggedIn = () => {
        return Cookies.get("token") ? true : false;
    };
    const isLoggedIn = isUserLoggedIn();

    //////////////////////////////////////////
    // SLP functions

    // @ts-ignore
    const updateCurrentAnimationName = (animationName) => {
        setCurrentAnimationName(animationName);
    };

        // @ts-ignore
    const updateCurrentSignFrame = (signFrame) => {
        setCurrentSignFrame(signFrame);
    };

     // @ts-ignore
    const updateStatus = (status) => {
        setCurrentStatus(status);
    };

    const toggleSkeleton = () => {
        setShowSkeleton((prevState) => !prevState);
    };

    const handleViewReset = () => {
        // @ts-ignore
        controls.current.reset();
    };

    // @ts-ignore
    const handleSpeedChange = (event) => {
        const newSpeed = parseFloat(event.target.value);
        setSpeed(newSpeed);
    };

    const handleHandFocus = () => {
        setHandFocus((prevFocus) => !prevFocus);
        // @ts-ignore
        controls.current.reset();
    };

    // Function to toggle left-handed mode
    const toggleLeftHandedMode = () => {
        setLeftHandedMode((prevMode) => !prevMode);
    };

    const togglePause = () => {
        setPaused((prevState) => !prevState);
    };

    function HandFocusMode() {
        const { camera } = useThree();
        const x = -35; // Adjust these values according to your requirements
        const y = 150;
        const z = 100;
        const decimal = 1; // Adjust this value to control the speed of lerping

        useFrame(() => {
            camera.position.lerp({ x, y, z }, decimal);
            camera.lookAt(x, y, z);
        });

        return null;
    }

    const controls = useRef();

    // @ts-ignore
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const submittedText = formData.get("sigmlUrl") as string; // Prevent null value

        try {
            const response = await fetch("http://127.0.0.1:5000/api/SLP", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: submittedText }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Data: ", data);
                console.log("Submitted text: ", submittedText);

                if (previousSubmittedText === submittedText) {
                    // If the current submitted text is the same as the previous one, append "#" to the returned text
                    setInputText(data["return"] + "+");
                } else {
                    // If they are different, update the inputText directly
                    setInputText(data["return"]);
                    const logData = {
                        text: data["return"],
                        module: "SLP",
                        user_id: Cookies.get("user_id") || "",
                    }
                    createLogsByUser(logData);
                }

                // Update the previousSubmittedText variable for the next comparison
                previousSubmittedText = submittedText;
            } else {
                console.error("Failed to process text");
            }
        } catch (error) {
            console.error("Error processing text: ", error);
        }
    };

    // Define a variable to store the previous submitted text
    let previousSubmittedText = "";

    //////////////////////////////////////////
    // SLR functions
    const handleSLRResponse = (data: string) => {
        setSLRResponse(data);
        const logData = {
            text: data,
            module: "SLR",
            user_id: Cookies.get("user_id") || "",
        }
        createLogsByUser(logData);
    };

    return (
        <div
            className={`communication-body ${
                leftHandedMode ? "left-handed" : ""
            }`}
        >
            <div className="container-wrapper">
                <div className="communication-menu">
                    <button
                        value="SLP"
                        onClick={handleButtonValue}
                        className={isButtonActive("SLP") ? "active" : ""}
                    >
                        {t("slp")}
                    </button>
                    <button
                        value="SLR"
                        onClick={handleButtonValue}
                        className={isButtonActive("SLR") ? "active" : ""}
                    >
                        {t("slr")}
                    </button>
                    <div
                        className={`animation ${
                            isButtonActive("SLR") ? "start-about" : "start-home"
                        }`}
                    ></div>
                </div>
                {activeButton === "SLP" && (
                    <>
                        {/* <nav className="sidebar-navigation">
                            <ul>
                                <li
                                    onClick={handleHandFocus}
                                    className={handFocus ? "active" : ""}
                                >
                                    <img
                                        src={
                                            handFocus
                                                ? handColoredImage
                                                : handImage
                                        }
                                        alt="hand"
                                        className="sidebar-btn"
                                    />
                                    <span className="tooltip">
                                        Hand focus mode
                                    </span>
                                </li>
                                <li onClick={handleViewReset}>
                                    <img
                                        src="./images/resetview.png"
                                        className="sidebar-btn"
                                    />
                                    <span className="tooltip">Reset zoom</span>
                                </li>
                                <li>
                                    <span className="tooltip">None</span>
                                </li>
                            </ul>
                        </nav> */}
                        <div className="canvas-wrapper">
                            <Canvas camera={{ position: [0, 0, 225], fov: 55 }}>
                                <directionalLight
                                    intensity={1}
                                    color="white"
                                    position={[10, 10, 10]}
                                />
                                <CharacterAnimationsProvider>
                                    <Experience />
                                    <Man
                                        animationKeyword={inputText}
                                        speed={speed}
                                        showSkeleton={showSkeleton}
                                        repeat={"No"}
                                        isPaused={isPaused}
                                        updateCurrentAnimationName={
                                            updateCurrentAnimationName
                                        }
                                        updateCurrentSignFrame={
                                            updateCurrentSignFrame
                                        }
                                        updateStatus={
                                            updateStatus
                                        }
                                    />
                                </CharacterAnimationsProvider>
                                {/*<FPSCounter onUpdateFPS={updateFPS} />*/}
                                {/*// @ts-ignore*/}
                                <OrbitControls ref={controls} />
                                {handFocus && <HandFocusMode />}
                            </Canvas>
                        </div>
                        {isLoggedIn ? (
                                                        <div>
                           <Communicationlog userId={Cookies.get("user_id") || ""} moduleType={"SLP"} /></div>
                        ) : (
                            <a></a>
                        )}
                        <div className="content-wrapper">
                            <div>
                                <h1 className="communication-h1">
                                    {t("avatar_control")}
                                </h1>
                                <div className="communication-toprow">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={leftHandedMode}
                                                onChange={() =>
                                                    setLeftHandedMode(
                                                        (prevMode) => !prevMode
                                                    )
                                                }
                                                color="primary"
                                                inputProps={{
                                                    "aria-label":
                                                        "Left-Hand Mode",
                                                }}
                                            />
                                        }
                                        label={t("left_hand_mode")}
                                    />

                                    <FormControlLabel
                                        control={
                                            <div className="skeleton-checkbox">
                                                <Checkbox
                                                    checked={showSkeleton}
                                                    onChange={() =>
                                                        setShowSkeleton(
                                                            (prevState) =>
                                                                !prevState
                                                        )
                                                    }
                                                    color="primary"
                                                    inputProps={{
                                                        "aria-label":
                                                            "Show Skeleton",
                                                    }}
                                                />
                                            </div>
                                        }
                                        label={
                                            showSkeleton
                                                ? t("hide_skeleton")
                                                : t("show_skeleton")
                                        }
                                    />

                                    {/* <Checkbox /> */}
                                </div>
                                <div className="speed-control">
                                    <div>
                                        <span className="speed-span">
                                            {t("speed")} :{" "}
                                        </span>
                                        <input
                                            type="range"
                                            className="speed-slider"
                                            min="0.2"
                                            max="2"
                                            step="0.2"
                                            value={speed}
                                            onChange={handleSpeedChange}
                                        />
                                        <input
                                            type="text"
                                            className="speed-textbox"
                                            value={speed}
                                            readOnly
                                        />
                                    </div>
                                    <hr className="separator" />
                                </div>
                            </div>

                            <div className="communication-middlerow">
                                <form
                                    onSubmit={handleSubmit}
                                    className="voice-form"
                                >
                                    <div className="voiceToTextBox">
                                        <textarea
                                            value={customTranScript}
                                            onChange={(e) => {
                                                setCustomTranscript(
                                                    e.target.value
                                                );
                                            }}
                                            className="avatar-textbox"
                                            id="sigmlUrl"
                                            name="sigmlUrl"
                                            placeholder={t("enter_text_here")}
                                            spellCheck="true"
                                        />
                                        {renderMicrophoneButton()}
                                    </div>

                                    <div className="voice-text-button-group">
                                        <button
                                            className="avatarplay-btn"
                                            type="submit"
                                        >
                                            {t("play")}
                                        </button>
                                        <button
                                            className="avatarpause-btn"
                                            onClick={togglePause}
                                            type="button"
                                        >
                                            {isPaused ? t("unpause") : t("pause")}
                                        </button>
                                    </div>
                                </form>
                                <hr className="separator" />
                            </div>

                            <div className="bottomrow">
                                <h1 className="communication-h1">{t("stats")}</h1>
                                <div className="communication-bottomrow">
                                <FPSCounter/>
                                    <input
                                        className="frame-box"
                                        type="text"
                                        placeholder={currentSignFrame}
                                    />
                                    <input
                                        className="gloss-box"
                                        type="text"
                                        placeholder={t("gloss")}
                                        value={currentAnimationName}
                                        readOnly
                                    />
                                </div>
                                <div className="status-row">
                                    <input
                                        className="status-box"
                                        type="text"
                                        placeholder={t("status_row")}
                                        value={currentStatus}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {activeButton === "SLR" && (
                    <>
                        <div className="slr-content-wrapper">
                            <SLROutput responseData={SLRResponse} />
                        </div>
                        <div className="slr-content-wrapper">
                            <SLRInput
                                onResponsiveReceived={handleSLRResponse}
                            />
                        </div>
                        {isLoggedIn ? (
                                                        <div>
                           <Communicationlog userId={Cookies.get("user_id") || ""} moduleType={"SLR"} /></div>
                        ) : (
                            <a></a>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Communication;
