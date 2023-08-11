import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { baseRPC } from "../../auth/config";
import { ReactElement } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
    getDefaultWallets,
    RainbowKitProvider,
    darkTheme,
    lightTheme,
    midnightTheme,
} from "@rainbow-me/rainbowkit";
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
