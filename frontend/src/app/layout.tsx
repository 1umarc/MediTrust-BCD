// overall UI template
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { headers } from 'next/headers';
import Web3ContextProvider from '@/context/web3';

import { ToastContainer } from 'react-toastify';  //added
import 'react-toastify/dist/ReactToastify.css';   //added

export const metadata: Metadata = {
  title: 'MediTrust',
  description: 'Donate',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3ContextProvider cookies={cookies}>{children}</Web3ContextProvider>
        <ToastContainer />
      </body>
    </html>
  ); // ToastContainer added
}
