import { useState, useRef, useEffect, ChangeEvent } from "react";
import style from "./EditDialog.module.css";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Ariakit from "@ariakit/react";
import { Pencil, GalleryThumbnails, Component, X, Info } from "lucide-react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { UploadOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import InputField from "@root/components/InputField/InputField";
import { AddComponent, GetComponent, UpdateComponent, DeleteComponent, AddImageSlider, GetImageSlider, UpdateImageSlider } from "@root/services/edithomepage.service.js";
// @ts-ignore
import { storage } from "../../../firebase.js";
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { Reorder } from "framer-motion";
import { Item } from "./Item";

import { useHomepageStore } from "@root/store/homepageStore.js";

type ImageModule = {
    image: File | string | null;
    sequence: number;
    status: string;
};

type ComponentModule = {
    homepage_component_id: number;
    title: string;
    type: "module" | "youtube" | "about" | "location";
    description: string;
    image: File | string | null;
    link: string;
};

export default function EditDialog() {
    const { setImageSlider, setComponents } = useHomepageStore();

    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("image slider");

    // For image slider
    const [imageModuleData, setImageModuleData] = useState<ImageModule>({
        image: "",
        sequence: 0,
        status: "Shown",
    });
    const [showAddImage, setShowAddImage] = useState(false);

    const [imageRows, setImageRows] = useState<ImageModule[]>([]);
    const [deleteImageRows, setDeleteImageRows] = useState<ImageModule[]>([]);
    const [copyImageRows, setCopyImageRows] = useState<ImageModule[]>([]);

    const imageContentRef = useRef<HTMLDivElement>(null);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [showImageSliderConfirmDialog, setShowImageSliderConfirmDialog] = useState(false);
    const [imageSliderUpload, setImageSliderUpload] = useState<string | null>();
    const [isClickingSaveButton, setIsClickingSaveButton] = useState(false);
    const [hasAddItemToImageSlider, setHasAddItemToImageSlider] = useState(false);

    // For components
    const [componentModuleData, setComponentModuleData] = useState<ComponentModule>({
        homepage_component_id: 0,
        title: "",
        type: "module",
        description: "",
        image: null as File | null,
        link: "",
    });
    const [addComponentOpen, setAddComponentOpen] = useState(false);
    const [componentRows, setComponentRows] = useState<ComponentModule[]>([]);
    const [imageUpload, setImageUpload] = useState<string | null>();
    const [selectTypeOpen, setSelectTypeOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const types = ["module", "youtube", "about", "location"];

    const [hasInteractedWithTitle, setHasInteractedWithTitle] = useState(false);
    const [hasInteractedWithDescription, setHasInteractedWithDescription] = useState(false);
    const [hasInteractedWithLink, setHasInteractedWithLink] = useState(false);
    const [hasInteractedWithImage, setHasInteractedWithImage] = useState(false);

    const fetchComponent = async () => {
        try {
            const response = await GetComponent();
            setComponentRows(response.data);
            setComponents(response.data);
        } catch (err) {
            toast.error(t("failed_fetch_components"));
        }
    };

    const fetchImageSlider = async () => {
        try {
            const response = await GetImageSlider();
            setImageRows(response.data.sort((a: ImageModule, b: ImageModule) => a.sequence - b.sequence));
            setCopyImageRows(response.data.sort((a: ImageModule, b: ImageModule) => a.sequence - b.sequence));
            setImageSlider((response.data as ImageModule[]).filter(slide => slide.status === "Shown").sort((a, b) => a.sequence - b.sequence));
            setShowSaveButton(false);
        } catch (err) {
            toast.error(t("failed_fetch_image_sliders"));
        }
    };

    useEffect(() => {
        fetchComponent();
        fetchImageSlider();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        setHasInteractedWithImage(true);

        if (file) {
            const fileType = file.type.split("/")[0];
            if (fileType !== "image") {
                toast.error(t("please_select_image"));
                return;
            }

            setComponentModuleData(prevState => ({
                ...prevState,
                image: file,
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    setImageUpload(reader.result);
                }
            };
            reader.readAsDataURL(file);
        } else {
            toast.error(t("no_file_selected"));
        }
    };

    const handleImageSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];

        if (file) {
            const fileType = file.type.split("/")[0];
            if (fileType !== "image") {
                toast.error(t("please_select_image"));
                return;
            }

            setImageModuleData(prevState => ({
                ...prevState,
                image: file,
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    setImageSliderUpload(reader.result);
                }
            };
            reader.readAsDataURL(file);
        } else {
            toast.error(t("no_file_selected"));
        }
        setShowSaveButton(true);
    };

    const uploadInputData = async (downloadURL: string) => {
        const updatedComponentData: ComponentModule = {
            ...componentModuleData,
            image: downloadURL,
        };

        const response = await AddComponent(updatedComponentData);
    };

    const addComponentRow = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (componentModuleData.title === "") {
            setHasInteractedWithTitle(true);
        }

        if (componentModuleData.type === "about" && componentModuleData.description === "") {
            setHasInteractedWithDescription(true);
        }

        if (["module", "youtube", "location"].includes(componentModuleData.type) && componentModuleData.link === "") {
            setHasInteractedWithLink(true);
        }

        if (["module", "about"].includes(componentModuleData.type) && componentModuleData.image === null) {
            setHasInteractedWithImage(true);
        }

        const moduleComponentCount = componentRows.filter(row => row.type === "module").length;
        const youtubeComponentCount = componentRows.filter(row => row.type === "youtube").length;
        const aboutComponentCount = componentRows.filter(row => row.type === "about").length;
        const locationComponentCount = componentRows.filter(row => row.type === "location").length;

        toast.promise(
            (async () => {
                if (componentModuleData.type === "module" && moduleComponentCount >= 3) {
                    throw new Error(t("maximum_module_reached"));
                }

                if (componentModuleData.type === "about" && aboutComponentCount >= 1) {
                    throw new Error(t("maximum_about_reached"));
                }

                if (componentModuleData.type === "youtube" && youtubeComponentCount >= 1) {
                    throw new Error(t("maximum_youtube_reached"));
                }

                if (componentModuleData.type === "location" && locationComponentCount >= 1) {
                    throw new Error(t("maximum_location_reached"));
                }

                if (componentModuleData.image instanceof File && ["module", "about"].includes(componentModuleData.type)) {
                    try {
                        const storageRef = ref(storage, `homepageComponentImage/${uuidv4()}`);

                        await uploadBytes(storageRef, componentModuleData.image)
                            .then(async snapshot => {
                                const downloadURL = await getDownloadURL(storageRef);
                                await uploadInputData(downloadURL);
                            })
                            .catch(error => {
                                throw new Error(t("failed_upload_image"));
                            });
                    } catch (err) {
                        throw new Error(t("failed_add_component"));
                    }
                } else if (componentModuleData.type === "youtube" || componentModuleData.type === "location") {
                    try {
                        await AddComponent(componentModuleData);
                    } catch (err) {
                        throw new Error(t("failed_add_component"));
                    }
                } else {
                    throw new Error("No file to upload, or the image is already a URL.");
                }

                await fetchComponent().then(() => {
                    setAddComponentOpen(false);
                    setComponentModuleData({
                        homepage_component_id: 0,
                        title: "",
                        type: "module",
                        description: "",
                        image: null,
                        link: "",
                    });
                    setImageUpload(null);
                });
            })(),
            {
                loading: t("loading_add_component"),
                success: t("success_add_component"),
                error: err => {
                    console.error(err);
                    return err.message;
                },
            }
        );
    };

    const confirmDeleteComponent = async (data: ComponentModule) => {
        try {
            const response = await DeleteComponent(data.homepage_component_id);
            if (data.image) {
                const imageRef = ref(storage, data.image as string);
                await deleteObject(imageRef)
                    .then(() => {
                        console.log("Image deleted successfully");
                    })
                    .catch(error => {
                        console.error("Failed to delete image", error);
                    });
            }

            toast.success(t("delete_component_success"));
            await fetchComponent();
        } catch (err) {
            toast.error(t("delete_component_failed"));
        }
    };

    const handleSaveImageSlider = () => {
        setIsClickingSaveButton(true);
        const imageSliderComponentCount = imageRows.length;

        toast.promise(
            (async () => {
                if (hasAddItemToImageSlider) {
                    if (imageModuleData.image instanceof File) {
                        try {
                            const storageRef = ref(storage, `homepageImageSlider/${uuidv4()}`);

                            await uploadBytes(storageRef, imageModuleData.image)
                                .then(async snapshot => {
                                    const downloadURL = await getDownloadURL(storageRef);
                                    await AddImageSlider({ image: downloadURL, sequence: imageSliderComponentCount + 1, status: imageModuleData.status });
                                })
                                .catch(error => {
                                    throw new Error(t("failed_upload_image"));
                                });

                            await fetchImageSlider().then(() => {
                                setImageModuleData({
                                    image: "",
                                    sequence: 0,
                                    status: "Shown",
                                });
                                setImageSliderUpload(null);
                                setShowAddImage(false);
                                setHasAddItemToImageSlider(false);
                                setOpen(false);
                                setShowImageSliderConfirmDialog(false);
                            });
                        } catch (err) {
                            console.error(err);
                            throw new Error(t("failed_add_image_slider"));
                        }
                    } else {
                        throw new Error("No file to upload, or the image is already a URL.");
                    }
                } else {
                    try {
                        await UpdateImageSlider(imageRows);

                        if (deleteImageRows.length > 0) {
                            for (const image of deleteImageRows) {
                                const imageRef = ref(storage, image.image as string);
                                await deleteObject(imageRef)
                                    .then(() => {
                                        console.log("Image deleted successfully");
                                    })
                                    .catch(error => {
                                        toast.error(t("failed_delete_image"));
                                        console.error("Failed to delete image", error);
                                    });
                            }
                        }

                        await fetchImageSlider().then(() => {
                            setOpen(false);
                            setShowSaveButton(false);
                            setShowImageSliderConfirmDialog(false);
                        });
                    } catch (err) {
                        throw new Error(t("failed_update_image_slider"));
                    }
                }
            })(),
            {
                loading: t("loading_add_image_slider"),
                success: t("success_add_image_slider"),
                error: err => {
                    console.error(err);
                    return err.message;
                },
            }
        );
    };

    // Reset the value of the input field(with the error) and the image when the dialog is closed
    useEffect(() => {
        if (!open) {
            setComponentModuleData({
                homepage_component_id: 0,
                title: "",
                type: "module",
                description: "",
                image: null,
                link: "",
            });
            setImageUpload(null);
            setHasInteractedWithTitle(false);
            setHasInteractedWithDescription(false);
            setHasInteractedWithLink(false);
            setHasInteractedWithImage(false);
            setShowAddImage(false);
            setImageSliderUpload(null);
        }

        if (!addComponentOpen) {
            setComponentModuleData({
                homepage_component_id: 0,
                title: "",
                type: "module",
                description: "",
                image: null,
                link: "",
            });
            setImageUpload(null);
            setHasInteractedWithTitle(false);
            setHasInteractedWithDescription(false);
            setHasInteractedWithLink(false);
            setHasInteractedWithImage(false);
        }
    }, [open, addComponentOpen]);

    const handleHideImageSlider = async (data: ImageModule) => {
        let updatedData = {
            ...data,
            status: data.status === "Shown" ? "Hidden" : "Shown",
        };
        setImageRows(prevState => {
            const index = prevState.findIndex(row => row.sequence === data.sequence);
            prevState[index] = updatedData;
            return [...prevState];
        });
        setShowSaveButton(true);
    };

    const handleDeleteImageSlider = async (data: ImageModule) => {
        const updatedData = imageRows.filter(row => row.sequence !== data.sequence);
        setImageRows(updatedData);
        setDeleteImageRows(prevState => [...prevState, data]);
        setShowSaveButton(true);
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={open => {
                if (!open && showSaveButton && !isClickingSaveButton) {
                    setShowImageSliderConfirmDialog(true);
                } else {
                    setOpen(open);
                    setShowAddImage(false);
                    setHasAddItemToImageSlider(false);
                    setShowSaveButton(false);
                    setIsClickingSaveButton(false);
                }
            }}>
            <Dialog.Trigger className={style.pencil_container} style={{ opacity: open ? 0 : 1 }}>
                <Pencil />
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className={style.overlay} />
                <Dialog.Content className={style.content}>
                    <Dialog.Title className={style.dialog_title}>
                        {t("edit_homepage")}
                        <Dialog.Close asChild>
                            <button className={style.close_icon} aria-label="Close">
                                <X size={30} />
                            </button>
                        </Dialog.Close>
                    </Dialog.Title>

                    <Tabs.Root defaultValue="image slider" onValueChange={setActiveTab}>
                        <Tabs.List className={style.tabs_list}>
                            <Tabs.Trigger className={style.tabs_trigger} value="image slider">
                                <GalleryThumbnails />
                                {t("img_slider")}
                            </Tabs.Trigger>
                            <Tabs.Trigger className={style.tabs_trigger} value="components">
                                <Component />
                                {t("components")}
                            </Tabs.Trigger>

                            {activeTab === "components" ? (
                                <div className={style.submit_btn_grp}>
                                    <Dialog.Root open={addComponentOpen} onOpenChange={setAddComponentOpen}>
                                        <Dialog.Trigger asChild>
                                            <div className={style.info_add_grp}>
                                                <Tooltip.Provider>
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <Info className={style.infoIcon} />
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content className={style.TooltipContent} sideOffset={5}>
                                                                {/* Recommended image size: 2205x906 */}
                                                                <b style={{ fontSize: 13 }}>{t("component_info")}</b> <br />
                                                                &#x2022; {t("component_info_module")} <br />
                                                                &#x2022; {t("componenet_info_about")} <br />
                                                                &#x2022; {t("componenet_info_youtube")} <br />
                                                                &#x2022; {t("componenet_info_location")}
                                                                <Tooltip.Arrow className={style.TooltipArrow} />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    </Tooltip.Root>
                                                </Tooltip.Provider>
                                                <button className={style.add_btn}>{t("add")}</button>
                                            </div>
                                        </Dialog.Trigger>
                                        <Dialog.Portal>
                                            <Dialog.Overlay className={style.overlay} />
                                            <Dialog.Content className={style.content2}>
                                                <Dialog.Title className={style.dialog_title}>
                                                    {t("add_homepage_element")}
                                                    <Dialog.Close asChild>
                                                        <button className={style.close_icon} aria-label="Close">
                                                            <X size={30} />
                                                        </button>
                                                    </Dialog.Close>
                                                </Dialog.Title>
                                                <form className={style.dialog_content2} onSubmit={addComponentRow}>
                                                    <div className={style.select_container2}>
                                                        <Ariakit.SelectProvider
                                                            setOpen={open => {
                                                                setSelectTypeOpen(open);
                                                            }}
                                                            setValue={value => {
                                                                setComponentModuleData({
                                                                    type: value as "module" | "youtube" | "about" | "location",
                                                                    homepage_component_id: 0,
                                                                    title: "",
                                                                    description: "",
                                                                    image: null,
                                                                    link: "",
                                                                });
                                                                setImageUpload(null);
                                                            }}
                                                            defaultValue={componentModuleData.type}>
                                                            <Ariakit.SelectLabel className={style.select_label2}>{t("type")}</Ariakit.SelectLabel>
                                                            <Ariakit.Select className={style.selectTrigger2}>
                                                                {t(componentModuleData.type)}
                                                                <div className={`${style.selectTriggerIcon2} ${selectTypeOpen ? style.selectIconFocus2 : ""}`}>
                                                                    <ChevronDownIcon />
                                                                </div>
                                                            </Ariakit.Select>
                                                            <Ariakit.SelectPopover gutter={4} sameWidth className={style.selectPopover2}>
                                                                {types.map((type, index) => (
                                                                    <Ariakit.SelectItem
                                                                        key={index}
                                                                        className={style.selectItem2}
                                                                        value={type}
                                                                        onClick={() => {
                                                                            setComponentModuleData(prev => ({
                                                                                ...prev,
                                                                                type: type as "module" | "youtube" | "about" | "location",
                                                                            }));
                                                                            setSelectTypeOpen(false);
                                                                        }}>
                                                                        {type === "youtube" ? "Youtube" : t(type)}
                                                                    </Ariakit.SelectItem>
                                                                ))}
                                                            </Ariakit.SelectPopover>
                                                        </Ariakit.SelectProvider>
                                                    </div>
                                                    {componentModuleData.type === "module" && (
                                                        <div className={style.input_fieldset}>
                                                            <InputField
                                                                label={t("title")}
                                                                name="Title"
                                                                value={componentModuleData?.title}
                                                                onChange={event => {
                                                                    setComponentModuleData({
                                                                        ...componentModuleData,
                                                                        title: event.target.value,
                                                                    });
                                                                    setHasInteractedWithTitle(true);
                                                                }}
                                                                error={hasInteractedWithTitle && componentModuleData.title === "" ? t("title_required") : ""}
                                                            />
                                                        </div>
                                                    )}
                                                    {componentModuleData.type === "about" && (
                                                        <div className={style.input_fieldset}>
                                                            <InputField
                                                                label={t("description")}
                                                                name="Description"
                                                                value={componentModuleData?.description}
                                                                onChange={event => {
                                                                    setComponentModuleData({
                                                                        ...componentModuleData,
                                                                        description: event.target.value,
                                                                    });
                                                                    setHasInteractedWithDescription(true);
                                                                }}
                                                                multipleLines={true}
                                                                error={hasInteractedWithDescription && componentModuleData.description === "" ? t("description_required") : ""}
                                                            />
                                                        </div>
                                                    )}
                                                    {["module", "youtube", "location"].includes(componentModuleData.type) && (
                                                        <div className={style.input_fieldset}>
                                                            <InputField
                                                                label={t("link")}
                                                                name="Link"
                                                                value={componentModuleData?.link}
                                                                onChange={event => {
                                                                    setComponentModuleData({
                                                                        ...componentModuleData,
                                                                        link: event.target.value,
                                                                    });
                                                                    setHasInteractedWithLink(true);
                                                                }}
                                                                error={hasInteractedWithLink && componentModuleData.link === "" ? t("link_required") : ""}
                                                            />
                                                        </div>
                                                    )}
                                                    {["module", "about"].includes(componentModuleData.type) && (
                                                        <div>
                                                            <label htmlFor="file" className={style.uploadLabel} style={{ marginBottom: "20px" }}>
                                                                <>
                                                                    {imageUpload ? (
                                                                        <img src={imageUpload} alt="thumbnail" className={style.thumbnail2} />
                                                                    ) : (
                                                                        <>
                                                                            <UploadOutlined /> &nbsp; {t("upload_an_image")}
                                                                        </>
                                                                    )}
                                                                    <input type="file" id="file" className={style.img_input} onChange={handleImageChange} accept="image/jpeg, image/png, image/jpg" />
                                                                </>
                                                            </label>
                                                            {hasInteractedWithImage && !imageUpload && <span className={style.error_message}>{t("no_file_selected")}</span>}
                                                        </div>
                                                    )}
                                                    <button className={style.save_btn} type="submit">
                                                        {t("save")}
                                                    </button>
                                                </form>
                                            </Dialog.Content>
                                        </Dialog.Portal>
                                    </Dialog.Root>
                                </div>
                            ) : (
                                <div className={style.submit_btn_grp}>
                                    <button
                                        className={style.add_btn}
                                        onClick={() => {
                                            setHasAddItemToImageSlider(true);
                                            setShowAddImage(true);
                                            imageContentRef.current?.scrollTo({ top: imageContentRef.current.scrollHeight, behavior: "smooth" });
                                        }}>
                                        {t("add")}
                                    </button>
                                    {showSaveButton && (
                                        <button className={style.save_btn} onClick={handleSaveImageSlider}>
                                            {t("save_changes")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </Tabs.List>
                        <div className={style.dialog_content} ref={imageContentRef}>
                            {/* Image Slider Tab Content */}
                            <Tabs.Content className={style.tabs_content} value="image slider">
                                <div className={style.table_container}>
                                    <div className={`${style.row} ${style.header_row}`}>
                                        <div>No</div>
                                        <div>{t("images")}</div>
                                        <div>{t("dc_status")}</div>
                                        <div>{t("action")}</div>
                                    </div>
                                    <hr className={style.divider} />
                                    <Reorder.Group
                                        axis="y"
                                        values={imageRows}
                                        onReorder={value => {
                                            // change its sequence to its current index + 1
                                            const updatedImageRows = value.map((row, index) => {
                                                return {
                                                    ...row,
                                                    sequence: index + 1,
                                                };
                                            });
                                            setImageRows(updatedImageRows);
                                            setShowSaveButton(true);
                                        }}
                                        as="div"
                                        className="">
                                        {imageRows.map((row, index) => (
                                            <Item item={row} key={row.image?.toString()} index={index + 1} handleHide={() => handleHideImageSlider(row)} handleDelete={() => handleDeleteImageSlider(row)} />
                                        ))}
                                        {showAddImage && (
                                            <div className={style.row}>
                                                <div>{imageRows.length + 1}</div>
                                                <div>
                                                    <label htmlFor="imageSliderFile" className={style.uploadLabel}>
                                                        {imageSliderUpload ? (
                                                            <img src={imageSliderUpload} alt="thumbnail" className={style.thumbnail} />
                                                        ) : (
                                                            <>
                                                                <UploadOutlined /> &nbsp; {t("upload_an_image")}
                                                            </>
                                                        )}
                                                        <input type="file" name="" id="imageSliderFile" className={style.img_input} onChange={handleImageSliderChange} accept="image/jpeg, image/png, image/jpg" />
                                                    </label>
                                                </div>

                                                <div>
                                                    <div className={style.select_container}>
                                                        <Ariakit.SelectProvider
                                                            setOpen={open => {
                                                                setSelectTypeOpen(open);
                                                            }}
                                                            setValue={value => {
                                                                setImageModuleData(prevState => ({
                                                                    ...prevState,
                                                                    status: value as "Shown" | "Hidden",
                                                                }));
                                                            }}
                                                            defaultValue={imageModuleData.status}>
                                                            <Ariakit.Select className={style.selectTrigger}>
                                                                {imageModuleData.status === "Shown" ? t("shown") : t("hidden")}
                                                                <div className={`${style.selectTriggerIcon} ${selectTypeOpen ? style.selectIconFocus : ""}`}>
                                                                    <ChevronDownIcon />
                                                                </div>
                                                            </Ariakit.Select>
                                                            <Ariakit.SelectPopover gutter={4} sameWidth className={style.selectPopover}>
                                                                {["Shown", "Hidden"].map((status, index) => (
                                                                    <Ariakit.SelectItem
                                                                        key={index}
                                                                        className={style.selectItem}
                                                                        value={status}
                                                                        onClick={() => {
                                                                            setImageModuleData(prevState => ({
                                                                                ...prevState,
                                                                                status: status as "Shown" | "Hidden",
                                                                            }));
                                                                            setSelectTypeOpen(false);
                                                                        }}>
                                                                        {status === "Shown" ? t("shown") : t("hidden")}
                                                                    </Ariakit.SelectItem>
                                                                ))}
                                                            </Ariakit.SelectPopover>
                                                        </Ariakit.SelectProvider>
                                                    </div>
                                                </div>
                                                <div></div>
                                            </div>
                                        )}
                                    </Reorder.Group>
                                </div>
                            </Tabs.Content>

                            {/* Components Tab Content */}
                            <Tabs.Content className={style.tabs_content} value="components">
                                <div className={style.table_container}>
                                    <div className={style.row2}>
                                        <div>No</div>
                                        <div>{t("type")}</div>
                                        <div>{t("action")}</div>
                                    </div>
                                    <hr className={style.divider} />
                                    {componentRows.map((row, index) => (
                                        <div className={style.row2} key={index}>
                                            <div>{index + 1}</div>
                                            <div>{row.type === "module" ? t("available") + " " + t("module") : row.type === "about" ? t("about") + " Neuon AI" : row.type === "youtube" ? "YouTube Video" : t("location")}</div>
                                            <div className={style.btn_grp}>
                                                <Dialog.Root>
                                                    <Dialog.Trigger asChild>
                                                        <button className={`${style.table_btn_grp} ${style.hide_button}`}>{t("edit")}</button>
                                                    </Dialog.Trigger>
                                                    <Dialog.Portal>
                                                        <Dialog.Overlay className={style.overlay} />
                                                        <Dialog.Content className={style.content2}>
                                                            <Dialog.Title className={style.dialog_title}>
                                                                {t("edit_homepage_element")}
                                                                <Dialog.Close asChild>
                                                                    <button className={style.close_icon} aria-label="Close">
                                                                        <X size={30} />
                                                                    </button>
                                                                </Dialog.Close>
                                                            </Dialog.Title>
                                                            <div className={style.dialog_content2}>
                                                                <div className={style.select_container2}>
                                                                    <Ariakit.SelectProvider defaultValue={row.type}>
                                                                        <Ariakit.SelectLabel className={style.select_label2}>{t("type")}</Ariakit.SelectLabel>
                                                                        <Ariakit.Select className={style.selectTrigger2} disabled={isEditMode} style={{ backgroundColor: "rgb(231, 231, 231)", cursor: "not-allowed" }}>
                                                                            {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
                                                                            <div className={`${style.selectTriggerIcon2} ${selectTypeOpen ? style.selectIconFocus2 : ""}`} style={{ cursor: "not-allowed" }}>
                                                                                <ChevronDownIcon style={{ cursor: "not-allowed" }} />
                                                                            </div>
                                                                        </Ariakit.Select>
                                                                    </Ariakit.SelectProvider>
                                                                </div>

                                                                <div className={style.input_fieldset}>
                                                                    {row.type === "module" && (
                                                                        <InputField
                                                                            label={t("title")}
                                                                            name="Title"
                                                                            value={row.title}
                                                                            onChange={event => {
                                                                                const updatedRows = [...componentRows];
                                                                                updatedRows[index].title = event.target.value;
                                                                                setComponentRows(updatedRows);
                                                                            }}
                                                                            error=""
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className={style.input_fieldset}>
                                                                    {row.type === "about" && (
                                                                        <InputField
                                                                            label={t("description")}
                                                                            name="Description"
                                                                            value={row.description}
                                                                            onChange={event => {
                                                                                const updatedRows = [...componentRows];
                                                                                updatedRows[index].description = event.target.value;
                                                                                setComponentRows(updatedRows);
                                                                            }}
                                                                            multipleLines={true}
                                                                            error=""
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className={style.input_fieldset}>
                                                                    {["module", "youtube", "location"].includes(row.type) && (
                                                                        <InputField
                                                                            label={t("link")}
                                                                            name="Link"
                                                                            value={row.link}
                                                                            onChange={event => {
                                                                                const updatedRows = [...componentRows];
                                                                                updatedRows[index].link = event.target.value;
                                                                                setComponentRows(updatedRows);
                                                                            }}
                                                                            error=""
                                                                        />
                                                                    )}
                                                                </div>
                                                                {["module", "about"].includes(row.type) && (
                                                                    <label htmlFor="file" className={style.uploadLabel} style={{ marginBottom: "20px" }}>
                                                                        <>
                                                                            {row.image ? (
                                                                                <img src={row.image as string} alt="thumbnail" className={style.thumbnail2} />
                                                                            ) : (
                                                                                <>
                                                                                    <UploadOutlined /> &nbsp; {t("upload_an_image")}
                                                                                </>
                                                                            )}
                                                                            <input
                                                                                type="file"
                                                                                id="file"
                                                                                className={style.img_input}
                                                                                onChange={e => {
                                                                                    const file = e.target.files && e.target.files[0];

                                                                                    if (file) {
                                                                                        const reader = new FileReader();
                                                                                        reader.onloadend = () => {
                                                                                            if (typeof reader.result === "string") {
                                                                                                const updatedRows = [...componentRows];
                                                                                                updatedRows[index].image = reader.result;
                                                                                                setComponentRows(updatedRows);
                                                                                            }
                                                                                        };
                                                                                        reader.readAsDataURL(file);
                                                                                    } else {
                                                                                        toast.error(t("no_file_selected"));
                                                                                    }
                                                                                }}
                                                                                accept="image/jpeg, image/png, image/jpg"
                                                                            />
                                                                        </>
                                                                    </label>
                                                                )}

                                                                <Dialog.Close asChild>
                                                                    <button
                                                                        className={style.save_btn}
                                                                        onClick={async () => {
                                                                            try {
                                                                                await UpdateComponent(row);
                                                                                toast.success(t("update_component_success"));
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                                toast.error(t("update_component_failed"));
                                                                            }
                                                                        }}>
                                                                        {t("save")}
                                                                    </button>
                                                                </Dialog.Close>
                                                            </div>
                                                        </Dialog.Content>
                                                    </Dialog.Portal>
                                                </Dialog.Root>

                                                <Dialog.Root>
                                                    <Dialog.Trigger asChild>
                                                        <button className={`${style.table_btn_grp} ${style.delete_button}`}>{t("delete")}</button>
                                                    </Dialog.Trigger>
                                                    <Dialog.Portal>
                                                        <Dialog.Overlay className={style.dlt_dialog_overlay} />
                                                        <Dialog.Content className={style.dlt_dialog_content}>
                                                            <Dialog.Title className={style.dialog_title}>{t("confirm_delete")}</Dialog.Title>
                                                            <Dialog.Description className={style.dlt_dialog_description}>{t("sure_delete_component")}</Dialog.Description>
                                                            <div className={style.buttonsConfirmation}>
                                                                <Dialog.Close asChild>
                                                                    <button className={style.noButton}>{t("no")}</button>
                                                                </Dialog.Close>
                                                                <Dialog.Close asChild>
                                                                    <button className={style.yesButton} onClick={async () => await confirmDeleteComponent(row)}>
                                                                        {t("yes")}
                                                                    </button>
                                                                </Dialog.Close>
                                                            </div>
                                                        </Dialog.Content>
                                                    </Dialog.Portal>
                                                </Dialog.Root>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Tabs.Content>
                        </div>
                    </Tabs.Root>
                </Dialog.Content>
            </Dialog.Portal>

            <Dialog.Root open={showImageSliderConfirmDialog}>
                <Dialog.Portal>
                    <Dialog.Overlay className={style.dlt_dialog_overlay} />
                    <Dialog.Content className={style.dlt_dialog_content}>
                        <Dialog.Title className={style.dialog_title}>{t("img_slider_confirm_close")}</Dialog.Title>
                        <Dialog.Description className={style.dlt_dialog_description}>{t("img_slider_confirm_close_desc")}</Dialog.Description>
                        <div className={style.buttonsConfirmation}>
                            <Dialog.Close asChild>
                                <button
                                    className={style.noButton}
                                    onClick={() => {
                                        setOpen(false);
                                        setShowImageSliderConfirmDialog(false);
                                        setImageRows(copyImageRows);
                                    }}>
                                    {t("yes_close")}
                                </button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                                <button
                                    className={style.yesButton}
                                    onClick={() => {
                                        setOpen(true);
                                        setShowImageSliderConfirmDialog(false);
                                    }}>
                                    {t("dc_cancel")}
                                </button>
                            </Dialog.Close>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </Dialog.Root>
    );
}
