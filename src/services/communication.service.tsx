import axios from "axios";
import { use } from "i18next";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const createLogsByUser = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/logs/user/create`, data);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteAllLogsByUser = async (userId: string, data: any) => {
  try {
    const response = await axios.delete(`${BASE_API_URL}/logs/user/${userId}`, {
      data: data,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

export const fetchLogsByUser = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_API_URL}/logs/user`, data);
    return response;
  } catch (err) {
    throw err;
  }
};
