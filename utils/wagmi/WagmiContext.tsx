import { ReactNode, createContext, useContext } from "react";
import { WagmiHoc } from ".";
import { ConnectArgs } from "wagmi/actions";
import { fetchBalance, connect } from "@wagmi/core";
import { baseGoerli } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";

interface IProps {
    children?: ReactNode;
}

export type TGlobalContextType = {
    connect?: any;
    fetchBalance?: any;
    baseGoerli?: any;
    InjectedConnector?: any;
};

export const WalletContext = createContext<TGlobalContextType>({
    connect: undefined,
});

const WagmiProvider = ({ children }: IProps) => {
    return (
        <WalletContext.Provider
            value={{ connect, fetchBalance, baseGoerli, InjectedConnector }}
        >
            {children}
        </WalletContext.Provider>
    );
};

const WagmiWrapper = ({ children }: IProps) => {
    return (
        <WagmiHoc>
            <WagmiProvider>{children}</WagmiProvider>
        </WagmiHoc>
    );
};

const useWagmi = () => {
    const { connect, fetchBalance, baseGoerli, InjectedConnector } =
        useContext(WalletContext);
    const injectConnector = new InjectedConnector({ chains: [baseGoerli] });
    return { connect, fetchBalance, baseGoerli, InjectedConnector, injectConnector };
};

export { useWagmi, WagmiWrapper };
