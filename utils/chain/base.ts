import { CHAINS_ENUMS, CHAINS_IDS } from ".";

export const Base = {
    index: 10,
    id: CHAINS_IDS.BASE,
    name: "Base Mainnet",
    logo: "https://storage.googleapis.com/frontier-wallet/blockchains/base/info/logo.svg",
    coinId: 8453,
    symbol: "ETH",
    chainId: "84531",
    decimals: 18,
    blockchain: CHAINS_ENUMS.ETHEREUM,
    derivation: [
        {
            path: "m/44'/60'/0'/0/0",
            basePath: "m/44'/60'/${index}'/0/0",
        },
    ],
    curve: "secp256k1",
    publicKeyType: "secp256k1Extended",
    explorer: {
        url: "https://basescan.org",
        explorerName: "BaseScan",
        txPath: "/tx/",
        accountPath: "/address/",
    },
    info: {
        url: "https://mainnet.base.org/",
        rpc: "https://mainnet.base.org/",
    },
};
