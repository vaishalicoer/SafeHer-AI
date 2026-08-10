import React from 'react'

export default function AdminDashboard({ show, onClose }) {
  return (
    <div id="adminOverlay" className={show ? 'show' : ''}>
      <div className="admin-wrap">
        <div className="admin-topbar">
          <div className="atitle">
            <div className="mark">📊</div>
            <h1>SafeHer AI — Admin Console</h1>
          </div>
          <button className="admin-close" onClick={onClose}>Close ✕</button>
        </div>

        <div className="kpi-row">
          <div className="kpi-card"><span>Total Users</span><b>18,204</b><div className="delta up">▲ 4.2% this week</div></div>
          <div className="kpi-card"><span>Active SOS Alerts</span><b>2</b><div className="delta warn">Live now</div></div>
          <div className="kpi-card"><span>Avg. Response Time</span><b>0.8s</b><div className="delta up">▼ 0.2s faster</div></div>
          <div className="kpi-card"><span>Unsafe Reports (7d)</span><b>146</b><div className="delta warn">▲ 12 vs last week</div></div>
        </div>

        <div className="admin-grid">
          <div className="panel-card">
            <h3>SOS Alerts — Last 7 Days</h3>
            <svg viewBox="0 0 460 140" width="100%" height="140">
              <polyline points="0,110 65,95 130,100 195,60 260,75 325,40 390,50 460,20" fill="none" stroke="#FF5C7A" strokeWidth="2.5" />
              <polyline points="0,110 65,95 130,100 195,60 260,75 325,40 390,50 460,20" fill="url(#g1)" stroke="none" opacity="0.15" />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5C7A" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <g stroke="#2A2760">
                <line x1="0" y1="35" x2="460" y2="35" />
                <line x1="0" y1="70" x2="460" y2="70" />
                <line x1="0" y1="105" x2="460" y2="105" />
              </g>
            </svg>
          </div>
          <div className="panel-card">
            <h3>Reports by Area Type</h3>
            <svg viewBox="0 0 220 140" width="100%" height="140">
              <g fontSize="9" fill="#9691C4" fontFamily="JetBrains Mono">
                <rect x="10" y="30" width="24" height="90" fill="#FF5C7A" /><text x="6" y="132">Lighting</text>
                <rect x="55" y="55" width="24" height="65" fill="#FFC15E" /><text x="52" y="132">Harass.</text>
                <rect x="100" y="75" width="24" height="45" fill="#8177FF" /><text x="93" y="132">Isolated</text>
                <rect x="145" y="90" width="24" height="30" fill="#49E0B3" /><text x="136" y="132">Suspic.</text>
                <rect x="190" y="100" width="24" height="20" fill="#615D93" /><text x="188" y="132">Other</text>
              </g>
            </svg>
          </div>
        </div>

        <div className="admin-grid">
          <div className="panel-card">
            <h3>Recent Incidents</h3>
            <table className="admin-table">
              <tbody>
                <tr><th>Time</th><th>User</th><th>Type</th><th>Status</th></tr>
                <tr><td>9:41 PM</td><td>V. Sharma</td><td>SOS Alert</td><td><span className="status-pill active">Active</span></td></tr>
                <tr><td>8:55 PM</td><td>R. Kapoor</td><td>Unsafe Report</td><td><span className="status-pill review">Review</span></td></tr>
                <tr><td>7:20 PM</td><td>S. Verma</td><td>Auto-alert (stalled)</td><td><span className="status-pill resolved">Resolved</span></td></tr>
                <tr><td>6:04 PM</td><td>A. Iyer</td><td>SOS Alert</td><td><span className="status-pill resolved">Resolved</span></td></tr>
                <tr><td>4:47 PM</td><td>P. Nair</td><td>Unsafe Report</td><td><span className="status-pill resolved">Resolved</span></td></tr>
              </tbody>
            </table>
          </div>
          <div className="panel-card">
            <h3>Guardians Online Now</h3>
            <div className="online-row"><div className="od"></div>Priya Nair — watching Vaishali S.</div>
            <div className="online-row"><div className="od"></div>Rhea Kapoor — watching Vaishali S.</div>
            <div className="online-row"><div className="od"></div>Sam Verma — watching Vaishali S.</div>
            <div className="online-row" style={{ borderBottom: 'none' }}>
              <div className="od" style={{ background: 'var(--text-faint)' }}></div>Amit Singh — offline
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
