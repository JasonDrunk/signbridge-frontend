import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const GetAllGuessTheWordPlayer = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/guess_the_word/player`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const GetAllDoTheSignPlayer = async () => {
  try {
    const response = await axios.get(`${BASE_API_URL}/do_the_sign/player`);
    return response;
  } catch (err) {
    throw err;
  }
};

type Score = {
  user_id: number;
  score: number;
};

export const SendResultToGuessTheWord = async (data: Score) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/guess_the_word/score`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const SendResultToDoTheSign = async (data: Score) => {
  try {
    const response = await axios.post(
      `${BASE_API_URL}/do_the_sign/score`,
      data
    );
    return response;
  } catch (err) {
    throw err;
  }
};
