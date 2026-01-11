import React from 'react'
import { Connect } from './Connect' // has the Connect button

export function Header() {
    return (
        <header className='navbar flex justify-between p-4 pt-0'>
            <h1 className='text-xl font-bold'>🇨🇭 Medi✙rust</h1>
            <div className='flex gap-2'>
                <Connect />
            </div>
        </header>
    )
}