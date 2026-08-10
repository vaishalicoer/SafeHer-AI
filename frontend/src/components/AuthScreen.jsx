import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function AuthScreen({ onAuthed }) {
  const { showToast } = useApp()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const firstName = name.trim() ? name.trim().split(' ')[0] : 'Vaishali'
    onAuthed(firstName)
  }

  return (
    <div id="authScreen">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="mark">🛡️</div>
          <b>SafeHer AI</b>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Log In
          </div>
          <div className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Register
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="field">
              <label>Full name</label>
              <input type="text" placeholder="Vaishali Sharma" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>
          {mode === 'register' && (
            <div className="field">
              <label>Emergency phone number</label>
              <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}
          <button type="submit" className="auth-submit">
            {mode === 'register' ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>
        <div className="auth-oauth">
          <button onClick={() => showToast('Demo only — connect a real OAuth provider')}>🔵 Google</button>
          <button onClick={() => showToast('Demo only — connect a real OAuth provider')}> Apple</button>
        </div>
        <p className="auth-fine">This is a demo prototype. No real account is created.</p>
      </div>
    </div>
  )
}
