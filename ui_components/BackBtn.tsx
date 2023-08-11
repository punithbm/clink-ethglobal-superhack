import React from "react";
import { icons } from "../utils/images";
import Image from "next/image";

export default function BackBtn(props: any) {
    const { onClick } = props;
    return (
        <Image
            src={icons.backIcon}
            alt="back-icon"
            className="relative cursor-pointer"
            onClick={onClick}
        />
    );
}
