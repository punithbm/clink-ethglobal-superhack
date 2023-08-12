import { Dialog, Transition } from "@headlessui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { initWasm } from "@trustwallet/wallet-core";
import { BigNumber } from "bignumber.js";
import { serializeError } from "eth-rpc-errors";
import dynamic from "next/dynamic";
import { Options } from "qr-code-styling";
import React, { FC, Fragment, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useAccount } from "wagmi";

import {
    getBalance,
    getEstimatedGas,
    getNonce,
    getSendRawTransaction,
    getSendTransactionStatus,
    getUsdPrice,
} from "../apiServices";
import { GlobalContext } from "../context/GlobalContext";
import {
    getCurrencyFormattedNumber,
    getTokenValueFormatted,
    hexFormatter,
    hexToNumber,
    numHex,
} from "../utils";
import { Base } from "../utils/chain/base";
import { icons } from "../utils/images";
import { useWagmi } from "../utils/wagmi/WagmiContext";
import { Wallet } from "../utils/wallet";
import { TRANSACTION_TYPE, TTranx } from "../utils/wallet/types";
import { DepositAmountComponent } from "./loadchest/DepositAmountComponent";
import { QRComponent } from "./loadchest/QRComponent";
import PrimaryBtn from "./PrimaryBtn";

export default dynamic(() => Promise.resolve(ClaimBtnModal), {
    ssr: false,
});
export interface IClaimBtnModal {
    open: boolean;
    setOpen: (val: boolean) => void;
    uuid: string;
    walletAddress?: string;
    tokenPrice?: string;
    fetchBalance?: () => void;
}

export const ClaimBtnModal: FC<IClaimBtnModal> = (props) => {
    const { open, setOpen, uuid } = props;
    const { getAccount, injectConnector, connect, baseGoerli } = useWagmi();

    const { isConnecting, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    const [connecting, setConnecting] = useState(false);
    const [openInput, setOpenInput] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [toAddress, setToAddress] = useState("");
    const [walletBalanceHex, setWalletBalanceHex] = useState("");
    const [fromAddress, setFromAddress] = useState("");
    const [tokenValue, setTokenValue] = useState("");
    const [linkValueUsd, setLinkValueUsd] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [options] = useState<Options>({
        width: 240,
        height: 240,
        type: "svg",
        image: icons.logo.src,
        margin: 5,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q",
        },
        dotsOptions: {
            type: "extra-rounded",
            color: "#FFFFFF",
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.5,
            margin: 15,
            crossOrigin: "anonymous",
        },
        backgroundOptions: {
            color: "#2B2D30",
        },
    });
    const [showOptions, setShowOptions] = useState(true);
    const [value, setValue] = useState("");

    const handleConnect = async () => {
        setProcessing(true);
        const account = await getAccount();
        if (account.isConnected) {
            setToAddress(account.address);
            sendToken(account.address);
        } else {
            try {
                const result = await connect({
                    chainId: baseGoerli.id,
                    connector: injectConnector,
                });
                setToAddress(result.account);
                toast.success(`Wallet Connected`);
                sendToken(result.account);
            } catch (e: any) {
                const err = serializeError(e);
                console.log(err, "err");
                setProcessing(false);
                toast.error(e.message);
            }
        }
    };

    const sendToken = async (toAdd: string) => {
        setProcessing(true);
        try {
            const walletCore = await initWasm();
            const wallet = new Wallet(walletCore);
            const gasLimitData = (await getEstimatedGas({
                from: fromAddress,
                to: toAdd,
                value: walletBalanceHex,
            })) as any;
            const gasLimit = gasLimitData?.result ?? "0x5208";
            const gasPirce = "3B9ACA00";
            let bgBal = BigNumber(walletBalanceHex);
            const bgGasPirce = BigNumber("0x" + gasPirce);
            const bgGasLimit = BigNumber(gasLimit);
            const gasFee = bgGasPirce.multipliedBy(bgGasLimit).multipliedBy(2);
            bgBal = bgBal.minus(gasFee);
            const amountToSend = hexFormatter(bgBal.toString(16));
            const nonce = (await getNonce(fromAddress)) as any;
            const tx: TTranx = {
                toAddress: toAdd,
                nonceHex: nonce.result,
                chainIdHex: numHex(Number(Base.chainId)),
                gasPriceHex: gasPirce,
                gasLimitHex: gasLimit,
                amountHex: amountToSend,
                contractDecimals: 18,
                fromAddress: fromAddress,
                transactionType: TRANSACTION_TYPE.SEND,
                isNative: true,
            };
            const privKey = await wallet.getPrivKeyFromPayLink(uuid);
            const txData = await wallet.signEthTx(tx, privKey);
            const rawTx = (await getSendRawTransaction(txData)) as any;
            if (rawTx.error) {
                setProcessing(false);
                const err = serializeError(rawTx.error.message);
                toast.error(err.message);
            } else {
                handleTransactionStatus(rawTx.result);
            }
        } catch (e: any) {
            setProcessing(false);
            toast.error(e.message);
            console.log(e, "e");
        }
    };

    const handleTransactionStatus = (hash: string) => {
        const intervalInMilliseconds = 2000;
        const interval = setInterval(() => {
            getSendTransactionStatus(hash)
                .then((res: any) => {
                    if (res.result) {
                        const status = Number(res.result.status);
                        if (status === 1) {
                            setProcessing(false);
                            toast.success("Claimed Successfully");
                            fetchBalance(fromAddress);
                        } else {
                            setProcessing(false);
                            const err = serializeError("Failed to Claim!");
                            toast.error(err.message);
                        }
                        if (interval !== null) {
                            clearInterval(interval);
                        }
                    }
                })
                .catch((e) => {
                    setProcessing(false);
                    toast.error(e.message);
                    console.log(e, "e");
                });
        }, intervalInMilliseconds);
    };

    const fetchBalance = async (address: string) => {
        const balance = (await getBalance(address)) as any;
        const hexValue = balance.result;
        const bgBal = BigNumber(hexValue);
        const bgNum = bgBal.dividedBy(Math.pow(10, 18)).toNumber();
        setWalletBalanceHex(hexValue);
        getUsdPrice().then(async (res: any) => {
            setTokenValue(getTokenValueFormatted(bgNum));
            setIsLoading(false);
            const formatBal = bgNum * res.data.ethereum.usd;
            setLinkValueUsd(getCurrencyFormattedNumber(formatBal));
        });
    };

    const handleInputChange = (val: string) => {
        setValue(val);
    };

    const handleWalletConnectFlow = () => {
        setShowOptions(false);
    };

    useEffect(() => {
        console.log("came to ue");
        if (connecting) {
            handleWalletConnectFlow();
            toast.success("Wallet Connected Successfully");
        }
    }, [isConnecting]);

    const handleExternalWalletClick = async () => {
        try {
            if (!isConnected) {
                setConnecting(true);
                await openConnectModal?.();
            } else {
                handleWalletConnectFlow();
            }
        } catch (e: any) {
            setConnecting(false);
            const err = serializeError(e);
            toast.error(err.message);
            console.log(e, "error");
        }
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenInput = () => {
        setOpenInput(!openInput);
    };

    if (typeof window === "object") {
        return ReactDOM.createPortal(
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-[1000]" onClose={handleClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-[1000] overflow-y-hidden md:rounded-[16px]">
                        <div className="flex min-h-full items-end justify-center sm:items-center p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel
                                    className={`bg-black lg:min-w-[400px] rounded-[12px] w-full lg:w-[400px]  py-5`}
                                >
                                    {open && showOptions ? (
                                        <div className="px-4">
                                            <div
                                                className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer mb-5"
                                                onClick={() => {
                                                    handleExternalWalletClick();
                                                }}
                                            >
                                                <p className="text-center text-white">
                                                    {connecting
                                                        ? "Connecting..."
                                                        : "External Wallet"}
                                                </p>
                                            </div>
                                            <div
                                                className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer mb-5"
                                                onClick={() => {
                                                    handleOpenInput();
                                                }}
                                            >
                                                <p className="text-center text-white">
                                                    Send to public address
                                                </p>
                                            </div>
                                            {openInput ? (
                                                <div>
                                                    <input
                                                        name={"public address"}
                                                        style={{
                                                            caretColor: "white",
                                                        }}
                                                        inputMode="text"
                                                        type="string"
                                                        className={`rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer mb-5 pl-0 pt-2 pb-1 backdrop-blur-xl text-[32px] border-none text-center  text-white placeholder-white/40 block w-full focus:outline-none focus:ring-transparent`}
                                                        placeholder={"0x..."}
                                                        autoFocus={true}
                                                        value={value}
                                                        onChange={(e) => {
                                                            handleInputChange(
                                                                `${e.target.value}`,
                                                            );
                                                        }}
                                                        onWheel={() =>
                                                            (
                                                                document.activeElement as HTMLElement
                                                            ).blur()
                                                        }
                                                    />
                                                    <div className="my-4 cursor-pointer">
                                                        <PrimaryBtn
                                                            className={`lg:w-[90%] ${
                                                                value
                                                                    ? "opacity-100"
                                                                    : "opacity-40"
                                                            }`}
                                                            title={"Send Amount"}
                                                            btnDisable={!value}
                                                            onClick={() => {}}
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}
                                            <div
                                                className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                                                onClick={() => {}}
                                            >
                                                <p className="text-center text-white">
                                                    {`Transfer to Bank (TBD)`}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>,
            document.body,
        );
    }
    return null;
};
