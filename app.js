// --- NAVIGATION ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// --- SETTINGS MODAL ---
const settingsBtn = document.querySelectorAll('.settings-gear-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');

settingsBtn.forEach(btn => {
  btn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
});
if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
}

// --- AUDIO ---
const actionSound = document.getElementById('action-sound');
function playSound() {
  if (actionSound) {
    actionSound.currentTime = 0;
    actionSound.play().catch(() => {});
  }
}

// --- COUNTERS ---
let khernipsCount = parseInt(localStorage.getItem('khernipsCount') || '0');
let kharisCount = parseInt(localStorage.getItem('kharisCount') || '0');

const khernipsBtn = document.getElementById('khernips-btn');
const kharisBtn = document.getElementById('kharis-btn');
const kharisCountDisplay = document.getElementById('kharis-count');

if (khernipsBtn) {
  khernipsBtn.innerText = `Wash Hands (${khernipsCount})`;
  khernipsBtn.addEventListener('click', () => {
    khernipsCount++;
    localStorage.setItem('khernipsCount', khernipsCount);
    khernipsBtn.innerText = `Wash Hands (${khernipsCount})`;
    playSound();
  });
}

if (kharisBtn && kharisCountDisplay) {
  kharisCountDisplay.innerText = kharisCount;
  kharisBtn.addEventListener('click', () => {
    kharisCount++;
    localStorage.setItem('kharisCount', kharisCount);
    kharisCountDisplay.innerText = kharisCount;
    playSound();
  });
}

// --- CLOUD DATABASE ARCHIVE SYSTEM ---
let allPetitions = [];
let allReadings = [];

// 1. Fetch Data
async function fetchPetitions() {
  const container = document.getElementById('cloud-petitions-list');
  try {
    const res = await fetch('/api/petitions');
    allPetitions = await res.json();
    applyPetitionsFilter();
  } catch (err) {
    if (container) {
      container.innerHTML = `<p style="text-align:center; color:#d9534f; font-size:0.8rem;">Failed to load cloud petitions.</p>`;
    }
  }
}

async function fetchReadings() {
  const container = document.getElementById('cloud-readings-list');
  try {
    const res = await fetch('/api/readings');
    allReadings = await res.json();
    applyReadingsFilter();
  } catch (err) {
    if (container) {
      container.innerHTML = `<p style="text-align:center; color:#d9534f; font-size:0.8rem;">Failed to load cloud readings.</p>`;
    }
  }
}

// 2. Render Data
function renderPetitions(items) {
  const container = document.getElementById('cloud-petitions-list');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted);">No cloud petitions found (´｡• ᵕ •｡`)</p>`;
    return;
  }

  container.innerHTML = items.map(p => {
    const formattedDate = new Date(p.created_at).toLocaleString();
    return `
      <div class="archive-item">
        <p class="archive-date">${formattedDate}</p>
        <p class="archive-text">${p.text}</p>
        <button class="cute-btn delete-btn" onclick="deletePetition(${p.id})">Delete ✕</button>
      </div>
    `;
  }).join('');
}

function renderReadings(items) {
  const container = document.getElementById('cloud-readings-list');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted);">No cloud readings found ( ˘▽˘)</p>`;
    return;
  }

  container.innerHTML = items.map(r => {
    const formattedDate = new Date(r.created_at).toLocaleString();
    return `
      <div class="archive-item">
        <p class="archive-date">${formattedDate}</p>
        <p class="archive-text">${r.text}</p>
        <button class="cute-btn delete-btn" onclick="deleteReading(${r.id})">Delete ✕</button>
      </div>
    `;
  }).join('');
}

// 3. Save Data
const sendPetitionBtn = document.getElementById('send-petition-btn');
const petitionText = document.getElementById('petition-text');

if (sendPetitionBtn) {
  sendPetitionBtn.addEventListener('click', async () => {
    const val = petitionText.value.trim();
    if (!val) return;
    
    sendPetitionBtn.disabled = true;
    sendPetitionBtn.innerText = "Saving to Cloud...";
    
    try {
      await fetch('/api/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: val })
      });
      petitionText.value = '';
      playSound();
      await fetchPetitions();
    } catch (e) {
      alert("Error saving petition to cloud database");
    } finally {
      sendPetitionBtn.disabled = false;
      sendPetitionBtn.innerText = "Send to Cloud Archive ( ✧ )";
    }
  });
}

const saveJournalBtn = document.getElementById('save-journal-btn');
const journalEntry = document.getElementById('journal-entry');

if (saveJournalBtn) {
  saveJournalBtn.addEventListener('click', async () => {
    const val = journalEntry.value.trim();
    if (!val) return;

    saveJournalBtn.disabled = true;
    saveJournalBtn.innerText = "Saving to Cloud...";

    try {
      await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: val })
      });
      journalEntry.value = '';
      playSound();
      await fetchReadings();
    } catch (e) {
      alert("Error saving reading to cloud database");
    } finally {
      saveJournalBtn.disabled = false;
      saveJournalBtn.innerText = "Save Reading to Cloud ( ✧ )";
    }
  });
}

// 4. Delete Data
window.deletePetition = async function(id) {
  if (!confirm("Delete this petition from the cloud?")) return;
  await fetch(`/api/petitions?id=${id}`, { method: 'DELETE' });
  fetchPetitions();
};

window.deleteReading = async function(id) {
  if (!confirm("Delete this reading from the cloud?")) return;
  await fetch(`/api/readings?id=${id}`, { method: 'DELETE' });
  fetchReadings();
};

// 5. Date & Keyword Filtering Logic
const filterPetitionsInput = document.getElementById('filter-petitions-input');
const filterPetitionsDate = document.getElementById('filter-petitions-date');
const clearPetitionsDateBtn = document.getElementById('clear-petitions-date-btn');

function applyPetitionsFilter() {
  const query = filterPetitionsInput ? filterPetitionsInput.value.toLowerCase() : '';
  const selectedDate = filterPetitionsDate ? filterPetitionsDate.value : ''; 

  const filtered = allPetitions.filter(p => {
    const itemDate = new Date(p.created_at);
    // Format item date as YYYY-MM-DD
    const formattedItemDate = itemDate.toISOString().split('T')[0];
    const matchesText = p.text.toLowerCase().includes(query) || itemDate.toLocaleString().toLowerCase().includes(query);
    const matchesDate = !selectedDate || formattedItemDate === selectedDate;

    return matchesText && matchesDate;
  });
  renderPetitions(filtered);
}

if (filterPetitionsInput) filterPetitionsInput.addEventListener('input', applyPetitionsFilter);
if (filterPetitionsDate) filterPetitionsDate.addEventListener('change', applyPetitionsFilter);
if (clearPetitionsDateBtn) {
  clearPetitionsDateBtn.addEventListener('click', () => {
    if (filterPetitionsDate) filterPetitionsDate.value = '';
    applyPetitionsFilter();
  });
}

const filterReadingsInput = document.getElementById('filter-readings-input');
const filterReadingsDate = document.getElementById('filter-readings-date');
const clearReadingsDateBtn = document.getElementById('clear-readings-date-btn');

function applyReadingsFilter() {
  const query = filterReadingsInput ? filterReadingsInput.value.toLowerCase() : '';
  const selectedDate = filterReadingsDate ? filterReadingsDate.value : '';

  const filtered = allReadings.filter(r => {
    const itemDate = new Date(r.created_at);
    const formattedItemDate = itemDate.toISOString().split('T')[0];
    const matchesText = r.text.toLowerCase().includes(query) || itemDate.toLocaleString().toLowerCase().includes(query);
    const matchesDate = !selectedDate || formattedItemDate === selectedDate;

    return matchesText && matchesDate;
  });
  renderReadings(filtered);
}

if (filterReadingsInput) filterReadingsInput.addEventListener('input', applyReadingsFilter);
if (filterReadingsDate) filterReadingsDate.addEventListener('change', applyReadingsFilter);
if (clearReadingsDateBtn) {
  clearReadingsDateBtn.addEventListener('click', () => {
    if (filterReadingsDate) filterReadingsDate.value = '';
    applyReadingsFilter();
  });
}

// Initial Fetch on Startup
window.addEventListener('DOMContentLoaded', () => {
  fetchPetitions();
  fetchReadings();
});

