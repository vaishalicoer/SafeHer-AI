const API_URL = "https://safeher-ai-21wi.onrender.com";

// ================= AUTH =================

export async function registerUser(name, email, phone, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ================= JOURNEY (Walk With Me) =================

export async function startJourney(latitude, longitude, guardianContact) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/journey/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ latitude, longitude, guardianContact }),
  });
  return res.json();
}

export async function updateJourneyLocation(journeyId, latitude, longitude) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/journey/update-location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ journeyId, latitude, longitude }),
  });
  return res.json();
}

export async function endJourney(journeyId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/journey/end`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ journeyId }),
  });
  return res.json();
}

export async function getActiveJourney() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/journey/active`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

// ================= EMERGENCY CONTACTS =================

export async function addEmergencyContact(name, phone, relation, category) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/emergency`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone, relation, category }),
  });
  return res.json();
}

export async function getEmergencyContacts() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/emergency`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function deleteEmergencyContact(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/emergency/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

// ================= SOS =================

export async function triggerSOS(latitude, longitude) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/sos/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ latitude, longitude }),
  });
  return res.json();
}

export async function cancelSOS() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/sos/cancel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export default API_URL;