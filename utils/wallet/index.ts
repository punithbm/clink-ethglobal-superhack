import { TW, WalletCore } from "@trustwallet/wallet-core";
import * as bs58 from "bs58";

import { hexToBuffer } from "..";
import { ISigningInput, TTranx } from "./types";
export class Wallet {
    CoinType: WalletCore["CoinType"];
    HexCoding: WalletCore["HexCoding"];
    AnySigner: WalletCore["AnySigner"];
    HDWallet: WalletCore["HDWallet"];
    PublicKey: WalletCore["PublicKey"];
    AnyAddress: WalletCore["AnyAddress"];
    PrivateKey: WalletCore["PrivateKey"];
    Mnemonic: WalletCore["Mnemonic"];
    Curve: WalletCore["Curve"];
    TW: typeof TW;
    SolanaAddress: WalletCore["SolanaAddress"];
    StoredKey: WalletCore["StoredKey"];

    constructor(_walletCore: WalletCore, _tw = TW) {
        const {
            HDWallet,
            CoinType,
            AnySigner,
            HexCoding,
            PublicKey,
            PrivateKey,
            Mnemonic,
            Curve,
            AnyAddress,
            SolanaAddress,
            StoredKey,
        } = _walletCore;
        this.CoinType = CoinType;
        this.AnySigner = AnySigner;
        this.HexCoding = HexCoding;
        this.HDWallet = HDWallet;
        this.PublicKey = PublicKey;
        this.PrivateKey = PrivateKey;
        this.Mnemonic = Mnemonic;
        this.Curve = Curve;
        this.TW = _tw;
        this.AnyAddress = AnyAddress;
        this.SolanaAddress = SolanaAddress;
        this.StoredKey = StoredKey;
    }

    importWithPrvKey = async (
        privatekey: string,
        chainId = "ethereum",
        curve = "secp256k1",
    ) => {
        const _privateKey = this.trimZeroHex(privatekey);
        const _curve = this.getCurve(curve);
        const coinType = this.getCoinType(chainId);
        let prvKey = this.PrivateKey.create();
        try {
            prvKey = this.PrivateKey.createWithData(this.HexCoding.decode(_privateKey));
        } catch (e) {
            console.log(e);
        }
        let pubKey = prvKey?.getPublicKeyCurve25519();
        switch (_curve) {
            case this.Curve.secp256k1:
                pubKey = prvKey.getPublicKeySecp256k1(false);
                break;
            case this.Curve.ed25519:
                pubKey = prvKey.getPublicKeyEd25519();
                break;
            case this.Curve.ed25519Blake2bNano:
                pubKey = prvKey.getPublicKeyEd25519Blake2b();
                break;
            case this.Curve.curve25519:
                pubKey = prvKey.getPublicKeyCurve25519();
                break;
            case this.Curve.nist256p1:
                pubKey = prvKey.getPublicKeyNist256p1();
                break;
            case this.Curve.ed25519ExtendedCardano:
                pubKey = prvKey.getPublicKeyEd25519Cardano();
                break;
            default:
                break;
        }
        const generatedAddress = this.AnyAddress.createWithPublicKey(
            pubKey,
            coinType,
        ).description();
        return generatedAddress;
    };

    createPayLink = () => {
        const account = this.HDWallet.create(128, "");
        const entropy = account.entropy();
        const address = account.getAddressForCoin(this.CoinType.ethereum);
        const key = account.getKey(this.CoinType.ethereum, "m/44'/60'/0'/0/0");
        const keyHex = this.bufferToHex(key.data());
        const hash = bs58.encode(entropy);
        return { link: "/i#" + hash, address: address, key: keyHex };
    };

    getAccountFromPayLink = (hash: string) => {
        const urlHash = this.formatUrlHash(hash);
        try {
            const bs58Decoded = bs58.decode(urlHash);
            const account = this.HDWallet.createWithEntropy(bs58Decoded, "");
            return account.getAddressForCoin(this.CoinType.ethereum);
        } catch (e) {
            console.log(e, "error");
            return "";
        }
    };

    getPrivKeyFromPayLink = (hash: string) => {
        const urlHash = this.formatUrlHash(hash);
        try {
            const bs58Decoded = bs58.decode(urlHash);
            const account = this.HDWallet.createWithEntropy(bs58Decoded, "");
            const privKey = account.getKey(this.CoinType.ethereum, "m/44'/60'/0'/0/0");
            const secret = this.bufferToHex(privKey.data());
            return secret;
        } catch {
            return "";
        }
    };

    // Not required to use this
    getKeyFromPayLink = (url: string) => {
        const urlHash = this.formatUrlHash(url);
        try {
            const bs58Decoded = bs58.decode(urlHash);
            const account = this.HDWallet.createWithEntropy(bs58Decoded, "");
            return this.bufferToHex(account.getKeyForCoin(this.CoinType.ethereum).data());
        } catch {
            return "";
        }
    };

    formatUrlHash = (url: string) => {
        let urlHash = url ?? "";
        if (!urlHash && urlHash == "") {
            return "";
        }
        if (urlHash.includes("/i#")) {
            urlHash = url.split("/i#").pop() ?? "";
        }
        return urlHash.replace("/i", "").replace("#", "");
    };

    trimZeroHex = (zeroHex: string) => {
        if (zeroHex.startsWith("0x")) {
            return zeroHex.slice(2, zeroHex.length);
        }
        return zeroHex;
    };

    getCurve = (curve: string) => {
        switch (curve) {
            case "secp256k1":
                return this.Curve.secp256k1;
            case "ed25519Blake2bNano":
                return this.Curve.ed25519Blake2bNano;
            case "curve25519":
                return this.Curve.curve25519;
            case "nist256p1":
                return this.Curve.nist256p1;
            case "ed25519ExtendedCardano":
                return this.Curve.ed25519ExtendedCardano;
            case "ed25519":
                return this.Curve.ed25519;
            default:
                return this.Curve.secp256k1;
        }
    };

    getCoinType = (chainId: string) => {
        const coinType = this.CoinType;
        switch (chainId) {
            case "ethereum":
                return coinType.ethereum;
            case "bsc":
                return coinType.smartChain;
            case "polygon":
                return coinType.polygon;
            case "solana":
                return coinType.solana;
            case "zkevm":
                return coinType.polygonzkEVM;
            case "zksync":
                return coinType.zksync;
            default:
                return coinType.ethereum;
        }
    };

    bufferToHex = (unitArray: Uint8Array) => {
        return Buffer.from(unitArray).toString("hex");
    };

    createWithMnemonic(mnemonic: string, passphrase: string) {
        return this.HDWallet.createWithMnemonic(mnemonic, passphrase);
    }

    signEthTx = async (tx: TTranx, prvKey: string) => {
        const _prvKey = prvKey;
        const _tx = this.txFormat(tx);
        this.txLogger(tx);
        const signingInput = this.getEthSigningInput(_tx, _prvKey);
        const input = TW.Ethereum.Proto.SigningInput.create(signingInput);
        const encoded = TW.Ethereum.Proto.SigningInput.encode(input).finish();
        const outputData = this.AnySigner.sign(encoded, this.CoinType.ethereum);
        const output = TW.Ethereum.Proto.SigningOutput.decode(outputData);
        return this.HexCoding.encode(output.encoded);
    };

    getEthSigningInput = (tx: TTranx, prvKey: string): ISigningInput => {
        const txDataInput = TW.Ethereum.Proto.Transaction.create();
        let txSignInputData: ISigningInput = {
            toAddress: tx.toAddress,
            chainId: hexToBuffer(tx.chainIdHex ?? ""),
            nonce: hexToBuffer(tx.nonceHex ?? ""),
            gasPrice: hexToBuffer(tx.gasPriceHex ?? ""),
            gasLimit: hexToBuffer(tx.gasLimitHex ?? ""),
            privateKey: this.PrivateKey.createWithData(
                this.HexCoding.decode(prvKey),
            ).data(),
        };
        if (!tx.isNative) {
            txDataInput.erc20Transfer =
                TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
                    to: tx.toAddress,
                    amount: hexToBuffer(tx.amountHex ?? ""),
                });
            txSignInputData = {
                ...txSignInputData,
                toAddress: tx.contractAddress,
            };
        } else {
            txDataInput.transfer = TW.Ethereum.Proto.Transaction.Transfer.create({
                amount: hexToBuffer(tx.amountHex ?? ""),
            });
        }
        txSignInputData = {
            ...txSignInputData,
            transaction: txDataInput,
        };
        return txSignInputData;
    };

    txFormat = (tx: TTranx) => {
        return tx;
    };

    txLogger = (tx: TTranx) => {
        console.log("gasprice", tx.gasPrice);
        console.log("gasLimit", tx.gasLimit);
        console.log("amount", tx.amount);
        console.log("amountValue", tx.amountValue);
        console.log("contractDecimals", tx.contractDecimals);
        console.log("contractAddress", tx.contractAddress);
        console.log("nonce", tx.nonce);
        console.log("gaspriceHex", tx.gasPriceHex);
        console.log("gaspriceValue", tx.gasPriceValue);
        console.log("gasLimitHex", tx.gasLimitHex);
        console.log("amountHex", tx.amountHex);
        console.log("nonceHex", tx.nonceHex);
        console.log("chainId", tx.chainId);
        console.log("chainIdHex", tx.chainIdHex);
        console.log("toAddress", tx.toAddress);
        console.log("fromAddress", tx.fromAddress);
        console.log("symbol", tx.symbol);
        console.log("blockchain", tx.blockchain);
        console.log("isNative", tx.isNative);
        console.log("transactionType", tx.transactionType);
        console.log("data", tx.data);
        console.log("value", tx.value);
        console.log("valueHex", tx.valueHex);
        console.log("nonce Buffer", Buffer.from(tx.nonceHex ?? "", "hex"));
        console.log("chain id Buffer", Buffer.from("5208" ?? "", "hex"));
        console.log("amount Buffer", Buffer.from(tx.amountHex ?? "", "hex"));
        console.log("gasprice Buffer", Buffer.from(tx.gasPriceHex ?? "", "hex"));
        console.log("gasLimit Buffer", Buffer.from(tx.gasLimitHex ?? "", "hex"));
    };
}
