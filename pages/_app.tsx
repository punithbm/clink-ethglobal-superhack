import './globals.css';

import type { AppProps } from 'next/app';
import React, { FC } from 'react';

const Layout: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <div>
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
};

export default Layout;
