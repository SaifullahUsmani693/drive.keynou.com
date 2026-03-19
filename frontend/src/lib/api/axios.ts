import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const message = response?.data?.message;
    if (message && ["post", "put", "patch", "delete"].includes(response.config.method || "")) {
      toast.success(message);
    }
    return response;
  },
  (error: AxiosError) => {
    const message = (error.response?.data as { message?: string })?.message || error.message;
    if (message) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export default api;
