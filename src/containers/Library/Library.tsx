import React, { useRef, useState, useEffect } from "react";
import "./Library.css";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material"; // Import Material-UI components
import { fetchCat, fetchSign } from "../../services/library.service";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
// @ts-ignore
import { CharacterAnimationsProvider } from "../../components/SLP/CharacterAnimations";
// @ts-ignore
import Experience from "../../components/SLP/Experience";
// @ts-ignore
import Man from "../../components/AvatarModels/Man";
import styles from "./Admin/LibraryAdmin.module.css";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

interface LibraryCategories {
    category_name: string;
    category_thumbnail: string;
    category_id: number;
}

interface LibrarySigns {
    keyword: string;
    animations: Array<string>;
    contributor: string;
    thumbnail: string;
}

enum View {
    Categories,
    Signs,
    SignWrapper,
}

export default function Library() {
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState<LibraryCategories[]>([]);
    const [signs, setSigns] = useState<LibrarySigns[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [selectedSignIndex, setSelectedSignIndex] = useState<number | null>(
        null
    );
    const [currentView, setCurrentView] = useState<View>(View.Categories);
    const [previousView, setPreviousView] = useState<View | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Scroll to the top of the page when the view changes
        window.scrollTo(0, 0);
    }, [currentView]); // Scroll when currentView changes

    const resetSearch = () => {
        setSearchKeyword("");
    };

    const filteredSigns =
        searchKeyword.trim() === ""
            ? signs
            : signs.filter((sign) =>
                  sign.keyword
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase())
              );

    const fetchCategories = async () => {
        try {
            const { data } = await fetchCat();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleCategoryClick = async (categoryName: string) => {
        try {
            const signsData = await fetchSign(categoryName);
            setSigns(signsData);
            setSelectedCategory(categoryName);
            setCurrentView(View.Signs);
        } catch (error) {
            console.error("Error fetching signs:", error);
        }
    };

    const handleSignClick = (index: number) => {
        setSelectedSignIndex(index);
        setPreviousView(currentView);
        setCurrentView(View.SignWrapper);
    };

    const handleBackButtonClick = () => {
        if (previousView !== null) {
            setCurrentView(previousView);
            setPreviousView(null);
        }
    };

    const controls = useRef();

    const renderSignWrapper = () => (
        <div className={styles.signPageWrapper}>
            <div>
                <div className={styles.titleBack}>
                    <Button
                        className={styles.backContainer}
                        onClick={handleBackButtonClick}
                    >
                        <KeyboardReturnIcon className={styles.backButton} />
                    </Button>
                    <Typography variant="h1" className={styles.signHeader}>
                        {signs[selectedSignIndex]?.keyword || "No sign found"}
                    </Typography>
                </div>
                <div className={styles.signImages}>
                    <img
                        src={signs[selectedSignIndex].thumbnail}
                        alt={signs[selectedSignIndex].keyword}
                        className={styles.signImage}
                    />
                    <div className={styles.sign_wrapper}>
                        <Canvas camera={{ position: [0, 0, 225], fov: 55 }}>
                            <directionalLight
                                intensity={1}
                                color="white"
                                position={[10, 10, 10]}
                            />
                            <CharacterAnimationsProvider>
                                <Experience />
                                <Man
                                    animationKeyword={
                                        selectedSignIndex !== null
                                            ? signs[selectedSignIndex].keyword
                                            : ""
                                    }
                                    speed={""}
                                    showSkeleton={""}
                                    repeat={"Yes"}
                                    isPaused={""}
                                />
                            </CharacterAnimationsProvider>
                            <OrbitControls ref={controls} />
                        </Canvas>
                    </div>
                </div>
                <div className={styles.signInfo}>
                    <h4>
                        {t("animations")}
                        {signs[selectedSignIndex]?.animations ? (
                            <>
                                {"["}
                                {signs[selectedSignIndex].animations.map(
                                    (animation, index) => (
                                        <>
                                            {index > 0 && ", "}{" "}
                                            {/* Add comma after the first animation */}
                                            {animation}
                                        </>
                                    )
                                )}
                                {" ]"}
                            </>
                        ) : (
                            "Unknown"
                        )}
                    </h4>
                    <h4 variant="body2" className="sign-contributor">
                        {t("contributor")}
                        {signs[selectedSignIndex]?.contributor || "Unknown"}
                    </h4>
                </div>
            </div>
        </div>
    );

    const renderCategories = () => (
        <>
            <div className={styles.imageHeader}>
                <img
                    src="./images/lib.png"
                    alt="Library"
                    className={styles.libImage}
                />
            </div>
            <Grid className={styles.grid1} container spacing={8}>
                {categories.map((category) => (
                    <Grid
                        className={styles.grid2}
                        key={category.category_id}
                        item
                        xs={24}
                        sm={6}
                        md={4}
                        lg={3}
                    >
                        <Card
                            className={styles.card}
                            onClick={() =>
                                handleCategoryClick(category.category_name)
                            }
                        >
                            <CardContent className={styles.cardContent}>
                                <div className={styles.categoryImg}>
                                    <img
                                        src={category.category_thumbnail}
                                        alt={category.category_name}
                                        style={{ maxWidth: "100%" }}
                                    />
                                    <div className={styles.categoryText}>
                                        <p>{category.category_name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );

    const renderSigns = () => (
        <div className="signs">
            <div className={styles.signBox}>
                <div className={styles.titleBack}>
                    <Button
                        className={styles.backContainer}
                        onClick={() => setCurrentView(View.Categories)}
                    >
                        <KeyboardReturnIcon className={styles.backButton} />
                    </Button>
                    <Typography
                        className={styles.signHeader}
                        variant="h4"
                        gutterBottom
                    >
                        {selectedCategory}
                    </Typography>
                </div>
                <div className={styles.searchBarWrapper}>
                    <input
                        className={styles.searchBar}
                        type="text"
                        placeholder="Search by keyword..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <span className={styles.separator}>|</span>
                    <button
                        className={styles.resetButton}
                        aria-label="Close"
                        onClick={resetSearch}
                    >
                        <Cross2Icon className={styles.resetIcon} />
                    </button>
                </div>
            </div>
            <Grid className={styles.grid1} container spacing={8}>
                {filteredSigns.map((sign, index) => (
                    <Grid
                        className={styles.grid2}
                        key={index}
                        item
                        xs={24}
                        sm={6}
                        md={4}
                        lg={3}
                    >
                        <Card
                            className={styles.card}
                            onClick={() => handleSignClick(index)}
                        >
                            <CardContent className={styles.cardContent}>
                                <div className={styles.categoryImg}>
                                    <img
                                        src={sign.thumbnail}
                                        alt={sign.keyword}
                                        style={{ maxWidth: "100%" }}
                                    />
                                    <div className={styles.categoryText}>
                                        <p>{sign.keyword}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );

    return (
        <div className={styles.library}>
            {currentView === View.Categories && renderCategories()}
            {currentView === View.Signs && renderSigns()}
            {currentView === View.SignWrapper && renderSignWrapper()}
        </div>
    );
}
