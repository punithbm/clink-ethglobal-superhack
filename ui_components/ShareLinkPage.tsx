import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";

import AccountAbstraction from "@safe-global/account-abstraction-kit-poc";
import { EthersAdapter, SafeAccountConfig, SafeFactory } from "@safe-global/protocol-kit";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import {
    MetaTransactionData,
    MetaTransactionOptions,
    OperationType,
} from "@safe-global/safe-core-sdk-types";
import { initWasm } from "@trustwallet/wallet-core";
import { BigNumber } from "bignumber.js";
import { serializeError } from "eth-rpc-errors";
import { ethers } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { parseEther } from "viem";

import {
    getBalance,
    getEstimatedGas,
    getNonce,
    getRelayTransactionStatus,
    getSendRawTransaction,
    getSendTransactionStatus,
    getUsdPrice,
} from "../apiServices";
import { GlobalContext } from "../context/GlobalContext";
import {
    decodeAddressHash,
    encryptAndEncodeHexStrings,
    getCurrencyFormattedNumber,
    getTokenValueFormatted,
    hexFormatter,
    hexToNumber,
    numHex,
} from "../utils";
import { Base } from "../utils/chain/base";
import { BaseGoerli } from "../utils/chain/baseGoerli";
import { icons } from "../utils/images";
import { useWagmi } from "../utils/wagmi/WagmiContext";
import { Wallet } from "../utils/wallet";
import { TRANSACTION_TYPE, TTranx } from "../utils/wallet/types";
import ClaimBtnModal from "./ClaimBtnModal";
import Footer from "./footer";
import { QRComponent } from "./loadchest/QRComponent";
import PrimaryBtn from "./PrimaryBtn";
import QrModal from "./QrModal";
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
    const [headingText, setHeadingText] = useState("Your Chest is ready to claim!");
    const [linkValueUsd, setLinkValueUsd] = useState("");
    const [isRedirected, setIsRedirected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [openClaimModal, setOpenClaimModal] = useState(false);
    const [openShareModal, setOpenShareModal] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [isClaimSuccessful, setIsClaimSuccessful] = useState(false);
    const [txHash, setTxHash] = useState("");
    const ethersProvider = new ethers.providers.JsonRpcProvider(BaseGoerli.info.rpc);
    const relayPack = new GelatoRelayPack(process.env.NEXT_PUBLIC_GELATO_RELAY_API_KEY);
    const options: MetaTransactionOptions = {
        gasLimit: "100000",
        isSponsored: true,
    };
    const router = useRouter();

    const [url, setUrl] = useState("");
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

    const copyAddress = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(fromAddress);
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
            try {
                const walletCore = await initWasm();
                const wallet = new Wallet(walletCore);
                setWallet(wallet);
                const chars = uuid.split("|");
                if (chars.length < 1) {
                    return;
                }
                const smartAccHash = chars[1];
                const smartAddress = decodeAddressHash(smartAccHash);
                if (smartAddress) {
                    setFromAddress(smartAddress);
                } else {
                    console.log("error", "invalid identifier");
                }
                handleSendToken();
                await fetchBalance(smartAddress);
            } catch (e) {
                router.push("/");
            }
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
            setLinkValueUsd(
                getCurrencyFormattedNumber(roundDownToTenth(formatBal), 2, "USD", true),
            );
            const zeroBal =
                getCurrencyFormattedNumber(formatBal, 2, "USD", true) === "$0";
            setHeadingText(
                zeroBal
                    ? "Chest have found their owner!"
                    : "Your Chest is ready to claim!",
            );
        });
    };

    const handleClaimClick = () => {
        setOpenClaimModal(true);
    };

    const handleCloseClaimModal = () => {
        setOpenClaimModal(false);
    };

    const handlePublicAddressTransaction = (toAdd: string) => {
        handleCloseClaimModal();
        sendToken(toAdd);
    };

    const handleConnect = async () => {
        const account = await getAccount();
        if (account.isConnected) {
            setToAddress(account.address);
            handleCloseClaimModal();
            sendToken(account.address);
        } else {
            try {
                const result = await connect({
                    chainId: baseGoerli.id,
                    connector: injectConnector,
                });
                setToAddress(result.account);
                toast.success(
                    `Please wait, wallet connected and claim initiated for the chest`,
                );
                handleCloseClaimModal();
                sendToken(result.account);
            } catch (e: any) {
                const err = serializeError(e);
                console.log(err, "err");
                setProcessing(false);
                toast.error(e.message);
            }
        }
    };

    // const [safeAccountAbstraction, setSafeAccountAbstraction] =
    //     useState<AccountAbstraction>();
    const isRelayInitiated = useRef(false);
    const safeAccountAbstraction = useRef<AccountAbstraction>();

    const handleSendToken = async () => {
        const walletCore = await initWasm();
        const wallet = new Wallet(walletCore);
        const chars = uuid.split("|");
        if (chars.length < 1) {
            return;
        }
        const eoaHash = chars[0];
        const fromKey = await wallet.getAccountFromPayLink(eoaHash);

        // from signer address
        const fromSigner = new ethers.Wallet(fromKey.key, ethersProvider);
        const safeAccountAbs = new AccountAbstraction(fromSigner);
        await safeAccountAbs.init({ relayPack });
        safeAccountAbstraction.current = safeAccountAbs;
        isRelayInitiated.current = true;
    };

    const sendToken = async (toAdd: string) => {
        setProcessing(true);
        try {
            if (isRelayInitiated.current) {
                const amountValue = hexToNumber(walletBalanceHex) / Math.pow(10, 18);

                const safeTransactionData: MetaTransactionData = {
                    to: toAdd,
                    data: "0x",
                    value: parseEther(amountValue.toString()).toString(),
                    operation: OperationType.Call,
                };

                const gelatoTaskId =
                    await safeAccountAbstraction?.current?.relayTransaction(
                        [safeTransactionData],
                        options,
                    );
                console.log(gelatoTaskId, "task id");
                if (gelatoTaskId) {
                    handleTransactionStatus(gelatoTaskId);
                }
            } else {
                await handleSendToken();
                sendToken(toAdd);
                return;
            }
        } catch (e: any) {
            setProcessing(false);
            toast.error(e.message);
            console.log(e, "e");
        }
    };

    const handleTransactionStatus = (hash: string) => {
        const intervalInMilliseconds = 1000;
        const interval = setInterval(() => {
            getRelayTransactionStatus(hash)
                .then((res: any) => {
                    if (res) {
                        const task = res.data.task;
                        if (task) {
                            if (
                                task.taskState === "WaitingForConfirmation" ||
                                task.taskState === "ExecSuccess"
                            ) {
                                setLinkValueUsd("$0");
                                setTokenValue("0");
                                setTxHash(task.transactionHash);
                                setHeadingText("Chest have found their owner!");
                                handleClaimSuccess();
                                if (interval !== null) {
                                    clearInterval(interval);
                                }
                            }
                        } else {
                            setProcessing(false);
                            const err = serializeError("Failed to Claim!");
                            toast.error(err.message);
                            if (interval !== null) {
                                clearInterval(interval);
                            }
                        }
                    }
                })
                .catch((e) => {
                    setProcessing(false);
                    toast.error(e.message);
                    console.log(e, "e");
                    if (interval !== null) {
                        clearInterval(interval);
                    }
                });
        }, intervalInMilliseconds);
    };

    const handleClaimSuccess = () => {
        setIsClaimSuccessful(true);
        setProcessing(false);
        toast.success(
            <>
                <p>Claimed Successfully!</p>
            </>,
        );
    };

    useEffect(() => {
        if (window.history.length <= 2) {
            setIsRedirected(false);
        } else {
            setIsRedirected(true);
        }
        setUrl(window.location.href);
    }, []);

    const handleDisableBtn = () => {
        if (!isLoading && linkValueUsd !== "$0") {
            return false;
        } else {
            return true;
        }
    };

    const roundDownToTenth = (number: number) => {
        const decimalPart = number - Math.floor(number);
        if (decimalPart < 0.7) {
        return Math.round(number * 10) / 10;
        } else {
        return Math.ceil(number);
        }
    };

    return (
        <div className="w-full h-screen relative flex items-center overflow-hidden">
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
                {!processing && (
                    <p className="text-white text-[20px] font-bold">{headingText}</p>
                )}

                <div className="w-full md:w-[60%] max-w-[450px] h-[235px] shareLinkBg mb-16 cardShine">
                    <div className=" rounded-lg profileBackgroundImage flex flex-col justify-between h-full">
                        {isLoading ? (
                            <div className="w-full h-full mt-5 ml-5">
                                <div className="w-[15%] h-[20%] bg-white/10 animate-pulse rounded-lg mb-2"></div>
                                <div className="w-[10%] h-[12%] bg-white/10 animate-pulse rounded-lg "></div>
                            </div>
                        ) : (
                            <div className="flex justify-between">
                                <div className="flex gap-1 flex-col text-start ml-3">
                                    <p className="text-[40px] text-[#F4EC97] font bold">{`${linkValueUsd}`}</p>
                                    <p className="text-sm text-white/50">{`~ ${tokenValue} ETH`}</p>
                                    <div className="flex justify-around w-[100px] mx-auto mt-1.5">
                                        <Link
                                            href={`https://goerli.basescan.org/address/${fromAddress}/#internaltx`}
                                            target="_blank"
                                        >
                                            <Image
                                                src={icons.linkWhite}
                                                alt="external link"
                                                className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                                            />
                                        </Link>

                                        <Image
                                            src={icons.qrWhite}
                                            alt="show qr code"
                                            className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                                            onClick={() => {
                                                setShowQr(!showQr);
                                            }}
                                        />
                                        <Image
                                            src={icons.copyIconWhite}
                                            alt="copy address"
                                            className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                                            onClick={copyAddress}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="self-end">
                            {isClaimSuccessful || linkValueUsd === "$0" ? (
                                <Image
                                    className="mt-[-29px]"
                                    src={icons.tchestopen}
                                    alt="Chest Open"
                                />
                            ) : (
                                <Image className="" src={icons.tchest} alt="Chest" />
                            )}
                        </div>
                    </div>
                </div>
                {linkValueUsd === "$0" ? (
                    txHash ? (
                        <div
                            className={`py-4 text-white support_text_bold font-normal rounded-lg flex gap-1 items-center w-full justify-center border border-white max-w-[450px] mx-auto`}
                        >
                            <div>
                                <p>🎉 Claim successful!</p>
                                <p className="mt-3">
                                    {" "}
                                    The treasure is now yours to behold!
                                    <a
                                        target="_blank"
                                        href={`https://goerli.basescan.org/tx/${txHash}`}
                                        rel="noreferrer"
                                        className="underline ml-2"
                                    >
                                        {"View ->"}
                                    </a>
                                </p>
                            </div>
                        </div>
                    ) : null
                ) : isRedirected ? (
                    <>
                        {!processing && (
                            <div className="lg:hidden block w-full">
                                <PrimaryBtn
                                    className={`${
                                        handleDisableBtn() ? "opacity-60" : "opacity-100"
                                    }`}
                                    title="Share"
                                    onClick={() => {
                                        handleShareURL();
                                    }}
                                    rightImage={showShareIcon ? icons.shareBtnIcon : ""}
                                    showShareIcon={showShareIcon}
                                    btnDisable={handleDisableBtn()}
                                    loading={isLoading}
                                />
                            </div>
                        )}
                        {!processing && (
                            <div className="hidden lg:block w-full max-w-[400px]">
                                <PrimaryBtn
                                    className={`${
                                        handleDisableBtn() ? "opacity-60" : "opacity-100"
                                    }`}
                                    title={shareText}
                                    onClick={() => {
                                        setOpenShareModal(true);
                                    }}
                                    rightImage={showShareIcon ? icons.shareBtnIcon : ""}
                                    btnDisable={handleDisableBtn()}
                                    loading={isLoading}
                                />
                            </div>
                        )}
                        <SecondaryBtn
                            className={`${
                                handleDisableBtn() ? "opacity-60" : "opacity-100"
                            }`}
                            title={"Claim"}
                            onClick={() => handleClaimClick()}
                            rightImage={processing ? undefined : icons.downloadBtnIcon}
                            btnDisable={handleDisableBtn()}
                            loading={isLoading || processing}
                        />
                        {processing && (
                            <p className="claim-processing">
                                {"⏳ Hang tight! We're currently processing your claim."}
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <PrimaryBtn
                            className={`${
                                handleDisableBtn() ? "opacity-60" : "opacity-100"
                            }`}
                            title={"Claim"}
                            onClick={() => handleClaimClick()}
                            rightImage={
                                processing ? undefined : icons.downloadBtnIconBlack
                            }
                            btnDisable={handleDisableBtn()}
                            loading={isLoading || processing}
                        />

                        {processing && (
                            <p className="claim-processing">
                                {"⏳ Hang tight! We're currently processing your claim."}
                            </p>
                        )}
                        {!processing && (
                            <div className="lg:hidden block w-full">
                                <SecondaryBtn
                                    className={`${
                                        handleDisableBtn() ? "opacity-60" : "opacity-100"
                                    }`}
                                    title="Share"
                                    onClick={() => {
                                        handleShareURL();
                                    }}
                                    rightImage={
                                        showShareIcon ? icons.shareBtnIconWhite : ""
                                    }
                                    showShareIcon={showShareIcon}
                                    btnDisable={handleDisableBtn()}
                                    loading={isLoading}
                                />
                            </div>
                        )}
                        {!processing && (
                            <div className="hidden lg:block w-full max-w-[400px]">
                                <SecondaryBtn
                                    className={`${
                                        handleDisableBtn() ? "opacity-60" : "opacity-100"
                                    }`}
                                    title={shareText}
                                    onClick={() => {
                                        setOpenShareModal(true);
                                    }}
                                    rightImage={
                                        showShareIcon ? icons.shareBtnIconWhite : ""
                                    }
                                    btnDisable={handleDisableBtn()}
                                    loading={isLoading}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
            <ClaimBtnModal
                open={openClaimModal}
                setOpen={setOpenClaimModal}
                uuid={uuid}
                handleConnect={handleConnect}
                handlePublicAddressTransaction={handlePublicAddressTransaction}
            />
            <ShareBtnModal open={openShareModal} setOpen={setOpenShareModal} />
            <QrModal open={showQr} setOpen={setShowQr} address={fromAddress} />
            {isClaimSuccessful && (
                <Confetti
                    width={2400}
                    height={1200}
                    recycle={false}
                    numberOfPieces={2000}
                />
            )}

            <Footer />
        </div>
    );
};
export default ShareLink;
