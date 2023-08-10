import Image from "next/image";
import { FC, MouseEvent, useEffect, useState } from "react";
import { icons } from "../../utils/images";
import * as Bip39 from "bip39";
import { Wallet } from "../../utils/wallet";
import { initWasm } from "@trustwallet/wallet-core";
import { useRouter } from "next/router";
import * as loaderAnimation from "../../public/lottie/loader.json";
import {
    getBalance,
    getEstimatedGas,
    getGasPrice,
    getNonce,
    getSendRawTransaction,
    getUsdPrice,
} from "../../apiServices";
import { hexToNumber, numHex } from "../../utils";
import { TRANSACTION_TYPE, TTranx } from "../../utils/wallet/types";
import { Base } from "../../utils/chain/base";
import { data } from "autoprefixer";
import BackBtn from "../BackBtn";
import { ESteps, THandleStep } from "../../pages";
import Lottie from "lottie-react";
import PrimaryBtn from "../PrimaryBtn";

export interface ILoadChestComponent extends THandleStep {
    openLogin?: any;
}
export const LoadChestComponent: FC<ILoadChestComponent> = (props) => {
    const router = useRouter();
    const { openLogin, handleSteps } = props;
    const [value, setValue] = useState("");
    const [price, setPrice] = useState("");
    const [tokenPrice, setTokenPrice] = useState("");
    const [tokenValue, setTokenValue] = useState(0);
    const [fromAddress, setFromAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionLoading, setTransactionLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        getUsdPrice()
            .then(async (res: any) => {
                console.log(res, "price");
                setTokenPrice(res.data.ethereum.usd);
                const walletCore = await initWasm();
                const wallet = new Wallet(walletCore);
                const address = await wallet.importWithPrvKey(openLogin.privKey);
                console.log(address, "address");
                setFromAddress(address);
                const balance = (await getBalance(address)) as any;
                setTokenValue(hexToNumber(balance.result) / Math.pow(10, 18));
                const formatBal = (
                    (hexToNumber(balance.result) / Math.pow(10, 18)) *
                    res.data.ethereum.usd
                ).toFixed(3);
                setPrice(
                    Number(formatBal) < 0.001
                        ? "<0.001"
                        : (formatBal as unknown as string),
                );
                setLoading(false);
            })
            .catch((e) => {
                console.log(e);
            });
    }, []);

    const handleValueClick = (val: string) => {
        setValue(val);
    };

    const dollorToToken = (val: string) => {
        return Number(val) / Number(tokenPrice);
    };

    const createWallet = async () => {
        if (value) {
            setTransactionLoading(true);
            try {
                const walletCore = await initWasm();
                const wallet = new Wallet(walletCore);
                const link = await wallet.createPayLink();
                const address = await wallet.getAccountFromPayLink(link);
                const tokenAmount = dollorToToken(value) * Math.pow(10, 18);
                console.log(tokenAmount, "token amount");
                let valueHex = String(numHex(Number(value)));
                if (!valueHex.startsWith("0x")) {
                    valueHex = "0x" + valueHex;
                }
                const gasLimitData = (await getEstimatedGas({
                    from: fromAddress,
                    to: address,
                    value: valueHex,
                })) as any;
                const nonce = (await getNonce(fromAddress)) as any;
                const tx: TTranx = {
                    toAddress: address,
                    nonceHex: nonce.result,
                    chainIdHex: numHex(Number(Base.chainId)),
                    // gas price is hardcoded to pass 1 by default as of now
                    gasPriceHex: "3B9ACA00" ?? "0x1",
                    gasLimitHex: gasLimitData.result,
                    amountHex: numHex(tokenAmount),
                    amount: tokenAmount,
                    contractDecimals: 18,
                    fromAddress: fromAddress,
                    transactionType: TRANSACTION_TYPE.SEND,
                    isNative: true,
                };
                const txData = await wallet.signEthTx(tx, openLogin.privKey);
                console.log(txData, "tx data");
                const rawTx = await getSendRawTransaction(txData);
                console.log(rawTx, "raw tx");
                console.log(link, "link");

                router.push(link);
                setTransactionLoading(false);
            } catch (e: any) {
                console.log(e, "e");
            }
        }
    };
    return (
        <div className="mx-auto relative max-w-[400px]">
            {!transactionLoading ? (
                <div>
                    <BackBtn onClick={() => handleSteps(ESteps.ONE)} />
                    <div className="text-center mb-6">
                        <p className="paragraph text-white/40">STEP 2</p>
                        <p className="paragraph_regular text-white">
                            Enter the amount to store in the chest
                        </p>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/40 bg-white/5 py-2 px-4">
                        <div>
                            <p className="paragraph font-normal text-white/40">
                                YOUR BALANCE
                            </p>
                            <div className="flex items-start gap-3 my-2">
                                <Image src={icons.transferIcon} alt="transferIcon" />
                                <div>
                                    <p className="text-white text-[24px] font-semibold leading-10 mb-2">
                                        ${price}
                                    </p>
                                    <p className="text-white/30 text-[12px] leading-[14px]">
                                        ~ {tokenValue} ETH
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image src={icons.ethLogo} alt="transferIcon" />
                            <p className="text-white text-[24px] font-normal leading-9">
                                ETH
                            </p>
                        </div>
                    </div>
                    <div className="w-full mt-5 ">
                        <div className="relative rounded-lg border bg-white/5 border-gray-500  h-auto  p-4">
                            <div className="flex items-center justify-center">
                                <input
                                    name={"usd value"}
                                    style={{ caretColor: "white" }}
                                    className={`pl-0 pt-2 pb-1 backdrop-blur-xl text-[32px] border-none text-center bg-transparent text-white dark:text-textDark-900 placeholder-white dark:placeholder-textDark-300 rounded-lg block w-full focus:outline-none focus:ring-transparent`}
                                    placeholder={"$0"}
                                    autoFocus={true}
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e.target.value);
                                    }}
                                    disabled={loading}
                                    onWheel={() =>
                                        (document.activeElement as HTMLElement).blur()
                                    }
                                />
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
                    <div className="relative mt-5">
                        <div
                            className={`absolute left-1/2 top-5 -translate-x-1/2 z-0 ${
                                value ? "opacity-50" : "opacity-100"
                            }`}
                        >
                            <Image src={icons.tchest} alt="chest" />
                        </div>
                        <div className={`${value ? "opacity-100" : "opacity-0"}`}>
                            <PrimaryBtn title={"Load Chest"} onClick={createWallet} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-[600px] h-full relative flex flex-col text-center items-center gap-20 mx-auto mt-32">
                    <p className="text-white heading2 text-[32px] ">Loading Chest...</p>
                    <Lottie animationData={loaderAnimation} />
                </div>
            )}
        </div>
    );
};
