import "@rainbow-me/rainbowkit/styles.css";

import {
    darkTheme,
    getDefaultWallets,
    lightTheme,
    midnightTheme,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { ReactElement } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";

import { baseRPC } from "../../auth/config";
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [baseGoerli],
    [publicProvider()],
);

const { connectors } = getDefaultWallets({
    appName: "Clink",
    projectId: "fb3037b60ba3165d90a7f1bb1a727cc5",
    chains,
});

const config = createConfig({
    autoConnect: true,
    connectors: connectors,
    publicClient,
    webSocketPublicClient,
});

export const WagmiHoc = ({ children }: { children: ReactElement }) => {
    return (
        <WagmiConfig config={config}>
            <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
        </WagmiConfig>
    );
};
