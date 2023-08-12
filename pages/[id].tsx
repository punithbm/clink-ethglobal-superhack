import { useRouter } from "next/router";
import React from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { baseGoerli } from "wagmi/chains";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";

import { productName } from "../constants";
import ShareLink from "../ui_components/ShareLinkPage";
import { BaseGoerli } from "../utils/chain/baseGoerli";
import MetaHead from "../ui_components/siteMeta";

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
                appName: productName,
                jsonRpcUrl: BaseGoerli.info.url,
                chainId: BaseGoerli.coinId,
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

export default function claim() {
    const router = useRouter();
    const uuid = router.asPath;
    return (
      <WagmiConfig config={config}>
        <MetaHead title="Hey, Claim your Reward!!" description="Crypto Rewards Just in Link | Clink Safe" imageUrl="https://raw.githubusercontent.com/punithbm/eth-micropay-superhack/develop/public/assets/images/meta.png" urlEndpoint="" />
        <ShareLink uuid={uuid} />
      </WagmiConfig>
    );
}
