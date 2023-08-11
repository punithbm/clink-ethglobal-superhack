import "react-toastify/dist/ReactToastify.css";
import { serializeError } from "eth-rpc-errors";
import React, { useContext, useMemo, useState } from "react";
import HomePage from "../ui_components/home/HomePage";
import ConnectWallet from "../ui_components/connect_wallet/";
import "./globals.css";
import OpenLogin from "@toruslabs/openlogin";
import { baseGoerli, projectId } from "../constants";
import { Wallet } from "../utils/wallet";
import { initWasm } from "@trustwallet/wallet-core";
import { LoadChestComponent } from "../ui_components/loadchest/LoadChestComponent";
import Header from "../ui_components/header";
import BottomSheet from "../ui_components/bottom-sheet";
import LoadingTokenPage from "../ui_components/loadingTokenPage";
import { getStore } from "../store/GlobalStore";
import { ACTIONS, GlobalContext } from "../context/GlobalContext";
import { useWagmi } from "../utils/wagmi/WagmiContext";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import { connect } from "@wagmi/core";

export type THandleStep = {
  handleSteps: (step: number) => void;
};

export enum ESteps {
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
  const [loader, setLoader] = useState(true);
  const [openLogin, setSdk] = useState<any>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [step, setStep] = useState<number>(ESteps.ONE);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { fetchBalance, injectConnector, sendTransaction, getAccount } = useWagmi();

  useMemo(async () => {
    async function initializeOpenLogin() {
      const sdkInstance = new OpenLogin({
        clientId: projectId,
        network: baseGoerli.networks.testnet.displayName,
        mfaSettings: undefined,
      });
      await sdkInstance.init();
      if (sdkInstance.privKey) {
        if (localStorage.getItem("loginAttempted") === "true") {
          handleSteps(ESteps.THREE);
          localStorage.removeItem("loginAttempted");
        }
        const prvKey = sdkInstance.privKey;
        getAddress(prvKey);
      } else {
        setLoader(false);
      }
      setSdk(sdkInstance);

      dispatch({
        type: ACTIONS.LOGGED_IN_VIA,
        payload: LOGGED_IN.GOOGLE,
      });
      dispatch({
        type: ACTIONS.GOOGLE_USER_INFO,
        payload: {
          googleUserInfo: sdkInstance.state.userInfo,
          isConnected: sdkInstance.privKey ? true : false,
        },
      });
    }
    initializeOpenLogin();
    localStorage.removeItem("chestRedirect");
  }, []);

  useMemo(async () => {
    const account = await getAccount();
    if (account.isConnected && loggedInVia === LOGGED_IN.EXTERNAL_WALLET) {
      dispatch({
        type: ACTIONS.SET_ADDRESS,
        payload: account.address,
      });
      dispatch({
        type: ACTIONS.LOGGED_IN_VIA,
        payload: LOGGED_IN.EXTERNAL_WALLET,
      });
      setWalletAddress(account.address);
      handleSteps(ESteps.THREE);
    }
  }, [walletAddress]);

  useMemo(async () => {
    const account = await getAccount();
    if (account.isConnected && loggedInVia === LOGGED_IN.EXTERNAL_WALLET) {
      dispatch({
        type: ACTIONS.SET_ADDRESS,
        payload: account.address,
      });
      dispatch({
        type: ACTIONS.LOGGED_IN_VIA,
        payload: LOGGED_IN.EXTERNAL_WALLET,
      });
      setWalletAddress(account.address);
      handleSteps(ESteps.THREE);
    }
  }, []);

  // const { dispatch } = getStore();
  // setTimeout(function () {
  //     dispatch({
  //         type: ACTIONS.GOOGLE_USER_INFO,
  //         payload: {
  //             googleUserInfo: openLogin.state,
  //         },
  //     });
  // }, 200);

  const signIn = async () => {
    localStorage.setItem("loginAttempted", "true");
    try {
      await openLogin.login({
        loginProvider: "google",
        redirectUrl: `${window.origin}`,
        mfaLevel: "none",
      });
    } catch (error) {
      console.log("error", error);
    }

    setOpenBottomSheet(false);
  };

  const getAddress = async (prvKey: string) => {
    const walletCore = await initWasm();
    const wallet = new Wallet(walletCore);
    const address = await wallet.importWithPrvKey(prvKey);
    setWalletAddress(address);
    dispatch({
      type: ACTIONS.SET_ADDRESS,
      payload: address,
    });
    setLoader(false);
  };

  const signOut = async () => {
    await openLogin.logout();
    setStep(ESteps.ONE);
    dispatch({
      type: ACTIONS.LOGOUT,
      payload: "",
    });
    setWalletAddress("");
    setOpenBottomSheet(false);
  };

  const handleSteps = (step: number) => {
    setStep(step);
  };

  const getUIComponent = (step: number) => {
    switch (step) {
      case ESteps.ONE:
        return <HomePage handleSetupChest={handleSetupChest} />;
      case ESteps.TWO:
        return <ConnectWallet signIn={signIn} handleSteps={handleSteps} connectWallet={connectWallet} connecting={connecting} />;
      case ESteps.THREE:
        return <LoadChestComponent openLogin={openLogin} handleSteps={handleSteps} />;
      default:
        return <HomePage handleSetupChest={handleSetupChest} />;
    }
  };

  const handleSetupChest = async () => {
    if (walletAddress) {
      handleSteps(ESteps.THREE);
    } else {
      handleSteps(ESteps.TWO);
    }
  };
  const onHamburgerClick = () => {
    setOpenBottomSheet(true);
  };

  const connectWallet = async () => {
    setConnecting(true);
    try {
      connect({
        chainId: baseGoerli.chainId,
        connector: injectConnector,
      })
        .then((result: any) => {
          setWalletAddress(result.account);
          setConnecting(false);
          dispatch({
            type: ACTIONS.SET_ADDRESS,
            payload: result.account,
          });
          dispatch({
            type: ACTIONS.LOGGED_IN_VIA,
            payload: LOGGED_IN.EXTERNAL_WALLET,
          });
          setStep(ESteps.THREE);
        })
        .catch((e) => {
          const err = serializeError(e);
          console.log(err, "err");
          setConnecting(false);
          toast.error(err.message);
          console.log(e, "error");
        });
    } catch (e: any) {
      const err = serializeError(e);
      console.log(err, "err");
      setConnecting(false);
      toast.error(err.message);
      console.log(e, "error");
    }
  };

  return (
    <>
      <Header walletAddress={walletAddress} signIn={signIn} step={step} handleSteps={handleSteps} onHamburgerClick={onHamburgerClick} signOut={signOut} />
      <div className="p-4 relative">
        <ToastContainer toastStyle={{ backgroundColor: "#282B30" }} className={`w-50`} style={{ width: "600px" }} position="bottom-center" autoClose={6000} hideProgressBar={true} newestOnTop={false} closeOnClick rtl={false} theme="dark" />
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
      </div>
    </>
  );
}
