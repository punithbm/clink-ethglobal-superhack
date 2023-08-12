import { getApiService, globalApiService } from "../utils/globalApiServices";
import axiosInstance from "../utils/httpInterceptor";

enum ETHEREUM_REQUESTS {
    ethBalance = "eth_getBalance",
    ethEstimatedGas = "eth_estimateGas",
    ethGasPrice = "eth_gasPrice",
    ethSendRawTransaction = "eth_sendRawTransaction",
    ethGetTransactionCount = "eth_getTransactionCount",
    ethTransactionStatus = "eth_getTransactionReceipt",
}

export const getBalance = async (address: string) => {
    return new Promise(function (resolve, reject) {
        globalApiService(ETHEREUM_REQUESTS.ethBalance, [address, "latest"])
            .then((response) => {
                resolve(response);
            })
            .catch((e) => reject(e));
    });
};

export const getEstimatedGas = async (params: {
    from: string;
    to: string;
    value: string;
}) => {
    const { from, to, value } = params;
    return new Promise(function (resolve, reject) {
        globalApiService(ETHEREUM_REQUESTS.ethEstimatedGas, [
            { from: from, to: to, value: value },
        ])
            .then((response) => {
                resolve(response);
            })
            .catch((e) => reject(e));
    });
};

export const getGasPrice = async () => {
    return new Promise(function (resolve, reject) {
        globalApiService(ETHEREUM_REQUESTS.ethGasPrice, [])
            .then((response) => {
                resolve(response);
            })
            .catch((e) => reject(e));
    });
};

export const getNonce = async (address: string) => {
    return new Promise(function (resolve, reject) {
        globalApiService(ETHEREUM_REQUESTS.ethGetTransactionCount, [address, "latest"])
            .then((response) => {
                resolve(response);
            })
            .catch((e) => reject(e));
    });
};

export const getSendRawTransaction = async (tx: string) => {
    return new Promise(function (resolve, reject) {
        globalApiService(ETHEREUM_REQUESTS.ethSendRawTransaction, [tx])
            .then((response) => {
                resolve(response);
            })
            .catch((e) => reject(e));
    });
};

export const getSendTransactionStatus = async (hash: string) => {
    return new Promise(function (resolve, reject) {
        globalApiService(ETHEREUM_REQUESTS.ethTransactionStatus, [hash])
            .then((response) => {
                resolve(response);
            })
            .catch((e) => reject(e));
    });
};

export const getRelayTransactionStatus = async (taskId: string) => {
    return new Promise(function (resolve, reject) {
        getApiService({
            url: `https://relay.gelato.digital/tasks/status/${taskId}`,
        })
            .then((response) => {
                resolve(response);
            })
            .catch((e) => reject(e));
    });
};

export const getUsdPrice = (): Promise<any[]> => {
    const config = {
        method: "get",
        url: "https://pro-api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&x_cg_pro_api_key=CG-3rZprwbEEjFtakNBS8mghn8H",
        headers: { "Content-Type": "application/json" },
    };
    return new Promise((resolve) => {
        axiosInstance(config)
            .then((res: any) => {
                if (res.status === 200) {
                    resolve(res);
                }
            })
            .catch((e) => {
                console.log(e);
            });
    });
};
