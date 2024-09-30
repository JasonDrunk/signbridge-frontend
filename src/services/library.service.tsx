import axios from "axios";


export const createCat = async (data: FormData) => {
    try {
        const response = await axios.post(
            "http://localhost:3000/lib/admin/categories",
            data
        );
        return response;
    } catch (err) {
        throw err;
    }
};


export const updateCat = async (catId: number, data: FormData) => {
    try {
        const response = await axios.put(
            `http://localhost:3000/lib/admin/categories/${catId}`,
            data
        );
        return response;
    } catch (err) {
        throw err;
    }
};

export const deleteCat = async (data: any) => {
    try {
        const response = await axios.delete(
            `http://localhost:3000/lib/admin/categories/${data}`
        );
        return response;
    } catch (err) {
        throw err;
    }
};

export const fetchCat = async () => {
    try {
        const response = await axios.get(
            "http://localhost:3000/lib/categories"
        );
        return response;
    } catch (err) {
        throw err;
    }
};

export const fetchSign = async (cat: string): Promise<any> => {
    try {
      console.log(cat);
      const response = await axios.get(
        `http://localhost:3000/lib/sign/${cat}`
      );
  
      console.log(response.data);
      return response.data; // Assuming the forms are returned in the response data
    } catch (err) {
      throw err;
    }
  };

  export const updateSign = async (signId: number, data: FormData) => {
    try {
        const response = await axios.put(
            `http://localhost:3000/lib/admin/sign/${signId}`,
            data
        );
        return response;
    } catch (err) {
        throw err;
    }
};

