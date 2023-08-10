import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment, ReactNode } from "react";
import { icons } from "../../utils/images";
import Image from "next/image";

type TProps = {
    isOpen: boolean;
    onClose: () => void;
};
const BottomSheet: FC<TProps> = (props) => {
    const { isOpen = true, onClose } = props;
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/[0.6] transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className={`pointer-events-none fixed inset-x-0 bottom-0 flex max-w-full justify-center`}
                        >
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 "
                                enterFrom="translate-y-full"
                                enterTo="translate-y-0"
                                leave="transform transition ease-in-out duration-300 "
                                leaveFrom="translate-y-0"
                                leaveTo="translate-y-full"
                            >
                                {/* ${
                                            isFullscreen === "true" ? "" : "grow"
                                        } */}
                                <Dialog.Panel
                                    className={`pointer-events-auto w-full bg-[#f5f5f5] rounded-t-2xl dark:bg-neutralDark-50`}
                                >
                                    <div className="w-full">
                                        <div className="flex justify-between items-center px-4 py-3">
                                            <div>
                                                <p className="text-[12px] font-medium text-[#555555]">
                                                    ACCOUNT OVERVIEW
                                                </p>
                                                <p>Frontier Wallet : </p>
                                            </div>
                                            <div>
                                                <Image
                                                    src={icons.chevronRight}
                                                    alt="more options"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-[95%] h-[52px] bg-white rounded-lg mx-auto flex justify-between items-center px-4 mb-6">
                                            <p className="">Copy Address</p>
                                            <Image
                                                src={icons.copyBlack}
                                                alt="copy icon"
                                            />
                                        </div>
                                        <div className="w-[95%] h-[52px] bg-white rounded-lg mx-auto flex justify-between items-center px-4 mb-6">
                                            <p className="text-[#E11900]">
                                                Disconnect Wallet
                                            </p>
                                        </div>
                                        <div className="bg-white w-full px-4">
                                            <div className="flex justify-between items-center py-6 border-b-2">
                                                <div className="flex gap-2 items-center">
                                                    <Image
                                                        src={icons.googleIcon}
                                                        alt="login with google"
                                                    />
                                                    <p>Login with Google</p>
                                                </div>
                                                <Image
                                                    src={icons.chevronRight}
                                                    alt="login with google"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center py-6 border-b-2">
                                                <div className="flex gap-2 items-center">
                                                    <Image
                                                        src={icons.helpIcon}
                                                        alt="help"
                                                    />
                                                    <p>Help</p>
                                                </div>
                                                <Image
                                                    src={icons.chevronRight}
                                                    alt="login with google"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center py-6">
                                                <div className="flex gap-2 items-center">
                                                    <Image
                                                        src={icons.googleIcon}
                                                        alt="login with google"
                                                    />
                                                    <p>Logout</p>
                                                </div>
                                                <Image
                                                    src={icons.logoutIcon}
                                                    alt="logout"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default BottomSheet;
