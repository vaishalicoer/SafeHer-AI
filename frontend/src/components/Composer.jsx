import React from 'react'
import { useChat } from '../context/ChatContext.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Composer() {
  const { inputText, setInputText, dictationOn, toggleDictation, send } = useChat()
  const { showToast } = useApp()

  function handleKeyDown(e) {
    if (e.key === 'Enter') send()
  }

  return (
    <div className="composer">
      <input
        type="text"
        placeholder="Ask SafeHer AI anything…"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className={`mic-btn ${dictationOn ? 'listening' : ''}`}
        onClick={() => toggleDictation(() => showToast('Voice input not supported in this browser'))}
        title="Voice input"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0014 0" />
          <path d="M12 17v4" />
        </svg>
      </button>
      <button onClick={() => send()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4">
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  )
}
