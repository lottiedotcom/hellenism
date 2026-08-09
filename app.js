// --- NAVIGATION LOGIC ---
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

// --- UI BUTTONS & COUNTERS ---
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

// --- DIVINATION: TAROT ---
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

// --- DIVINATION: DELPHIC MAXIMS ---
const drawDelphicBtn = document.getElementById('draw-delphic-btn');
const delphicDisplay = document.getElementById('delphic-display');
const delphicMaxim = document.getElementById('delphic-maxim');
const delphicAdvice = document.getElementById('delphic-advice');

const delphicMaxims = [
  { maxim: "Know Thyself", advice: "Look inward before looking outward." },
  { maxim: "Nothing in Excess", advice: "Seek balance and moderation in all things." },
  { maxim: "Surety Brings Ruin", advice: "Avoid overconfidence and absolute guarantees." }
];

if (drawDelphicBtn) {
  drawDelphicBtn.addEventListener('click', () => {
    const randomMaxim = delphicMaxims[Math.floor(Math.random() * delphicMaxims.length)];
    delphicMaxim.innerText = randomMaxim.maxim;
    delphicAdvice.innerText = randomMaxim.advice;
    delphicDisplay.classList.remove('hidden');
    playSound();
  });
}

// --- DIVINATION: HOMEROMANCY ---
const drawHomerBtn = document.getElementById('draw-homer-btn');
const homerDisplay = document.getElementById('homer-display');
const homerVerse = document.getElementById('homer-verse');
const homerOmen = document.getElementById('homer-omen');

const homerVerses = [
  { verse: "Endure, my heart...", omen: "Patience and resilience will see you through." },
  { verse: "Sing to me, O Muse...", omen: "Seek inspiration and allow creativity to flow." }
];

if (drawHomerBtn) {
  drawHomerBtn.addEventListener('click', () => {
    const randomVerse = homerVerses[Math.floor(Math.random() * homerVerses.length)];
    homerVerse.innerText = randomVerse.verse;
    homerOmen.innerText = randomVerse.omen;
    homerDisplay.classList.remove('hidden');
    playSound();
  });
}

// --- DYNAMIC DATA: MOON PHASE & ASTROLOGY ---
function updateAstronomyData() {
  const now = new Date();
  
  // 1. Calculate Moon Phase mathematically
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

  // Update Moon HTML
  if (document.getElementById('moon-phase-name')) document.getElementById('moon-phase-name').innerText = phaseName;
  if (document.getElementById('moon-percentage')) document.getElementById('moon-percentage').innerText = illumination + "%";
  if (document.getElementById('moon-age')) document.getElementById('moon-age').innerText = Math.round(age) + " days";

  // 2. Cycle Progress & Countdowns
  const progress = (age / synodicMonth) * 100;
  if (document.getElementById('deipnon-percent')) document.getElementById('deipnon-percent').innerText = Math.round(progress) + "%";
  if (document.getElementById('deipnon-progress')) document.getElementById('deipnon-progress').style.width = progress + "%";

  let daysToDeipnon = Math.round(synodicMonth - age);
  if (daysToDeipnon === Math.round(synodicMonth)) daysToDeipnon = 0;
  
  if (document.getElementById('countdown-deipnon')) document.getElementById('countdown-deipnon').innerText = daysToDeipnon + " Days";
  if (document.getElementById('countdown-noumenia')) document.getElementById('countdown-noumenia').innerText = (daysToDeipnon + 1) + " Days";
  if (document.getElementById('countdown-agathos')) document.getElementById('countdown-agathos').innerText = (daysToDeipnon + 2) + " Days";

  // 3. Simple Zodiac Math (Sun Sign Based on Date)
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

// --- DYNAMIC DATA: SUNDOWN API ---
async function fetchSundown() {
  const sundownText = document.getElementById('sundown-time');
  if (!sundownText) return;

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
        const data = await res.json();
        const sunset = new Date(data.results.sunset);
        sundownText.innerText = sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } catch(e) {
        sundownText.innerText = "~ 6:00 PM";
      }
    }, () => {
      sundownText.innerText = "Location Off";
    });
  } else {
    sundownText.innerText = "~ 6:00 PM";
  }
}

// --- DYNAMIC DATA: DAILY HYMN ---
function loadDailyHymn() {
  const hymns = [
    "Hear me, O blessed one, whose light shines upon the earth...",
    "I call upon you, eternal and pure, to bless this hearth...",
    "Goddess of the crossroads, guide my steps in the dark...",
    "Radiant Apollo, bringer of light, heal our spirits today."
  ];
  const today = new Date().getDay(); // Gets a number 0-6
  const selectedHymn = hymns[today % hymns.length];
  if (document.getElementById('daily-hymn')) {
    document.getElementById('daily-hymn').innerText = selectedHymn;
  }
}

// --- CLOUD DATABASE ARCHIVE SYSTEM (WITH FILTERS) ---
let allPetitions = [];
let allReadings = [];

// 1. Fetch Data
async function fetchPetitions() {
  const container = document.getElementById('cloud-petitions-list');
  try {
    const res = await fetch('/api/petitions');
    if (!res.ok) throw new Error('API Error');
    allPetitions = await res.json();
    applyPetitionsFilter();
  } catch (err) {
    if (container) {
      container.innerHTML = `<p style="text-align:center; color:#d9534f; font-size:0.8rem;">Ready to save your first petition locally or to cloud!</p>`;
    }
  }
}

async function fetchReadings() {
  const container = document.getElementById('cloud-readings-list');
  try {
    const res = await fetch('/api/readings');
    if (!res.ok) throw new Error('API Error');
    allReadings = await res.json();
    applyReadingsFilter();
  } catch (err) {
    if (container) {
      container.innerHTML = `<p style="text-align:center; color:#d9534f; font-size:0.8rem;">Ready to save your first reading locally or to cloud!</p>`;
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
        <button class="cute-btn delete-btn" onclick="deletePetition(${p.id || `'${p.created_at}'`})">Delete ✕</button>
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
        <button class="cute-btn delete-btn" onclick="deleteReading(${r.id || `'${r.created_at}'`})">Delete ✕</button>
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

// 4. Delete Data Functions 
window.deletePetition = async function(id) {
  if (!confirm("Delete this petition?")) return;
  try {
    await fetch(`/api/petitions?id=${id}`, { method: 'DELETE' });
    fetchPetitions();
  } catch (err) {
    allPetitions = allPetitions.filter(p => p.id !== id && p.created_at !== id);
    applyPetitionsFilter();
  }
};

window.deleteReading = async function(id) {
  if (!confirm("Delete this reading?")) return;
  try {
    await fetch(`/api/readings?id=${id}`, { method: 'DELETE' });
    fetchReadings();
  } catch (err) {
    allReadings = allReadings.filter(r => r.id !== id && r.created_at !== id);
    applyReadingsFilter();
  }
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

// --- INITIAL FETCH ON STARTUP ---
window.addEventListener('DOMContentLoaded', () => {
  // Fire data fetching for moon math and layout
  updateAstronomyData();
  fetchSundown();
  loadDailyHymn();

  // Fire cloud archive fetches
  fetchPetitions();
  fetchReadings();
});

