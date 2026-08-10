// Calls the Anthropic Messages API directly from the browser.
//
// SECURITY NOTE: This exposes VITE_ANTHROPIC_API_KEY to anyone who opens
// dev tools on your deployed site. That's acceptable for local development
// and prototyping, but before shipping this publicly you should replace
// this function's fetch target with your own backend/serverless endpoint
// that holds the API key server-side and forwards the request.

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const SYSTEM_PROMPT =
  'You are SafeHer AI, a calm, practical personal-safety assistant inside a ' +
  "women's safety app. Give short, specific, actionable safety guidance " +
  '(3-5 sentences max, sometimes a short list). Be warm but not alarmist. ' +
  'Never diagnose, never give legal advice, and if the user describes an ' +
  'immediate emergency, clearly and gently tell them to contact local ' +
  'emergency services right away in addition to any other advice.'

export async function askSafetyAssistant(userText) {
  if (!API_KEY) {
    throw new Error('missing_api_key')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }]
    })
  })

  if (!response.ok) {
    throw new Error('request_failed')
  }

  const data = await response.json()
  const reply = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')

  return reply || "I couldn't quite process that — could you try rephrasing?"
}
