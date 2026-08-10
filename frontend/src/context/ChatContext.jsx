import React, { createContext, useContext, useRef, useState } from 'react'
import { askSafetyAssistant } from '../utils/claudeApi.js'

const ChatContext = createContext(null)

const INITIAL_MESSAGE = {
  who: 'ai',
  text: "Hi, I'm your SafeHer assistant. Ask me about a route, a situation you're unsure about, or anything else on your mind — this stays private."
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [showChips, setShowChips] = useState(true)
  const [loading, setLoading] = useState(false)
  const [inputText, setInputText] = useState('')
  const [dictationOn, setDictationOn] = useState(false)
  const recognizerRef = useRef(null)

  async function send(text) {
    const trimmed = (text ?? inputText).trim()
    if (!trimmed) return
    setShowChips(false)
    setMessages((m) => [...m, { who: 'me', text: trimmed }])
    setInputText('')
    setLoading(true)
    try {
      const reply = await askSafetyAssistant(trimmed)
      setMessages((m) => [...m, { who: 'ai', text: reply }])
    } catch (err) {
      const msg =
        err.message === 'missing_api_key'
          ? 'AI assistant needs a VITE_ANTHROPIC_API_KEY set in your .env file to respond. If this is an emergency, please contact local emergency services immediately.'
          : "I'm having trouble connecting right now. If this is an emergency, please contact local emergency services immediately."
      setMessages((m) => [...m, { who: 'ai', text: msg }])
    } finally {
      setLoading(false)
    }
  }

  function toggleDictation(onUnsupported) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      onUnsupported?.()
      return
    }
    if (!dictationOn) {
      const recognizer = new SR()
      recognizer.lang = 'en-US'
      recognizer.interimResults = false
      recognizer.onresult = (ev) => setInputText(ev.results[0][0].transcript)
      recognizer.onend = () => setDictationOn(false)
      recognizer.start()
      recognizerRef.current = recognizer
      setDictationOn(true)
    } else {
      recognizerRef.current?.stop()
      setDictationOn(false)
    }
  }

  return (
    <ChatContext.Provider
      value={{ messages, showChips, loading, inputText, setInputText, dictationOn, send, toggleDictation }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
