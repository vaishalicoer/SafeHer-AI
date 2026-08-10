import React, { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import AuthScreen from './components/AuthScreen.jsx'
import Intro from './components/Intro.jsx'
import PhoneShell from './components/PhoneShell.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [userName, setUserName] = useState('Vaishali')
  const [activePanel, setActivePanel] = useState('home')
  const [showAdmin, setShowAdmin] = useState(false)

  function handleAuthed(name) {
    setUserName(name)
    setAuthed(true)
  }

  function handleLogOut() {
    setAuthed(false)
    setActivePanel('home')
    setShowAdmin(false)
  }

  return (
    <AppProvider activePanel={activePanel} setActivePanel={setActivePanel} setShowAdmin={setShowAdmin}>
      {!authed ? (
        <AuthScreen onAuthed={handleAuthed} />
      ) : (
        <ChatProvider>
          <div id="appScreen">
            <div className="stage">
              <Intro />
              <PhoneShell userName={userName} onLogOut={handleLogOut} />
            </div>
          </div>
        </ChatProvider>
      )}

      <AdminDashboard show={showAdmin} onClose={() => setShowAdmin(false)} />
    </AppProvider>
  )
}
