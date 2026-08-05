// Tarot Card Draw from JSON
document.getElementById("draw-card-btn").addEventListener("click", async () => {
if(typeof playSound === 'function') playSound();
const display = document.getElementById("card-display");
const nameEl = document.getElementById("card-name");
const meaningEl = document.getElementById("card-meaning");

display.classList.remove("hidden");
nameEl.innerText = "Shuffling... ( ˘▽˘)";
meaningEl.innerText = "";

try {
const response = await fetch("tarot.json");
const tarotDeck = await response.json();

const randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];

nameEl.innerText = randomCard.name;
meaningEl.innerHTML = `<strong>Keywords:</strong> ${randomCard.keywords.join(" • ")}<br><br>${randomCard.meaning}`;
} catch (error) {
nameEl.innerText = "Error (x_x)";
meaningEl.innerText = "Could not load tarot.json. Make sure the file is in the same folder!";
}
});

// ==========================================
// SHRINE & ALTAR FEATURES 
// ==========================================

const deities = ["Hestia", "Hekate", "Apollo", "Hermes"];
let shrineData = JSON.parse(localStorage.getItem('shrineData')) || {};

deities.forEach(d => {
    if(!shrineData[d]) shrineData[d] = { offerings: [], sketch: null, petitions: [] };
});

let currentShrine = document.getElementById('deity-focus-input').value;

document.getElementById('deity-focus-input').addEventListener('change', (e) => {
    currentShrine = e.target.value;
    saveAndRenderShrine();
});

function saveAndRenderShrine() {
    localStorage.setItem('shrineData', JSON.stringify(shrineData));
    const canvas = document.getElementById('altar-canvas');
    
    const currentOfferings = canvas.querySelectorAll('.draggable-offering');
    currentOfferings.forEach(o => o.remove());

    const data = shrineData[currentShrine];

    const frame = document.getElementById('sketch-frame');
    if (data.sketch) {
        frame.innerHTML = `<img src="${data.sketch}" alt="Devotional Sketch">`;
    } else {
        frame.innerHTML = `<span id="sketch-placeholder">Frame<br>(Tap to set)</span>`;
    }

    data.offerings.forEach(off => {
        const img = document.createElement('img');
        img.src = off.src;
        img.className = 'draggable-offering';
        img.style.left = off.x + 'px';
        img.style.top = off.y + 'px';
        canvas.appendChild(img);
        makeDraggable(img, off.id);
    });
}

document.getElementById('upload-offering').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        shrineData[currentShrine].offerings.push({
            id: Date.now(),
            src: event.target.result,
            x: 20, 
            y: 20
        });
        saveAndRenderShrine();
    };
    reader.readAsDataURL(file);
    this.value = ''; 
});

document.getElementById('upload-sketch').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        shrineData[currentShrine].sketch = event.target.result;
        saveAndRenderShrine();
    };
    reader.readAsDataURL(file);
    this.value = '';
});

function makeDraggable(el, offeringId) {
    let offsetX = 0, offsetY = 0;
    let startX, startY, isDragging = false;

    function dragStart(e) {
        e.preventDefault();
        isDragging = false;
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;

        const rect = el.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        document.addEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', dragMove, {passive: false});
        document.addEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', dragEnd);
    }

    function dragMove(e) {
        e.preventDefault();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
            isDragging = true;
        }

        if (isDragging) {
            const canvas = document.getElementById("altar-canvas");
            const canvasRect = canvas.getBoundingClientRect();

            let newX = clientX - canvasRect.left - offsetX;
            let newY = clientY - canvasRect.top - offsetY;

            newX = Math.max(0, Math.min(newX, canvasRect.width - el.offsetWidth));
            newY = Math.max(0, Math.min(newY, canvasRect.height - el.offsetHeight));

            el.style.left = newX + "px";
            el.style.top = newY + "px";
        }
    }

    function dragEnd(e) {
        document.removeEventListener(e.type.includes('touch') ? 'touchmove' : 'mousemove', dragMove);
        document.removeEventListener(e.type.includes('touch') ? 'touchend' : 'mouseup', dragEnd);

        if (!isDragging) {
            if(confirm("Remove this offering?")) {
                shrineData[currentShrine].offerings = shrineData[currentShrine].offerings.filter(o => o.id !== offeringId);
                saveAndRenderShrine();
            }
        } else {
            const offering = shrineData[currentShrine].offerings.find(o => o.id === offeringId);
            if (offering) {
                offering.x = parseInt(el.style.left);
                offering.y = parseInt(el.style.top);
                saveAndRenderShrine();
            }
        }
    }

    el.addEventListener('mousedown', dragStart);
    el.addEventListener('touchstart', dragStart, {passive: false});
}

document.getElementById('prompt-generator-btn').addEventListener('click', () => {
    const hour = new Date().getHours();
    let prompt = "";
    if (hour >= 5 && hour < 12) {
        prompt = "Morning Reflection: What intentions are you setting for today's daylight?";
    } else if (hour >= 12 && hour < 18) {
        prompt = "Afternoon Check-in: How are you maintaining your energy and alignment?";
    } else {
        prompt = "Nighttime Reflection: What burdens can you release to the dark, and what are you grateful for today?";
    }
    
    const promptDisplay = document.getElementById('prompt-display');
    promptDisplay.innerText = prompt;
    promptDisplay.classList.remove('hidden');
});

document.getElementById('send-petition-btn').addEventListener('click', () => {
    const textArea = document.getElementById('petition-text');
    if(textArea.value.trim() === '') return;
    
    shrineData[currentShrine].petitions.push(textArea.value);
    localStorage.setItem('shrineData', JSON.stringify(shrineData));

    textArea.classList.add('fade-out');
    
    const container = document.getElementById('sparkle-container');
    const sparkle = document.createElement('div');
    sparkle.innerText = '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧';
    sparkle.className = 'sparkle-anim';
    container.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
        textArea.value = '';
        textArea.classList.remove('fade-out');
    }, 2000);
});

document.getElementById('sweep-altar-btn').addEventListener('click', () => {
    shrineData[currentShrine].offerings = [];
    saveAndRenderShrine();
    
    const kharisCountSpan = document.getElementById('kharis-count');
    if(kharisCountSpan) {
        let count = parseInt(kharisCountSpan.innerText) || 0;
        kharisCountSpan.innerText = count + 1;
    }

    alert("Make sure to clean your physical space as well! ( ˘▽˘)っ🧹");
});


// ==========================================
// LIVE MOON & LOCATION DATA SCRIPT
// ==========================================

async function loadMoonAndLocationData() {
    // 1. Calculate Live Moon Data
    const synodic = 29.53058770576;
    const baseDate = new Date('2024-01-11T11:57:00Z'); // Known New Moon
    const now = new Date();
    const diff = (now - baseDate) / (1000 * 60 * 60 * 24);
    let age = diff % synodic;
    if (age < 0) age += synodic;

    const illumination = (1 - Math.cos((age / synodic) * 2 * Math.PI)) / 2 * 100;
    
    let phase = "";
    if (age < 1.84) phase = "New Moon";
    else if (age < 5.53) phase = "Waxing Crescent";
    else if (age < 9.22) phase = "First Quarter";
    else if (age < 12.91) phase = "Waxing Gibbous";
    else if (age < 16.61) phase = "Full Moon";
    else if (age < 20.30) phase = "Waning Gibbous";
    else if (age < 23.99) phase = "Third Quarter";
    else if (age < 27.68) phase = "Waning Crescent";
    else phase = "New Moon";

    document.getElementById('moon-phase-name').innerText = phase;
    document.getElementById('moon-percentage').innerText = illumination.toFixed(1) + "%";
    document.getElementById('moon-age').innerText = age.toFixed(1) + " days";

    // Update Deipnon Progress & Countdowns
    let progress = (age / synodic) * 100;
    document.getElementById('deipnon-percent').innerText = progress.toFixed(1) + "%";
    document.getElementById('deipnon-progress').style.width = progress + "%";

    const daysToDeipnon = synodic - age;
    const daysToNoumenia = (daysToDeipnon + 1) % synodic;
    const daysToAgathos = (daysToDeipnon + 2) % synodic;

    document.getElementById('countdown-deipnon').innerText = daysToDeipnon.toFixed(1) + " days";
    document.getElementById('countdown-noumenia').innerText = daysToNoumenia.toFixed(1) + " days";
    document.getElementById('countdown-agathos').innerText = daysToAgathos.toFixed(1) + " days";

    // 2. Zodiac & Energy (Sidereal Estimation)
    const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const energies = [
        "Initiation & Action", "Grounding & Senses", "Communication & Ideas", 
        "Home & Intuition", "Creativity & Passion", "Organization & Healing", 
        "Balance & Harmony", "Transformation & Depth", "Exploration & Wisdom", 
        "Structure & Ambition", "Innovation & Community", "Rest & Spirituality"
    ];
    
    const sidereal = 27.321661;
    const ariesBase = new Date('2024-01-15T00:00:00Z'); // Known Aries Moon
    let siderealDiff = (now - ariesBase) / (1000 * 60 * 60 * 24);
    let siderealAge = siderealDiff % sidereal;
    if (siderealAge < 0) siderealAge += sidereal;
    
    const signIndex = Math.floor((siderealAge / sidereal) * 12);
    
    document.getElementById('moon-zodiac').innerText = zodiacSigns[signIndex];
    document.getElementById('moon-keywords').innerText = energies[signIndex];

    // 3. Get Accurate Sundown Time via Geolocation API
    if ("geolocation" in navigator) {
        document.getElementById('sundown-time').innerText = "Locating...";
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
                const data = await response.json();
                
                if (data.results && data.results.sunset) {
                    const sunsetTime = new Date(data.results.sunset);
                    document.getElementById('sundown-time').innerText = sunsetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                } else {
                    document.getElementById('sundown-time').innerText = "Data Error";
                }
            } catch (err) {
                document.getElementById('sundown-time').innerText = "Network Error";
            }
        }, () => {
            document.getElementById('sundown-time').innerText = "Loc Denied";
        });
    } else {
        document.getElementById('sundown-time').innerText = "No GPS";
    }
}

// Ensure both Altar and Live Data render on load
window.addEventListener('DOMContentLoaded', () => {
    saveAndRenderShrine();
    loadMoonAndLocationData();
});
