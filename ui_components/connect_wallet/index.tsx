import * as React from "react";
import { icons } from "../../utils/images";
import SecondaryBtn from "../SecondaryBtn";
import { ESteps, THandleStep } from "../../pages";
import BackBtn from "../BackBtn";
import Image from "next/image";

interface IConnectWallet extends THandleStep {
    signIn: () => Promise<void>;
}

export default function ConnectWallet(props: IConnectWallet) {
    const { signIn, handleSteps } = props;
    return (
        <div className="w-full relative pt-[100px] md:pt-[300px] ">
            <BackBtn onClick={() => handleSteps(ESteps.ONE)} />
            <div className="w-full text-center p-2 relative">
                <div className="mb-[70px]">
                    <p className="text-sm md:text-lg font-bold leading-1 text-white/50 mb-6 md:mb-10">
                        STEP 1
                    </p>
                    <p className="text-lg md:text-xl font-bold leading-1 text-white mb-3 md:mb-10">
                        Connect your wallet
                    </p>
                    <p className="text-sm md:text-lg font-regular leading-1 md:leading-[32px] text-white/50 md:mb-10">
                        Enable access to your wallet to load <br /> your assets to the
                        chest
                    </p>
                </div>
                <Image className="m-auto mb-[70px]" src={icons.tchest} alt="Chest" />

                <div className="flex gap-3 justify-center items-center w-[80%] md:w-[60%] lg:w-[360px] h-[64px] mx-auto rounded-lg mb-6">
                    <SecondaryBtn
                        leftImage={icons.walletIcon ?? ""}
                        title={"Connect your wallet"}
                        onClick={signIn}
                    />
                </div>
                <p className="text-[16px] leading-[18px] text-center text-white/50 mb-6">
                    OR
                </p>
                <div className="flex gap-3 justify-center items-center w-[80%] md:w-[60%] lg:w-[360px] h-[64px] mx-auto rounded-lg">
                    <button
                        className={`px-4 w-[90%] h-[40px] rounded-lg bg-white flex gap-2 items-center justify-center`}
                    >
                        <Image
                            src={icons.googleIcon}
                            alt="google login"
                            className="w-5"
                        />
                        <span className="text-[16px] font-medium text-black/50 self-center my-auto">
                            {"Sign in with Google"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
