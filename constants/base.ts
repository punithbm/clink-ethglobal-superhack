enum OPENLOGIN_NETWORK {
    MAINNET = "mainnet",
    DEVELOPMENT = "development",
    TESTNET = "testnet",
}

const baseGoerli = {
    chainName: "Base Goerli",
    chainId: 84531,
    chainIdHex: "0x14a33",
    networks: {
        mainnet: { url: "", displayName: OPENLOGIN_NETWORK.MAINNET },
        devnet: { url: "", displayName: OPENLOGIN_NETWORK.DEVELOPMENT },
        testnet: {
            url: "https://goerli.base.org",
            displayName: OPENLOGIN_NETWORK.TESTNET,
        },
    },
};

const projectId =
    "BI5-250tyqwU_79yFve_chx6hiE-f8iCxPHe0oqDpv-xU9dvGJ1p3JLo1y0AqzlMKDoZ_w0NLjxIFyNhxXJ6L6Y";

const loginProvider = {
    google: "google",
};

export { baseGoerli, loginProvider, projectId };
