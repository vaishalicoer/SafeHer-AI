import React from 'react'
import { useApp } from '../context/AppContext.jsx'

const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'journey', label: 'Journey' },
  { key: 'report', label: 'Report' },
  { key: 'circle', label: 'Circle' },
  { key: 'assistant', label: 'AI' }
]

const ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  journey: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  report: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l9 18H3z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  ),
  circle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.4" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M14.5 15.2c2.6.3 4.5 2 4.5 4.8" />
    </svg>
  ),
  assistant: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

export default function Navbar() {
  const { activePanel, switchPanel } = useApp()
  return (
    <div className="navbar">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          className={`navbtn ${activePanel === item.key ? 'active' : ''}`}
          onClick={() => switchPanel(item.key)}
        >
          <span className="navicon">{ICONS[item.key]}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}
