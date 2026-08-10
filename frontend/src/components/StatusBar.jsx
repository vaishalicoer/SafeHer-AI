import React, { useEffect, useState } from 'react'

export default function StatusBar() {
  const [time, setTime] = useState('9:41')

  useEffect(() => {
    function tick() {
      const d = new Date()
      const h = d.getHours() % 12 || 12
      const m = d.getMinutes().toString().padStart(2, '0')
      setTime(`${h}:${m}`)
    }
    tick()
    const iv = setInterval(tick, 15000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="statusbar">
      <span>{time}</span>
      <div className="icons">
        <span>●●●●</span>
        <span>Wi-Fi</span>
        <span>100%</span>
      </div>
    </div>
  )
}
