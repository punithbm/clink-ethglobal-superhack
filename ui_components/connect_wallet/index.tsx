import Image from "next/image";
import * as React from "react";

import { THandleStep } from "../../pages";
import { icons } from "../../utils/images";
import SecondaryBtn from "../SecondaryBtn";

interface IConnectWallet extends THandleStep {
    signIn: () => Promise<void>;
    connectWallet: () => Promise<void>;
    connecting: boolean;
}

export default function ConnectWallet(props: IConnectWallet) {
    const { signIn, connectWallet, connecting } = props;
    return (
        <>
            <div className="w-full relative lg:pt-10">
                <div className="w-full text-center p-2 relative">
                    <div className="mb-[30px] lg:mb-5">
                        <p className="text-sm md:text-lg font-bold leading-1 text-white/50 mb-6 md:mb-10">
                            STEP 1
                        </p>
                        <p className="text-lg md:text-xl font-bold leading-1 text-white mb-3 md:mb-5 lg:mb-10">
                            Connect your wallet
                        </p>
                        <p className="text-sm md:text-lg font-regular leading-1 md:leading-[32px] text-white/50 md:mb-10">
                            Enable access to your wallet to load <br /> your assets to the
                            chest
                        </p>
                    </div>
                    <Image
                        className="m-auto mb-[30px] lg:mb-5"
                        src={icons.tchest}
                        alt="Chest"
                    />

                    <div className="flex gap-3 justify-center items-center w-[80%] md:w-[60%] lg:w-[360px] h-[64px] mx-auto rounded-lg mb-6 lg:mb-4">
                        <SecondaryBtn
                            leftImage={icons.walletIcon ?? ""}
                            title={connecting ? "Connecting..." : "Connect your wallet"}
                            onClick={connectWallet}
                        />
                    </div>
                    {/* <div className="flex gap-3 justify-center items-center w-[80%] md:w-[60%] lg:w-[360px] mx-auto rounded-lg my-5">
                    <ConnectButton />
                </div> */}
                    <p className="text-[16px] leading-[18px] text-center text-white/50 mb-6 lg:mb-4">
                        OR
                    </p>
                    <div className="flex gap-3 justify-center items-center w-[80%] md:w-[60%] lg:w-[360px] mx-auto rounded-lg">
                        <button
                            className={`py-4 w-full rounded-lg bg-white flex gap-2 items-center justify-center max-w-[400px]`}
                            onClick={signIn}
                        >
                            <Image
                                src={icons.googleIcon}
                                alt="google login"
                                className="w-6"
                            />
                            <span className="text-[16px] leading-1 font-medium text-black/50 self-center my-auto">
                                {"Sign in with Google"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
