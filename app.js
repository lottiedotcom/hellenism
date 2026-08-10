// --- NAVIGATION LOGIC ---
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.add('active');
  });
});

// --- SETTINGS MODAL ---
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsBtns = document.querySelectorAll('.settings-gear-btn');

settingsBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.remove('hidden');
  });
});

if (closeSettingsBtn && settingsModal) {
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

// --- COUNTERS & BUTTONS ---
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
    if (cardName) cardName.innerText = randomCard.name;
    if (cardMeaning) cardMeaning.innerText = randomCard.meaning;
    if (cardDisplay) cardDisplay.classList.remove('hidden');
    playSound();
  });
}

// --- MOON & ASTRONOMY CALCULATIONS ---
function updateAstronomyData() {
  const now = new Date();
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date('2024-01-11T11:57:00Z'); 
  const diff = now - knownNewMoon;
  const days = diff / (1000 * 60 * 60 * 24);
  const cycle = days / synodicMonth;
  let age = (cycle - Math.floor(cycle)) * synodicMonth;

  let phaseName = "";
  if (age < 1.84) phaseName = "New Moon";
  else if (age < 5.53) phaseName = "Waxing Crescent";
  else if (age < 9.22) phaseName = "First Quarter";
  else if (age < 12.91) phaseName = "Waxing Gibbous";
  else if (age < 16.61) phaseName = "Full Moon";
  else if (age < 20.30) phaseName = "Waning Gibbous";
  else if (age < 23.99) phaseName = "Last Quarter";
  else if (age < 27.68) phaseName = "Waning Crescent";
  else phaseName = "New Moon";

  const illumination = Math.round((1 - Math.cos((age / synodicMonth) * 2 * Math.PI)) / 2 * 100);

  if (document.getElementById('moon-phase-name')) document.getElementById('moon-phase-name').innerText = phaseName;
  if (document.getElementById('moon-percentage')) document.getElementById('moon-percentage').innerText = illumination + "%";
  if (document.getElementById('moon-age')) document.getElementById('moon-age').innerText = Math.round(age) + " days";

  const progress = (age / synodicMonth) * 100;
  if (document.getElementById('deipnon-percent')) document.getElementById('deipnon-percent').innerText = Math.round(progress) + "%";
  if (document.getElementById('deipnon-progress')) document.getElementById('deipnon-progress').style.width = progress + "%";

  let daysToDeipnon = Math.round(synodicMonth - age);
  if (daysToDeipnon === Math.round(synodicMonth)) daysToDeipnon = 0;
  
  if (document.getElementById('countdown-deipnon')) document.getElementById('countdown-deipnon').innerText = daysToDeipnon + " Days";
  if (document.getElementById('countdown-noumenia')) document.getElementById('countdown-noumenia').innerText = (daysToDeipnon + 1) + " Days";
  if (document.getElementById('countdown-agathos')) document.getElementById('countdown-agathos').innerText = (daysToDeipnon + 2) + " Days";

  const month = now.getMonth() + 1;
  const day = now.getDate();
  let sign = "";
  
  if ((month == 1 && day <= 20) || (month == 12 && day >=22)) sign = "Capricorn";
  else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) sign = "Aquarius";
  else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) sign = "Pisces";
  else if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) sign = "Aries";
  else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) sign = "Taurus";
  else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) sign = "Gemini";
  else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) sign = "Cancer";
  else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) sign = "Leo";
  else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) sign = "Virgo";
  else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) sign = "Libra";
  else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) sign = "Scorpio";
  else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) sign = "Sagittarius";

  if (document.getElementById('moon-zodiac')) document.getElementById('moon-zodiac').innerText = sign;
  if (document.getElementById('moon-keywords')) document.getElementById('moon-keywords').innerText = "Reflection, Cleansing, Preparation";
}

// --- SUNDOWN & HYMN ---
async function fetchSundown() {
  const sundownText = document.getElementById('sundown-time');
  if (!sundownText) return;
  sundownText.innerText = "~ 6:00 PM";
}

function loadDailyHymn() {
  const hymns = [
    "Hear me, O blessed one, whose light shines upon the earth...",
    "I call upon you, eternal and pure, to bless this hearth...",
    "Goddess of the crossroads, guide my steps in the dark...",
    "Radiant Apollo, bringer of light, heal our spirits today."
  ];
  const today = new Date().getDay();
  if (document.getElementById('daily-hymn')) {
    document.getElementById('daily-hymn').innerText = hymns[today % hymns.length];
  }
}

// --- LOCAL STORAGE ARCHIVES (INSTANT & CRASH-PROOF) ---
function loadLocalArchives() {
  const petitionsContainer = document.getElementById('local-petitions-list');
  const readingsContainer = document.getElementById('local-readings-list');

  let petitions = JSON.parse(localStorage.getItem('localPetitions') || '[]');
  let readings = JSON.parse(localStorage.getItem('localReadings') || '[]');

  if (petitionsContainer) {
    if (petitions.length === 0) {
      petitionsContainer.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted);">No saved petitions yet.</p>`;
    } else {
      petitionsContainer.innerHTML = petitions.map((p, idx) => `
        <div style="background:#fbf9ff; border:1px solid var(--border-blue); padding:10px; border-radius:8px; margin-bottom:10px;">
          <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 4px 0;">${p.date}</p>
          <p style="font-size:0.9rem; margin:0 0 8px 0;">${p.text}</p>
          <button class="cute-btn" style="padding:2px 8px; font-size:0.7rem; background:#e6a3a3;" onclick="deleteLocalPetition(${idx})">Delete ✕</button>
        </div>
      `).join('');
    }
  }

  if (readingsContainer) {
    if (readings.length === 0) {
      readingsContainer.innerHTML = `<p style="text-align:center; font-size:0.85rem; color:var(--text-muted);">No saved readings yet.</p>`;
    } else {
      readingsContainer.innerHTML = readings.map((r, idx) => `
        <div style="background:#fbf9ff; border:1px solid var(--border-blue); padding:10px; border-radius:8px; margin-bottom:10px;">
          <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 4px 0;">${r.date}</p>
          <p style="font-size:0.9rem; margin:0 0 8px 0;">${r.text}</p>
          <button class="cute-btn" style="padding:2px 8px; font-size:0.7rem; background:#e6a3a3;" onclick="deleteLocalReading(${idx})">Delete ✕</button>
        </div>
      `).join('');
    }
  }
}

window.deleteLocalPetition = function(idx) {
  let petitions = JSON.parse(localStorage.getItem('localPetitions') || '[]');
  petitions.splice(idx, 1);
  localStorage.setItem('localPetitions', JSON.stringify(petitions));
  loadLocalArchives();
};

window.deleteLocalReading = function(idx) {
  let readings = JSON.parse(localStorage.getItem('localReadings') || '[]');
  readings.splice(idx, 1);
  localStorage.setItem('localReadings', JSON.stringify(readings));
  loadLocalArchives();
};

const sendPetitionBtn = document.getElementById('send-petition-btn');
const petitionText = document.getElementById('petition-text');
if (sendPetitionBtn && petitionText) {
  sendPetitionBtn.addEventListener('click', () => {
    const val = petitionText.value.trim();
    if (!val) return;
    let petitions = JSON.parse(localStorage.getItem('localPetitions') || '[]');
    petitions.unshift({ text: val, date: new Date().toLocaleString() });
    localStorage.setItem('localPetitions', JSON.stringify(petitions));
    petitionText.value = '';
    playSound();
    loadLocalArchives();
  });
}

const saveJournalBtn = document.getElementById('save-journal-btn');
const journalEntry = document.getElementById('journal-entry');
if (saveJournalBtn && journalEntry) {
  saveJournalBtn.addEventListener('click', () => {
    const val = journalEntry.value.trim();
    if (!val) return;
    let readings = JSON.parse(localStorage.getItem('localReadings') || '[]');
    readings.unshift({ text: val, date: new Date().toLocaleString() });
    localStorage.setItem('localReadings', JSON.stringify(readings));
    journalEntry.value = '';
    playSound();
    loadLocalArchives();
  });
}

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  updateAstronomyData();
  fetchSundown();
  loadDailyHymn();
  loadLocalArchives();
});

