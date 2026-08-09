// --- NAVIGATION LOGIC ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons and views
    navBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    
    // Add active class to clicked button and target view
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// --- SETTINGS MODAL ---
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsBtns = document.querySelectorAll('.settings-gear-btn');

settingsBtns.forEach(btn => {
  btn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
});

if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
}

// --- SOUND EFFECTS ---
const actionSound = document.getElementById('action-sound');
function playSound() {
  if (actionSound) {
    actionSound.currentTime = 0;
    actionSound.play().catch(() => {});
  }
}

// --- ALTAR COUNTERS & BUTTONS ---
let khernipsCount = parseInt(localStorage.getItem('khernipsCount') || '0');
let kharisCount = parseInt(localStorage.getItem('kharisCount') || '0');

const khernipsBtn = document.getElementById('khernips-btn');
const kharisBtn = document.getElementById('kharis-btn');
const kharisCountDisplay = document.getElementById('kharis-count');
const hestiaBtn = document.getElementById('hestia-ritual-btn');

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

if (hestiaBtn) {
  hestiaBtn.addEventListener('click', () => {
    playSound();
    hestiaBtn.innerText = "Hearth Lit ( 🔥 )";
    setTimeout(() => { hestiaBtn.innerText = "Light the Hearth of Hestia ( ♨ )"; }, 3000);
  });
}

// --- PRAYER PROMPT GENERATOR ---
const promptBtn = document.getElementById('prompt-generator-btn');
const promptDisplay = document.getElementById('prompt-display');
const prompts = [
  "Express gratitude for a recent small blessing.",
  "Ask for guidance on an upcoming decision.",
  "Reflect on a challenge and ask for strength.",
  "Offer praise to a deity you feel drawn to today."
];

if (promptBtn && promptDisplay) {
  promptBtn.addEventListener('click', () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    promptDisplay.innerText = randomPrompt;
    promptDisplay.classList.remove('hidden');
    playSound();
  });
}

// --- TAROT DRAW LOGIC ---
const drawCardBtn = document.getElementById('draw-card-btn');
const cardDisplay = document.getElementById('card-display');
const cardName = document.getElementById('card-name');
const cardMeaning = document.getElementById('card-meaning');

const tarotCards = [
  { name: "The Star (✧)", meaning: "Hope, inspiration, and spiritual guidance." },
  { name: "The Moon (☽)", meaning: "Intuition, dreams, and navigating the subconscious." },
  { name: "The Sun (☼)", meaning: "Joy, success, and clear visibility." },
  { name: "High Priestess (𐦯)", meaning: "Inner wisdom, mystery, and divine knowledge." }
];

if (drawCardBtn) {
  drawCardBtn.addEventListener('click', () => {
    const randomCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    cardName.innerText = randomCard.name;
    cardMeaning.innerText = randomCard.meaning;
    cardDisplay.classList.remove('hidden');
    playSound();
  });
}

// --- CLOUD DATABASE LOGIC (VERCEL API) ---
let allPetitions = [];
let allReadings = [];

// 1. Fetch Data
async function fetchPetitions() {
  const container = document.getElementById('cloud-petitions-list');
  try {
    const res = await fetch('/api/petitions');
    if (!res.ok) throw new Error('Network response was not ok');
    allPetitions = await res.json();
    applyPetitionsFilter();
  } catch (err) {
    if (container) container.innerHTML = `<p style="text-align:center; color:#d9534f; font-size:0.8rem;">Ready to save your first petition locally or to cloud!</p>`;
  }
}

async function fetchReadings() {
  const container = document.getElementById('cloud-readings-list');
  try {
    const res = await fetch('/api/readings');
    if (!res.ok) throw new Error('Network response was not ok');
    allReadings = await res.json();
    applyReadingsFilter();
  } catch (err) {
    if (container) container.innerHTML = `<p style="text-align:center; color:#d9534f; font-size:0.8rem;">Ready to save your first reading locally or to cloud!</p>`;
  }
}

// 2. Render Data
function renderPetitions(items) {
  const container = document.getElementById('cloud-petitions-list');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted);">No petitions found for this date (´｡• ᵕ •｡`)</p>`;
    return;
  }
  container.innerHTML = items.map(p => `
    <div style="background:#fbf9ff; border:1px solid var(--border-blue); padding:10px; border-radius:8px; margin-bottom:10px;">
      <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 5px 0;">${new Date(p.created_at).toLocaleString()}</p>
      <p style="font-size:0.9rem; margin:0;">${p.text}</p>
    </div>
  `).join('');
}

function renderReadings(items) {
  const container = document.getElementById('cloud-readings-list');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted);">No readings found for this date ( ˘▽˘)</p>`;
    return;
  }
  container.innerHTML = items.map(r => `
    <div style="background:#fbf9ff; border:1px solid var(--border-blue); padding:10px; border-radius:8px; margin-bottom:10px;">
      <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 5px 0;">${new Date(r.created_at).toLocaleString()}</p>
      <p style="font-size:0.9rem; margin:0;">${r.text}</p>
    </div>
  `).join('');
}

// 3. Save Data (Petitions)
const sendPetitionBtn = document.getElementById('send-petition-btn');
const petitionText = document.getElementById('petition-text');

if (sendPetitionBtn) {
  sendPetitionBtn.addEventListener('click', async () => {
    const val = petitionText.value.trim();
    if (!val) return;
    
    sendPetitionBtn.disabled = true;
    sendPetitionBtn.innerText = "Saving...";
    
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
      console.log("Saving locally as fallback");
      allPetitions.unshift({ text: val, created_at: new Date().toISOString() });
      applyPetitionsFilter();
      petitionText.value = '';
      playSound();
    } finally {
      sendPetitionBtn.disabled = false;
      sendPetitionBtn.innerText = "Send to Cloud Archive ( ✧ )";
    }
  });
}

// 4. Save Data (Readings)
const saveJournalBtn = document.getElementById('save-journal-btn');
const journalEntry = document.getElementById('journal-entry');

if (saveJournalBtn) {
  saveJournalBtn.addEventListener('click', async () => {
    const val = journalEntry.value.trim();
    if (!val) return;

    saveJournalBtn.disabled = true;
    saveJournalBtn.innerText = "Saving...";

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
      console.log("Saving locally as fallback");
      allReadings.unshift({ text: val, created_at: new Date().toISOString() });
      applyReadingsFilter();
      journalEntry.value = '';
      playSound();
    } finally {
      saveJournalBtn.disabled = false;
      saveJournalBtn.innerText = "Save Reading to Cloud ( ✧ )";
    }
  });
}

// 5. Date Filtering
const filterPetitionsDate = document.getElementById('filter-petitions-date');
const clearPetitionsDateBtn = document.getElementById('clear-petitions-date-btn');

function applyPetitionsFilter() {
  const selectedDate = filterPetitionsDate ? filterPetitionsDate.value : ''; 
  const filtered = allPetitions.filter(p => {
    if (!selectedDate) return true;
    return new Date(p.created_at).toISOString().split('T')[0] === selectedDate;
  });
  renderPetitions(filtered);
}

if (filterPetitionsDate) filterPetitionsDate.addEventListener('change', applyPetitionsFilter);
if (clearPetitionsDateBtn) {
  clearPetitionsDateBtn.addEventListener('click', () => {
    if (filterPetitionsDate) filterPetitionsDate.value = '';
    applyPetitionsFilter();
  });
}

const filterReadingsDate = document.getElementById('filter-readings-date');
const clearReadingsDateBtn = document.getElementById('clear-readings-date-btn');

function applyReadingsFilter() {
  const selectedDate = filterReadingsDate ? filterReadingsDate.value : '';
  const filtered = allReadings.filter(r => {
    if (!selectedDate) return true;
    return new Date(r.created_at).toISOString().split('T')[0] === selectedDate;
  });
  renderReadings(filtered);
}

if (filterReadingsDate) filterReadingsDate.addEventListener('change', applyReadingsFilter);
if (clearReadingsDateBtn) {
  clearReadingsDateBtn.addEventListener('click', () => {
    if (filterReadingsDate) filterReadingsDate.value = '';
    applyReadingsFilter();
  });
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  fetchPetitions();
  fetchReadings();
});

