import "./globals.css";

import type { AppProps } from "next/app";
import React, { FC } from "react";

import GlobalContextProvider from "../context/GlobalContext";
import { WagmiWrapper } from "../utils/wagmi/WagmiContext";

const Layout: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <main>
            <GlobalContextProvider>
                <WagmiWrapper>
                    <Component {...pageProps} />
                </WagmiWrapper>
            </GlobalContextProvider>
        </main>
    );
};

export default Layout;
