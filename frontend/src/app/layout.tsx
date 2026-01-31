// overall UI template
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

import { headers } from 'next/headers';
import Web3ContextProvider from '@/context/web3';

import { ToastContainer } from 'react-toastify';  //added
import 'react-toastify/dist/ReactToastify.css';   //added

export const metadata: Metadata = {
  title: "MediTrust - DAO Medical Donations",
  description: "Transparent, blockchain-powered medical donation platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en" className="dark">
      <body className={inter.className} >
        <Web3ContextProvider cookies={cookies}>

          <Header/>

        {/* Background Video - Shows on ALL pages */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/HeartBeatLine.mp4" type="video/mp4" />
        </video>
          
        {children}

          <Footer/>
          
        </Web3ContextProvider>
        <ToastContainer />
      </body>
    </html>
  ); // ToastContainer added
}
