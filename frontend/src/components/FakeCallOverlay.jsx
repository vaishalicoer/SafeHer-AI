import React, { useEffect, useRef, useState } from 'react'

export default function FakeCallOverlay({ active, onEnd }) {
  const [answered, setAnswered] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!active) {
      setAnswered(false)
      setSeconds(0)
      clearInterval(intervalRef.current)
    }
  }, [active])

  function answer() {
    setAnswered(true)
    setSeconds(0)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  function end() {
    clearInterval(intervalRef.current)
    onEnd()
  }

  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const timeLabel = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

  return (
    <div className={`callscreen ${active ? 'show' : ''}`}>
      <div className="cs-top">
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 30 }}>
          {answered ? '' : 'Incoming call'}
        </div>
        <div className="cs-avatar">👩</div>
        <h2>Mom</h2>
        <p>{answered ? 'Call in progress' : 'mobile'}</p>
      </div>

      {!answered ? (
        <div className="cs-actions">
          <button className="cs-btn cs-decline" onClick={end}>✕</button>
          <button className="cs-btn cs-accept" onClick={answer}>✓</button>
        </div>
      ) : (
        <div className="cs-live show">
          <div className="cs-timer">{timeLabel}</div>
          <button className="cs-btn cs-decline" onClick={end}>✕</button>
        </div>
      )}
    </div>
  )
}
