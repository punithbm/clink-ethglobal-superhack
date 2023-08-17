import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { EthersAdapter, SafeAccountConfig, SafeFactory } from "@safe-global/protocol-kit";
import {
    CHAIN_NAMESPACES,
    SafeEventEmitterProvider,
    WALLET_ADAPTERS,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { serializeError } from "eth-rpc-errors";
import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import {
    oauthClientId,
    productName,
    web3AuthClientId,
    web3AuthLoginType,
    web3AuthVerifier,
} from "../constants";
import { ACTIONS, GlobalContext } from "../context/GlobalContext";
import BottomSheet from "../ui_components/bottom-sheet";
import ConnectWallet from "../ui_components/connect_wallet/";
import Footer from "../ui_components/footer";
import Header from "../ui_components/header";
import HomePage from "../ui_components/home/HomePage";
import { LoadChestComponent } from "../ui_components/loadchest/LoadChestComponent";
import { BaseGoerli } from "../utils/chain/baseGoerli";
import { useWagmi } from "../utils/wagmi/WagmiContext";

export type THandleStep = {
    handleSteps: (step: number) => void;
};

export enum ESTEPS {
    ONE = 1,
    TWO = 2,
    THREE = 3,
}
export enum LOGGED_IN {
    GOOGLE = "google",
    EXTERNAL_WALLET = "external_wallet",
}

export default function Home() {
    const {
        dispatch,
        state: { loggedInVia },
    } = useContext(GlobalContext);
    const [loader, setLoader] = useState(false);
    const [initLoader, setInitLoader] = useState(false);
    const { openConnectModal } = useConnectModal();

    const [openLogin, setSdk] = useState<any>("");
    const [safeLogin, setSafeLogin] = useState<any>("");
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [step, setStep] = useState<number>(0);
    const [openBottomSheet, setOpenBottomSheet] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const { getAccount, disconnect } = useWagmi();
    const { address, isConnecting, isConnected } = useAccount();
    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
    const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

    useEffect(() => {
        const item = localStorage.getItem("isGoogleLogin");
        console.log(
            localStorage.getItem("isGoogleLogin ") &&
                localStorage.getItem("isGoogleLogin ") === "true",
            "storage",
        );
        if (item) {
            handleSteps(ESTEPS.THREE);
        } else {
            handleSteps(ESTEPS.ONE);
        }
        async function initializeOpenLogin() {
            item && setLoader(true);
            setInitLoader(true);
            const chainConfig = {
                chainNamespace: CHAIN_NAMESPACES.EIP155,
                chainId: BaseGoerli.chainIdHex,
                rpcTarget: BaseGoerli.info.rpc,
                displayName: BaseGoerli.name,
                blockExplorer: BaseGoerli.explorer.url,
                ticker: BaseGoerli.symbol,
                tickerName: "Ethereum",
            };

            const web3auth = new Web3AuthNoModal({
                clientId: web3AuthClientId,
                web3AuthNetwork: "testnet",
                chainConfig: chainConfig,
            });

            const privateKeyProvider = new EthereumPrivateKeyProvider({
                config: { chainConfig },
            });

            const openloginAdapter = new OpenloginAdapter({
                adapterSettings: {
                    uxMode: "popup",
                    loginConfig: {
                        google: {
                            name: productName,
                            verifier: web3AuthVerifier,
                            typeOfLogin: web3AuthLoginType,
                            clientId: oauthClientId,
                        },
                    },
                },
                loginSettings: {
                    mfaLevel: "none",
                },
                privateKeyProvider,
            });

            web3auth.configureAdapter(openloginAdapter);
            setWeb3auth(web3auth);
            await web3auth.init();
            setProvider(web3auth.provider);
            setInitLoader(false);
        }

        initializeOpenLogin();
    }, []);

    useEffect(() => {
        if (web3auth && web3auth.connected) {
            setLoader(true);
            getAccounts()
                .then((res: any) => {
                    setLoader(false);
                    dispatch({
                        type: ACTIONS.LOGGED_IN_VIA,
                        payload: LOGGED_IN.GOOGLE,
                    });
                    dispatch({
                        type: ACTIONS.SET_ADDRESS,
                        payload: res,
                    });
                    setWalletAddress(res);
                })
                .catch((e) => {
                    console.log(e, "error");
                });
        }
    }, [provider]);

    const signIn = async () => {
        setLoader(true);
        try {
            if (!web3auth) {
                return;
            }
            if (web3auth.connected) {
                return;
            }
            const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
                loginProvider: "google",
            });
            setProvider(web3authProvider);
            const acc = (await getAccounts()) as any;
            localStorage.setItem("isConnected", "true");
            localStorage.setItem("isGoogleLogin", "true");
            dispatch({
                type: ACTIONS.LOGGED_IN_VIA,
                payload: LOGGED_IN.GOOGLE,
            });
            dispatch({
                type: ACTIONS.SET_ADDRESS,
                payload: acc,
            });
            setWalletAddress(acc);
            setLoader(false);
            handleSteps(ESTEPS.THREE);
        } catch (e) {
            setLoader(false);
            console.log(e, "e");
        }
    };

    const getAccounts = async () => {
        if (!provider) {
            return;
        }
        try {
            const contractAddress = await deploySafeContract();
            return await contractAddress;
        } catch (error) {
            setLoader(false);
            return error;
        }
    };

    const deploySafeContract = async () => {
        const ethProvider = new ethers.providers.Web3Provider(provider!);
        const signer = await ethProvider.getSigner();
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer || ethProvider,
        });
        const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });
        const safeAccountConfig: SafeAccountConfig = {
            owners: [await signer.getAddress()],
            threshold: 1,
        };
        const safeSdkOwnerPredicted = await safeFactory.predictSafeAddress(
            safeAccountConfig,
        );
        return safeSdkOwnerPredicted;
    };

    const signOut = async () => {
        await web3auth?.logout();
        localStorage.removeItem("isGoogleLogin");
        localStorage.removeItem("isConnected");
        setStep(ESTEPS.ONE);

        dispatch({
            type: ACTIONS.LOGGED_IN_VIA,
            payload: "",
        });
        dispatch({
            type: ACTIONS.LOGOUT,
            payload: "",
        });
        dispatch({
            type: ACTIONS.SET_ADDRESS,
            payload: "",
        });
        if (isConnected) {
            await disconnect();
        }
        setWalletAddress("");
        setOpenBottomSheet(false);
    };

    const handleSteps = (step: number) => {
        setStep(step);
    };

    const getUIComponent = (step: number) => {
        switch (step) {
            case ESTEPS.ONE:
                return <HomePage handleSetupChest={handleSetupChest} loader={loader} />;
            case ESTEPS.TWO:
                return (
                    <ConnectWallet
                        signIn={signIn}
                        handleSteps={handleSteps}
                        loader={loader}
                    />
                );
            case ESTEPS.THREE:
                return <LoadChestComponent provider={provider} loader={loader} />;
            default:
                return <></>;
        }
    };

    const handleSetupChest = async () => {
        if (walletAddress) {
            handleSteps(ESTEPS.THREE);
        } else {
            handleSteps(ESTEPS.TWO);
        }
    };
    const onHamburgerClick = () => {
        setOpenBottomSheet(true);
    };

    const connectWallet = async () => {
        setConnecting(true);
        try {
            await openConnectModal?.();
        } catch (e: any) {
            const err = serializeError(e);
            setConnecting(false);
            toast.error(err.message);
        }
    };

    useEffect(() => {
        if (address && !isConnecting && connecting) {
            localStorage.setItem("isConnected", "true");
            localStorage.setItem("isGoogleLogin", "false");
            dispatch({
                type: ACTIONS.SET_ADDRESS,
                payload: address,
            });
            dispatch({
                type: ACTIONS.LOGGED_IN_VIA,
                payload: LOGGED_IN.EXTERNAL_WALLET,
            });
            setConnecting(false);
            setWalletAddress(address);
            handleSteps(ESTEPS.THREE);
        }
    }, [isConnecting]);

    return (
        <>
            <Header
                walletAddress={walletAddress}
                signIn={signIn}
                step={step}
                handleSteps={handleSteps}
                onHamburgerClick={onHamburgerClick}
                signOut={signOut}
                setWalletAddress={setWalletAddress}
                loader={loader}
                initLoader={initLoader}
            />
            <div className="p-4 relative">
                <ToastContainer
                    toastStyle={{ backgroundColor: "#282B30" }}
                    className={`w-50`}
                    style={{ width: "600px" }}
                    position="bottom-center"
                    autoClose={6000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    theme="dark"
                />
                {getUIComponent(step)}
                <BottomSheet
                    isOpen={openBottomSheet}
                    onClose={() => {
                        setOpenBottomSheet(false);
                    }}
                    walletAddress={walletAddress}
                    signOut={signOut}
                    signIn={signIn}
                    handleSteps={handleSteps}
                />
                <Footer />
            </div>
        </>
    );
}
