import React from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Toast() {
  const { toastMsg, toastVisible } = useApp()
  return (
    <div className="toast-el" style={{ opacity: toastVisible ? 1 : 0 }}>
      {toastMsg}
    </div>
  )
}
