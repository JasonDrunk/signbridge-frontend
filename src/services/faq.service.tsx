import axios from "axios";

// ---------- Create Faq ----------
export const CreateFaq = async (data: any) => {
    try {
        const response = await axios.post(
            "http://localhost:3000/faqs/create-faq",
            data
        );
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Update Faq ----------
export const UpdateFaq = async (data: any) => {
    try {
        const response = await axios.put(
            `http://localhost:3000/faqs/update-faq/${data.faq_id}`,
            data
        );
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Delete Faq ----------
export const DeleteFaq = async (data: any) => {
    try {
        const response = await axios.delete(
            `http://localhost:3000/faqs/delete-faq/${data}`
        );
        return response;
    } catch (err) {
        throw err;
    }
};

// ---------- Fetch Faq ----------
export const FetchFaq = async () => {
    try {
        const response = await axios.get(
            "http://localhost:3000/faqs/fetch-faq"
        );
        return response;
    } catch (err) {
        throw err;
    }
};
