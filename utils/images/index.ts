import logo from "../../public/assets/images/logo.svg";
import tchest from "../../public/assets/images/tchest.svg";
import walletIcon from "../../public/assets/images/wallet_btn_image.svg";
import shareBtnIcon from "../../public/assets/images/share_btn_icon.svg";
import downloadBtnIcon from "../../public/assets/images/download_btn_icon.svg";
import backIcon from "../../public/assets/images/back_icon.png";
import transferIcon from "../../public/assets/images/transfer_icon.svg";
import ethLogo from "../../public/assets/images/eth_logo.svg";
import tokensLoading from "../../public/assets/images/tokens_loading.png";
import hamburgerBlack from "../../public/assets/images/hamburger_black.svg";
import googleIcon from "../../public/assets/images/google_icon.svg";
import chevronRight from "../../public/assets/images/chevron_right.svg";
import copyBlack from "../../public/assets/images/copy_black.svg";
import logoutIcon from "../../public/assets/images/logout_icon.svg";
import helpIcon from "../../public/assets/images/help_icon.svg";

export type TImages =
    | "logo"
    | "tchest"
    | "walletIcon"
    | "backIcon"
    | "shareBtnIcon"
    | "transferIcon"
    | "tokensLoading"
    | "hamburgerBlack"
    | "googleIcon"
    | "chevronRight"
    | "copyBlack"
    | "logoutIcon"
    | "helpIcon"
    | "downloadBtnIcon"
    | "ethLogo";

export type TNextImage = {
    src: string;
    height: number;
    width: number;
};

export const icons: Record<TImages, TNextImage> = {
    logo,
    tchest,
    walletIcon,
    backIcon,
    shareBtnIcon,
    transferIcon,
    downloadBtnIcon,
    tokensLoading,
    hamburgerBlack,
    googleIcon,
    chevronRight,
    copyBlack,
    logoutIcon,
    helpIcon,
    ethLogo,
};
