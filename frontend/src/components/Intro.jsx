import React from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Intro() {
  const { openAdmin } = useApp()
  return (
    <div className="intro">
      <div className="eyebrow"><span className="dot"></span> AI Safety Companion</div>
      <h1>Your guardian,<br /><em>always on.</em></h1>
      <p className="lede">
        SafeHer AI watches your journey, listens for danger, and keeps the people you trust one tap away — quietly,
        until the moment it matters.
      </p>

      <div className="stat-row">
        <div className="stat"><b>0.8s</b><span>Alert dispatch</span></div>
        <div className="stat"><b>24/7</b><span>AI monitoring</span></div>
        <div className="stat"><b>3</b><span>Guardians nearby</span></div>
      </div>

      <div className="feature-list">
        <div className="f">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#49E0B3" strokeWidth="2">
            <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
          </svg>
          <span><strong>One-touch SOS</strong> — hold to alert your circle and nearby responders instantly.</span>
        </div>
        <div className="f">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8177FF" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span><strong>Live journey tracking</strong> — guardians see your route and ETA in real time.</span>
        </div>
        <div className="f">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5C7A" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span><strong>AI safety assistant</strong> — ask anything, get calm, practical guidance instantly.</span>
        </div>
      </div>

      <div className="admin-link" onClick={openAdmin}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
        </svg>
        View Admin Dashboard
      </div>
    </div>
  )
}
