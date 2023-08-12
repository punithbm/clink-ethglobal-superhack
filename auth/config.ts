import { Web3AuthConfig, Web3AuthModalPack } from "@safe-global/auth-kit";
import {
    ADAPTER_EVENTS,
    CHAIN_NAMESPACES,
    SafeEventEmitterProvider,
    UserInfo,
    WALLET_ADAPTERS,
} from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

import { baseGoerli, loginProvider, projectId } from "../constants/base";

// https://web3auth.io/docs/sdk/pnp/web/modal/initialize#arguments
export const options: Web3AuthOptions = {
    clientId: projectId,
    web3AuthNetwork: baseGoerli.networks.testnet.displayName,
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: baseGoerli.chainIdHex,
        rpcTarget: baseGoerli.networks.testnet.url,
    },
    uiConfig: {
        theme: "dark",
        loginMethodsOrder: [loginProvider.google],
    },
};

// https://web3auth.io/docs/sdk/pnp/web/modal/initialize#configuring-adapters
export const modalConfig = {
    [WALLET_ADAPTERS.METAMASK]: {
        label: "metamask",
        showOnDesktop: true,
        showOnMobile: false,
    },
};

// https://web3auth.io/docs/sdk/pnp/web/modal/whitelabel#whitelabeling-while-modal-initialization
export const openLoginAdapter = new OpenloginAdapter({
    loginSettings: {
        mfaLevel: "mandatory",
    },
    adapterSettings: {
        uxMode: "popup",
        whiteLabel: {
            name: "Safe",
        },
    },
});

const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: "https://safe-transaction-goerli.safe.global",
};

export const baseRPC = baseGoerli.networks.testnet.url;

export const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig);
