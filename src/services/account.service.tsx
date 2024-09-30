import axios from "axios";
import { GOOGLE } from "../constants/account.constant";

import { User } from "firebase/auth";

// ---------- Sign Up User ----------
export const SignUpUser = async (data: any) => {
  try {
    const registerUser = await axios.post(
      "http://localhost:3000/users/signup",
      data
    );
    return registerUser;
  } catch (err) {
    throw err;
  }
};

export const VerifyEmail = async (firebase_id: any) => {
  try {
    const response = await axios.put(
      "http://localhost:3000/users/verify-email",
      firebase_id
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const FetchGoogleData = async (token: string) => {
  try {
    const response = await axios.get(GOOGLE.GOOGLELAPIS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Login User ----------
export const LoginUser = async (data: any) => {
  try {
    const loginUser = await axios.post(
      "http://localhost:3000/users/login",
      data
    );
    return loginUser;
  } catch (err) {
    throw err;
  }
};

export const LogoutUser = async (data: any) => {
  try {
    const logoutUser = await axios.post(
      "http://localhost:3000/users/logout",
      data
    );
    return logoutUser;
  } catch (err) {
    throw err;
  }
};

// ---------- Reset Password ----------
export const UserResetPassword = async (data: any) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/users/reset-password",
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

//  ---------- Get User by email ----------
export const GetUserByEmail = async (email: string | null, user: User) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/users/${email}/profile`,
      {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update profile info by user_id ----------
export const UpdateUserProfileById = async (userID: string, data: FormData) => {
  try {
    const response = await axios.put(
      `http://localhost:3000/users/${userID}/profile`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Fetch All Countries ----------
export const FetchAllCountries = async () => {
  try {
    const response = await axios.get("http://localhost:3000/users/countries");
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Fetch dataset by user id ----------
export const FetchDatasetByUserId = async (userID: string) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/users/${userID}/datasets`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Fetch all users ----------
export const FetchAllUsers = async (user: User | null) => {
  try {
    const response = await axios.get("http://localhost:3000/users/all-users", {
      headers: {
        Authorization: `Bearer ${await user?.getIdToken(true)}`,
      },
    });
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Fetch all dataset ----------
export const FetchAllDataset = async (user: User | null) => {
  try {
    const response = await axios.get(
      "http://localhost:3000/users/all-datasets",
      {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken(true)}`,
        },
      }
    );
    return response;
  } catch (err) {
    throw err;
  }
};
