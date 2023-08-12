import "react-toastify/dist/ReactToastify.css";

import AccountAbstraction from "@safe-global/account-abstraction-kit-poc";
import Safe, { EthersAdapter, getSafeContract } from "@safe-global/protocol-kit";
import { SafeAccountConfig, SafeFactory } from "@safe-global/protocol-kit";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import {
    MetaTransactionData,
    MetaTransactionOptions,
    OperationType,
    RelayTransaction,
} from "@safe-global/safe-core-sdk-types";
import { initWasm } from "@trustwallet/wallet-core";
import { serializeError } from "eth-rpc-errors";
import { ethers } from "ethers";
import Lottie from "lottie-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, MouseEvent, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { parseEther } from "viem";

import { getBalance, getSendTransactionStatus, getUsdPrice } from "../../apiServices";
import { GlobalContext } from "../../context/GlobalContext";
import { ESTEPS, LOGGED_IN, THandleStep } from "../../pages";
import * as loaderAnimation from "../../public/lottie/loader.json";
import {
    getCurrencyFormattedNumber,
    getTokenFormattedNumber,
    getTokenValueFormatted,
    hexToNumber,
    numHex,
} from "../../utils";
import { Base } from "../../utils/chain/base";
import { icons } from "../../utils/images";
import { useWagmi } from "../../utils/wagmi/WagmiContext";
import { Wallet } from "../../utils/wallet";
import { TRANSACTION_TYPE, TTranx } from "../../utils/wallet/types";
import BackBtn from "../BackBtn";
import PrimaryBtn from "../PrimaryBtn";
import SecondaryBtn from "../SecondaryBtn";
import DepositAmountModal from "./DepositAmountModal";
import { ProfileCard } from "./ProfileCard";

export interface ILoadChestComponent extends THandleStep {
    openLogin?: any;
    safeLogin?: any;
    provider?: any;
}
export const LoadChestComponent: FC<ILoadChestComponent> = (props) => {
    const { openLogin, handleSteps, safeLogin, provider } = props;

    const {
        state: { loggedInVia, address, googleUserInfo, isConnected },
    } = useContext(GlobalContext);

    const router = useRouter();

    const [value, setValue] = useState("");
    const [price, setPrice] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [tokenPrice, setTokenPrice] = useState("");
    const [tokenValue, setTokenValue] = useState(0);
    const [fromAddress, setFromAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [toggle, setToggle] = useState(true);
    const [btnDisable, setBtnDisable] = useState(true);
    const [balanceInUsd, setBalanceInUsd] = useState("");
    const [showActivity, setShowActivity] = useState(false);

    const handleToggle = () => {
        setToggle(!toggle);
    };
    const [balLoading, setBalLoading] = useState(false);

    useEffect(() => {
        if (address) {
            fetchBalance();
        }
    }, [address]);

    const fetchBalance = async () => {
        setLoading(true);
        getUsdPrice()
            .then(async (res: any) => {
                setTokenPrice(res.data.ethereum.usd);
                setFromAddress(address);
                const balance = (await getBalance(address)) as any;
                setTokenValue(
                    getTokenFormattedNumber(
                        hexToNumber(balance.result) as unknown as string,
                        18,
                    ),
                );
                const formatBal = (
                    (hexToNumber(balance.result) / Math.pow(10, 18)) *
                    res.data.ethereum.usd
                ).toFixed(3);
                setPrice(getCurrencyFormattedNumber(formatBal));
                setBalanceInUsd(formatBal);
                setLoading(false);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const handleValueClick = (val: string) => {
        setValue(`$${val}`);
        const valueWithoutDollarSign = val.replace(/[^\d.]/g, "");
        const tokenIputValue = Number(valueWithoutDollarSign) / Number(tokenPrice);
        setInputValue(getTokenValueFormatted(Number(tokenIputValue)));
    };

    const handleInputChange = (val: string) => {
        const valueWithoutDollarSign = val.replace(/[^\d.]/g, "");
        let appendDollar = "";
        if (Number(valueWithoutDollarSign) > 0) {
            appendDollar = "$";
        }
        setValue(`${appendDollar}${valueWithoutDollarSign}`);
        const tokenIputValue = Number(valueWithoutDollarSign) / Number(tokenPrice);
        setInputValue(getTokenValueFormatted(Number(tokenIputValue)));
        if (Number(valueWithoutDollarSign) < Number(balanceInUsd)) {
            setBtnDisable(false);
        } else {
            setBtnDisable(true);
        }
    };

    const dollorToToken = (val: string) => {
        return Number(val) / Number(tokenPrice);
    };

    const { sendTransaction } = useWagmi();

    function removeLeadingZeros(value: string): string {
        // Check if the input value is empty or null
        if (!value || value.length === 0) {
            return value;
        }

        // Find the index of the first non-zero digit
        let nonZeroIndex = 0;
        while (value[nonZeroIndex] === "0" && nonZeroIndex < value.length - 1) {
            nonZeroIndex++;
        }

        // Remove leading zeros and return the result
        return value.substring(nonZeroIndex);
    }

    const createWallet = async () => {
        const _inputValue = inputValue.replace(/[^\d.]/g, "");
        if (_inputValue) {
            setTransactionLoading(true);
            try {
                const walletCore = await initWasm();
                const wallet = new Wallet(walletCore);
                const payData = await wallet.createPayLink();
                const toAddress = payData.address;
                const tokenAmount = Number(_inputValue) * Math.pow(10, 18);
                const ethersProvider = new ethers.providers.JsonRpcProvider(
                    "https://goerli.base.org",
                );
                const signer = new ethers.Wallet(payData.key, ethersProvider);
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signerOrProvider: signer,
                });

                const safeFactory = await SafeFactory.create({
                    ethAdapter: ethAdapter,
                });
                const destinationAddress = await signer.getAddress();
                const safeAccountConfig: SafeAccountConfig = {
                    owners: [destinationAddress],
                    threshold: 1,
                };
                const relayPack = new GelatoRelayPack(
                    "qbec0fcMKxOAXM0qyxL6cDMX_aaJUmSPPAJUIEg17kU_",
                );
                const safeAccountAbstraction = new AccountAbstraction(signer);
                await safeAccountAbstraction.init({ relayPack });

                const addPredicted = await safeFactory.predictSafeAddress(
                    safeAccountConfig,
                );
                console.log(addPredicted, "addPredicted");
                console.log(
                    parseEther(inputValue).toString(),
                    "parseEther(inputValue).toString()",
                );
                console.log(
                    "process.env.GELATO_RELAY_API_KEY ",
                    "qbec0fcMKxOAXM0qyxL6cDMX_aaJUmSPPAJUIEg17kU_",
                );
                const amountParsed = numHex(Number(parseEther(_inputValue)));
                const safeTransactionData: MetaTransactionData = {
                    to: destinationAddress,
                    data: "0x",
                    value: parseEther(inputValue).toString(),
                    operation: OperationType.Call,
                };
                const options: MetaTransactionOptions = {
                    gasLimit: "100000",
                    isSponsored: true,
                };

                const gelatoTaskId = await safeAccountAbstraction.relayTransaction(
                    [safeTransactionData],
                    options,
                );

                console.log("gelatoTaskId ", gelatoTaskId);

                handleTransactionStatus(gelatoTaskId, payData.link);

                // if (loggedInVia === LOGGED_IN.GOOGLE) {
                //     try {
                //         let valueHex = String(nonStrtZero);

                //         if (!valueHex.startsWith("0x")) {
                //             valueHex = "0x" + valueHex;
                //         }

                //         const gasLimitData = (await getEstimatedGas({
                //             from: fromAddress,
                //             to: toAddress,
                //             value: valueHex,
                //         })) as any;

                //         const nonce = (await getNonce(fromAddress)) as any;

                //         const tx: TTranx = {
                //             toAddress: toAddress,
                //             nonceHex: nonce.result,
                //             chainIdHex: numHex(Number(Base.chainId)),
                //             // gas price is hardcoded to pass 1 by default as of now
                //             gasPriceHex: "3B9ACA00" ?? "0x1",
                //             gasLimitHex: gasLimitData.result,
                //             amountHex: numHex(tokenAmount),
                //             contractDecimals: 18,
                //             fromAddress: fromAddress,
                //             transactionType: TRANSACTION_TYPE.SEND,
                //             isNative: true,
                //         };

                //         const prvKey = (await provider.request({
                //             method: "private_key",
                //         })) as string;
                //         console.log("prvKey ", prvKey);
                //         const txData = await wallet.signEthTx(tx, prvKey);
                //         const rawTx = (await getSendRawTransaction(txData)) as any;
                //         handleTransactionStatus(rawTx.result, payData.link);
                //     } catch (e: any) {
                //         setTransactionLoading(false);
                //         const err = serializeError(e);
                //         toast.error(err.message);
                //         console.log(e, "error");
                //     }
                // } else {
                //     try {
                //         const sendAmount = await sendTransaction({
                //             to: toAddress,
                //             value: parseEther(inputValue),
                //         });
                //         handleTransactionStatus(sendAmount.hash, payData.link);
                //     } catch (e: any) {
                //         setTransactionLoading(false);
                //         const err = serializeError(e);
                //         toast.error(err.message);
                //         console.log(e, "error");
                //     }
                // }
            } catch (e: any) {
                setTransactionLoading(false);
                const err = serializeError(e);
                toast.error(err.message);
                console.log(e, "e");
            }
        }
    };

    const handleTransactionStatus = (hash: string, link: string) => {
        const intervalInMilliseconds = 2000;
        const interval = setInterval(() => {
            getSendTransactionStatus(hash).then((res: any) => {
                if (res.result) {
                    const status = Number(res.result.status);
                    if (status === 1) {
                        router.push(link);
                    } else {
                        setTransactionLoading(false);
                        toast.error("Failed to Load Chest. Try Again");
                    }
                    if (interval !== null) {
                        clearInterval(interval);
                    }
                }
            });
        }, intervalInMilliseconds);
    };

    const handleShowActivity = () => {
        setShowActivity(!showActivity);
    };

    return (
        <div className="mx-auto relative max-w-[400px]">
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
            {!transactionLoading ? (
                <div>
                    <ProfileCard
                        balance={price}
                        showActivity={false}
                        transactionLoading={false}
                    ></ProfileCard>

                    {!showActivity ? (
                        <>
                            <div className="rounded-lg border border-white/40 bg-white/5 ">
                                <div className="flex items-center justify-between py-2 px-4">
                                    <div>
                                        <p className="paragraph font-normal text-white/40">
                                            YOUR BALANCE
                                        </p>
                                        <div className="flex items-start gap-3 my-2">
                                            <Image
                                                src={icons.transferIcon}
                                                alt="transferIcon"
                                                onClick={handleToggle}
                                                className="cursor-pointer"
                                            />
                                            {toggle ? (
                                                loading ? (
                                                    <div className="w-full h-full">
                                                        <div className="w-[40px] h-[10px] bg-white/10 animate-pulse rounded-lg mb-2"></div>
                                                        <div className="w[40px] h-[10px] bg-white/10 animate-pulse rounded-lg "></div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-white/80 text-[24px] font-semibold leading-10 mb-2">
                                                            {price}
                                                        </p>
                                                        <p className="text-white/30 text-[12px] leading-[14px]">
                                                            {tokenValue} ETH
                                                        </p>
                                                    </div>
                                                )
                                            ) : loading ? (
                                                <div className="w-full h-full">
                                                    <div className="w-[40px] h-[10px] bg-white/10 animate-pulse rounded-lg mb-2"></div>
                                                    <div className="w[40px] h-[10px] bg-white/10 animate-pulse rounded-lg "></div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-white/80 text-[24px] font-semibold leading-10 mb-2">
                                                        ~ {tokenValue} ETH
                                                    </p>
                                                    <p className="text-white/30 text-[12px] leading-[14px]">
                                                        {price}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Image src={icons.ethLogo} alt="transferIcon" />
                                        <p className="text-white text-[24px] font-normal leading-9">
                                            ETH
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className="bg-white/80 py-2 rounded-b-lg cursor-pointer"
                                    role="presentation"
                                    onClick={() => {
                                        setOpen(true);
                                    }}
                                >
                                    <p className="text-[#010101] text-[14px] leading-[18px] font-medium text-center">
                                        + Add funds to your account
                                    </p>
                                </div>
                            </div>
                            <div className="w-full mt-5 ">
                                <div className="relative rounded-lg border bg-white/5 border-gray-500  h-auto  p-4">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <div className="flex items-center justify-center">
                                                {/* <p className="text-[32px] text-white">$</p> */}
                                                <input
                                                    name="usdValue"
                                                    style={{ caretColor: "white" }}
                                                    inputMode="decimal"
                                                    type="text"
                                                    className={`dollorInput pl-0 pt-2 pb-1 backdrop-blur-xl text-[32px] border-none text-center bg-transparent text-white dark:text-textDark-900 placeholder-white dark:placeholder-textDark-300 rounded-lg block w-full focus:outline-none focus:ring-transparent`}
                                                    placeholder="$0"
                                                    value={value}
                                                    onChange={(e) => {
                                                        handleInputChange(e.target.value);
                                                    }}
                                                    disabled={loading}
                                                    onWheel={() =>
                                                        (
                                                            document.activeElement as HTMLElement
                                                        ).blur()
                                                    }
                                                />
                                            </div>
                                            {Number(inputValue) > 0 && (
                                                <p className="text-white/30 text-[12px] leading-[14px] text-center">
                                                    ~ {inputValue} ETH
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-5">
                                <div
                                    className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                                    role="presentation"
                                    onClick={() => {
                                        handleValueClick("1");
                                    }}
                                >
                                    <p className="text-center text-white">$1</p>
                                </div>
                                <div
                                    className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                                    role="presentation"
                                    onClick={() => {
                                        handleValueClick("2");
                                    }}
                                >
                                    <p className="text-center text-white">$2</p>
                                </div>
                                <div
                                    className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                                    role="presentation"
                                    onClick={() => {
                                        handleValueClick("5");
                                    }}
                                >
                                    <p className="text-center text-white">$5</p>
                                </div>
                            </div>
                            <div className="relative mt-10">
                                <div
                                    className={`${
                                        !btnDisable && value
                                            ? "opacity-100"
                                            : "opacity-50"
                                    } flex gap-2 justify-between`}
                                >
                                    <PrimaryBtn
                                        className={`w-[45%] lg:w-[185px] max-w-[185px] mx-0 ${
                                            btnDisable || !value
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                        title={"Create Link"}
                                        onClick={createWallet}
                                        btnDisable={btnDisable || !value}
                                    />
                                    <SecondaryBtn
                                        className={`w-[45%] lg:w-[185px] max-w-[185px] mx-0 ${
                                            btnDisable || !value
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                        title={"Send"}
                                        onClick={createWallet}
                                    />
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            ) : (
                <div className="w-full max-w-[600px] h-full relative flex flex-col text-center items-center gap-5 mx-auto mt-20">
                    <p className="text-white heading2 text-[32px] ">Loading Chest...</p>
                    <Lottie animationData={loaderAnimation} />
                </div>
            )}
            <DepositAmountModal
                open={open}
                setOpen={setOpen}
                walletAddress={fromAddress}
                tokenPrice={tokenPrice}
                fetchBalance={fetchBalance}
            />
        </div>
    );
};
