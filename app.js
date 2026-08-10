document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. VERCEL CLOUD DB / PERSISTENCE LAYER
    // ==========================================
    async function saveToCloud(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        try {
            await fetch('/api/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
        } catch (err) {}
    }

    async function loadFromCloud(key, defaultValue) {
        try {
            const res = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.value !== undefined) {
                    localStorage.setItem(key, JSON.stringify(data.value));
                    return data.value;
                }
            }
        } catch (err) {}
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : defaultValue;
    }

    // ==========================================
    // 2. TAB NAVIGATION & SETTINGS MODAL
    // ==========================================
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

            btn.classList.add('active');
            const targetView = document.getElementById(btn.getAttribute('data-target'));
            if(targetView) targetView.classList.add('active');
        });
    });

    // Settings Gear Modal Logic
    const settingsModal = document.getElementById('settings-modal');
    document.querySelectorAll('.settings-gear-btn').forEach(gear => {
        gear.addEventListener('click', () => {
            if(settingsModal) settingsModal.classList.toggle('hidden');
        });
    });

    const closeSettings = document.getElementById('close-settings-btn');
    if(closeSettings && settingsModal) {
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    // ==========================================
    // 3. EXPANDED DIVINATION (Tarot, Delphic, Homeromancy)
    // ==========================================
    const drawBtn = document.getElementById("draw-card-btn");
    if(drawBtn) {
        drawBtn.addEventListener("click", async () => {
            if(typeof playSound === 'function') playSound();
            const display = document.getElementById("card-display");
            const nameEl = document.getElementById("card-name");
            const meaningEl = document.getElementById("card-meaning");

            if(display) display.classList.remove("hidden");
            if(nameEl) nameEl.innerText = "Shuffling Tarot... ( ˘▽˘)";
            if(meaningEl) meaningEl.innerText = "";

            try {
                const response = await fetch("tarot.json");
                const tarotDeck = await response.json();
                const randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];

                if(nameEl) nameEl.innerText = randomCard.name;
                if(meaningEl) meaningEl.innerHTML = `<strong>Keywords:</strong> ${randomCard.keywords.join(" • ")}<br><br>${randomCard.meaning}`;
            } catch (error) {
                if(nameEl) nameEl.innerText = "Error (x_x)";
                if(meaningEl) meaningEl.innerText = "Could not load tarot.json.";
            }
        });
    }

    const delphicBtn = document.getElementById("draw-delphic-btn");
    if(delphicBtn) {
        delphicBtn.addEventListener("click", async () => {
            const display = document.getElementById("delphic-display");
            const maximEl = document.getElementById("delphic-maxim");
            const adviceEl = document.getElementById("delphic-advice");

            if(display) display.classList.remove("hidden");
            if(maximEl) maximEl.innerText = "Consulting Apollo... ( ✧ω✧)";
            if(adviceEl) adviceEl.innerText = "";

            try {
                const response = await fetch("delphic.json");
                const delphicDeck = await response.json();
                const randomMaxim = delphicDeck[Math.floor(Math.random() * delphicDeck.length)];

                if(maximEl) maximEl.innerText = randomMaxim.maxim;
                if(adviceEl) adviceEl.innerHTML = `<strong>Guidance:</strong> ${randomMaxim.advice}`;
            } catch (error) {
                const fallbacks = [
                    { maxim: "Know Thyself", advice: "Look inward before seeking answers from the outside world." },
                    { maxim: "Nothing in Excess", advice: "Seek balance and moderation in all things today." },
                    { maxim: "Pledge Surety and Ruin is Near", advice: "Exercise caution in commitments and contracts." }
                ];
                const fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                if(maximEl) maximEl.innerText = fb.maxim;
                if(adviceEl) adviceEl.innerHTML = `<strong>Guidance:</strong> ${fb.advice}`;
            }
        });
    }

    const homerBtn = document.getElementById("draw-homer-btn");
    if(homerBtn) {
        homerBtn.addEventListener("click", async () => {
            const display = document.getElementById("homer-display");
            const verseEl = document.getElementById("homer-verse");
            const omenEl = document.getElementById("homer-omen");

            if(display) display.classList.remove("hidden");
            if(verseEl) verseEl.innerText = "Opening the Epics... ( 🏛️ )";
            if(omenEl) omenEl.innerText = "";

            try {
                const response = await fetch("homeromancy.json");
                const homerDeck = await response.json();
                const randomVerse = homerDeck[Math.floor(Math.random() * homerDeck.length)];

                if(verseEl) verseEl.innerText = `"${randomVerse.verse}" — ${randomVerse.source}`;
                if(omenEl) omenEl.innerHTML = `<strong>Omen:</strong> ${randomVerse.omen}`;
            } catch (error) {
                const fallbacks = [
                    { verse: "Even a fool is wise after the event.", source: "Iliad", omen: "Learn from past missteps without carrying regret." },
                    { verse: "Endure my heart, even worse have you endured.", source: "Odyssey", omen: "Resilience will see you through your present trials." }
                ];
                const fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                if(verseEl) verseEl.innerText = `"${fb.verse}" — ${fb.source}`;
                if(omenEl) omenEl.innerHTML = `<strong>Omen:</strong> ${fb.omen}`;
            }
        });
    }

    // ==========================================
    // 4. MULTI-DEITY SHRINE & GRIMOIRE ARCHIVE
    // ==========================================
    let deities = ["Hestia", "Hekate", "Apollo", "Hermes"];
    let shrineData = {};
    let deityGrimoire = {}; 
    let currentShrine = "Hestia";
    
    // NEW: Unified Archive for Readings & Prayers
    let journalArchive = [];

    async function initDeitiesAndShrines() {
        deities = await loadFromCloud('customDeitiesList', ["Hestia", "Hekate", "Apollo", "Hermes"]);
        shrineData = await loadFromCloud('shrineData', {});
        deityGrimoire = await loadFromCloud('deityGrimoire', {});
        
        // Load the journal archive from the cloud via the REST endpoint mechanism
        journalArchive = await loadFromCloud('journalArchive', []);

        deities.forEach(d => {
            if(!shrineData[d]) shrineData[d] = { offerings: [], sketch: null, petitions: [] };
            if(!deityGrimoire[d]) deityGrimoire[d] = { plants: [], animals: [], offerings: [], colors: [], symbols: [] };
        });

        populateDeityDropdown();
        renderGrimoireArchive();
        renderJournalArchive(); // Render the newly loaded archive
        
        const deityInput = document.getElementById('deity-focus-input');
        if(deityInput) {
            currentShrine = deityInput.value || deities[0];
            deityInput.addEventListener('change', (e) => {
                currentShrine = e.target.value;
                saveAndRenderShrine();
            });
        }
        saveAndRenderShrine();
    }

    function populateDeityDropdown() {
        const select = document.getElementById('deity-focus-input');
        if(!select) return;
        select.innerHTML = '';
        deities.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            select.appendChild(opt);
        });
        select.value = currentShrine;
    }

    // Render Illuminated Grimoire Manuscript Cards (Tab 4)
    function renderGrimoireArchive() {
        const grid = document.getElementById('archive-grid');
        if(!grid) return;
        grid.innerHTML = '';

        deities.forEach(d => {
            const data = deityGrimoire[d] || { plants: [], animals: [], offerings: [], colors: [], symbols: [] };
            const shrine = shrineData[d] || { offerings: [], petitions: [] };

            const card = document.createElement('div');
            card.className = 'grimoire-manuscript-card';
            card.innerHTML = `
                <div class="manuscript-header">
                    <h4>📖 Sanctuary of ${d}</h4>
                    <span class="manuscript-badge">Active Shrine</span>
                </div>
                <div class="manuscript-section">
                    <p class="manuscript-label">🎨 Sacred Colors</p>
                    <div class="tag-container">
                        ${data.colors.length ? data.colors.map(c => `<span class="cute-tag">${c}</span>`).join('') : '<span class="empty-tag">No colors added</span>'}
                    </div>
                </div>
                <div class="manuscript-section">
                    <p class="manuscript-label">⚡ Sacred Symbols</p>
                    <div class="tag-container">
                        ${data.symbols.length ? data.symbols.map(s => `<span class="cute-tag">${s}</span>`).join('') : '<span class="empty-tag">No symbols added</span>'}
                    </div>
                </div>
                <div class="manuscript-section">
                    <p class="manuscript-label">🌿 Sacred Plants</p>
                    <div class="tag-container">
                        ${data.plants.length ? data.plants.map(p => `<span class="cute-tag">${p}</span>`).join('') : '<span class="empty-tag">No plants added</span>'}
                    </div>
                </div>
                <div class="manuscript-section">
                    <p class="manuscript-label">🐾 Sacred Animals</p>
                    <div class="tag-container">
                        ${data.animals.length ? data.animals.map(a => `<span class="cute-tag">${a}</span>`).join('') : '<span class="empty-tag">No animals added</span>'}
                    </div>
                </div>
                <div class="manuscript-section">
                    <p class="manuscript-label">🍯 Standard Offerings</p>
                    <div class="tag-container">
                        ${data.offerings.length ? data.offerings.map(o => `<span class="cute-tag">${o}</span>`).join('') : '<span class="empty-tag">No offerings added</span>'}
                    </div>
                </div>
                <div class="manuscript-footer">
                    <span>Canvas Items: ${shrine.offerings.length}</span>
                    <span>Petitions: ${shrine.petitions.length}</span>
                </div>
                <button class="cute-btn full-width margin-top edit-grimoire-btn" data-deity="${d}">Edit Grimoire Associations ✨</button>
            `;
            grid.appendChild(card);
        });

        document.querySelectorAll('.edit-grimoire-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deity = e.target.getAttribute('data-deity');
                openGrimoireEditor(deity);
            });
        });
    }

    // NEW: Render the unified journal and prayer archive to the screen
    function renderJournalArchive() {
        const list = document.getElementById('journal-archive-list');
        if(!list) return;
        list.innerHTML = '';
        
        if (journalArchive.length === 0) {
            list.innerHTML = '<p class="center-text" style="font-size:0.8rem; color:var(--text-muted);">No entries yet. Cast a reading or send a petition to see it here!</p>';
            return;
        }

        journalArchive.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'libation-item';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'flex-start';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%; font-size:0.75rem; color:var(--text-muted); margin-bottom:6px;">
                    <span><strong>${entry.type}</strong></span>
                    <span>${entry.date}</span>
                </div>
                <div style="font-size:0.85rem; font-weight:normal; line-height:1.4;">
                    ${entry.text}
                </div>
            `;
            list.appendChild(card);
        });
    }

    function openGrimoireEditor(deity) {
        const currentData = deityGrimoire[deity] || { plants: [], animals: [], offerings: [], colors: [], symbols: [] };
        
        const colInput = prompt(`Enter sacred colors for ${deity} (comma separated):`, (currentData.colors || []).join(', '));
        if(colInput !== null) currentData.colors = colInput.split(',').map(s => s.trim()).filter(Boolean);

        const symInput = prompt(`Enter sacred symbols for ${deity} (comma separated):`, (currentData.symbols || []).join(', '));
        if(symInput !== null) currentData.symbols = symInput.split(',').map(s => s.trim()).filter(Boolean);

        const pInput = prompt(`Enter sacred plants for ${deity} (comma separated):`, currentData.plants.join(', '));
        if(pInput !== null) currentData.plants = pInput.split(',').map(s => s.trim()).filter(Boolean);

        const aInput = prompt(`Enter sacred animals for ${deity} (comma separated):`, currentData.animals.join(', '));
        if(aInput !== null) currentData.animals = aInput.split(',').map(s => s.trim()).filter(Boolean);

        const oInput = prompt(`Enter standard offerings for ${deity} (comma separated):`, currentData.offerings.join(', '));
        if(oInput !== null) currentData.offerings = oInput.split(',').map(s => s.trim()).filter(Boolean);

        deityGrimoire[deity] = currentData;
        saveToCloud('deityGrimoire', deityGrimoire);
        renderGrimoireArchive();
    }

    // Custom Deity Addition with Inline Form
    const addDeityBtn = document.getElementById('add-custom-deity-btn');
    const newDeityInput = document.getElementById('new-deity-input');
    const customDeityForm = document.getElementById('custom-deity-form');
    const saveNewDeityBtn = document.getElementById('save-new-deity-btn');

    if(addDeityBtn && newDeityInput && customDeityForm) {
        addDeityBtn.addEventListener('click', () => {
            const name = newDeityInput.value.trim();
            if(name && !deities.includes(name)) {
                customDeityForm.classList.remove('hidden');
                customDeityForm.dataset.deityName = name;
            } else if (!name) {
                alert("Please enter a valid deity name!");
            } else {
                alert("This deity already exists in your shrine switcher!");
            }
        });
    }

    if(saveNewDeityBtn) {
        saveNewDeityBtn.addEventListener('click', async () => {
            const name = customDeityForm.dataset.deityName;
            const colorsStr = document.getElementById('new-deity-colors').value;
            const symbolsStr = document.getElementById('new-deity-symbols').value;
            const plantsStr = document.getElementById('new-deity-plants').value;
            const animalsStr = document.getElementById('new-deity-animals').value;
            const offeringsStr = document.getElementById('new-deity-offerings').value;

            if(name && !deities.includes(name)) {
                deities.push(name);
                shrineData[name] = { offerings: [], sketch: null, petitions: [] };
                deityGrimoire[name] = {
                    colors: colorsStr.split(',').map(s => s.trim()).filter(Boolean),
                    symbols: symbolsStr.split(',').map(s => s.trim()).filter(Boolean),
                    plants: plantsStr.split(',').map(s => s.trim()).filter(Boolean),
                    animals: animalsStr.split(',').map(s => s.trim()).filter(Boolean),
                    offerings: offeringsStr.split(',').map(s => s.trim()).filter(Boolean)
                };

                currentShrine = name;
                
                await saveToCloud('customDeitiesList', deities);
                await saveToCloud('shrineData', shrineData);
                await saveToCloud('deityGrimoire', deityGrimoire);
                
                populateDeityDropdown();
                renderGrimoireArchive();
                saveAndRenderShrine();

                // Reset form
                newDeityInput.value = '';
                document.getElementById('new-deity-colors').value = '';
                document.getElementById('new-deity-symbols').value = '';
                document.getElementById('new-deity-plants').value = '';
                document.getElementById('new-deity-animals').value = '';
                document.getElementById('new-deity-offerings').value = '';
                customDeityForm.classList.add('hidden');
            }
        });
    }

    function saveAndRenderShrine() {
        saveToCloud('shrineData', shrineData);
        renderGrimoireArchive();
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

    // ==========================================
    // 5. HEARTH OF HESTIA RITUAL TOGGLE (Moon View / Homepage)
    // ==========================================
    const hestiaToggleBtn = document.getElementById('hestia-ritual-btn');
    const hestiaDisplay = document.getElementById('hestia-ritual-display');

    if(hestiaToggleBtn && hestiaDisplay) {
        let hestiaActive = false;
        hestiaToggleBtn.addEventListener('click', () => {
            hestiaActive = !hestiaActive;
            if(hestiaActive) {
                hestiaDisplay.classList.remove('hidden');
                hestiaDisplay.innerHTML = `
                    <strong>🔥 Hearth of Hestia Lit</strong><br>
                    <em>"First and last to Hestia we pour the sacred honey-sweet libation."</em><br>
                    Your sacred space is now opened and protected by the First Goddess.
                `;
                hestiaToggleBtn.textContent = "Extinguish / Close Hearth (🔥)";
            } else {
                hestiaDisplay.innerHTML = `
                    <strong>🔥 Hearth Closed</strong><br>
                    <em>"Farewell gentle Hestia, guardian of our home."</em>
                `;
                setTimeout(() => {
                    hestiaDisplay.classList.add('hidden');
                }, 2000);
                hestiaToggleBtn.textContent = "Light the Hearth of Hestia (🔥)";
            }
        });
    }

    // ==========================================
    // 6. MULTI-PROMPT GENERATOR & PETITIONS
    // ==========================================
    const promptLibrary = {
        morning: [
            "Morning Reflection: What intentions are you setting for today's daylight?",
            "Dawn Offering: What action can you take today to honor Phoebus Apollo or Helios?",
            "Hearth Fire: How will you bring warmth and hospitality (Hestia) into your morning routine?",
            "Fresh Start: What mindset or boundary do you wish to cultivate as the sun rises?"
        ],
        afternoon: [
            "Afternoon Alignment: How are you maintaining your energy and spiritual focus today?",
            "Midday Swiftness: What pressing task requires Hermes' focus and clear speech right now?",
            "Zenith Reflection: How can you bring truth and clarity to a challenge you are facing?",
            "Devotional Balance: What small act of gratitude can you perform before sundown?"
        ],
        night: [
            "Nighttime Reflection: What burdens can you release to the dark, and what are you grateful for today?",
            "Crossroads Meditation: What decision or transition are you contemplating under Hekate's gaze?",
            "Selene's Light: What quiet truth or intuitive dream do you wish to invite tonight?",
            "Hearth Restoration: How will you quiet your mind and rest your body in honor of Hestia's peace?"
        ]
    };

    let lastPromptIndex = -1;
    const promptGenBtn = document.getElementById('prompt-generator-btn');
    if(promptGenBtn) {
        promptGenBtn.addEventListener('click', () => {
            const hour = new Date().getHours();
            let category = "night";
            if (hour >= 5 && hour < 12) category = "morning";
            else if (hour >= 12 && hour < 18) category = "afternoon";

            const prompts = promptLibrary[category];
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * prompts.length);
            } while (prompts.length > 1 && randomIndex === lastPromptIndex);

            lastPromptIndex = randomIndex;
            
            const promptDisplay = document.getElementById('prompt-display');
            if(promptDisplay) {
                promptDisplay.innerText = prompts[randomIndex];
                promptDisplay.classList.remove('hidden');
            }
        });
    }

    const sendPetitionBtn = document.getElementById('send-petition-btn');
    if(sendPetitionBtn) {
        sendPetitionBtn.addEventListener('click', async () => {
            const textArea = document.getElementById('petition-text');
            if(!textArea || textArea.value.trim() === '') return;
            
            if(!shrineData[currentShrine]) shrineData[currentShrine] = { offerings: [], sketch: null, petitions: [] };
            shrineData[currentShrine].petitions.push(textArea.value);
            
            // NEW: Push to the unified archive
            journalArchive.unshift({
                id: Date.now(),
                type: `Petition to ${currentShrine}`,
                text: textArea.value.trim(),
                date: new Date().toLocaleString()
            });
            
            await saveToCloud('shrineData', shrineData);
            await saveToCloud('journalArchive', journalArchive);

            renderGrimoireArchive();
            renderJournalArchive(); // Update visual list immediately
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

    // NEW: Wiring up the Divination Journal button
    const saveJournalBtn = document.getElementById('save-journal-btn');
    if (saveJournalBtn) {
        saveJournalBtn.addEventListener('click', async () => {
            const journalEntry = document.getElementById('journal-entry');
            if (!journalEntry || journalEntry.value.trim() === '') return;

            // Push to the unified archive
            journalArchive.unshift({
                id: Date.now(),
                type: 'Divination Reading',
                text: journalEntry.value.trim(),
                date: new Date().toLocaleString()
            });

            await saveToCloud('journalArchive', journalArchive);
            renderJournalArchive(); // Update visual list immediately

            journalEntry.value = '';
            alert("Entry saved to your archive! ( ˘▽˘)");
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
                saveToCloud('kharisCount', count + 1);
            }

            alert("Make sure to clean your physical space as well! ( ˘▽˘)っ🧹");
        });
    }

    // ==========================================
    // 7. DAILY HYMNS LOADER
    // ==========================================
    const dailyHymns = {
        0: { title: "Orphic Hymn to Helios (Sunday)", text: "Hear, golden Helios, whose blessed light shines across the boundless earth... Bringer of daylight, eternal sun, guide our steps with radiant grace." },
        1: { title: "Homeric Hymn to Selene (Monday)", text: "Sing of the Moon, sweet-voiced Muses! From her immortal head a glow is shown from heaven and embraces earth... Queen of the night, shining Selene." },
        2: { title: "Orphic Hymn to Ares & Aphrodite (Tuesday)", text: "Magnanimous Ares, shield-bearer and strength of mortals... paired with Aphrodite's gentle grace, bring courage, passion, and harmony to our hearth." },
        3: { title: "Homeric Hymn to Hermes (Wednesday)", text: "Sing, Muse, of Hermes, the guide and messenger! Swift-footed lord of paths and speech, watcher by night, bringer of luck, and friend to mortals." },
        4: { title: "Orphic Hymn to Zeus (Thursday)", text: "Zeus, father of gods and mortals, thunderer high on Olympos! Dispenser of justice and order, grant us wisdom, strength, and shelter." },
        5: { title: "Orphic Hymn to Aphrodite (Friday)", text: "Sea-born Aphrodite, queen of beauty and love! Weaver of joy, gentlest goddess, bless our shrine and hearth with unity and kindness." },
        6: { title: "Homeric Hymn to Hestia & Apollo (Saturday)", text: "Hestia, keeper of the eternal flame in sacred Pytho and high Olympos... alongside Far-Shooting Apollo, bring light and warmth to our sacred sanctuary." }
    };

    function loadDailyHymn() {
        const day = new Date().getDay();
        const hymn = dailyHymns[day];
        const hymnEl = document.getElementById('daily-hymn');
        if (hymnEl && hymn) {
            hymnEl.innerHTML = `<strong>${hymn.title}</strong><br><br>"${hymn.text}"`;
        }
    }

    // ==========================================
    // 8. ASTRONOMICAL MOON & LOCATION DATA
    // ==========================================
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

    // Initialize modules safely
    initDeitiesAndShrines();
    renderLunarEvents();
    loadMoonAndLocationData();
    loadDailyHymn();

});

