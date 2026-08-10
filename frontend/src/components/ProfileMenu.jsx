import React, { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function ProfileMenu({ initial = 'V', onLogOut, style }) {
  const { showToast, openAdmin } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="avatar" style={style} ref={ref} onClick={() => setOpen((o) => !o)}>
      {initial}
      <div className={`profile-menu ${open ? 'open' : ''}`}>
        <button onClick={() => showToast('Profile settings — demo only')}>👤 Profile</button>
        <button onClick={openAdmin}>📊 Admin Dashboard</button>
        <button onClick={onLogOut}>🚪 Log Out</button>
      </div>
    </div>
  )
}
