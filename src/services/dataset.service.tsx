//dataset.service.tsx
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const submitForm = async (formData: FormData): Promise<any> => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/datasetForms`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const getAllFormsForSignExpert = async (): Promise<any> => {
  try {
    const response = await axios.get(
      "http://localhost:3000/datasetForms/signexpert"
    );
    return response.data; // Assuming the forms are returned in the response data
  } catch (err) {
    throw err;
  }
};

export const getAllFormsForAdmin = async (): Promise<any> => {
  try {
    const response = await axios.get(
      "http://localhost:3000/datasetForms/admin"
    );
    return response.data; // Assuming the forms are returned in the response data
  } catch (err) {
    throw err;
  }
};

export const updateFormById = async (
  formId: number,
  updatedFormData: Record<string, string>,
  updatedMessage: string
): Promise<any> => {
  try {
    const response = await axios.put(
      `http://localhost:3000/datasetForms/${formId}`,
      { ...updatedFormData, message: updatedMessage }, // Combine the form data and message
      {
        headers: {
          "Content-Type": "application/json", // Change content type to JSON
        },
      }
    );
    return response.data; // Return the response data
  } catch (err) {
    throw err;
  }
};

export const updateFormWithVideoById = async (
  formId: number,
  updatedFormData: Record<string, string>,
  video: File,
  updatedMessage: string
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("video", video);

    for (const key in updatedFormData) {
      formData.append(key, updatedFormData[key]);
    }
    formData.append("message", updatedMessage); // Add the updated message to form data

    const response = await axios.put(
      `http://localhost:3000/datasetForms/avatarVideo/${formId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Use multipart form data for file uploads
        },
      }
    );
    return response.data; // Return the response data
  } catch (err) {
    throw err;
  }
};

export const getFormById = async (formId: number): Promise<any> => {
  try {
    const response = await axios.get(
      `http://localhost:3000/datasetForms/${formId}`
    );

    return response.data; // Assuming the forms are returned in the response data
  } catch (err) {
    throw err;
  }
};

export const getDemoVidById = async (formId: number): Promise<any> => {
  try {
    const response = await axios.get(
      `http://localhost:3000/datasetForms/demoVid/${formId}`,
      { responseType: "arraybuffer" } // Set responseType to 'arraybuffer' to receive raw binary data
    );
    return response; // Return the raw binary data
  } catch (err) {
    throw err;
  }
};

export const getAvatarVidById = async (formId: number): Promise<any> => {
  try {
    const response = await axios.get(
      `http://localhost:3000/datasetForms/avatarVid/${formId}`,
      { responseType: "arraybuffer" } // Set responseType to 'arraybuffer' to receive raw binary data
    );
    return response; // Return the raw binary data
  } catch (err) {
    throw err;
  }
};

export const deleteFormById = async (
  formId: number,
  updatedMessage: string
): Promise<any> => {
  try {
    // Assuming updatedMessage needs to be sent as part of the request body
    const response = await axios.delete(
      `http://localhost:3000/datasetForms/${formId}`,
      {
        data: { message: updatedMessage },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};
