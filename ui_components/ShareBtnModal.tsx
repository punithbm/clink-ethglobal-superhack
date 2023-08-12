import { Dialog, Transition } from "@headlessui/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { serializeError } from "eth-rpc-errors";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Options } from "qr-code-styling";
import React, { FC, Fragment, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import { trimAddress, trimLink } from "../utils";
import { icons } from "../utils/images";
import { DepositAmountComponent } from "./loadchest/DepositAmountComponent";
import { QRComponent } from "./loadchest/QRComponent";
import PrimaryBtn from "./PrimaryBtn";

export default dynamic(() => Promise.resolve(ShareBtnModal), {
    ssr: false,
});
export interface IClaimBtnModal {
    open: boolean;
    setOpen: (val: boolean) => void;
}

export const ShareBtnModal: FC<IClaimBtnModal> = (props) => {
    const { open, setOpen } = props;

    // const { getAccount, injectConnector, connect, baseGoerli } = useWagmi();

    const { isConnecting, address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    const [connecting, setConnecting] = useState(false);
    const [openInput, setOpenInput] = useState(false);

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
    const [value, setValue] = useState("");

    const handleInputChange = (val: string) => {
        setValue(val);
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
        // setShowDeposit(false);
        // setShowQr(false);
        setOpen(false);
    };

    const handleOpenInput = () => {
        setOpenInput(!openInput);
    };

    const [copyText, setCopyText] = useState("Copy");
    const [color, setColor] = useState(false);

    if (typeof window === "object") {
        const url = window.location.href;

        const copyToClipBoard = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            setColor(true);
            navigator.clipboard.writeText(url);
            setCopyText("Copied!");
            setTimeout(() => {
                setCopyText("Copy");
                setColor(false);
            }, 5000);
        };
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
                                        <div>
                                            <div className="mb-1">
                                                <QRComponent
                                                    walletAddress={url}
                                                    isShareQr={true}
                                                    widthPx={240}
                                                    heightPx={240}
                                                />
                                            </div>
                                            <ul className="flex gap-4 items-center pb-4 justify-center">
                                                <li>
                                                    <Link
                                                        href={`https://twitter.com/intent/tweet?url=${url}`}
                                                        passHref
                                                        target="_blank"
                                                        className="flex font-sans flex-col items-center font-medium text-lg focus-visible:outline-none"
                                                    >
                                                        <Image
                                                            className="w-[60px]"
                                                            src={icons.x}
                                                            alt="twitter"
                                                        />
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href={`https://telegram.me/share/url?url=${url}`}
                                                        passHref
                                                        target="_blank"
                                                        className="flex font-sans flex-col items-center font-medium text-lg focus-visible:outline-none"
                                                    >
                                                        <Image
                                                            className="w-[60px]"
                                                            src={icons.telegramBlue}
                                                            alt="telegram"
                                                        />
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link
                                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
                                                        passHref
                                                        target="_blank"
                                                        className="flex font-sans flex-col items-center font-medium text-lg focus-visible:outline-none"
                                                    >
                                                        <Image
                                                            className="w-[60px]"
                                                            src={icons.linkedinBlue}
                                                            alt="linkedin"
                                                        />
                                                    </Link>
                                                </li>
                                            </ul>
                                            <div className="relative rounded-lg border border-black px-2 py-2 bg-white/20 flex items-center justify-between w-[95%] mx-auto">
                                                <p className="font-medium text-[12px] text-white">
                                                    {trimLink(url)}
                                                </p>
                                                <button
                                                    type="button"
                                                    className={`font-bold text-[16px] border border-black py-2 min-w-[80px] rounded-[36px] ${
                                                        color
                                                            ? "bg-black text-white"
                                                            : "bg-white text-black"
                                                    }`}
                                                    onClick={(e) => copyToClipBoard(e)}
                                                >
                                                    {copyText}
                                                </button>
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
