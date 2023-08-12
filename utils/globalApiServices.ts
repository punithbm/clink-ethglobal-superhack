import { BaseGoerli } from "./chain/baseGoerli";

export const globalApiService = (method: string, params?: any) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const body = JSON.stringify({
        jsonrpc: "2.0",
        method: method,
        params,
        id: 1,
    });

    const requestOptions = {
        method: "POST",
        headers,
        body,
    };

    const jsonRpcUrl = BaseGoerli.info.url;

    return fetch(jsonRpcUrl, requestOptions)
        .then((response) => response.json())
        .catch((e) => e);
};
