import "react-toastify/dist/ReactToastify.css";
import { serializeError } from "eth-rpc-errors";
import Image from "next/image";
import { FC, MouseEvent, useContext, useEffect, useState } from "react";
import { icons } from "../../utils/images";
import * as Bip39 from "bip39";
import { Wallet } from "../../utils/wallet";
import { initWasm } from "@trustwallet/wallet-core";
import { useRouter } from "next/router";
import * as loaderAnimation from "../../public/lottie/loader.json";
import { toast } from "react-toastify";
import {
    getBalance,
    getEstimatedGas,
    getGasPrice,
    getNonce,
    getSendRawTransaction,
    getSendTransactionStatus,
    getUsdPrice,
} from "../../apiServices";
import {
    getCurrencyFormattedNumber,
    getTokenFormattedNumber,
    getTokenValueFormatted,
    hexToNumber,
    numHex,
} from "../../utils";
import { TRANSACTION_TYPE, TTranx } from "../../utils/wallet/types";
import { Base } from "../../utils/chain/base";
import BackBtn from "../BackBtn";
import { ESteps, LOGGED_IN, THandleStep } from "../../pages";
import Lottie from "lottie-react";
import PrimaryBtn from "../PrimaryBtn";
import DepositAmountModal from "./DepositAmountModal";
import { GlobalContext } from "../../context/GlobalContext";
import { useWagmi } from "../../utils/wagmi/WagmiContext";
import { parseEther } from "viem";
import { ToastContainer } from "react-toastify";

export interface ILoadChestComponent extends THandleStep {
    openLogin?: any;
}
export const LoadChestComponent: FC<ILoadChestComponent> = (props) => {
    const { openLogin, handleSteps } = props;

    const {
        state: { loggedInVia, address },
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

                const amountParsed = numHex(Number(parseEther(_inputValue)));
                const nonStrtZero = removeLeadingZeros(amountParsed);

                if (loggedInVia === LOGGED_IN.GOOGLE) {
                    try {
                        let valueHex = String(nonStrtZero);

                        if (!valueHex.startsWith("0x")) {
                            valueHex = "0x" + valueHex;
                        }

                        const gasLimitData = (await getEstimatedGas({
                            from: fromAddress,
                            to: toAddress,
                            value: valueHex,
                        })) as any;

                        const nonce = (await getNonce(fromAddress)) as any;

                        const tx: TTranx = {
                            toAddress: toAddress,
                            nonceHex: nonce.result,
                            chainIdHex: numHex(Number(Base.chainId)),
                            // gas price is hardcoded to pass 1 by default as of now
                            gasPriceHex: "3B9ACA00" ?? "0x1",
                            gasLimitHex: gasLimitData.result,
                            amountHex: numHex(tokenAmount),
                            contractDecimals: 18,
                            fromAddress: fromAddress,
                            transactionType: TRANSACTION_TYPE.SEND,
                            isNative: true,
                        };

                        const txData = await wallet.signEthTx(tx, openLogin.privKey);
                        const rawTx = (await getSendRawTransaction(txData)) as any;
                        handleTransactionStatus(rawTx.result, payData.link);
                    } catch (e: any) {
                        setTransactionLoading(false);
                        const err = serializeError(e);
                        toast.error(err.message);
                        console.log(e, "error");
                    }
                } else {
                    try {
                        const sendAmount = await sendTransaction({
                            to: toAddress,
                            value: parseEther(inputValue),
                        });
                        handleTransactionStatus(sendAmount.hash, payData.link);
                    } catch (e: any) {
                        setTransactionLoading(false);
                        const err = serializeError(e);
                        toast.error(err.message);
                        console.log(e, "error");
                    }
                }
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
                    <div className="text-center mb-6 mt-12">
                        <p className="paragraph text-white/40">STEP 2</p>
                        <p className="paragraph_regular text-white">
                            Enter the amount to store in the chest
                        </p>
                    </div>
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
                                                    ~ {tokenValue} ETH
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
                        {loggedInVia === LOGGED_IN.GOOGLE && (
                            <div
                                className="bg-white/80 py-2 rounded-b-lg cursor-pointer"
                                onClick={() => {
                                    setOpen(true);
                                }}
                            >
                                <p className="text-[#010101] text-[14px] leading-[18px] font-medium text-center">
                                    + Add funds to your account
                                </p>
                            </div>
                        )}
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
                                            autoFocus={true}
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
                            onClick={() => {
                                handleValueClick("1");
                            }}
                        >
                            <p className="text-center text-white">$1</p>
                        </div>
                        <div
                            className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                            onClick={() => {
                                handleValueClick("2");
                            }}
                        >
                            <p className="text-center text-white">$2</p>
                        </div>
                        <div
                            className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
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
                                !btnDisable && value ? "opacity-100" : "opacity-50"
                            }`}
                        >
                            <PrimaryBtn
                                className={`lg:w-[400px] max-w-[400px] ${
                                    btnDisable || !value ? "cursor-not-allowed" : ""
                                }`}
                                title={"Load Chest"}
                                onClick={createWallet}
                                btnDisable={btnDisable || !value}
                            />
                        </div>
                    </div>
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
