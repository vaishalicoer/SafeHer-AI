import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import StatusBar from './StatusBar.jsx'
import Navbar from './Navbar.jsx'
import Composer from './Composer.jsx'
import FakeCallOverlay from './FakeCallOverlay.jsx'
import Toast from './Toast.jsx'
import Home from '../screens/Home.jsx'
import Journey from '../screens/Journey.jsx'
import Report from '../screens/Report.jsx'
import Circle from '../screens/Circle.jsx'
import Assistant from '../screens/Assistant.jsx'

// All screens stay mounted at all times (just shown/hidden via the "active"
// class, same as the original design) so each screen keeps its own state
// -- timers, recordings, chat history -- when you switch tabs and come back.

export default function PhoneShell({ userName, onLogOut }) {
  const { activePanel } = useApp()
  const [fakeCallActive, setFakeCallActive] = useState(false)

  return (
    <div className="phone-wrap">
      <div className="phone-glow"></div>
      <div className="phone">
        <div className="notch"></div>
        <div className="screen">
          <StatusBar />

          <div className="panels">
            <div className={`panel ${activePanel === 'home' ? 'active' : ''}`}>
              <Home userName={userName} onLogOut={onLogOut} onStartFakeCall={() => setFakeCallActive(true)} />
            </div>
            <div className={`panel ${activePanel === 'journey' ? 'active' : ''}`}>
              <Journey userName={userName} onLogOut={onLogOut} />
            </div>
            <div className={`panel ${activePanel === 'report' ? 'active' : ''}`}>
              <Report userName={userName} onLogOut={onLogOut} />
            </div>
            <div className={`panel ${activePanel === 'circle' ? 'active' : ''}`}>
              <Circle userName={userName} onLogOut={onLogOut} />
            </div>
            <div className={`panel ${activePanel === 'assistant' ? 'active' : ''}`}>
              <Assistant userName={userName} onLogOut={onLogOut} />
            </div>
          </div>

          <Composer />
          <Navbar />
          <FakeCallOverlay active={fakeCallActive} onEnd={() => setFakeCallActive(false)} />
          <Toast />
        </div>
      </div>
    </div>
  )
}
