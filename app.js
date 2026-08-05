document.addEventListener('DOMContentLoaded', () => {

    // 1. Tab Navigation Logic
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

            btn.classList.add('active');
            const targetView = document.getElementById(btn.getAttribute('data-target'));
            if(targetView) targetView.classList.add('active');
        });
    });

    // 2. Tarot Card Draw from JSON
    const drawBtn = document.getElementById("draw-card-btn");
    if(drawBtn) {
        drawBtn.addEventListener("click", async () => {
            if(typeof playSound === 'function') playSound();
            const display = document.getElementById("card-display");
            const nameEl = document.getElementById("card-name");
            const meaningEl = document.getElementById("card-meaning");

            if(display) display.classList.remove("hidden");
            if(nameEl) nameEl.innerText = "Shuffling... ( ˘▽˘)";
            if(meaningEl) meaningEl.innerText = "";

            try {
                const response = await fetch("tarot.json");
                const tarotDeck = await response.json();
                const randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];

                if(nameEl) nameEl.innerText = randomCard.name;
                if(meaningEl) meaningEl.innerHTML = `<strong>Keywords:</strong> ${randomCard.keywords.join(" • ")}<br><br>${randomCard.meaning}`;
            } catch (error) {
                if(nameEl) nameEl.innerText = "Error (x_x)";
                if(meaningEl) meaningEl.innerText = "Could not load tarot.json. Make sure the file is in the same folder!";
            }
        });
    }

    // 3. Shrine & Altar Features 
    const deities = ["Hestia", "Hekate", "Apollo", "Hermes"];
    let shrineData = JSON.parse(localStorage.getItem('shrineData')) || {};

    deities.forEach(d => {
        if(!shrineData[d]) shrineData[d] = { offerings: [], sketch: null, petitions: [] };
    });

    const deityInput = document.getElementById('deity-focus-input');
    let currentShrine = deityInput ? deityInput.value : "Hestia";

    if(deityInput) {
        deityInput.addEventListener('change', (e) => {
            currentShrine = e.target.value;
            saveAndRenderShrine();
        });
    }

    function saveAndRenderShrine() {
        localStorage.setItem('shrineData', JSON.stringify(shrineData));
        const canvas = document.getElementById('altar-canvas');
        if(!canvas) return;
        
        const currentOfferings = canvas.querySelectorAll('.draggable-offering');
        currentOfferings.forEach(o => o.remove());

        const data = shrineData[currentShrine] || { offerings: [], sketch: null };

        const frame = document.getElementById('sketch-frame');
        if (frame) {
            if (data.sketch) {
                frame.innerHTML = `<img src="${data.sketch}" alt="Devotional Sketch">`;
            } else {
                frame.innerHTML = `<span id="sketch-placeholder">Frame<br>(Tap to set)</span>`;
            }
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

    const uploadOffering = document.getElementById('upload-offering');
    if(uploadOffering) {
        uploadOffering.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                if(!shrineData[currentShrine]) shrineData[currentShrine] = { offerings: [], sketch: null, petitions: [] };
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
    }

    const uploadSketch = document.getElementById('upload-sketch');
    if(uploadSketch) {
        uploadSketch.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                if(!shrineData[currentShrine]) shrineData[currentShrine] = { offerings: [], sketch: null, petitions: [] };
                shrineData[currentShrine].sketch = event.target.result;
                saveAndRenderShrine();
            };
            reader.readAsDataURL(file);
            this.value = '';
        });
    }

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

    const promptGenBtn = document.getElementById('prompt-generator-btn');
    if(promptGenBtn) {
        promptGenBtn.addEventListener('click', () => {
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
            if(promptDisplay) {
                promptDisplay.innerText = prompt;
                promptDisplay.classList.remove('hidden');
            }
        });
    }

    const sendPetitionBtn = document.getElementById('send-petition-btn');
    if(sendPetitionBtn) {
        sendPetitionBtn.addEventListener('click', () => {
            const textArea = document.getElementById('petition-text');
            if(!textArea || textArea.value.trim() === '') return;
            
            if(!shrineData[currentShrine]) shrineData[currentShrine] = { offerings: [], sketch: null, petitions: [] };
            shrineData[currentShrine].petitions.push(textArea.value);
            localStorage.setItem('shrineData', JSON.stringify(shrineData));

            textArea.classList.add('fade-out');
            
            const container = document.getElementById('sparkle-container');
            if(container) {
                const sparkle = document.createElement('div');
                sparkle.innerText = '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧';
                sparkle.className = 'sparkle-anim';
                container.appendChild(sparkle);
                
                setTimeout(() => {
                    sparkle.remove();
                    textArea.value = '';
                    textArea.classList.remove('fade-out');
                }, 2000);
            }
        });
    }

    const sweepBtn = document.getElementById('sweep-altar-btn');
    if(sweepBtn) {
        sweepBtn.addEventListener('click', () => {
            if(shrineData[currentShrine]) {
                shrineData[currentShrine].offerings = [];
            }
            saveAndRenderShrine();
            
            const kharisCountSpan = document.getElementById('kharis-count');
            if(kharisCountSpan) {
                let count = parseInt(kharisCountSpan.innerText) || 0;
                kharisCountSpan.innerText = count + 1;
            }

            alert("Make sure to clean your physical space as well! ( ˘▽˘)っ🧹");
        });
    }


    // 4. Astronomical Live Moon & Location Data 
    const upcomingLunarEvents = [
        { date: "Aug 12, 2026", event: "Total Solar Eclipse 🌑" },
        { date: "Aug 28, 2026", event: "Partial Lunar Eclipse 🌕" },
        { date: "Dec 24, 2026", event: "Super Full Moon ✨" },
        { date: "Feb 6, 2027", event: "Annular Solar Eclipse 🌒" },
        { date: "Feb 20, 2027", event: "Penumbral Lunar Eclipse 🌗" },
        { date: "Jul 18, 2027", event: "Supermoon ✨" },
        { date: "Aug 2, 2027", event: "Total Solar Eclipse 🌑" }
    ];

    const toggleLunar = document.getElementById('toggle-lunar-events');
    if(toggleLunar) {
        toggleLunar.addEventListener('click', () => {
            const list = document.getElementById('lunar-events-list');
            if(list) list.classList.toggle('hidden');
        });
    }

    function renderLunarEvents() {
        const list = document.getElementById('lunar-events-list');
        if(!list) return;
        list.innerHTML = "";
        upcomingLunarEvents.forEach(e => {
            const item = document.createElement('div');
            item.className = 'libation-item';
            item.innerHTML = `<span>${e.date}</span> <span>${e.event}</span>`;
            list.appendChild(item);
        });
    }

    function loadMoonAndLocationData() {
        const now = new Date();
        const jd = (now.getTime() / 86400000) + 2440587.5;
        const T = (jd - 2451545.0) / 36525;

        const M = (357.5291092 + 35999.0502909 * T) % 360;
        const D = (297.8501921 + 445267.1114034 * T) % 360;
        const Mprime = (134.9633964 + 477198.8675055 * T) % 360;
        const F = (93.2720950 + 483202.0175233 * T) % 360;
        const Lprime = (218.3164477 + 481267.88123421 * T) % 360;

        const rad = Math.PI / 180;
        
        let moonLon = Lprime 
            + 6.289 * Math.sin(Mprime * rad)
            + 1.274 * Math.sin((2 * D - Mprime) * rad)
            + 0.658 * Math.sin(2 * D * rad)
            + 0.214 * Math.sin(2 * Mprime * rad)
            - 0.186 * Math.sin(M * rad)
            - 0.114 * Math.sin(2 * F * rad);
        moonLon = (moonLon + 360) % 360;

        const sunLon = (280.46646 + 36000.76983 * T + 1.914602 * Math.sin(M * rad)) % 360;

        let elongation = (moonLon - sunLon + 360) % 360;
        let illumination = (1 - Math.cos(elongation * rad)) / 2 * 100;
        
        let phase = "";
        if (elongation < 3 || elongation > 357) phase = "New Moon";
        else if (elongation >= 3 && elongation < 87) phase = "Waxing Crescent";
        else if (elongation >= 87 && elongation < 93) phase = "First Quarter";
        else if (elongation >= 93 && elongation < 177) phase = "Waxing Gibbous";
        else if (elongation >= 177 && elongation < 183) phase = "Full Moon";
        else if (elongation >= 183 && elongation < 267) phase = "Waning Gibbous";
        else if (elongation >= 267 && elongation < 273) phase = "Third Quarter";
        else phase = "Waning Crescent";

        let moonAgeDays = (elongation / 360) * 29.530588;

        const phaseEl = document.getElementById('moon-phase-name');
        const percentEl = document.getElementById('moon-percentage');
        const ageEl = document.getElementById('moon-age');

        if(phaseEl) phaseEl.innerText = phase;
        if(percentEl) percentEl.innerText = illumination.toFixed(1) + "%";
        if(ageEl) ageEl.innerText = moonAgeDays.toFixed(1) + " days";

        const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        const energies = [
            "Initiation & Action", "Grounding & Senses", "Communication & Ideas", 
            "Home & Intuition", "Creativity & Passion", "Organization & Healing", 
            "Balance & Harmony", "Transformation & Depth", "Exploration & Wisdom", 
            "Structure & Ambition", "Innovation & Community", "Rest & Spirituality"
        ];
        
        const signIndex = Math.floor(moonLon / 30);
        
        const zodiacEl = document.getElementById('moon-zodiac');
        const keywordsEl = document.getElementById('moon-keywords');
        if(zodiacEl) zodiacEl.innerText = zodiacSigns[signIndex];
        if(keywordsEl) keywordsEl.innerText = energies[signIndex];

        const synodic = 29.53058770576;
        let progress = (moonAgeDays / synodic) * 100;
        
        const deipPercent = document.getElementById('deipnon-percent');
        const deipProgress = document.getElementById('deipnon-progress');
        if(deipPercent) deipPercent.innerText = progress.toFixed(1) + "%";
        if(deipProgress) deipProgress.style.width = progress + "%";

        const daysToDeipnon = synodic - moonAgeDays;
        const daysToNoumenia = (daysToDeipnon + 1) % synodic;
        const daysToAgathos = (daysToDeipnon + 2) % synodic;

        const countDeip = document.getElementById('countdown-deipnon');
        const countNou = document.getElementById('countdown-noumenia');
        const countAgathos = document.getElementById('countdown-agathos');

        if(countDeip) countDeip.innerText = daysToDeipnon.toFixed(1) + " days";
        if(countNou) countNou.innerText = daysToNoumenia.toFixed(1) + " days";
        if(countAgathos) countAgathos.innerText = daysToAgathos.toFixed(1) + " days";

        const sundownEl = document.getElementById('sundown-time');
        if ("geolocation" in navigator) {
            if(sundownEl) sundownEl.innerText = "Locating...";
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
                    const data = await response.json();
                    
                    if (data.results && data.results.sunset && sundownEl) {
                        const sunsetTime = new Date(data.results.sunset);
                        sundownEl.innerText = sunsetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    } else if(sundownEl) {
                        sundownEl.innerText = "Data Error";
                    }
                } catch (err) {
                    if(sundownEl) sundownEl.innerText = "Network Error";
                }
            }, () => {
                if(sundownEl) sundownEl.innerText = "Loc Denied";
            });
        } else if(sundownEl) {
            sundownEl.innerText = "No GPS";
        }
    }

    // Initialize everything safely
    saveAndRenderShrine();
    renderLunarEvents();
    loadMoonAndLocationData();

});

