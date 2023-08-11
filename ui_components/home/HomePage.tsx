import * as React from "react";
import PrimaryBtn from "../PrimaryBtn";
import { icons } from "../../utils/images";
import Image from "next/image";
import { getNetwork } from "@wagmi/core";

interface IHome {
    handleSetupChest: () => void;
}

export default function HomePage(props: IHome) {
    const { handleSetupChest } = props;
    const { chain, chains } = getNetwork();
    return (
        <div className="w-full text-center items-center p-2 flex-col">
            <h1 className="hero_text mt-12 text-[32px] leading-3 font-bold">
                Share crypto rewards <br /> in just a link
            </h1>
            <p className="md:heading3_regular mt-5 opacity-50 mb-14 text-[16px] leading-14 text-white">
                Load a chest with tokens or nfts that can be <br /> claimed by anyone you
                share the link with
            </p>
            <Image className="m-auto mb-20" src={icons.tchest} alt="Chest" />
            <PrimaryBtn
                title="Setup a Treasure Chest"
                onClick={() => handleSetupChest()}
            />
        </div>
    );
}
