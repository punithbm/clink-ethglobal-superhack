import "react-toastify/dist/ReactToastify.css";

import Image from "next/image";
import { FC, useContext, useState } from "react";

import { GlobalContext } from "../../context/GlobalContext";
import { ESTEPS, LOGGED_IN, THandleStep } from "../../pages";
import { trimAddress } from "../../utils";
import { icons } from "../../utils/images";
import PrimaryBtn from "../PrimaryBtn";
import SecondaryBtn from "../SecondaryBtn";

export interface IProfileCard {
    profileImage?: string;
    balance: string;
    showActivity: boolean;
    transactionLoading: boolean;
}
export const ProfileCard: FC<IProfileCard> = (props) => {
    const { balance, showActivity, transactionLoading } = props;
    const {
        state: { loggedInVia, address, googleUserInfo, isConnected },
    } = useContext(GlobalContext);

    return (
        <>
            <div className="w-full h-auto bg-[#0C0421] rounded-lg mb-4 profileBackgroundImage flex-col justify-center items-center text-center cursor-pointer pb-2">
                <div className="pt-2">
                    <Image
                        src={
                            address ? `https://effigy.im/a/${address}.png` : icons.ethLogo
                        }
                        alt="profile image"
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-full mx-auto border-white/50 border"
                    />
                </div>
                <p className="text-sm mx-auto pt-1 text-white/50">My Smart Wallet</p>
                {transactionLoading ? (
                    <div className="w-20 h-10 animate-pulse bg-white/10 rounded-lg mx-auto"></div>
                ) : (
                    <p className="text-sm text-white pb-2">{`${trimAddress(address)}`}</p>
                )}

                <div className="flex justify-around w-[100px] mx-auto pb-1">
                    <Image
                        src={icons.copyIconWhite}
                        alt="copy address"
                        className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() => {
                            console.info("on click");
                        }}
                    />
                    <Image
                        src={icons.qrWhite}
                        alt="show qr code"
                        className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() => {
                            console.info("on click");
                        }}
                    />
                    <Image
                        src={icons.linkWhite}
                        alt="external link"
                        className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() => {
                            console.info("on click");
                        }}
                    />
                </div>
                <p className="inline text-[10px] text-white/50">Powered by: </p>
                <Image
                    src={icons.safeLogo}
                    alt="safe logo"
                    className="w-10 inline-block"
                />

                {/* {showActivity ? (
                    <div className="flex gap-2 items-center justify-center pb-4">
                        <PrimaryBtn
                            title="Send"
                            onClick={() => {}}
                            className="max-w-[155px] text-sm !py-2 "
                        />
                        <SecondaryBtn
                            title="Deposit"
                            onClick={() => {}}
                            className="max-w-[155px] text-sm !py-2 text-[#1ACDA2] border-[#1ACDA2] font-medium"
                        />
                    </div>
                ) : null} */}
            </div>
            {/* {showActivity ? (
                <div>
                    <p className="text-white/50">Activity</p>
                </div>
            ) : null} */}
        </>
    );
};
