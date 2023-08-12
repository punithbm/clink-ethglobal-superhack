import { Dialog, Transition } from "@headlessui/react";
import dynamic from "next/dynamic";
import React, { FC, Fragment, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import { QRComponent } from "./loadchest/QRComponent";

export default dynamic(() => Promise.resolve(QrModal), {
    ssr: false,
});
export interface IQrModal {
    open: boolean;
    setOpen: (val: boolean) => void;
    value: string;
}

export const QrModal: FC<IQrModal> = (props) => {
    const { open, setOpen, value } = props;

    const [showOptions, setShowOptions] = useState(true);

    const handleClose = () => {
        // setShowDeposit(false);
        // setShowQr(false);
        setOpen(false);
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
                                    className={`bg-lightGray lg:min-w-[400px] rounded-[12px] w-[50%] lg:w-[400px]  py-5`}
                                >
                                    {open && showOptions ? (
                                        <div>
                                            <div className="mb-5">
                                                <QRComponent
                                                    walletAddress={value}
                                                    isShareQr={true}
                                                    widthPx={240}
                                                    heightPx={240}
                                                />
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
