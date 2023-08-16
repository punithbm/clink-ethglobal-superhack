import backIcon from "../../public/assets/images/back_icon.png";
import baseLogo from "../../public/assets/images/base_logo.svg";
import profileCardBg from "../../public/assets/images/bg_card_topology.svg";
import chevronRight from "../../public/assets/images/chevron_right.svg";
import copyBlack from "../../public/assets/images/copy_black.svg";
import copyIconWhite from "../../public/assets/images/copy_icon_white.svg";
import downloadBtnIcon from "../../public/assets/images/download_btn_icon.svg";
import downloadBtnIconBlack from "../../public/assets/images/download_btn_icon_black.svg";
import ethLogo from "../../public/assets/images/eth_logo.svg";
import googleIcon from "../../public/assets/images/google_icon.svg";
import hamburgerBlack from "../../public/assets/images/hamburger_black.svg";
import helpIcon from "../../public/assets/images/help_icon.svg";
import linkWhite from "../../public/assets/images/link_white.svg";
import linkedinBlue from "../../public/assets/images/linkedin_blue.svg";
import loadAvatar from "../../public/assets/images/load_avatar.png";
import logo from "../../public/assets/images/logo.svg";
import logo2 from "../../public/assets/images/logo_clink.png";
import logoutIcon from "../../public/assets/images/logout_icon.svg";
import qrWhite from "../../public/assets/images/qr_white.svg";
import safeLogo from "../../public/assets/images/safe_logo.svg";
import shareBtnIcon from "../../public/assets/images/share_btn_icon.svg";
import shareBtnIconWhite from "../../public/assets/images/share_btn_icon_white.svg";
import tchest from "../../public/assets/images/tchest.svg";
import tchestopen from "../../public/assets/images/tchestopen.svg";
import telegramBlue from "../../public/assets/images/telegram_blue.svg";
import tokensLoading from "../../public/assets/images/tokens_loading.png";
import transferIcon from "../../public/assets/images/transfer_icon.svg";
import walletIcon from "../../public/assets/images/wallet_btn_image.svg";
import x from "../../public/assets/images/x.svg";

export type TImages =
    | "logo"
    | "logo2"
    | "tchest"
    | "tchestopen"
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
    | "downloadBtnIconBlack"
    | "shareBtnIconWhite"
    | "profileCardBg"
    | "x"
    | "telegramBlue"
    | "linkedinBlue"
    | "safeLogo"
    | "baseLogo"
    | "copyIconWhite"
    | "linkWhite"
    | "qrWhite"
    | "ethLogo"
    | "loadAvatar";

export type TNextImage = {
    src: string;
    height: number;
    width: number;
};

export const icons: Record<TImages, TNextImage> = {
    logo,
    logo2,
    tchest,
    tchestopen,
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
    downloadBtnIconBlack,
    shareBtnIconWhite,
    profileCardBg,
    x,
    linkedinBlue,
    telegramBlue,
    safeLogo,
    baseLogo,
    copyIconWhite,
    linkWhite,
    qrWhite,
    loadAvatar,
};
