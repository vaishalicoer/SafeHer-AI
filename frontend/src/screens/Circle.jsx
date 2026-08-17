import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProfileMenu from '../components/ProfileMenu.jsx'
import { addEmergencyContact, getEmergencyContacts, deleteEmergencyContact } from '../api.js'

const CATEGORIES = ["Family", "Friend", "Warden", "Security", "Hospital", "Helpline", "Other"]

export default function Circle({ userName, onLogOut }) {
  const { showToast } = useApp()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRelation, setNewRelation] = useState('')
  const [newCategory, setNewCategory] = useState('Family')

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    setLoading(true)
    const result = await getEmergencyContacts()
    if (result.success) {
      setContacts(result.contacts)
    }
    setLoading(false)
  }

  async function addContact() {
    if (!newName.trim()) {
      showToast('Enter a contact name')
      return
    }
    if (!newPhone.trim()) {
      showToast('Enter a phone number')
      return
    }

    const result = await addEmergencyContact(
      newName.trim(),
      newPhone.trim(),
      newRelation.trim() || newCategory,
      newCategory
    )

    if (result.success) {
      showToast(`${newName.trim()} added to your Guardian Circle`)
      setNewName('')
      setNewPhone('')
      setNewRelation('')
      setNewCategory('Family')
      setFormOpen(false)
      loadContacts()
    } else {
      showToast(result.message || 'Could not add contact')
    }
  }

  async function handleDelete(id, name) {
    const result = await deleteEmergencyContact(id)
    if (result.success) {
      showToast(`${name} removed`)
      loadContacts()
    }
  }

  // Group contacts by category for the directory view
  const grouped = contacts.reduce((acc, c) => {
    const cat = c.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  return (
    <div className="screen-inner">
      <div className="p-head">
        <div><h2>Guardian Circle</h2><p>{contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''}</p></div>
        <ProfileMenu initial={userName?.[0]?.toUpperCase() || 'V'} onLogOut={onLogOut} />
      </div>

      {loading ? (
        <p style={{ padding: 16, color: 'var(--text-faint)' }}>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p style={{ padding: 16, color: 'var(--text-faint)' }}>No emergency contacts yet — add one below.</p>
      ) : (
        Object.keys(grouped).map((category) => (
          <div key={category} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-faint)', padding: '8px 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {category}
            </div>
            {grouped[category].map((c) => (
              <div className="contact-row" key={c._id}>
                <div className="ca">{c.name.charAt(0).toUpperCase()}</div>
                <div><b>{c.name}</b><span>{c.relation} · {c.phone}</span></div>
                <div className="contact-actions">
                  <a href={`tel:${c.phone}`}><button>📞</button></a>
                  <button onClick={() => handleDelete(c._id, c.name)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <button className="add-contact-btn" onClick={() => setFormOpen((o) => !o)}>+ Add Emergency Contact</button>
      <div className={`mini-form ${formOpen ? 'open' : ''}`}>
        <input type="text" placeholder="Contact name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input type="tel" placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
        <input type="text" placeholder="Relation (e.g. Mother, Warden)" value={newRelation} onChange={(e) => setNewRelation(e.target.value)} />
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 8 }}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={addContact}>Save Contact</button>
      </div>
    </div>
  )
}