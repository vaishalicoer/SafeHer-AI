import React, { createContext, useContext, useCallback, useRef, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children, activePanel, setActivePanel, setShowAdmin }) {
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200)
  }, [])

  const switchPanel = useCallback((name) => setActivePanel(name), [setActivePanel])
  const openAdmin = useCallback(() => setShowAdmin(true), [setShowAdmin])

  const value = { showToast, toastMsg, toastVisible, switchPanel, activePanel, openAdmin }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
