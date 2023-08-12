import Image from "next/image";
import React, { FC } from "react";

import { TImages, TNextImage } from "../utils/images";
import { icons } from "../utils/images";

interface ISecondaryBtn {
    title: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    leftImage?: TNextImage | TImages;
    rightImage?: TNextImage | TImages | string;
    className?: string;
    showShareIcon?: boolean;
}

export default function SecondaryBtn(props: ISecondaryBtn) {
    const { title, onClick, rightImage, leftImage, showShareIcon, className } = props;
    return (
        <button
            className={`py-4 support_text_bold text-white rounded-lg flex gap-1 items-center w-full justify-center border border-white bg-white/10 max-w-[400px] mx-auto ${className}`}
            onClick={onClick}
        >
            {leftImage && <Image src={leftImage} alt="right-image" />}
            {title}
            {rightImage && <Image src={rightImage} alt="right-image" />}
        </button>
    );
}
