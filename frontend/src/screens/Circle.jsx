import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProfileMenu from '../components/ProfileMenu.jsx'

const INITIAL_CONTACTS = [
  { name: 'Priya Nair', meta: '2 min away · Sister', watching: true },
  { name: 'Rhea Kapoor', meta: 'Roommate', watching: true },
  { name: 'Sam Verma', meta: 'Best friend', watching: true },
  { name: 'Amit Singh', meta: 'Colleague', watching: false }
]

export default function Circle({ userName, onLogOut }) {
  const { showToast } = useApp()
  const [contacts, setContacts] = useState(INITIAL_CONTACTS)
  const [formOpen, setFormOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  function addContact() {
    if (!newName.trim()) {
      showToast('Enter a contact name')
      return
    }
    setContacts((c) => [...c, { name: newName.trim(), meta: newPhone.trim() || 'No number added', watching: true }])
    showToast(`${newName.trim()} added to your Guardian Circle`)
    setNewName('')
    setNewPhone('')
    setFormOpen(false)
  }

  return (
    <div className="screen-inner">
      <div className="p-head">
        <div><h2>Guardian Circle</h2><p>3 people watching over you</p></div>
        <ProfileMenu initial={userName?.[0]?.toUpperCase() || 'V'} onLogOut={onLogOut} />
      </div>

      <div className="orbit">
        <div className="orbit-ring r1"></div>
        <div className="orbit-ring r2"></div>
        <div className="orbit-center">{userName?.[0]?.toUpperCase() || 'V'}</div>
        <div className="node n1">P<div className="gdot"></div></div>
        <div className="node n2">R<div className="gdot"></div></div>
        <div className="node n3 away">A<div className="gdot"></div></div>
        <div className="node n4">S<div className="gdot"></div></div>
        <div className="node n5 away">K<div className="gdot"></div></div>
      </div>

      <div>
        {contacts.map((c, i) => (
          <div className="contact-row" key={i}>
            <div className="ca">{c.name.charAt(0).toUpperCase()}</div>
            <div><b>{c.name}</b><span>{c.meta}</span></div>
            <div className="contact-actions">
              <button onClick={() => showToast(`Calling ${c.name}…`)}>📞</button>
              <button onClick={() => showToast(`Message sent to ${c.name}`)}>💬</button>
            </div>
            <div className={`tag ${c.watching ? 'on' : 'off'}`}>{c.watching ? 'WATCHING' : 'OFFLINE'}</div>
          </div>
        ))}
      </div>

      <button className="add-contact-btn" onClick={() => setFormOpen((o) => !o)}>+ Add Emergency Contact</button>
      <div className={`mini-form ${formOpen ? 'open' : ''}`}>
        <input type="text" placeholder="Contact name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input type="tel" placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
        <button onClick={addContact}>Save Contact</button>
      </div>
    </div>
  )
}
