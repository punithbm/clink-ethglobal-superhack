import OpenLogin from '@toruslabs/openlogin';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import ConnectBtn from './ConnectBtn';
import * as React from 'react';
import Link from 'next/link';

export default function HomePageNew() {
  useEffect(() => {}, []);

  const getSolanaPrivateKey = (openloginKey: any) => {};

  const getAccountInfo = async (secretKey: any) => {};

  const handleLogin = async () => {};

  const handleLogout = async () => {};

  return (
    <div className="bg-white h-[100vh] w-full flex-col text-center relative">
      <div className="relative top-[20%]">
        <p className="heading1 text-[40px] text-[#010101] font-bold leading-3 mb-10">
          Send crypto to anyone,
          <br /> even if they don't have a wallet.
        </p>
        <Link href="/create-link">
          <div className="py-4 px-10 bg-[#FF7236] rounded-2xl w-[261px] mx-auto text-white">Create a microlink</div>
        </Link>
      </div>
    </div>
  );
}
