// Tarot Card Draw from JSON
document.getElementById("draw-card-btn").addEventListener("click", async () => {
playSound();
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
// NEW FEATURES IMPLEMENTATION 
// ==========================================

// 1. Multi-Deity Shrine Switcher & State Management
const deities = ["Hestia", "Hekate", "Apollo", "Hermes"];
let shrineData = JSON.parse(localStorage.getItem('shrineData')) || {};

// Initialize missing deities
deities.forEach(d => {
    if(!shrineData[d]) shrineData[d] = { offerings: [], sketch: null, petitions: [] };
});

let currentShrine = document.getElementById('deity-focus-input').value;

document.getElementById('deity-focus-input').addEventListener('change', (e) => {
    currentShrine = e.target.value;
    saveAndRenderShrine();
});

// 2 & 3. Interactive Altar Canvas & Sketch Frame
function saveAndRenderShrine() {
    localStorage.setItem('shrineData', JSON.stringify(shrineData));
    const canvas = document.getElementById('altar-canvas');
    
    // Clear current draggable offerings
    const currentOfferings = canvas.querySelectorAll('.draggable-offering');
    currentOfferings.forEach(o => o.remove());

    const data = shrineData[currentShrine];

    // Render Sketch
    const frame = document.getElementById('sketch-frame');
    if (data.sketch) {
        frame.innerHTML = `<img src="${data.sketch}" alt="Devotional Sketch">`;
    } else {
        frame.innerHTML = `<span id="sketch-placeholder">Frame<br>(Tap to set)</span>`;
    }

    // Render Offerings
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

// Upload Offering (Base64)
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

// Upload Sketch (Base64)
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

// Drag and Drop Logic with Tap-to-Delete
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

        // Detect if dragging vs tapping
        if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
            isDragging = true;
        }

        if (isDragging) {
            const canvas = document.getElementById("altar-canvas");
            const canvasRect = canvas.getBoundingClientRect();

            let newX = clientX - canvasRect.left - offsetX;
            let newY = clientY - canvasRect.top - offsetY;

            // Contain within canvas bounds
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

// 4. Prayer & Petition Journal 
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
    
    // Save to deity history
    shrineData[currentShrine].petitions.push(textArea.value);
    localStorage.setItem('shrineData', JSON.stringify(shrineData));

    // Fade Out Animation & Sparkles
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

// 5. Altar Cleansing & Physical Reset
document.getElementById('sweep-altar-btn').addEventListener('click', () => {
    shrineData[currentShrine].offerings = [];
    saveAndRenderShrine();
    
    // Increment Kharis
    const kharisCountSpan = document.getElementById('kharis-count');
    if(kharisCountSpan) {
        let count = parseInt(kharisCountSpan.innerText) || 0;
        kharisCountSpan.innerText = count + 1;
    }

    // Reminder popup
    alert("Make sure to clean your physical space as well! ( ˘▽˘)っ🧹");
});

// Initial Render on page load
window.addEventListener('DOMContentLoaded', saveAndRenderShrine);
