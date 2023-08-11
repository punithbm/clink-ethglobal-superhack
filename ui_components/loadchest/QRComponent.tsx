import { FC, useEffect, useRef, useState } from "react";
import { icons } from "../../utils/images";
import Image from "next/image";
import { copyToClipBoard, trimAddress } from "../../utils";
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
export declare type QRCodeStylingOptions = {
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
const useQRCodeStyling = (options: QRCodeStylingOptions): QRCodeStyling | null => {
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
}
export const QRComponent: FC<IQRComponent> = (props) => {
    const { walletAddress } = props;
    const [options] = useState<Options>({
        width: 240,
        height: 240,
        type: "svg",
        image: icons.logo.src,
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
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.5,
            margin: 15,
            crossOrigin: "anonymous",
        },
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
                You can deposit crypto into your account via this public key:
            </p>
            <div className="flex items-center justify-center" ref={ref} />
            <div>
                <div className="flex items-center justify-center">
                    <div className="w-fit mt-[15px] border-dashed border border-secondary-300 dark:border-secondaryDark-300 rounded-[10px] flex justify-center items-start md:items-center p-2">
                        <div className=" text-white text-[14px] break-all">
                            {trimAddress(walletAddress)}
                        </div>
                        <button className="ml-1 w-6 h-6" onClick={() => handleCopy()}>
                            <Image
                                src={icons.copyBlack}
                                alt="copyIcon"
                                className="w-full h-full"
                            />
                        </button>
                    </div>
                </div>
                {showcopyText && (
                    <p className="text-black text-[14px] text-center mt-2">Copied!</p>
                )}
            </div>
        </div>
    );
};
