import "react-toastify/dist/ReactToastify.css";

import Image from "next/image";
import { FC, useContext, useState } from "react";

import { GlobalContext } from "../../context/GlobalContext";
import { ESTEPS, LOGGED_IN, THandleStep } from "../../pages";
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
            <div className="w-full h-auto bg-[#0C0421] rounded-lg mb-4 profileBackgroundImage flex-col text-center cursor-pointer pb-2">
                <div className="py-4">
                    <Image
                        src={
                            !isConnected
                                ? icons.googleIcon
                                : loggedInVia === LOGGED_IN.GOOGLE
                                ? googleUserInfo.profileImage
                                : icons.ethLogo
                        }
                        alt="profile image"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full mx-auto border-white/50 border"
                    />
                </div>
                <p className="text-sm mx-auto text-white/50 pb-4">MY ACCOUNT</p>
                {transactionLoading ? (
                    <div className="w-20 h-10 animate-pulse bg-white/10 rounded-lg mx-auto"></div>
                ) : (
                    <p className="text-xl text-white font-bold leading-2 pb-4">
                        {balance}
                    </p>
                )}

                {showActivity ? (
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
                ) : null}
            </div>
            {showActivity ? (
                <div>
                    <p className="text-white/50">Activity</p>
                </div>
            ) : null}
        </>
    );
};
