import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function ConnectBtn() {
    return (
        <Menu as="div" className="relative inline-block w-full text-center">
            <div>
                <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-lg bg-[#19A5E1] my-2 px-3 py-3 text-md font-medium text-white shadow-sm">
                    Connect Options
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 absolute right-4 "
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                    </svg>
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute  z-10 mt-2 w-full  rounded-md bg-white shadow-lg ring-1">
                    <div className="py-1">
                        <Menu.Item>
                            <div className="py-5 border-b-2">
                                <p>Connect Wallet</p>
                            </div>
                        </Menu.Item>
                        <Menu.Item>
                            <div className="py-5">
                                <p>Sign In With Google</p>
                            </div>
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
