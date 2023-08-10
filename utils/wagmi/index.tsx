import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { baseRPC } from "../../auth/config";
import { ReactElement } from "react";
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [baseGoerli],
    [publicProvider()],
);

const config = createConfig({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        new CoinbaseWalletConnector({
            chains,
            options: {
                appName: "micropay",
                jsonRpcUrl: baseRPC,
                chainId: baseGoerli.id,
            },
        }),
        new InjectedConnector({
            chains,
            options: {
                name: "Injected",
                shimDisconnect: true,
            },
        }),
    ],
    publicClient,
    webSocketPublicClient,
});

export const WagmiHoc = ({ children }: { children: ReactElement }) => {
    return <WagmiConfig config={config}>{children}</WagmiConfig>;
};
