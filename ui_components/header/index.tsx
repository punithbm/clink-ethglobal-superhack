import * as React from "react";
import PrimaryBtn from "../PrimaryBtn";
import Image from "next/image";
import { icons } from "../../utils/images";
import { trimAddress } from "../../utils";
interface IHeader {
    walletAddress: string;
    signIn: () => Promise<void>;
}
const Header = (props: IHeader) => {
    const { walletAddress, signIn } = props;
    return (
        <header className="">
            <div className="h-[80px]"></div>
            <div className="sticky top-0 flex items-center justify-center">
                <div className="w-[90%] max-w-[600px] h-[64px] rounded-2xl bg-[#0C0421] text-center z-999 flex items-center justify-between ">
                    <div className="flex gap-2 px-4">
                        <Image src={icons.logo} alt="logo" className="w-12" />
                        <p className="text-[16px] font-bold text-white self-center">
                            Micropay
                        </p>
                    </div>
                    <div className="flex gap-4 items-center px-4">
                        <button
                            className={`px-4 h-[40px] rounded-lg bg-white flex gap-2 items-center justify-center`}
                        >
                            <Image
                                src={walletAddress ? icons.ethLogo : icons.googleIcon}
                                alt="google login"
                                className="w-5"
                            />
                            <span className="text-[16px] font-medium text-black/50 self-center my-auto">
                                {walletAddress ? trimAddress(walletAddress) : "Login"}
                            </span>
                        </button>
                        <div className="header-menu-list relative">
                            <button
                                type="button"
                                className="w-[40px] h-[40px] rounded-lg bg-white flex items-center justify-center "
                            >
                                <Image
                                    src={icons.hamburgerBlack}
                                    alt="more options"
                                    className="w-6 "
                                />
                                <div className="header-submenu absolute top-full bg-[#f5f5f5]  z-[100]">
                                    <div className="min-w-[480px] rounded-lg">
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
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Header;
