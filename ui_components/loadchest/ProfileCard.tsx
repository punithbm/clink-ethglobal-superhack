import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";

import Image from "next/image";
import Link from "next/link";
import { FC, useContext, useState } from "react";

import { GlobalContext } from "../../context/GlobalContext";
import { trimAddress } from "../../utils";
import { icons } from "../../utils/images";
import QrModal from "../QrModal";

export interface IProfileCard {
    profileImage?: string;
    balance: string;
    showActivity: boolean;
    transactionLoading: boolean;
}
export const ProfileCard: FC<IProfileCard> = (props) => {
    const { transactionLoading } = props;
    const {
        state: { address },
    } = useContext(GlobalContext);
    const [showQr, setShowQr] = useState(false);

    const copyToClipBoard = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(address);
    };

    return (
        <>
            <div className="w-full h-auto bg-[#0C0421] rounded-lg mb-4 profileBackgroundImage flex-col justify-center items-center text-center pb-2">
                <div className="pt-2">
                    <Image
                        src={
                            address
                                ? `https://effigy.im/a/${address}.png`
                                : icons.loadAvatar
                        }
                        alt="profile image"
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-full mx-auto border-white/50 border"
                    />
                </div>
                <p className="text-sm mx-auto pt-1 text-white/50">My Smart Wallet</p>
                {transactionLoading ? (
                    <div className="w-20 h-3 my-2 animate-pulse bg-white/10 rounded-lg mx-auto"></div>
                ) : (
                    <p className="text-sm text-white pb-2">{`${trimAddress(address)}`}</p>
                )}

                <div className="flex justify-around w-[100px] mx-auto pb-1">
                    <Image
                        src={icons.copyIconWhite}
                        alt="copy address"
                        className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={copyToClipBoard}
                    />
                    <Image
                        src={icons.qrWhite}
                        alt="show qr code"
                        className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                        onClick={() => {
                            setShowQr(!showQr);
                        }}
                    />
                    <Link
                        href={`https://goerli.basescan.org/address/${address}`}
                        target="_blank"
                    >
                        <Image
                            src={icons.linkWhite}
                            alt="external link"
                            className="w-5 cursor-pointer opacity-60 hover:opacity-100"
                        />
                    </Link>
                </div>
                <Link href={"https://safe.global/"} target="_blank">
                    <p className="inline text-[10px] text-white/50">Powered by: </p>
                    <Image
                        src={icons.safeLogo}
                        alt="safe logo"
                        className="w-10 inline-block"
                    />
                </Link>

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

            <QrModal open={showQr} setOpen={setShowQr} address={address} />
        </>
    );
};
