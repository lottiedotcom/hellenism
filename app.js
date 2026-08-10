// --- TAB NAVIGATION ---
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
  btn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// --- AUDIO/SOUND ---
const actionSound = document.getElementById('action-sound');
function playSound() {
  if (actionSound) {
    actionSound.currentTime = 0;
    actionSound.play().catch(e => console.log("Audio play blocked by browser"));
  }
}

// --- COUNTERS (KHERNIPS & KHARIS) ---
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

// --- ARCHIVE SYSTEM (PETITIONS & JOURNALS) ---
const petitionText = document.getElementById('petition-text');
const sendPetitionBtn = document.getElementById('send-petition-btn');
const petitionArchiveList = document.getElementById('petition-archive-list');

const journalEntry = document.getElementById('journal-entry');
const saveJournalBtn = document.getElementById('save-journal-btn');
const journalArchiveList = document.getElementById('journal-archive-list');

function loadArchives() {
  renderPetitions();
  renderJournals();
}

// Petitions
function renderPetitions() {
  if (!petitionArchiveList) return;
  const petitions = JSON.parse(localStorage.getItem('sanctuary_petitions') || '[]');
  
  if (petitions.length === 0) {
    petitionArchiveList.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">No petitions saved yet (´｡• ᵕ •｡`)</p>';
    return;
  }

  petitionArchiveList.innerHTML = petitions.map((p, index) => `
    <div class="card" style="margin-top:8px; padding:10px; border:1px solid var(--border-blue);">
      <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 6px 0;">${p.date}</p>
      <p style="margin:0 0 8px 0; font-size:0.9rem; line-height:1.4;">${p.text}</p>
      <button class="cute-btn" style="padding:4px 10px; font-size:0.75rem;" onclick="deletePetition(${index})">Delete ✕</button>
    </div>
  `).join('');
}

window.deletePetition = function(index) {
  const petitions = JSON.parse(localStorage.getItem('sanctuary_petitions') || '[]');
  petitions.splice(index, 1);
  localStorage.setItem('sanctuary_petitions', JSON.stringify(petitions));
  renderPetitions();
};

if (sendPetitionBtn) {
  sendPetitionBtn.addEventListener('click', () => {
    if (!petitionText.value.trim()) return;
    const petitions = JSON.parse(localStorage.getItem('sanctuary_petitions') || '[]');
    petitions.unshift({
      date: new Date().toLocaleString(),
      text: petitionText.value.trim()
    });
    localStorage.setItem('sanctuary_petitions', JSON.stringify(petitions));
    petitionText.value = ''; 
    renderPetitions();
    playSound();
  });
}

// Journals
function renderJournals() {
  if (!journalArchiveList) return;
  const journals = JSON.parse(localStorage.getItem('sanctuary_journals') || '[]');
  
  if (journals.length === 0) {
    journalArchiveList.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">No readings saved yet ( ˘▽˘)</p>';
    return;
  }

  journalArchiveList.innerHTML = journals.map((j, index) => `
    <div class="card" style="margin-top:8px; padding:10px; border:1px solid var(--border-blue);">
      <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 6px 0;">${j.date}</p>
      <p style="margin:0 0 8px 0; font-size:0.9rem; line-height:1.4; white-space: pre-wrap;">${j.text}</p>
      <button class="cute-btn" style="padding:4px 10px; font-size:0.75rem;" onclick="deleteJournal(${index})">Delete ✕</button>
    </div>
  `).join('');
}

window.deleteJournal = function(index) {
  const journals = JSON.parse(localStorage.getItem('sanctuary_journals') || '[]');
  journals.splice(index, 1);
  localStorage.setItem('sanctuary_journals', JSON.stringify(journals));
  renderJournals();
};

if (saveJournalBtn) {
  saveJournalBtn.addEventListener('click', () => {
    if (!journalEntry.value.trim()) return;
    const journals = JSON.parse(localStorage.getItem('sanctuary_journals') || '[]');
    journals.unshift({
      date: new Date().toLocaleString(),
      text: journalEntry.value.trim()
    });
    localStorage.setItem('sanctuary_journals', JSON.stringify(journals));
    journalEntry.value = ''; 
    renderJournals();
    playSound();
  });
}

// --- BASIC DIVINATION MOCKUPS ---
const drawCardBtn = document.getElementById('draw-card-btn');
const cardDisplay = document.getElementById('card-display');
const cardName = document.getElementById('card-name');
const cardMeaning = document.getElementById('card-meaning');

if (drawCardBtn) {
  drawCardBtn.addEventListener('click', () => {
    cardName.innerText = "The High Priestess";
    cardMeaning.innerText = "Intuition, mystery, and looking inward.";
    cardDisplay.classList.remove('hidden');
    playSound();
  });
}

const drawDelphicBtn = document.getElementById('draw-delphic-btn');
const delphicDisplay = document.getElementById('delphic-display');
const delphicMaxim = document.getElementById('delphic-maxim');

if (drawDelphicBtn) {
  drawDelphicBtn.addEventListener('click', () => {
    delphicMaxim.innerText = "Know thyself.";
    delphicDisplay.classList.remove('hidden');
    playSound();
  });
}

// Load archives on start
window.addEventListener('DOMContentLoaded', loadArchives);

