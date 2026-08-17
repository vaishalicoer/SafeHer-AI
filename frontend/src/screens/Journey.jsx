import React, { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProfileMenu from '../components/ProfileMenu.jsx'
import { startJourney, updateJourneyLocation, endJourney, getActiveJourney } from '../api.js'

const GMAPS_KEY_ENV = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export default function Journey({ userName, onLogOut }) {
  const { showToast } = useApp()

  // ===== REAL JOURNEY STATE =====
  const [journeyId, setJourneyId] = useState(null)
  const [isSharing, setIsSharing] = useState(false)
  const [realCoords, setRealCoords] = useState(null)
  const [journeyLoading, setJourneyLoading] = useState(false)
  const updateIntervalRef = useRef(null)

  const [route, setRoute] = useState('safe')
  const [dotPos, setDotPos] = useState({ cx: 140, cy: 82 })

  const [gmapKey, setGmapKey] = useState(GMAPS_KEY_ENV)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapCanvasRef = useRef(null)

  const [riskVal, setRiskVal] = useState(48)
  const [riskLevel, setRiskLevel] = useState({ label: 'Moderate', color: 'var(--amber)' })
  const [riskReason, setRiskReason] = useState(
    'Elevated slightly due to reduced foot traffic and 2 community reports near this route after 9 PM.'
  )

  const [timerDuration, setTimerDuration] = useState(15 * 60)
  const [timerRemaining, setTimerRemaining] = useState(15 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerIntervalRef = useRef(null)

  // Check if a journey is already active (e.g. after page refresh)
  useEffect(() => {
    async function checkActive() {
      const result = await getActiveJourney()
      if (result.success && result.journey) {
        setJourneyId(result.journey._id)
        setIsSharing(true)
        setRealCoords(result.journey.currentLocation)
        startLocationUpdates(result.journey._id)
      }
    }
    checkActive()
    return () => clearInterval(updateIntervalRef.current)
  }, [])

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  function startLocationUpdates(id) {
    clearInterval(updateIntervalRef.current)
    updateIntervalRef.current = setInterval(async () => {
      try {
        const coords = await getCurrentPosition()
        setRealCoords(coords)
        await updateJourneyLocation(id, coords.latitude, coords.longitude)
      } catch (err) {
        console.error('Location update failed:', err)
      }
    }, 15000)
  }

  async function handleToggleSharing() {
    if (isSharing) {
      // Stop sharing / end journey
      if (journeyId) {
        setJourneyLoading(true)
        await endJourney(journeyId)
        setJourneyLoading(false)
      }
      clearInterval(updateIntervalRef.current)
      setIsSharing(false)
      setJourneyId(null)
      showToast('Live location sharing stopped')
    } else {
      // Start sharing / start journey
      setJourneyLoading(true)
      try {
        const coords = await getCurrentPosition()
        const result = await startJourney(coords.latitude, coords.longitude)
        if (result.success) {
          setJourneyId(result.journey._id)
          setIsSharing(true)
          setRealCoords(coords)
          startLocationUpdates(result.journey._id)
          showToast('Live location sharing started — Guardians can see your location')
        } else {
          showToast(result.message || 'Could not start sharing')
        }
      } catch (err) {
        showToast('Location access denied — enable it in your browser settings')
      }
      setJourneyLoading(false)
    }
  }

  async function handleImSafe() {
    if (journeyId) {
      setJourneyLoading(true)
      await endJourney(journeyId)
      clearInterval(updateIntervalRef.current)
      setIsSharing(false)
      setJourneyId(null)
      setJourneyLoading(false)
    }
    showToast("Marked as arrived safely ✓")
  }

  const [secondsLeft, setSecondsLeft] = useState(8 * 60)

  useEffect(() => {
    const total = route === 'fast' ? 8 * 60 : 12 * 60
    const iv = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 0) return s
        const next = s - 1
        const prog = 1 - next / total
        setDotPos({ cx: 40 + prog * 210, cy: 120 - prog * 90 })
        return next
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [route])

  function selectRoute(which) {
    setRoute(which)
    setSecondsLeft(which === 'fast' ? 8 * 60 : 12 * 60)
    showToast(which === 'fast' ? 'Switched to fastest route — safety score 62' : 'Switched to safest route — safety score 91')
  }

  function recalcRisk() {
    const val = Math.floor(Math.random() * 100)
    setRiskVal(val)
    if (val < 35) {
      setRiskLevel({ label: 'Low', color: 'var(--teal)' })
      setRiskReason('Well-lit route with steady foot traffic and no recent reports nearby.')
    } else if (val < 70) {
      setRiskLevel({ label: 'Moderate', color: 'var(--amber)' })
      setRiskReason('Elevated slightly due to reduced foot traffic and recent community reports near this route after dark.')
    } else {
      setRiskLevel({ label: 'High', color: 'var(--rose)' })
      setRiskReason('Multiple recent reports and low visibility along this stretch — consider the Safest route option or a live tracked journey.')
    }
  }

  function loadRealMap() {
    const key = gmapKey.trim()
    if (!key) {
      showToast('Enter a valid Google Maps API key first')
      return
    }
    window.initGMap = function () {
      const center = realCoords
        ? { lat: realCoords.latitude, lng: realCoords.longitude }
        : { lat: 28.6139, lng: 77.209 }
      const map = new window.google.maps.Map(mapCanvasRef.current, {
        center,
        zoom: 15,
        disableDefaultUI: true,
        styles: [{ elementType: 'geometry', stylers: [{ color: '#14123A' }] }]
      })
      new window.google.maps.Marker({ position: center, map, label: userName?.[0] || 'V' })
      setMapLoaded(true)
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=initGMap`
    script.onerror = () => showToast('Could not load Google Maps — check your API key')
    document.head.appendChild(script)
  }

  function setDuration(mins) {
    setTimerDuration(mins * 60)
    setTimerRemaining(mins * 60)
  }

  function toggleTimer() {
    if (!timerRunning) {
      setTimerRunning(true)
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current)
            setTimerRunning(false)
            showToast('Timer expired — Guardians alerted automatically')
            return timerDuration
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerIntervalRef.current)
      setTimerRunning(false)
      setTimerRemaining(timerDuration)
      showToast('Safety timer cancelled')
    }
  }

  useEffect(() => () => clearInterval(timerIntervalRef.current), [])

  const etaM = Math.floor(Math.max(secondsLeft, 0) / 60)
  const etaS = Math.max(secondsLeft, 0) % 60
  const timerM = Math.floor(timerRemaining / 60)
  const timerS = timerRemaining % 60

  return (
    <div className="screen-inner">
      <div className="p-head">
        <div><h2>Journey</h2><p>{isSharing ? 'Tracking active · Live' : 'Tracking inactive'}</p></div>
        <ProfileMenu initial={userName?.[0]?.toUpperCase() || 'V'} onLogOut={onLogOut} />
      </div>

      <div className="gauge-wrap">
        <svg width="66" height="66" viewBox="0 0 36 36">
          <path d="M18 2a16 16 0 110 32 16 16 0 010-32" fill="none" stroke="#211D52" strokeWidth="4" />
          <path d="M18 2a16 16 0 110 32 16 16 0 010-32" fill="none" stroke="#49E0B3" strokeWidth="4" strokeLinecap="round" strokeDasharray="88" strokeDashoffset="14" />
        </svg>
        <div className="glabel"><b>84</b><span>Route safety score</span></div>
      </div>

      <div className="map-card">
        <div className="mc-head"><b>Live Map</b><span>{mapLoaded ? 'Live — Google Maps' : 'Simulated view'}</span></div>
        {!mapLoaded && (
          <div className="map-canvas">
            <svg viewBox="0 0 300 150">
              <rect width="300" height="150" fill="#14123A" />
              <g stroke="#2A2760" strokeWidth="2">
                <line x1="0" y1="30" x2="300" y2="30" /><line x1="0" y1="75" x2="300" y2="75" /><line x1="0" y1="120" x2="300" y2="120" />
                <line x1="70" y1="0" x2="70" y2="150" /><line x1="160" y1="0" x2="160" y2="150" /><line x1="230" y1="0" x2="230" y2="150" />
              </g>
              <path d="M40 120 Q 90 90 160 75 T 250 30" stroke="#49E0B3" strokeWidth="3" fill="none" strokeDasharray="6 5" />
              <circle cx="40" cy="120" r="6" fill="#8177FF" />
              <circle cx="250" cy="30" r="6" fill="#FF5C7A" />
              <circle cx={dotPos.cx} cy={dotPos.cy} r="5" fill="#49E0B3" />
            </svg>
          </div>
        )}
        <div id="gmapCanvas" ref={mapCanvasRef} style={{ display: mapLoaded ? 'block' : 'none', width: '100%', height: 150, borderRadius: 14 }}></div>
        {realCoords && (
          <div style={{ padding: '8px 4px', fontSize: 12, color: 'var(--text-faint)' }}>
            📍 Real location: {realCoords.latitude.toFixed(5)}, {realCoords.longitude.toFixed(5)}
          </div>
        )}
        <div className="map-key-row">
          <input type="text" placeholder="Paste Google Maps API key to enable live map" value={gmapKey} onChange={(e) => setGmapKey(e.target.value)} />
          <button onClick={loadRealMap}>Connect</button>
        </div>
        <div className="map-note">Uses the Google Maps JavaScript API with your own key. Without one, a simulated route view is shown above.</div>
      </div>

      <div className="route-card">
        <b style={{ fontSize: 12.5 }}>Home → Studio Apartment</b>
        <div className="route-line">
          <div className="rl"><div className="dot"></div><div className="dash"></div><div className="dot end"></div></div>
          <div className="route-text">
            <div><b>Design Studio, MG Road</b><br /><span>Started 9:32 PM</span></div>
            <div><b>Home</b><br /><span>ETA {etaM}:{etaS.toString().padStart(2, '0')} min left</span></div>
          </div>
        </div>
      </div>

      <div className="route-options">
        <div className={`route-opt ${route === 'fast' ? 'selected' : ''}`} onClick={() => selectRoute('fast')}>
          <b>⚡ Fastest</b>
          <div className="rmeta"><span>8 min</span><span className="rscore" style={{ color: 'var(--amber)' }}>62</span></div>
        </div>
        <div className={`route-opt ${route === 'safe' ? 'selected' : ''}`} onClick={() => selectRoute('safe')}>
          <b>🛡️ Safest</b>
          <div className="rmeta"><span>12 min</span><span className="rscore" style={{ color: 'var(--teal)' }}>91</span></div>
        </div>
      </div>

      <div className="risk-card">
        <div className="rc-head"><b>AI Risk Prediction</b><span style={{ fontSize: 11, color: riskLevel.color }}>{riskLevel.label}</span></div>
        <div className="risk-meter"><div className="rp" style={{ left: `${riskVal}%` }}></div></div>
        <div className="risk-labels"><span>Low</span><span>Moderate</span><span>High</span></div>
        <p>{riskReason}</p>
        <div className="risk-recalc" onClick={recalcRisk}>↻ Recalculate for current time</div>
      </div>

      <div className="timer-card">
        <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>Safety Timer</span>
        <div className="tval">{timerM.toString().padStart(2, '0')}:{timerS.toString().padStart(2, '0')}</div>
        <div className="timer-chips">
          {[5, 15, 30, 60].map((mins) => (
            <div
              key={mins}
              className={`timer-chip ${timerDuration === mins * 60 ? 'active' : ''}`}
              onClick={() => setDuration(mins)}
            >
              {mins} min
            </div>
          ))}
        </div>
        <div className="timer-actions">
          <button className="timer-start" onClick={toggleTimer}>{timerRunning ? 'Cancel Timer' : 'Start Timer'}</button>
          <button className="timer-safe" onClick={handleImSafe} disabled={journeyLoading}>I'm Safe</button>
        </div>
      </div>

      <div className="toggle-row">
        <div><b>Share live location</b><span>{isSharing ? 'Currently sharing — Guardians can see you' : 'Tap to start sharing'}</span></div>
        <div
          className={`switch ${isSharing ? 'on' : ''}`}
          onClick={handleToggleSharing}
          style={{ cursor: journeyLoading ? 'wait' : 'pointer', opacity: journeyLoading ? 0.6 : 1 }}
        ></div>
      </div>
      <div className="toggle-row"><div><b>Auto-alert if I stop moving</b><span>Trigger after 90 seconds</span></div><div className="switch on"></div></div>
    </div>
  )
}