import { globalApiService } from '../utils/globalApiServices';
import axiosInstance from '../utils/httpInterceptor';

enum ETHEREUM_REQUESTS {
  ethBalance = 'eth_getBalance',
  ethEstimatedGas = 'eth_estimateGas',
  ethGasPrice = 'eth_gasPrice',
  ethSendRawTransaction = 'eth_sendRawTransaction',
  ethGetTransactionCount = 'eth_getTransactionCount',
}

export const getBalance = async (address: string) => {
  return new Promise(function (resolve, reject) {
    globalApiService(ETHEREUM_REQUESTS.ethBalance, [address, 'latest'])
      .then((response) => {
        resolve(response);
      })
      .catch((e) => reject(e));
  });
};

export const getEstimatedGas = async (params: { from: string; to: string; value: string }) => {
  const { from, to, value } = params;
  return new Promise(function (resolve, reject) {
    globalApiService(ETHEREUM_REQUESTS.ethEstimatedGas, [{ from: from, to: to, value: value }])
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
    globalApiService(ETHEREUM_REQUESTS.ethGetTransactionCount, [address, 'latest'])
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

export const getUsdPrice = (): Promise<any[]> => {
  const config = {
    method: 'get',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    headers: { 'Content-Type': 'application/json' },
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
