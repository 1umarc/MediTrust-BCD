// React Main
"use client"

import React from 'react'
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { BuyToken } from './components/BuyToken' // no more importing toast as done here

export default function Home() {

  return <>
    <div className='flex flex-col min-h-screen'>
      <Header />
      <BuyToken />
      <Footer />
    </div>
  </>
} // BuyToken added