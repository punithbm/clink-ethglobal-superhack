import { CHAINS_ENUMS, CHAINS_IDS } from ".";

export const BaseGoerli = {
    index: 10,
    id: CHAINS_IDS.BASEGOERLI,
    name: "Base Görli",
    logo: "https://storage.googleapis.com/frontier-wallet/blockchains/base/info/logo.svg",
    coinId: 8453,
    symbol: "ETH",
    chainId: "84531",
    chainIdHex: "0x14a33",
    decimals: 18,
    blockchain: CHAINS_ENUMS.ETHEREUM,
    derivation: {
        path: "m/44'/60'/0'/0/0",
    },
    curve: "secp256k1",
    publicKeyType: "secp256k1Extended",
    explorer: {
        url: "https://goerli.basescan.org",
        explorerName: "Base Görli Scan",
        txPath: "/tx/",
        accountPath: "/address/",
    },
    info: {
        url: "https://goerli.base.org/",
        rpc: process.env.NEXT_PUBLIC_RPC_URL ?? "https://goerli.base.org/",
    },
};
