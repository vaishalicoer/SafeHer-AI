import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import API_URL from '../api.js'

export default function AuthScreen({ onAuthed }) {
  const { showToast } = useApp()

  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (loading) return

    try {
      setLoading(true)

      // Register or Login endpoint
      const endpoint =
        mode === 'register'
          ? `${API_URL}/api/auth/register`
          : `${API_URL}/api/auth/login`

      // Request body
      const body =
        mode === 'register'
          ? {
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              password,
            }
          : {
              email: email.trim(),
              password,
            }

      console.log('Sending request to:', endpoint)
      console.log('Request body:', body)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      console.log('Backend response:', data)

      // Backend error
      if (!response.ok) {
        showToast(data.message || 'Something went wrong')
        return
      }

      // Save JWT token
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      // Save logged-in user
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      // Success message
      showToast(
        data.message ||
          (mode === 'register'
            ? 'Registration successful'
            : 'Login successful')
      )

      // Get first name
      const firstName = data.user?.name
        ? data.user.name.trim().split(' ')[0]
        : name.trim()
          ? name.trim().split(' ')[0]
          : 'User'

      // Tell App authentication succeeded
      onAuthed(firstName)

    } catch (error) {
      console.error('Authentication error:', error)

      showToast(
        'Unable to connect to SafeHer AI server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  function switchMode(newMode) {
    setMode(newMode)

    // Clear fields when switching Login/Register
    setName('')
    setEmail('')
    setPassword('')
    setPhone('')
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          🛡️
        </div>

        <h1>SafeHer AI</h1>

        {/* Login / Register tabs */}
        <div className="auth-tabs">

          <div
            className={`auth-tab ${
              mode === 'login' ? 'active' : ''
            }`}
            onClick={() => switchMode('login')}
          >
            Log In
          </div>

          <div
            className={`auth-tab ${
              mode === 'register' ? 'active' : ''
            }`}
            onClick={() => switchMode('register')}
          >
            Register
          </div>

        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit}>

          {/* Name - Register only */}
          {mode === 'register' && (
            <div className="field">
              <label>Full name</label>

              <input
                type="text"
                placeholder="Vaishali Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email */}
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

          {/* Password */}
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

          {/* Phone - Register only */}
          {mode === 'register' && (
            <div className="field">
              <label>Emergency phone number</label>

              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'register'
                ? 'Create Account'
                : 'Log In'}
          </button>

        </form>

        {/* Divider */}
        <div className="auth-divider">
          or continue with
        </div>

        {/* OAuth buttons */}
        <div className="auth-oauth">

          <button
            type="button"
            onClick={() =>
              showToast('Google login is not connected yet')
            }
          >
            🔵 Google
          </button>

          <button
            type="button"
            onClick={() =>
              showToast('Apple login is not connected yet')
            }
          >
            Apple
          </button>

        </div>

        {/* Footer */}
        <p className="auth-fine">
          Your account is securely connected to SafeHer AI.
        </p>

      </div>
    </div>
  )
}