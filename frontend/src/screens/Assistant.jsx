import React, { useEffect, useRef } from 'react'
import ProfileMenu from '../components/ProfileMenu.jsx'
import { useChat } from '../context/ChatContext.jsx'

const SUGGESTIONS = [
  'I have to walk alone at night, any tips?',
  'How do I verify my cab driver is legitimate?',
  'I feel like someone is following me, what should I do right now?'
]

export default function Assistant({ userName, onLogOut }) {
  const { messages, showChips, loading, send } = useChat()
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, loading])

  return (
    <div className="screen-inner">
      <div className="p-head">
        <div><h2>SafeHer AI</h2><p>Calm, private, always listening</p></div>
        <ProfileMenu initial="✦" onLogOut={onLogOut} style={{ background: 'linear-gradient(135deg,#8177FF,#49E0B3)' }} />
      </div>

      <div className="chatlog" ref={logRef}>
        {messages.map((m, i) => (
          <div className={`msg ${m.who}`} key={i}>{m.text}</div>
        ))}
        {loading && (
          <div className="msg ai typing"><span></span><span></span><span></span></div>
        )}
      </div>

      {showChips && (
        <div className="chips">
          {SUGGESTIONS.map((s) => (
            <div className="chip" key={s} onClick={() => send(s)}>{s}</div>
          ))}
        </div>
      )}
    </div>
  )
}
