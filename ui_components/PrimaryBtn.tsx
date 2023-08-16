import Image from "next/image";
import React, { FC } from "react";

import { TImages, TNextImage } from "../utils/images";
import { icons } from "../utils/images";

interface IPrimaryBtn {
    title: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    leftImage?: Record<TImages, TNextImage>;
    rightImage?: TNextImage | TImages | string;
    showShareIcon?: boolean;
    className?: string;
    btnDisable?: boolean;
    loading?: boolean;
}

export default function PrimaryBtn(props: IPrimaryBtn) {
    const { title, onClick, rightImage, showShareIcon, className, btnDisable, loading } =
        props;
    return (
        <button
            className={`${className} py-4 btnBg support_text_bold rounded-lg flex gap-1 items-center w-full justify-center my-0 mx-auto max-w-[400px] `}
            onClick={onClick}
            disabled={btnDisable}
        >
            {!loading && title}
            {rightImage && !loading ? (
                <Image src={rightImage ?? ""} alt="right-image" />
            ) : null}
            {loading && (
                <div className="bouncing-loader-black">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            )}
        </button>
    );
}
