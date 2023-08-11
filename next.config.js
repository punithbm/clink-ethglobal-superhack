/** @type {import('next').NextConfig} */

const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    images: {
        unoptimized: true,
    },
    publicRuntimeConfig: {
        basePath: "",
    },
    compiler: {
        removeConsole: false,
    },
    webpack: (config, { isServer }) => {
        config.plugins.push(
            new CopyPlugin({
                patterns: [
                    {
                        from: path.join(
                            __dirname,
                            "node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm",
                        ),
                        to: path.join(__dirname, ".next/static/chunks/pages"),
                    },
                ],
            }),
        );
        config.experiments.asyncWebAssembly = true;
        if (!isServer) {
            config.output.publicPath = `/_next/`;
        } else {
            config.output.publicPath = `./`;
        }
        config.resolve.fallback = { fs: false };
        config.output.assetModuleFilename = `node_modules/@trustwallet/dist/lib/wallet-core.wasm`;
        config.module.rules.push({
            test: /\.(wasm)$/,
            type: "asset/resource",
        });
        return config;
    },
};

module.exports = nextConfig;
