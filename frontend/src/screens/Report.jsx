import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProfileMenu from '../components/ProfileMenu.jsx'

const CATEGORIES = ['Poor lighting', 'Harassment', 'Isolated area', 'Suspicious activity', 'Other']
const CAT_ICONS = {
  'Poor lighting': '💡',
  Harassment: '⚠️',
  'Isolated area': '🌑',
  'Suspicious activity': '👁️',
  Other: '📌'
}

const INITIAL_REPORTS = [
  { icon: '💡', text: 'Poor lighting near MG Road underpass', meta: '0.4 km · 2 hrs ago · 6 confirmed' },
  { icon: '⚠️', text: 'Suspicious activity reported', meta: '0.9 km · yesterday · 3 confirmed' }
]

export default function Report({ userName, onLogOut }) {
  const { showToast } = useApp()
  const [category, setCategory] = useState('Poor lighting')
  const [severity, setSeverity] = useState('med')
  const [note, setNote] = useState('')
  const [reports, setReports] = useState(INITIAL_REPORTS)

  function submitReport() {
    const text = note.trim() ? `${category} — ${note.trim().slice(0, 40)}` : category
    setReports((r) => [{ icon: CAT_ICONS[category], text, meta: 'Just now · your report · 1 confirmed' }, ...r])
    setNote('')
    showToast('Report submitted — thanks for keeping the map current')
  }

  return (
    <div className="screen-inner">
      <div className="p-head">
        <div><h2>Report Area</h2><p>Help keep the map current</p></div>
        <ProfileMenu initial={userName?.[0]?.toUpperCase() || 'V'} onLogOut={onLogOut} />
      </div>

      <div className="report-map">
        <svg viewBox="0 0 300 150">
          <rect width="300" height="150" fill="#14123A" />
          <g stroke="#2A2760" strokeWidth="2">
            <line x1="0" y1="50" x2="300" y2="50" /><line x1="0" y1="100" x2="300" y2="100" />
            <line x1="100" y1="0" x2="100" y2="150" /><line x1="200" y1="0" x2="200" y2="150" />
          </g>
          <circle cx="60" cy="40" r="6" fill="#FF5C7A" /><circle cx="150" cy="90" r="6" fill="#FFC15E" />
          <circle cx="230" cy="60" r="6" fill="#FF5C7A" /><circle cx="180" cy="30" r="6" fill="#49E0B3" />
        </svg>
      </div>

      <div className="field-mini">
        <label>Category</label>
        <div className="cat-chips">
          {CATEGORIES.map((cat) => (
            <div key={cat} className={`cat-chip ${category === cat ? 'sel' : ''}`} onClick={() => setCategory(cat)}>
              {cat}
            </div>
          ))}
        </div>
      </div>

      <div className="field-mini">
        <label>Severity</label>
        <div className="sev-row">
          <div className={`sev-btn ${severity === 'low' ? 'sel-low' : ''}`} onClick={() => setSeverity('low')}>Low</div>
          <div className={`sev-btn ${severity === 'med' ? 'sel-med' : ''}`} onClick={() => setSeverity('med')}>Medium</div>
          <div className={`sev-btn ${severity === 'high' ? 'sel-high' : ''}`} onClick={() => setSeverity('high')}>High</div>
        </div>
      </div>

      <div className="field-mini">
        <label>Notes (optional)</label>
        <textarea
          placeholder="e.g. Streetlight has been out for a week near the underpass"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>

      <button className="report-submit" onClick={submitReport}>Submit Report — uses current location</button>

      <div className="report-list">
        <h3>Nearby Reports</h3>
        <div>
          {reports.map((r, i) => (
            <div className="report-row" key={i}>
              <div className="ri">{r.icon}</div>
              <div><b>{r.text}</b><span>{r.meta}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
