import React, { useRef, useState, useEffect } from "react";
import styles from "./LibraryAdmin.module.css";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material"; // Import Material-UI components
import {
    fetchCat,
    fetchSign,
    createCat,
    updateCat,
    deleteCat,
    updateSign,
} from "../../../services/library.service";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faImage } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
// @ts-ignore
import { CharacterAnimationsProvider } from "../../../components/SLP/CharacterAnimations";
// @ts-ignore
import Experience from "../../../components/SLP/Experience";
// @ts-ignore
import Man from "../../../components/AvatarModels/Man";
import InputField from "../../../components/InputField/InputField";
import ImageInput from "../../../components/ImageInput/ImageInput";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

interface LibraryCategories {
    category_name: string;
    category_thumbnail: string;
    category_id: number;
}

interface LibrarySigns {
    signId: number;
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
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // State for delete confirmation dialog
    const [openUpdateConfirm, setOpenUpdateConfirm] = useState(false); // State for update confirmation dialog
    const [openUpdateSignConfirm, setOpenUpdateSignConfirm] = useState(false); // State for update confirmation dialog
    const [cattodelete, setcattodelete] = useState<number | null>(null);
    const [cattoupdate, setcattoupdate] = useState<number | null>(null);
    const [signtoupdate, setsigntoupdate] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [resetImage, setResetImage] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");

    const [formData, setFormData] = useState({
        category_name: "",
        category_thumbnail: null as string | null,
    });

    useEffect(() => {
        // Scroll to the top of the page when the view changes
        window.scrollTo(0, 0);
    }, [currentView]); // Scroll when currentView changes

    const resetSearch = () => {
        setSearchKeyword("");
    };

    const handleUpdateCategory = (category: LibraryCategories) => {
        setFormData({
            category_name: category.category_name,
            category_thumbnail: category.category_thumbnail,
        });
        setcattoupdate(category.category_id);
        setOpenUpdateConfirm(true);
    };

    const [signformData, setSignFormData] = useState({
        thumbnail: null,
    });

    const setCategoryThumbnail = (image: any) => {
        setFormData({ ...formData, category_thumbnail: image });
    };

    const setSignThumbnail = (image: any) => {
        setSignFormData({ ...signformData, thumbnail: image });
    };

    // Filter signs based on the search keyword
    const filteredSigns =
        searchKeyword.trim() === ""
            ? signs
            : signs.filter((sign) =>
                  sign.keyword
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase())
              );
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await fetchCat();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleImageReset = () => {
        setResetImage(false);
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

    const confirmDeleteCategory = async () => {
        if (cattodelete === null) return;
        try {
            await deleteCat(cattodelete);
            toast.success(t("deleteCategorySuccess"));
            await fetchCategories();
        } catch (error) {
            toast.error(t("errorDeleteCategory"));
        } finally {
            setOpenDeleteConfirm(false);
            setcattodelete(null);
        }
    };

    const resetForm = () => {
        setFormData({
            category_name: "",
            category_thumbnail: null,
        });

        setSignFormData({
            thumbnail: null,
        });
    };

    async function addCat(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!formData.category_name.trim()) {
            toast.error(t("categoryNameRequired"));
            return;
        }

        if (!formData.category_thumbnail) {
            toast.error(t("categoryImageRequired"));
            return;
        }

        const data = new FormData();
        data.append("category_name", formData.category_name);
        if (formData.category_thumbnail) {
            data.append("image", formData.category_thumbnail);
        } else {
            data.append("imageURL", "");
        }

        try {
            await createCat(data);
            toast.success(t("categoryCreatedSuccess"));
            await fetchCategories();
        } catch (error) {
            toast.error(t("errorCreateCategory"));
        } finally {
            setOpen(false);
        }
    }

    async function editCat(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (cattoupdate === null) return;
        if (!formData.category_name.trim()) {
            toast.error(t("categoryNameRequired"));
            return;
        }

        if (!formData.category_thumbnail) {
            toast.error(t("categoryImageRequired"));
            return;
        }

        const data = new FormData();
        data.append("category_name", formData.category_name);
        if (formData.category_thumbnail) {
            data.append("image", formData.category_thumbnail);
        } else {
            data.append("imageURL", "");
        }

        try {
            await updateCat(cattoupdate, data);
            toast.success(t("categoryUpdatedSuccess"));
            await fetchCategories();
        } catch (error) {
            toast.error(t("errorUpdateCategory"));
        } finally {
            setOpenUpdateConfirm(false);
        }
    }

    async function editSign(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (signtoupdate === null) return;

        if (!signformData.thumbnail) {
            toast.error(t("signThumbnailRequired"));
            return;
        }

        const data = new FormData();
        if (signformData.thumbnail) {
            data.append("image", signformData.thumbnail);
        } else {
            data.append("imageURL", "");
        }

        try {
            await updateSign(signtoupdate, data);
            if (selectedCategory) {
                handleCategoryClick(selectedCategory);
            }
            toast.success(t("signThumbnailSuccess"));
        } catch (error) {
            toast.error(t("errorUpdateSignThumbnail"));
        } finally {
            setOpenUpdateSignConfirm(false);
        }
    }

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
            <div className={styles.buttonContainer}>
                <button
                    className={styles.addCategoryButton}
                    onClick={() => setOpen(true)}
                >
                    {t("addCategory")}
                </button>
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
                        <div className={styles.buttonAdmin}>
                            <button
                                className={styles.dltCatButton}
                                onClick={() => {
                                    setcattodelete(category.category_id);
                                    setOpenDeleteConfirm(true); // Open the delete confirmation dialog
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <button
                                className={styles.updateCatButton}
                                onClick={() => {
                                    handleUpdateCategory(category);
                                    setcattoupdate(category.category_id);
                                    setOpenUpdateConfirm(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                        </div>
                    </Grid>
                ))}
            </Grid>

            {/* Delete confirmation dialog */}
            <Dialog
                className={styles.dialog_overlay}
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
            >
                <DialogContent className={styles.dialog_content2}>
                    <DialogTitle className={styles.dialog_title}>
                        {t("confirmDelete")}
                    </DialogTitle>
                    <DialogContentText className={styles.dialog_description2}>
                        {t("sureDelete")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <div className={styles.buttonsConfirmation}>
                        <button
                            className={styles.noButton}
                            onClick={() => setOpenDeleteConfirm(false)}
                        >
                            {t("no")}
                        </button>
                        <button
                            className={styles.yesButton}
                            onClick={confirmDeleteCategory}
                        >
                            {t("yes")}
                        </button>
                    </div>
                </DialogActions>
            </Dialog>

            {/* Update confirmation dialog */}
            <Dialog
                open={openUpdateConfirm}
                onClose={() => setOpenUpdateConfirm(false)}
            >
                <DialogContent className={styles.dialog_content}>
                    <DialogTitle className={styles.dialog_title}>
                        {t("updateCategory")}
                    </DialogTitle>
                    <DialogContentText className={styles.dialog_description}>
                        {t("please_fill")}
                    </DialogContentText>
                    <form method="post" onSubmit={editCat}>
                        <fieldset className={styles.Fieldset_name}>
                            <InputField
                                label="Category Name"
                                name="category_name"
                                value={formData.category_name}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        category_name: e.target.value,
                                    });
                                }}
                                error=""
                            />
                        </fieldset>
                        <fieldset className={styles.Fieldset_thumbnail}>
                            <ImageInput
                                reset={resetImage}
                                onReset={handleImageReset}
                                setImageInfo={setCategoryThumbnail}
                            />
                        </fieldset>
                        <div
                            style={{
                                display: "flex",
                                marginTop: 75,
                                justifyContent: "flex-end",
                            }}
                        >
                            <button className={styles.saveButton} type="submit">
                                {t("save_changes")}
                            </button>
                        </div>
                    </form>
                    <DialogActions>
                        <button
                            className={styles.icon_button}
                            aria-label="Close"
                            onClick={() => {
                                setOpenUpdateConfirm(false);
                                resetForm(); // Reset the form details
                            }}
                        >
                            {" "}
                            <Cross2Icon className={styles.icon} />
                        </button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <>
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogContent className={styles.dialog_content}>
                        <DialogTitle className={styles.dialog_title}>
                            {t("createCategory")}
                        </DialogTitle>
                        <DialogContentText
                            className={styles.dialog_description}
                        >
                            {t("please_fill")}
                        </DialogContentText>
                        <form method="post" onSubmit={addCat}>
                            <fieldset className={styles.Fieldset_name}>
                                <InputField
                                    label="Category Name"
                                    name="category_name"
                                    value={formData.category_name}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            category_name: e.target.value,
                                        });
                                    }}
                                    error=""
                                />
                            </fieldset>
                            <fieldset className={styles.Fieldset_thumbnail}>
                                <ImageInput
                                    reset={resetImage}
                                    onReset={handleImageReset}
                                    setImageInfo={setCategoryThumbnail}
                                />
                            </fieldset>
                            <div
                                style={{
                                    display: "flex",
                                    marginTop: 75,
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    className={styles.saveButton}
                                    type="submit"
                                >
                                    {t("save_changes")}
                                </button>
                            </div>
                        </form>
                        <DialogActions>
                            <button
                                className={styles.icon_button}
                                aria-label="Close"
                                onClick={() => {
                                    setOpen(false);
                                    resetForm(); // Reset the form details
                                }}
                            >
                                {" "}
                                <Cross2Icon className={styles.icon} />
                            </button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>
            </>
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
                                {/* <Typography variant="body2" className="sign-animations">
                  Animations: {sign.animations.join(", ")}
                </Typography>
                <Typography variant="body2" className="sign-contributor">
                  Contributor: {sign.contributor}
                </Typography> */}
                            </CardContent>
                        </Card>

                        <div className={styles.buttonAdmin}>
                            <button
                                className={styles.updateSignButton}
                                onClick={() => {
                                    setsigntoupdate(sign.signId);
                                    setOpenUpdateSignConfirm(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                        </div>
                        <Dialog
                            open={openUpdateSignConfirm}
                            onClose={() => setOpenUpdateSignConfirm(false)}
                        >
                            <DialogContent className={styles.dialog_content3}>
                                <DialogTitle className={styles.dialog_title}>
                                {t("updateSignThumbnail")}
                                </DialogTitle>
                                <DialogContentText
                                    className={styles.dialog_description}
                                >
                                    {t("plsUploadImage")}
                                </DialogContentText>
                                <form method="post" onSubmit={editSign}>
                                    <br /> <br /> <br />
                                    <fieldset
                                        className={styles.Fieldset_thumbnail}
                                    >
                                        <ImageInput
                                            reset={resetImage}
                                            onReset={handleImageReset}
                                            setImageInfo={setSignThumbnail}
                                        />
                                    </fieldset>
                                    <div
                                        style={{
                                            display: "flex",
                                            marginTop: 75,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <button
                                            className={styles.saveButton}
                                            type="submit"
                                        >
                                            {t("save_changes")}
                                        </button>
                                    </div>
                                </form>
                                <DialogActions>
                                    <button
                                        className={styles.icon_button}
                                        aria-label="Close"
                                        onClick={() => {
                                            setOpenUpdateSignConfirm(false);
                                            resetForm();
                                        }}
                                    >
                                        {" "}
                                        <Cross2Icon className={styles.icon} />
                                    </button>
                                </DialogActions>
                            </DialogContent>
                        </Dialog>
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
