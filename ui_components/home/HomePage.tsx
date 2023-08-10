import OpenLogin from '@toruslabs/openlogin';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { useEffect, useState } from 'react';

export default function HomePage() {
  useEffect(() => {}, []);

  const getSolanaPrivateKey = (openloginKey: any) => {};

  const getAccountInfo = async (secretKey: any) => {};

  const handleLogin = async () => {};

  const handleLogout = async () => {};

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="bg-white/30 p-6">
        <p className="heading3">Links that are money</p>
        <p className="paragraph text-center !text-gray-500">
          Send crypto & NFTs to anyone, even if they don't have a wallet. <br /> No app needed!
        </p>
        <div className="bg-white p-6">
          <p className="paragraph text-center !text-gray-700">Create your TipLink</p>
          <div className="rounded-lg bg-[#19A5E1] py-3 my-2">
            <p className="text-white text-center">Connect Options</p>
          </div>
          <p className="paragraph text-center !text-gray-500">Suported assests: Base</p>
          <div className="rounded-lg border border-gray-500 p-4">
            <div className="flex items-center justify-center">
              <input name={'usd value'} className={`pl-0 pt-2 pb-1 border-none text-center dark:bg-transparent text-text-900 dark:text-textDark-900 placeholder-text-300 dark:placeholder-textDark-300 text-base rounded-lg block w-full focus:outline-none focus:ring-transparent`} placeholder={'$0 USD'} autoFocus={true} onWheel={() => (document.activeElement as HTMLElement).blur()} />
            </div>

            <p className="paragraph text-center !text-gray-500">~ 0.000ETH</p>
          </div>

          <div className="rounded-lg bg-[#19A5E1] py-3 my-2">
            <p className="text-white text-center">Create LootLink</p>
          </div>
        </div>
      </div>
    </div>
  );
}
