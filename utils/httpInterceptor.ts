import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";

import { baseGoerli } from "../constants/base";
import { TApiResponse } from "../types";
import { toastFlashMessage } from ".";

const axiosInstance: AxiosInstance = axios.create();

axiosInstance.defaults.baseURL = `${baseGoerli.networks.testnet.url}`;
axiosInstance.interceptors.request.use(
    function (config: AxiosRequestConfig) {
        return config;
    },
    function (error: AxiosError) {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    function (response: AxiosResponse<TApiResponse>) {
        if (response.status >= 200 && response.status <= 299) {
            return response;
        } else {
            toastFlashMessage("Cases yet to be handled", "error");
            return response;
        }
    },
    function (error: AxiosError) {
        return Promise.reject(error);
    },
);

export default axiosInstance;
