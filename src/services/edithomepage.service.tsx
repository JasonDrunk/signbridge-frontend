import axios from "axios";

// ---------- Add Homepage Component ----------
export const AddComponent = async (data: any) => {
    try {
        const response = await axios.post("http://localhost:3000/homepage/add-component", data);
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Update Homepage Component ----------
export const UpdateComponent = async (data: any) => {
    try {
        const response = await axios.put(`http://localhost:3000/homepage/update-component/${data.homepage_component_id}`, data);
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Delete Homepage Component ----------
export const DeleteComponent = async (data: any) => {
    try {
        const response = await axios.delete(`http://localhost:3000/homepage/delete-component/${data}`);
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Get Homepage Component ----------
export const GetComponent = async () => {
    try {
        const response = await axios.get("http://localhost:3000/homepage/get-component");
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Add Homepage Image Slider ----------
export const AddImageSlider = async (data: any) => {
    try {
        const response = await axios.post("http://localhost:3000/homepage/add-image-slider", data);
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Get Homepage Image Slider ----------
export const GetImageSlider = async () => {
    try {
        const response = await axios.get("http://localhost:3000/homepage/get-image-slider");
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Update Homepage Image Slider ----------
export const UpdateImageSlider = async (data: any) => {
    try {
        const response = await axios.put(`http://localhost:3000/homepage/update-image-slider`, data);
        return response;
    } catch (err) {
        throw err;
    }
};