import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Create Notification ----------
export const CreateNotification = async (data: any) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/notifications/create-notification`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Get user_id by email ----------
export const GetUserIdByEmail = async (email: any) => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/notifications/user/${email}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Get notifications by id ----------
export const GetNotificationsById = async (receiverId: any) => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/notifications/fetch-notifications/${receiverId}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Get sender info by sender_id ----------
export const GetSenderInfoBySenderId = async (senderId: any) => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/notifications/fetch-sender-info/${senderId}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Delete notification by notification_id ----------
export const DeleteNotification = async (notificationIds: number[]) => {
  try {
    const response = await axios.delete(
      `${BASE_API_URL}/notifications/delete-notifications`,
      { data: { notificationIds } }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- Update Notification Status ----------
export const UpdateNotificationStatus = async (
  notificationIds: number[],
  newStatus: number
) => {
  try {
    const response = await axios.put(
      `${BASE_API_URL}/notifications/update-statuses`,
      { notificationIds, status: newStatus }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ---------- fetch notification counts by receiver_id and status ----------
export const FetchNotificationCounts = async (
  receiverId: number,
  status: number
) => {
  try {
    const response = await axios.get(
      `${BASE_API_URL}/notifications/fetch-notifications-count/${receiverId}/${status}`
    );
    return response;
  } catch (err) {
    throw err;
  }
};
