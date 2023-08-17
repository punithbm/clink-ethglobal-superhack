import { toBuffer } from "@ethereumjs/util";
import bs58 from "bs58";
import crypto from "crypto";

import { ACTIONS, GlobalContext } from "../context/GlobalContext";
import { getStore } from "../store/GlobalStore";

export const ZERO_USD = "$0";
export const MIN_VAL = 0.000001;

export const toastFlashMessage = (
    message: string | React.ReactElement,
    type: string,
    delay = 3000,
) => {
    const { dispatch } = getStore();
    dispatch({
        type: ACTIONS.CLEAR_TOAST,
        payload: {
            message: "",
            toastType: "",
        },
    });
    setTimeout(function () {
        dispatch({
            type: ACTIONS.SHOW_TOAST,
            payload: {
                message: message,
                toastType: type,
            },
        });
        setTimeout(function () {
            dispatch({
                type: ACTIONS.HIDE_TOAST,
                payload: {},
            });
        }, delay);
    }, 200);
};

export const numHex = (num: number) => {
    return hexFormatter(num.toString(16));
};

export const hexFormatter = (hex: string) => {
    let a = hex;
    if (a.length % 2 > 0) {
        a = "0" + a;
    }
    return a;
};

export const hexToBuffer = (hex: string) => {
    if (hex.startsWith("0x")) {
        hex = hex.slice(2);
    }
    hex = hexFormatter(hex);
    return Buffer.from(hex, "hex");
};

export const bufferToHex = function (buf: Buffer): string {
    buf = toBuffer(buf);
    return "0x" + buf.toString("hex");
};

export const hexToNumber = (val: string, divider = 1) => {
    return parseInt(val, 16) / divider;
};

export const trimAddress = (val: string) => {
    const firstFour = val.substring(0, 4);
    const lastFour = val.substring(val.length - 4, val.length);
    return firstFour + "..." + lastFour;
};
export const trimLink = (val: string) => {
    const firstTwenty = val.substring(0, 20);
    const lastEight = val.substring(val.length - 8, val.length);
    return firstTwenty + "..." + lastEight;
};

export const getCurrencyFormattedNumber = (
    val: number | string,
    decimals = 2,
    currency = "USD",
    ignoreSmallVal = false,
) => {
    if (typeof val === "string") {
        val = Number(val);
    }
    // let currencyPrefix = "";
    let currencySuffix = "";
    if (val === 0 || !val) {
        return ZERO_USD;
    } else if (val < 0 || val < 1) {
        if (val < 0.01 && !ignoreSmallVal) {
            return "<$0.01";
        } else if (ignoreSmallVal && val < 0.01) {
            return ZERO_USD;
        }
    } else if (val > 999999999) {
        val = val / 1000000000;
        currencySuffix = "B";
    } else if (val > 999999) {
        val = val / 1000000; // convert to M for number from > 1 million
        currencySuffix = "M";
    }
    // Added to round down the number
    const expo = Math.pow(10, decimals);
    val = Math.ceil(val * expo) / expo;
    const _val = val.toLocaleString("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: decimals,
        currencyDisplay: "symbol",
    });
    if (!_val.includes("$")) {
        return "$" + Number(_val) + currencySuffix;
    }
    if (decimals === 2 && _val.includes(".") && _val.endsWith(".00")) {
        return _val.slice(0, -3) + currencySuffix;
    }
    return _val + currencySuffix;
};

export const getTokenFormattedNumber = (
    value: string,
    decimals: number,
    roundOff = true,
    fractions = 0,
) => {
    const _decimals = decimals || 18;
    const _value = parseFloat(value) || 0;
    const _expoValue = Math.pow(10, _decimals);
    let _calculated = _value / _expoValue;
    if (!roundOff) {
        return Number(_calculated);
    }
    let _decimalFixed = fractions;
    if (fractions == 0) {
        _decimalFixed = 2;
        if (_calculated < 100) {
            _decimalFixed = 6;
        }
    }
    const expo = Math.pow(10, _decimalFixed);
    _calculated = Math.floor(_calculated * expo) / expo;
    return Number(_calculated.toFixed(_decimalFixed));
};

export const getTokenValueFormatted = (
    val: number,
    fixedDigits = 6,
    showMinVal = true,
) => {
    const minVal = MIN_VAL;
    if (val == 0) {
        return "0";
    }
    if (val < minVal && showMinVal) {
        return "<" + minVal;
    } else {
        const expo = Math.pow(10, fixedDigits);
        val = Math.floor(val * expo) / expo;
        return val.toFixed(fixedDigits).replace(/(\.0*|(?<=(\..*))0*)$/, "");
    }
};

export const getNumFormatted = (val: number, dec = 6) => {
    const minVal = MIN_VAL;
    if (val < minVal || val == 0) {
        return "<" + minVal;
    } else {
        const expo = Math.pow(10, dec);
        val = Math.floor(val * expo) / expo;
        return val.toFixed(dec).replace(/(\.0*|(?<=(\..*))0*)$/, "");
    }
};

export const getExponentialFixedNumber = (num: number) => {
    return num.toString().includes("e")
        ? num.toFixed(20).replace(/(\.0*|(?<=(\..*))0*)$/, "")
        : num.toFixed(6).replace(/(\.0*|(?<=(\..*))0*)$/, "");
};

export const copyToClipBoard = (val: string) => {
    navigator.clipboard.writeText(`${val}`);
};

export const encryptAndEncodeHexStrings = (hexString1: string, hexString2: string) => {
    let concatenatedString = hexString1 + "0x" + hexString2;
    concatenatedString = Buffer.from(concatenatedString).toString("base64");
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        "aes-128-cbc",
        Buffer.from("8f2e9a6b3d5c1f7e"),
        iv,
    );
    const encryptedData = Buffer.concat([
        cipher.update(concatenatedString),
        cipher.final(),
    ]);

    const encodedData = bs58.encode(Buffer.from(concatenatedString));
    return encodedData;
};

export const encodeAddress = (address: string) => {
    const buffData = hexToBuffer(address);
    const hash = bs58.encode(buffData);
    return hash;
};

export const decodeAddressHash = (hash: string) => {
    const buffData = bs58.decode(hash);
    const address = bufferToHex(Buffer.from(buffData));
    return address;
};
