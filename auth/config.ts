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

import { projectId } from "../constants";
import { BaseGoerli } from "../utils/chain/baseGoerli";

export const options: Web3AuthOptions = {
  clientId: projectId,
  web3AuthNetwork: "testnet",
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: BaseGoerli.chainIdHex,
    rpcTarget: BaseGoerli.info.rpc,
  },
  uiConfig: {
    theme: "dark",
    loginMethodsOrder: ["google"],
  },
};

export const modalConfig = {
    [WALLET_ADAPTERS.METAMASK]: {
        label: "metamask",
        showOnDesktop: true,
        showOnMobile: false,
    },
};

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

export const baseRPC = BaseGoerli.info.rpc;

export const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig);
