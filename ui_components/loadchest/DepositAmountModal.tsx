import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import React, { FC, Fragment, useEffect, useRef, useState } from "react";
import QRCodeStyling, {
    CornerDotType,
    CornerSquareType,
    DotType,
    DrawType,
    ErrorCorrectionLevel,
    Gradient,
    Mode,
    Options,
    ShapeType,
    TypeNumber,
} from "qr-code-styling";
import ReactDOM from "react-dom";
import { icons } from "../../utils/images";
import dynamic from "next/dynamic";
import { copyToClipBoard, trimAddress } from "../../utils";
import { QRComponent } from "./QRComponent";
import { DepositAmountComponent } from "./DepositAmountComponent";
import { useWagmi } from "../../utils/wagmi/WagmiContext";
import { toast } from "react-toastify";
import { serializeError } from "eth-rpc-errors";
import { fetchBalance } from "wagmi/actions";

export default dynamic(() => Promise.resolve(DepositAmountModal), {
    ssr: false,
});
export interface IDepositAmountModal {
    open: boolean;
    setOpen: (val: boolean) => void;
    walletAddress: string;
    tokenPrice: string;
    fetchBalance: () => void;
}
export declare type QRCodeStylingOptions = {
    type?: DrawType;
    shape?: ShapeType;
    width?: number;
    height?: number;
    margin?: number;
    data?: string;
    image?: string;
    qrOptions?: {
        typeNumber?: TypeNumber;
        mode?: Mode;
        errorCorrectionLevel?: ErrorCorrectionLevel;
    };
    imageOptions?: {
        hideBackgroundDots?: boolean;
        imageSize?: number;
        crossOrigin?: string;
        margin?: number;
    };
    dotsOptions?: {
        type?: DotType;
        color?: string;
        gradient?: Gradient;
    };
    cornersSquareOptions?: {
        type?: CornerSquareType;
        color?: string;
        gradient?: Gradient;
    };
    cornersDotOptions?: {
        type?: CornerDotType;
        color?: string;
        gradient?: Gradient;
    };
    backgroundOptions?: {
        round?: number;
        color?: string;
        gradient?: Gradient;
    };
};
const useQRCodeStyling = (options: QRCodeStylingOptions): QRCodeStyling | null => {
    if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const QRCodeStylingLib = require("qr-code-styling");
        const qrCodeStyling: QRCodeStyling = new QRCodeStylingLib(options);
        return qrCodeStyling;
    }
    return null;
};
export const DepositAmountModal: FC<IDepositAmountModal> = (props) => {
    const { open, setOpen, walletAddress, tokenPrice, fetchBalance } = props;

    const { getAccount, injectConnector, connect, baseGoerli } = useWagmi();

    const [connecting, setConnecting] = useState(false);

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
    const [showQR, setShowQr] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [showOptions, setShowOptions] = useState(true);

    const handlePublicKeyClick = () => {
        setShowOptions(false);
        setShowDeposit(false);
        setShowQr(true);
    };

    const handleWalletConnectFlow = () => {
        setShowOptions(false);
        setShowQr(false);
        setShowDeposit(true);
    };

    const handleExternalWalletClick = async () => {
        try {
            const account = await getAccount();
            if (!account || !account.isConnected) {
                setConnecting(true);
                await connect({
                    chainId: baseGoerli.id,
                    connector: injectConnector,
                });
                handleWalletConnectFlow();
                toast.success("Wallet Connected Successfully");
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
        setShowDeposit(false);
        setShowQr(false);
        setOpen(false);
        setShowOptions(true);
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
                                                className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                                                onClick={() => {
                                                    handlePublicKeyClick();
                                                }}
                                            >
                                                <p className="text-center text-white">
                                                    Public Key
                                                </p>
                                            </div>
                                        </div>
                                    ) : showQR && !showDeposit ? (
                                        <QRComponent walletAddress={walletAddress} />
                                    ) : (
                                        showDeposit &&
                                        !showQR && (
                                            <DepositAmountComponent
                                                tokenPrice={tokenPrice}
                                                walletAddress={walletAddress}
                                                handleClose={handleClose}
                                                fetchBalance={fetchBalance}
                                            />
                                        )
                                    )}
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
