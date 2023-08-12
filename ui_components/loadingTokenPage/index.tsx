import Lottie from "lottie-react";
import * as React from "react";

import * as loaderAnimation from "../../public/lottie/loader.json";

export default function LoadingTokenPage() {
    return (
        <div className="w-full max-w-[600px] h-full relative flex flex-col text-center items-center gap-5 mx-auto mt-32">
            <p className="text-white heading2 text-[32px] ">Loading Chest...</p>
            <Lottie animationData={loaderAnimation} />
        </div>
    );
}
