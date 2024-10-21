import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Add Homepage Component ----------
export const AddComponent = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/homepage/add-component`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update Homepage Component ----------
export const UpdateComponent = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/homepage/update-component/${data.homepage_component_id}`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Delete Homepage Component ----------
export const DeleteComponent = async (data: any) => {
  try {
    const response = await axios.delete(
      `${BASE_API_URL}/homepage/delete-component/${data}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Get Homepage Component ----------
export const GetComponent = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/homepage/get-component`);
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Add Homepage Image Slider ----------
export const AddImageSlider = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/homepage/add-image-slider`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Get Homepage Image Slider ----------
export const GetImageSlider = async () => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/homepage/get-image-slider`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update Homepage Image Slider ----------
export const UpdateImageSlider = async (data: any) => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/homepage/update-image-slider`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};
