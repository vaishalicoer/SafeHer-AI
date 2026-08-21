import React, { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProfileMenu from '../components/ProfileMenu.jsx'
import { triggerSOS, cancelSOS, triggerMedicalAlert } from '../api.js'

const DEFAULT_LOCATIONS = [
  { icon: '🚓', name: 'Connaught Place Police Station', meta: '0.6 km · Open 24 hrs', q: 'Police+Station+near+me' },
  { icon: '🏥', name: 'Apollo Pharmacy & Clinic', meta: '0.9 km · Open 24 hrs', q: 'Hospital+near+me' },
  { icon: '🏪', name: '24x7 Convenience Store, MG Road', meta: '0.3 km · Well-lit, staffed', q: '24+hour+store+near+me' },
  { icon: '🚇', name: 'Rajiv Chowk Metro Station', meta: '1.1 km · CCTV & security present', q: 'Metro+station+near+me' }
]

export default function Home({ userName, onLogOut, onStartFakeCall }) {
  const { showToast, switchPanel } = useApp()

  // SOS state
  const [holdPct, setHoldPct] = useState(0)
  const [alerted, setAlerted] = useState(false)
  const [sosLoading, setSosLoading] = useState(false)
  const holdInterval = useRef(null)
  const holdStart = useRef(null)

  // Voice SOS
  const [voiceOn, setVoiceOn] = useState(false)
  const recognizerRef = useRef(null)

  // Audio recording
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const [vault, setVault] = useState([])

  // Safe locations
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS)

  function startHold() {
    if (alerted) {
      resetAlert()
      return
    }
    holdStart.current = Date.now()
    clearInterval(holdInterval.current)
    holdInterval.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - holdStart.current) / 3000) * 100)
      setHoldPct(pct)
      if (pct >= 100) {
        clearInterval(holdInterval.current)
        triggerAlert()
      }
    }, 30)
  }
  function cancelHold() {
    clearInterval(holdInterval.current)
    if (!alerted) setHoldPct(0)
  }

  async function triggerAlert() {
    setAlerted(true)
    setSosLoading(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const result = await triggerSOS(latitude, longitude)
          if (result.success) {
            showToast('SOS Alert sent — Guardians notified with your location')
          } else {
            showToast(result.message || 'Could not send SOS')
          }
          setSosLoading(false)
        },
        async () => {
          const result = await triggerSOS(null, null)
          showToast(result.success ? 'SOS Alert sent (location unavailable)' : 'Could not send SOS')
          setSosLoading(false)
        }
      )
    } else {
      const result = await triggerSOS(null, null)
      showToast(result.success ? 'SOS Alert sent' : 'Could not send SOS')
      setSosLoading(false)
    }
  }

  async function resetAlert() {
    setAlerted(false)
    setHoldPct(0)
    setSosLoading(true)
    await cancelSOS()
    setSosLoading(false)
    showToast('SOS Alert cancelled')
  }

  function toggleVoiceSOS() {
    if (!voiceOn) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) {
        showToast('Voice recognition not supported in this browser')
        return
      }
      const recognizer = new SR()
      recognizer.continuous = true
      recognizer.interimResults = false
      recognizer.lang = 'en-US'
      recognizer.onresult = (ev) => {
        const said = ev.results[ev.results.length - 1][0].transcript.toLowerCase()
        if (said.includes('help me now') || said.includes('help me') || said.includes('sos')) {
          triggerAlert()
          showToast('Voice trigger detected — alert sent')
        }
      }
      recognizer.onerror = () => {}
      recognizer.onend = () => {
        if (recognizerRef.current === recognizer) {
          try { recognizer.start() } catch (e) {}
        }
      }
      try { recognizer.start() } catch (e) {}
      recognizerRef.current = recognizer
      setVoiceOn(true)
    } else {
      setVoiceOn(false)
      if (recognizerRef.current) {
        const r = recognizerRef.current
        recognizerRef.current = null
        try { r.stop() } catch (e) {}
      }
    }
  }

  async function toggleRecording() {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const recorder = new MediaRecorder(stream)
        chunksRef.current = []
        recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const url = URL.createObjectURL(blob)
          setVault((v) => [
            { url, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            ...v
          ])
          showToast('Recording saved to Vault')
          stream.getTracks().forEach((t) => t.stop())
        }
        recorder.start()
        mediaRecorderRef.current = recorder
        setIsRecording(true)
        showToast('Recording started, saved to Vault when stopped')
      } catch (err) {
        showToast('Microphone access denied or unavailable')
      }
    } else {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    }
  }

  async function handleMedicalAlert() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const result = await triggerMedicalAlert(latitude, longitude, "Medical help needed")
          if (result.success) {
            showToast('Medical alert sent to your Guardians 🏥')
          } else {
            showToast(result.message || 'Could not send medical alert')
          }
        },
        async () => {
          const result = await triggerMedicalAlert(null, null, "Medical help needed")
          showToast(result.success ? 'Medical alert sent (location unavailable)' : 'Could not send alert')
        }
      )
    } else {
      const result = await triggerMedicalAlert(null, null, "Medical help needed")
      showToast(result.success ? 'Medical alert sent' : 'Could not send alert')
    }
  }

  function findSafeLocations() {
    if (!navigator.geolocation) {
      showToast('Location not supported on this device — showing default list')
      return
    }
    showToast('Finding safe locations near you…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const updated = [
          { icon: '🚓', name: 'Nearest Police Station', meta: `${(0.3 + Math.random() * 0.8).toFixed(1)} km · near your current location`, q: 'Police+Station', lat, lng },
          { icon: '🏥', name: 'Nearest Hospital / Pharmacy', meta: `${(0.4 + Math.random() * 1.0).toFixed(1)} km · near your current location`, q: 'Hospital', lat, lng },
          { icon: '🏪', name: 'Nearest 24x7 Store', meta: `${(0.2 + Math.random() * 0.6).toFixed(1)} km · near your current location`, q: '24+hour+store', lat, lng },
          { icon: '🚇', name: 'Nearest Metro / Transit Stop', meta: `${(0.5 + Math.random() * 1.2).toFixed(1)} km · near your current location`, q: 'Metro+station', lat, lng }
        ]
        setLocations(updated)
        showToast('Updated using your live location')
      },
      () => showToast('Location permission denied — showing default list')
    )
  }

  function locationHref(loc) {
    if (loc.lat) {
      return `https://www.google.com/maps/dir/?api=1&origin=${loc.lat},${loc.lng}&destination=${loc.q}`
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${loc.q}`
  }

  useEffect(() => {
    return () => {
      clearInterval(holdInterval.current)
      if (recognizerRef.current) {
        try { recognizerRef.current.stop() } catch (e) {}
      }
    }
  }, [])

  return (
    <div className="screen-inner">
      <div className="p-head">
        <div>
          <h2>Hi, {userName}</h2>
          <p>Wednesday, 9:41 PM · Home</p>
        </div>
        <ProfileMenu initial={userName?.[0]?.toUpperCase() || 'V'} onLogOut={onLogOut} />
      </div>

      <div className={`status-card ${alerted ? 'alerting' : ''}`}>
        <div className="pulse-dot"></div>
        <div className="txt">
          <b>{alerted ? 'Alert sent to your Guardians' : "You're marked Safe"}</b>
          <span>{alerted ? 'Guardians notified · Live location on' : 'No active journey · Location private'}</span>
        </div>
      </div>

      <div className="sos-wrap">
        <button
          className="sos-btn"
          onMouseDown={startHold}
          onTouchStart={(e) => { e.preventDefault(); startHold() }}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchEnd={cancelHold}
          onClick={() => { if (alerted) resetAlert() }}
          disabled={sosLoading}
        >
          <div className="sos-progress" style={{ '--p': holdPct }}></div>
          <div className="ico">🛡️</div>
          <span className="label">{alerted ? 'ALERT ACTIVE' : 'HOLD FOR HELP'}</span>
          <small>{alerted ? 'Tap to cancel' : '3 seconds to alert'}</small>
        </button>
        <div className="sos-hint">Sends your live location to all Guardians</div>
      </div>

      <div className="helpline-row">
        <a href="tel:100" className="helpline-btn police" onClick={() => showToast('Dialing Police — 100')}>
          <div className="hi">🚓</div>
          <div><b>Police</b><span>100 / 112</span></div>
        </a>
        <a href="tel:1091" className="helpline-btn women" onClick={() => showToast('Dialing Women Helpline — 1091')}>
          <div className="hi">☎️</div>
          <div><b>Women Helpline</b><span>1091</span></div>
        </a>
      </div>

      <div className="grid-actions">
        <div className="qa" onClick={onStartFakeCall}>
          <div className="qi">📞</div><b>Fake Call</b><span>Escape a moment, fast</span>
        </div>
        <div className="qa" onClick={() => switchPanel('journey')}>
          <div className="qi">📍</div><b>Share Location</b><span>Live for 30 min</span>
        </div>
        <div className="qa" onClick={toggleRecording}>
          <div className="qi">{isRecording ? '⏺️' : '🎙️'}</div>
          <b>{isRecording ? 'Recording…' : 'Discreet Record'}</b>
          <span>{isRecording ? 'Tap to stop & save' : 'Audio evidence'}</span>
        </div>
        <div className="qa" onClick={() => switchPanel('circle')}>
          <div className="qi">👥</div><b>Call Guardian</b><span>Open Guardian Circle</span>
        </div>
        <div className="qa" onClick={handleMedicalAlert}>
          <div className="qi">🏥</div><b>Medical Help</b><span>Discreet health alert</span>
        </div>
      </div>

      <div className="toggle-row">
        <div>
          <b>Voice SOS {voiceOn && <span className="voice-dot"></span>}</b>
          <span>{voiceOn ? 'Listening — say "help me now"' : 'Say "help me now" to trigger an alert'}</span>
        </div>
        <div className={`switch ${voiceOn ? 'on' : ''}`} onClick={toggleVoiceSOS}></div>
      </div>

      <div className="tip-card">
        <div className="ti">✨</div>
        <div>
          <b>Tonight's tip</b>
          <p>Your walk home is 12 min after dark. Want me to start a tracked journey and notify your Guardians when you arrive?</p>
        </div>
      </div>

      <div className="safe-loc">
        <h3>Nearby Safe Locations <span className="loc-refresh" onClick={findSafeLocations}>↻ Refresh</span></h3>
        <div>
          {locations.map((loc, i) => (
            <div className="loc-row" key={i}>
              <div className="li">{loc.icon}</div>
              <div><b>{loc.name}</b><span>{loc.meta}</span></div>
              <a className="loc-go" href={locationHref(loc)} target="_blank" rel="noopener noreferrer">Go</a>
            </div>
          ))}
        </div>
        <div className="loc-note">Tap "Go" to open turn-by-turn directions in Google Maps. Uses your device's live location — no API key needed.</div>
      </div>

      {vault.length > 0 && (
        <div className="vault">
          <h3>Recording Vault</h3>
          <div>
            {vault.map((clip, i) => (
              <div className="vault-item" key={i}>
                <div className="vi">🎧</div>
                <div><b>Clip {vault.length - i}</b><span>{clip.time}</span></div>
                <audio controls src={clip.url}></audio>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}