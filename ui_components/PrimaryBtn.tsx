import React, { FC } from "react";
import { TImages, TNextImage } from "../utils/images";
import { icons } from "../utils/images";
import Image from "next/image";

interface IPrimaryBtn {
    title: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    leftImage?: Record<TImages, TNextImage>;
    rightImage?: TNextImage | TImages;
}

export default function PrimaryBtn(props: IPrimaryBtn) {
    const { title, onClick, rightImage } = props;
    return (
        <button
            className="py-4 btnBg support_text_bold rounded-lg flex gap-1 items-center w-[90%] md:w-[60%] lg:w-[320px] justify-center my-0 mx-auto max-w-[320px] relative z-10"
            onClick={onClick}
        >
            {title}
            {rightImage ? <Image src={rightImage ?? ""} alt="right-image" /> : null}
        </button>
    );
}
