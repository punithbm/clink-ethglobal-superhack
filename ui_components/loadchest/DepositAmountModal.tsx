import { Dialog, Transition } from "@headlessui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { serializeError } from "eth-rpc-errors";
import dynamic from "next/dynamic";
import Image from "next/image";
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
import React, { FC, Fragment, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import { icons } from "../../utils/images";
import { DepositAmountComponent } from "./DepositAmountComponent";
import { QRComponent } from "./QRComponent";

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

export const DepositAmountModal: FC<IDepositAmountModal> = (props) => {
    const { open, setOpen, walletAddress, tokenPrice, fetchBalance } = props;

    // const { getAccount, injectConnector, connect, baseGoerli } = useWagmi();

    const { isConnecting, address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    const [connecting, setConnecting] = useState(false);

    const [options] = useState<Options>({
        width: 240,
        height: 240,
        type: "svg",
        image: icons.logo2.src,
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

    useEffect(() => {
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
                                    className={`bg-lightGray lg:min-w-[400px] rounded-[12px] w-full lg:w-[400px]  py-5`}
                                >
                                    {open && showOptions ? (
                                        <div className="px-4">
                                            <div
                                                role="presentation"
                                                className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer mb-5"
                                                onClick={() => {
                                                    handleExternalWalletClick();
                                                }}
                                            >
                                                <p className="text-center text-white">
                                                    {connecting
                                                        ? "Connecting..."
                                                        : "🔗 External Wallet"}
                                                </p>
                                            </div>
                                            <div
                                                role="presentation"
                                                className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                                                onClick={() => {
                                                    handlePublicKeyClick();
                                                }}
                                            >
                                                <p className="text-center text-white">
                                                    #️⃣ Public Address
                                                </p>
                                            </div>
                                        </div>
                                    ) : showQR && !showDeposit ? (
                                        <QRComponent
                                            walletAddress={walletAddress}
                                            widthPx={240}
                                            heightPx={240}
                                        />
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
