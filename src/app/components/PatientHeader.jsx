"use client";

import Link from 'next/link'
import logo from '../assets/medipulso.png'
import logoDarkMode from '../assets/logoDarkMode-1.png'
import { useSelector } from 'react-redux'

const PatientHeader = () => {
  const { theme } = useSelector(state => state.theme)

  return (
    <header className="flex justify-center py-2 border-b-[0.5px]">
      <Link href="/">
        <img src={theme === 'dark' ? logoDarkMode : logo} alt="logo" className="w-32" />
      </Link>
    </header>
  )
}

export default PatientHeader
