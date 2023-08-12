import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ReactElement } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { productName, rainbowKitProjectId } from "../../constants";

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [baseGoerli],
    [publicProvider()],
);

const { connectors } = getDefaultWallets({
    appName: productName,
    projectId: rainbowKitProjectId,
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
