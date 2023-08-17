import Image from "next/image";
import QRCodeStyling, {
    CornerDotType,
    CornerSquareType,
    DotType,
    DrawType,
    ErrorCorrectionLevel,
    Gradient,
    Mode,
    Options,
    ShapeType,
    TypeNumber,
} from "qr-code-styling";
import { FC, useEffect, useRef, useState } from "react";

import { copyToClipBoard, trimAddress } from "../../utils";
import { icons } from "../../utils/images";
export declare type TQRCodeStylingOptions = {
    type?: DrawType;
    shape?: ShapeType;
    width?: number;
    height?: number;
    margin?: number;
    data?: string;
    image?: string;
    qrOptions?: {
        typeNumber?: TypeNumber;
        mode?: Mode;
        errorCorrectionLevel?: ErrorCorrectionLevel;
    };
    imageOptions?: {
        hideBackgroundDots?: boolean;
        imageSize?: number;
        crossOrigin?: string;
        margin?: number;
    };
    dotsOptions?: {
        type?: DotType;
        color?: string;
        gradient?: Gradient;
    };
    cornersSquareOptions?: {
        type?: CornerSquareType;
        color?: string;
        gradient?: Gradient;
    };
    cornersDotOptions?: {
        type?: CornerDotType;
        color?: string;
        gradient?: Gradient;
    };
    backgroundOptions?: {
        round?: number;
        color?: string;
        gradient?: Gradient;
    };
};
const useQRCodeStyling = (options: TQRCodeStylingOptions): QRCodeStyling | null => {
    //Only do this on the client
    if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const QRCodeStylingLib = require("qr-code-styling");
        const qrCodeStyling: QRCodeStyling = new QRCodeStylingLib(options);
        return qrCodeStyling;
    }
    return null;
};
export interface IQRComponent {
    walletAddress: string;
    isShareQr?: boolean;
    widthPx: number;
    heightPx: number;
    showCopy?: boolean;
}
export const QRComponent: FC<IQRComponent> = (props) => {
    const { walletAddress, isShareQr, widthPx, heightPx, showCopy } = props;
    const [options] = useState<Options>({
        width: widthPx,
        height: heightPx,
        type: "svg",
        // image: icons.logo.src,
        margin: 5,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q",
        },
        dotsOptions: {
            type: "extra-rounded",
            color: "#FFFFFF",
        },
        // imageOptions: {
        //     hideBackgroundDots: true,
        //     imageSize: 0.5,
        //     margin: 5,
        //     crossOrigin: "anonymous",
        // },
        backgroundOptions: {
            color: "#2B2D30",
        },
    });
    const [showcopyText, setShowCopyText] = useState(false);
    const qrCode = useQRCodeStyling(options);
    const ref = useRef<any>(null);

    useEffect(() => {
        qrCode?.append(ref.current);
    }, [qrCode]);

    useEffect(() => {
        qrCode?.update({
            data: walletAddress,
            dotsOptions: options?.dotsOptions,
            backgroundOptions: options?.backgroundOptions,
        });
    }, [walletAddress]);
    const handleCopy = () => {
        copyToClipBoard(walletAddress);
        setShowCopyText(true);
        setTimeout(() => {
            setShowCopyText(false);
        }, 2000);
    };
    return (
        <div>
            <p className="text-white text-[20px] text-center m-2">
                {!isShareQr
                    ? "You can deposit crypto into your account via address"
                    : null}
            </p>
            <div className="flex items-center justify-center" ref={ref} />

            {!isShareQr ? (
                <div>
                    <div className="flex items-center justify-center">
                        <div className="w-fit mt-[15px] border-dashed border border-secondary-300 dark:border-secondaryDark-300 rounded-[10px] flex justify-center items-start md:items-center p-2">
                            <div className=" text-white text-[14px] break-all">
                                {trimAddress(walletAddress)}
                            </div>
                            <button className="ml-1 w-6 h-6" onClick={() => handleCopy()}>
                                <Image
                                    src={icons.copyIconWhite}
                                    alt="copyIcon"
                                    className="w-4 h-full"
                                />
                            </button>
                        </div>
                    </div>
                    {showcopyText && (
                        <p className="text-white text-[14px] text-center mt-2">Copied!</p>
                    )}
                </div>
            ) : null}
        </div>
    );
};
