import "react-toastify/dist/ReactToastify.css";

import { initWasm } from "@trustwallet/wallet-core";
import { BigNumber } from "bignumber.js";
import { serializeError } from "eth-rpc-errors";
import Image from "next/image";
import * as React from "react";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { Address } from "wagmi";

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
import ClaimBtnModal from "./ClaimBtnModal";
import PrimaryBtn from "./PrimaryBtn";
import SecondaryBtn from "./SecondaryBtn";
import { ShareBtnModal } from "./ShareBtnModal";

export interface IShareLink {
    uuid: string;
}

const ShareLink: FC<IShareLink> = (props) => {
    const { connect, baseGoerli, injectConnector, getAccount } = useWagmi();
    const {
        state: { isConnected },
    } = useContext(GlobalContext);
    const { uuid } = props;
    const [toAddress, setToAddress] = useState("");
    const [walletBalanceHex, setWalletBalanceHex] = useState("");
    const [fromAddress, setFromAddress] = useState("");
    const [wallet, setWallet] = useState("" as unknown as Wallet);
    const [shareText, setShareText] = useState("Share");
    const [showShareIcon, setShowShareIcon] = useState(true);
    const [tokenValue, setTokenValue] = useState("");
    const [headingText, setHeadingText] = useState("Your Chest is ready");
    const [linkValueUsd, setLinkValueUsd] = useState("");
    const [isRedirected, setIsRedirected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [openClaimModal, setOpenClaimModal] = useState(false);
    const [openShareModal, setOpenShareModal] = useState(false);
    const shareData = {
        text: "Here is you Gifted Chest",
        url: typeof window !== "undefined" ? window.location.href : "",
    };

    const handleShareURL = () => {
        if (navigator?.share) {
            navigator
                .share(shareData)
                .then(() => console.log("Successfully shared"))
                .catch((error) => console.log("Error sharing", error));
        }
    };

    const copyToClipBoard = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.href);
        setShareText("Link Copied!");
        setShowShareIcon(false);
        setTimeout(() => {
            setShareText("Share");
            setShowShareIcon(true);
        }, 4000);
    };

    useMemo(async () => {
        if (uuid && uuid != "/[id]") {
            const walletCore = await initWasm();
            const wallet = new Wallet(walletCore);
            setWallet(wallet);
            const account = wallet.getAccountFromPayLink(uuid);
            if (account) {
                setFromAddress(account);
            } else {
                console.log("error", "invalid identifier");
            }
            await fetchBalance(account);
        }
    }, [uuid]);

    const fetchBalance = async (address: string) => {
        const balance = (await getBalance(address)) as any;
        const hexValue = balance.result;
        const bgBal = BigNumber(hexValue);
        const bgNum = bgBal.dividedBy(Math.pow(10, 18)).toNumber();
        setWalletBalanceHex(hexValue);
        getUsdPrice().then(async (res: any) => {
            setTokenValue(getTokenValueFormatted(bgNum, 6, false));
            setIsLoading(false);
            const formatBal = bgNum * res.data.ethereum.usd;
            setLinkValueUsd(getCurrencyFormattedNumber(formatBal, 2, "USD", true));
        });
    };

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
            const gasFee = bgGasPirce.multipliedBy(bgGasLimit);
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

    useEffect(() => {
        if (window.history.length <= 2) {
            setIsRedirected(false);
        } else {
            setIsRedirected(true);
        }
    }, []);

    return (
        <div className="w-full h-screen relative flex items-center">
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
            <div className="w-full h-[70%] text-center p-4  flex flex-col gap-5 items-center">
                <p className="text-white text-[20px] font-bold">{headingText}</p>
                <div className="w-full md:w-[60%] max-w-[450px] h-[300px] rounded-lg shareLinkBg flex flex-col justify-between mb-16">
                    {isLoading ? (
                        <div className="w-full h-full mt-5 ml-5">
                            <div className="w-[15%] h-[20%] bg-white/10 animate-pulse rounded-lg mb-2"></div>
                            <div className="w-[10%] h-[12%] bg-white/10 animate-pulse rounded-lg "></div>
                        </div>
                    ) : (
                        <div className="flex gap-1 flex-col text-start ml-3">
                            <p className="text-[40px] text-[#F4EC97] font bold">{`${linkValueUsd}`}</p>
                            <p className="text-sm text-white/50">{`~ ${tokenValue} ETH`}</p>
                        </div>
                    )}
                    <div className="self-end">
                        <Image className="" src={icons.tchest} alt="Chest" />
                    </div>
                </div>
                {isRedirected ? (
                    <>
                        <div className="lg:hidden block w-full">
                            <PrimaryBtn
                                title="Share"
                                onClick={() => {
                                    handleShareURL();
                                }}
                                rightImage={showShareIcon ? icons.shareBtnIcon : ""}
                                showShareIcon={showShareIcon}
                            />
                        </div>
                        <div className="hidden lg:block w-full max-w-[400px]">
                            <PrimaryBtn
                                title={shareText}
                                onClick={() => {
                                    setOpenShareModal(true);
                                }}
                                rightImage={showShareIcon ? icons.shareBtnIcon : ""}
                            />
                        </div>
                        <SecondaryBtn
                            title={processing ? "Processing..." : "Claim"}
                            onClick={() => setOpenClaimModal(true)}
                            rightImage={processing ? undefined : icons.downloadBtnIcon}
                        />
                    </>
                ) : (
                    <>
                        <PrimaryBtn
                            title={processing ? "Processing..." : "Claim"}
                            onClick={() => setOpenClaimModal(true)}
                            rightImage={
                                processing ? undefined : icons.downloadBtnIconBlack
                            }
                        />
                        <div className="lg:hidden block w-full">
                            <SecondaryBtn
                                title="Share"
                                onClick={() => {
                                    handleShareURL();
                                }}
                                rightImage={showShareIcon ? icons.shareBtnIconWhite : ""}
                                showShareIcon={showShareIcon}
                            />
                        </div>
                        <div className="hidden lg:block w-full max-w-[400px]">
                            <SecondaryBtn
                                title={shareText}
                                onClick={() => {
                                    setOpenShareModal(true);
                                }}
                                rightImage={showShareIcon ? icons.shareBtnIconWhite : ""}
                            />
                        </div>
                    </>
                )}
            </div>
            <ClaimBtnModal
                open={openClaimModal}
                setOpen={setOpenClaimModal}
                uuid={uuid}
            />
            <ShareBtnModal open={openShareModal} setOpen={setOpenShareModal} />
        </div>
    );
};
export default ShareLink;
