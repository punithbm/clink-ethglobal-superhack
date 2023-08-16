import { Dialog, Transition } from "@headlessui/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { FC, Fragment, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { icons } from "../utils/images";
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
    handleConnect: () => void;
    handlePublicAddressTransaction: (toAdd: string) => void;
}

export const ClaimBtnModal: FC<IClaimBtnModal> = (props) => {
    const { open, setOpen, uuid, handleConnect, handlePublicAddressTransaction } = props;

    const [openInput, setOpenInput] = useState(false);
    const [value, setValue] = useState("");

    const handleInputChange = (val: string) => {
        setValue(val);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenInput = () => {
        setOpenInput(!openInput);
    };

    useEffect(() => {
        setValue("");
        setOpenInput(false);
    }, [open]);

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
                                    {open ? (
                                        <div className="px-4">
                                            {openInput && (
                                                <div className="absolute">
                                                    <Image
                                                        src={icons.backIcon}
                                                        alt="backIcon"
                                                        onClick={handleOpenInput}
                                                        className="cursor-pointer w-10 h-10"
                                                    />
                                                </div>
                                            )}
                                            <p className="text-center text-white text-[16px] mb-5">
                                                {openInput
                                                    ? "Enter Public Address"
                                                    : "💰 Claim"}
                                            </p>
                                            {!openInput && (
                                                <>
                                                    <div
                                                        className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer mb-5"
                                                        onClick={() => {
                                                            handleConnect();
                                                        }}
                                                        role="presentation"
                                                    >
                                                        <p className="text-center text-white">
                                                            {"🔗  External Wallet"}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer mb-5"
                                                        onClick={() => {
                                                            handleOpenInput();
                                                        }}
                                                        role="presentation"
                                                    >
                                                        <p className="text-center text-white">
                                                            #️⃣ Public Address
                                                        </p>
                                                    </div>

                                                    <div
                                                        className="rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer"
                                                        role="presentation"
                                                    >
                                                        <p className="text-center text-white">
                                                            {`🏦  Bank Transfer (Coming soon)`}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {openInput ? (
                                                <div>
                                                    <input
                                                        name={"public address"}
                                                        style={{
                                                            caretColor: "white",
                                                        }}
                                                        inputMode="text"
                                                        type="string"
                                                        className={`rounded-lg border border-gray-500 bg-white/5 p-2 cursor-pointer mb-5 pl-0 pt-2 pb-1 backdrop-blur-xl text-[14px] border-none text-center  text-white placeholder-white/40 block w-full focus:outline-none focus:ring-transparent`}
                                                        placeholder={"0xfc...71de"}
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
                                                            title={"Send"}
                                                            btnDisable={!value}
                                                            onClick={() => {
                                                                handlePublicAddressTransaction(
                                                                    value,
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}
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
