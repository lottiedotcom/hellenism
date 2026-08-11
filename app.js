document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. VERCEL CLOUD DB / PERSISTENCE LAYER
    // ==========================================
    async function saveToCloud(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        try {
            const res = await fetch('/api/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
            
            if (!res.ok) {
                const errText = await res.text();
                let errMsg = errText;
                try {
                    const errJson = JSON.parse(errText);
                    errMsg = `[${errJson.error}] \nDetails: ${errJson.details}`;
                } catch(e) {
                    errMsg = "Server returned an HTML error page. The API route is crashing or missing.";
                }
                alert(`CLOUD ERROR: ${errMsg}`);
            }
        } catch (err) {
            alert(`NETWORK ERROR: Could not reach Vercel server. \nDetails: ${err.message}`);
        }
    }

    async function loadFromCloud(key, defaultValue) {
        try {
            const res = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
            if (res.ok) {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (data && data.value !== undefined) {
                        localStorage.setItem(key, JSON.stringify(data.value));
                        return data.value;
                    }
                } catch (e) {
                    console.warn(`JSON parse error on loadFromCloud for ${key}`);
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

    // --- REBUILT EXPORT LOGIC: PULLS STRICTLY FROM LOCAL MEMORY ---
    const exportBtn = document.getElementById('export-backup-btn');
    const importBtn = document.getElementById('import-backup-btn');
    const importFileInput = document.getElementById('import-file-input');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const keysToBackup = [
                'customDeitiesList', 
                'shrineData', 
                'deityGrimoire', 
                'journalArchive', 
                'oneiroiArchive', 
                'associationJournal', 
                'khernipsCount', 
                'kharisCount',
                'libationsList'
            ];
            
            let backupData = {};
            exportBtn.innerText = "Gathering local data... ⋆｡°✩";
            
            for (const key of keysToBackup) {
                const localData = localStorage.getItem(key);
                if (localData) {
                    backupData[key] = JSON.parse(localData);
                }
            }
            
            const deitiesToBackup = backupData['customDeitiesList'] || [];
            for (const deity of deitiesToBackup) {
                const archiveKey = 'archive_' + deity;
                const localArchive = localStorage.getItem(archiveKey);
                if (localArchive) {
                    backupData[archiveKey] = JSON.parse(localArchive);
                }
            }

            if (Object.keys(backupData).length === 0) {
                alert("There is no local data found to backup yet!");
                exportBtn.innerText = "⋆｡°✩ Export Backup";
                return;
            }

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "hellenic_backup_" + Date.now() + ".json");
            document.body.appendChild(downloadAnchorNode); 
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            exportBtn.innerText = "⋆｡°✩ Export Backup";
        });
    }

    if (importBtn && importFileInput) {
        importBtn.addEventListener('click', () => importFileInput.click());

        importFileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            
            importBtn.innerText = "Importing... Please wait.";
            let successCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        try {
                            const importedData = JSON.parse(event.target.result);
                            for (const [key, value] of Object.entries(importedData)) {
                                if (value !== null && value !== undefined) {
                                    await saveToCloud(key, value);
                                }
                            }
                            successCount++;
                            resolve();
                        } catch (err) {
                            resolve(); 
                        }
                    };
                    reader.readAsText(file);
                });
            }
            
            alert(`Backup imported locally! Reloading app... ˙⋆✮⋆˚࿔`);
            location.reload();
        });
    }

    const archiveModal = document.getElementById('archive-modal');
    const closeArchiveBtn = document.getElementById('close-archive-btn');
    if(closeArchiveBtn && archiveModal) {
        closeArchiveBtn.addEventListener('click', () => {
            archiveModal.classList.add('hidden');
        });
    }

    const oneiroiModal = document.getElementById('oneiroi-modal');
    const closeOneiroiBtn = document.getElementById('close-oneiroi-btn');
    if (closeOneiroiBtn && oneiroiModal) {
        closeOneiroiBtn.addEventListener('click', () => {
            oneiroiModal.classList.add('hidden');
        });
    }

    const saveOneiroiBtn = document.getElementById('save-oneiroi-deepdive-btn');
    if (saveOneiroiBtn) {
        saveOneiroiBtn.addEventListener('click', async () => {
            const id = parseInt(document.getElementById('edit-dream-id').value);
            const index = oneiroiArchive.findIndex(d => d.id === id);
            if (index !== -1) {
                oneiroiArchive[index].title = document.getElementById('edit-dream-title').value || "Untitled Fragment";
                oneiroiArchive[index].raw_notes = document.getElementById('edit-dream-notes').value;
                oneiroiArchive[index].source = document.getElementById('edit-dream-source').value;
                oneiroiArchive[index].deity = document.getElementById('edit-dream-deity').value;
                oneiroiArchive[index].context = document.getElementById('edit-dream-context').value;
                
                const tagsStr = document.getElementById('edit-dream-tags').value;
                oneiroiArchive[index].tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);
                
                oneiroiArchive[index].aftermath = document.getElementById('edit-dream-aftermath').value;

                await saveToCloud('oneiroiArchive', oneiroiArchive);
                renderOneiroiArchive();
                oneiroiModal.classList.add('hidden');
            }
        });
    }

    // ==========================================
    // 3. EXPANDED DIVINATION
    // ==========================================
    const astragaliBtn = document.getElementById("draw-astragali-btn");
    if (astragaliBtn) {
        astragaliBtn.addEventListener("click", () => {
            const display = document.getElementById("astragali-display");
            const rollEl = document.getElementById("astragali-roll");
            const oracleEl = document.getElementById("astragali-oracle");

            if (display) display.classList.remove("hidden");
            if (rollEl) rollEl.innerText = "Casting the bones... ⋆˚꩜｡";
            if (oracleEl) oracleEl.innerText = "";

            setTimeout(() => {
                let rolls = [];
                let sum = 0;
                for(let i=0; i<5; i++) {
                    const r = Math.floor(Math.random() * 6) + 1;
                    rolls.push(r);
                    sum += r;
                }
                
                let deity = "";
                let reading = "";

                if (sum === 5) { 
                    deity = "The Oracle of Zeus"; 
                    reading = "All ones. The path is difficult and blocked by thorns. Wait and pray to the King of Olympus before taking action."; 
                } else if (sum >= 6 && sum <= 9) { 
                    deity = "The Oracle of Hades"; 
                    reading = "Shadows gather. Look to what is hidden beneath the surface. Introspection will reveal the truth."; 
                } else if (sum >= 10 && sum <= 14) { 
                    deity = "The Oracle of Hermes"; 
                    reading = "The winds shift in your favor. Swift action, clever words, and movement are required now."; 
                } else if (sum >= 15 && sum <= 19) { 
                    deity = "The Oracle of Athena"; 
                    reading = "Rely not on luck, but on wisdom and strategy. Plan your next steps with a clear, cool mind."; 
                } else if (sum >= 20 && sum <= 24) { 
                    deity = "The Oracle of Poseidon"; 
                    reading = "A great wave comes, but you shall not drown. Trust in the deep currents and hold your course steady."; 
                } else if (sum >= 25 && sum <= 29) { 
                    deity = "The Oracle of Aphrodite"; 
                    reading = "A time of blossoming connection, beauty, and passion. Lean into love and creative joy."; 
                } else if (sum === 30) { 
                    deity = "The Oracle of Tyche"; 
                    reading = "The highest throw! Fortune smiles brightly upon you. Move forward with absolute confidence."; 
                }

                const diceSymbols = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
                const visualRolls = rolls.map(r => diceSymbols[r-1]);

                if (rollEl) rollEl.innerText = `[ ${visualRolls.join(" ")} ] (Sum: ${sum})`;
                if (oracleEl) oracleEl.innerHTML = `<strong>${deity}</strong><br><br>${reading}`;
            }, 600);
        });
    }

    const drawBtn = document.getElementById("draw-card-btn");
    if(drawBtn) {
        drawBtn.addEventListener("click", async () => {
            if(typeof playSound === 'function') playSound();
            const display = document.getElementById("card-display");
            const nameEl = document.getElementById("card-name");
            const meaningEl = document.getElementById("card-meaning");

            if(display) display.classList.remove("hidden");
            if(nameEl) nameEl.innerText = "Shuffling Tarot... ⋆˚₊ 𖤓☽˚.⋆";
            if(meaningEl) meaningEl.innerText = "";

            try {
                const response = await fetch("tarot.json");
                const tarotDeck = await response.json();
                const randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];

                if(nameEl) nameEl.innerText = randomCard.name;
                if(meaningEl) meaningEl.innerHTML = `<strong>Keywords:</strong> ${randomCard.keywords.join(" • ")}<br><br>${randomCard.meaning}`;
            } catch (error) {
                if(nameEl) nameEl.innerText = "Error (x.x)";
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
            if(maximEl) maximEl.innerText = "Consulting Apollo... ⋆˚₊ 𖤓☽˚.⋆";
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
            if(verseEl) verseEl.innerText = "Opening the Epics... ₊˚ ꗃ";
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
    // 4. MULTI-DEITY SHRINE, LOGS, & ARCHIVES
    // ==========================================
    let deities = ["Hestia", "Hekate", "Apollo", "Hermes"];
    let shrineData = {};
    let deityGrimoire = {}; 
    let currentShrine = "Hestia";
    let journalArchive = [];
    let oneiroiArchive = [];
    let associationJournal = []; 
    
    let khernipsCount = 0;
    let kharisCount = 0;
    let libationsList = [];

    async function initApp() {
        deities = await loadFromCloud('customDeitiesList', ["Hestia", "Hekate", "Apollo", "Hermes"]);
        shrineData = await loadFromCloud('shrineData', {});
        deityGrimoire = await loadFromCloud('deityGrimoire', {});
        journalArchive = await loadFromCloud('journalArchive', []);
        oneiroiArchive = await loadFromCloud('oneiroiArchive', []);
        associationJournal = await loadFromCloud('associationJournal', []);
        
        khernipsCount = await loadFromCloud('khernipsCount', 0);
        kharisCount = await loadFromCloud('kharisCount', 0);
        libationsList = await loadFromCloud('libationsList', []);

        deities.forEach(d => {
            if(!shrineData[d]) shrineData[d] = { offerings: [], sketch: null, petitions: [] };
            if(!deityGrimoire[d]) deityGrimoire[d] = { plants: [], animals: [], offerings: [], colors: [], symbols: [] };
        });

        populateDeityDropdown();
        renderGrimoireArchive();
        renderJournalArchive(); 
        renderOneiroiArchive();
        renderAssociationJournal();
        
        const kBtn = document.getElementById('khernips-btn');
        if(kBtn) kBtn.innerText = `Wash Hands (${khernipsCount})`;
        
        const kSpan = document.getElementById('kharis-count');
        if(kSpan) kSpan.innerText = kharisCount;
        
        renderLibations();
        
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

    // --- KHERNIPS LOGIC ---
    const khernipsBtn = document.getElementById('khernips-btn');
    if (khernipsBtn) {
        khernipsBtn.addEventListener('click', async () => {
            khernipsCount++;
            khernipsBtn.innerText = `Wash Hands (${khernipsCount})`;
            await saveToCloud('khernipsCount', khernipsCount);
        });
    }

    // --- KHARIS TRACKER LOGIC ---
    const kharisBtn = document.getElementById('kharis-btn');
    const kharisCountSpan = document.getElementById('kharis-count');
    if (kharisBtn) {
        kharisBtn.addEventListener('click', async () => {
            kharisCount++;
            if (kharisCountSpan) kharisCountSpan.innerText = kharisCount;
            await saveToCloud('kharisCount', kharisCount);
        });
    }

    // --- LIBATIONS LOGIC ---
    const addLibationBtn = document.getElementById('add-libation-btn');
    const newLibationName = document.getElementById('new-libation-name');
    const newLibationType = document.getElementById('new-libation-type');
    const newLibationNote = document.getElementById('new-libation-note');
    
    if (addLibationBtn && newLibationName) {
        addLibationBtn.addEventListener('click', async () => {
            const name = newLibationName.value.trim();
            const type = newLibationType ? newLibationType.options[newLibationType.selectedIndex].text : "Offering";
            const note = newLibationNote ? newLibationNote.value.trim() : "";
            
            if (name) {
                const archiveKey = 'archive_' + currentShrine;
                let records = await loadFromCloud(archiveKey, []);
                
                records.unshift({
                    id: Date.now(),
                    name: name,
                    type: type,
                    note: note,
                    status: 'active',
                    date: new Date().toLocaleString()
                });
                
                await saveToCloud(archiveKey, records);

                kharisCount++;
                if (kharisCountSpan) kharisCountSpan.innerText = kharisCount;
                await saveToCloud('kharisCount', kharisCount);

                newLibationName.value = '';
                if(newLibationNote) newLibationNote.value = '';
                
                const container = document.getElementById('libation-sparkle-container');
                if(container) {
                    const sparkle = document.createElement('div');
                    sparkle.innerText = `Logged to ${currentShrine}'s Archive! (∩^ω^)⊃━☆ﾟ.*`;
                    sparkle.className = 'sparkle-anim';
                    container.appendChild(sparkle);
                    setTimeout(() => sparkle.remove(), 2500);
                }
            }
        });
    }

    function renderLibations() {
        const listEl = document.getElementById('libation-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        
        libationsList.forEach(item => {
            if (typeof item === 'string') {
                item = { id: Date.now() + Math.random(), name: item, type: 'Legacy Offering', note: '', deity: 'General', status: 'active' };
            }
            
            const div = document.createElement('div');
            div.className = `libation-card ${item.status === 'cleared' ? 'libation-cleared' : ''}`;
            
            div.innerHTML = `
                <div class="libation-header">
                    <span>${item.name}</span>
                    <div class="libation-actions">
                        <button class="action-icon-btn toggle-btn" data-id="${item.id}" title="Toggle Active/Cleared">${item.status === 'active' ? '⋆☀︎.' : '( ˘ ³˘)ノ'}</button>
                        <button class="action-icon-btn delete-btn" data-id="${item.id}" title="Delete">(x.x)</button>
                    </div>
                </div>
                <div class="libation-tags">
                    <span class="libation-tag">To: ${item.deity}</span>
                    <span class="libation-tag">${item.type}</span>
                </div>
                ${item.note ? `<div class="libation-note">"${item.note}"</div>` : ''}
            `;
            listEl.appendChild(div);
        });
        
        document.querySelectorAll('#libation-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseFloat(e.target.getAttribute('data-id'));
                libationsList = libationsList.filter(l => l.id !== id && l !== e.target.getAttribute('data-id')); 
                await saveToCloud('libationsList', libationsList);
                renderLibations();
            });
        });
        
        document.querySelectorAll('#libation-list .toggle-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseFloat(e.target.getAttribute('data-id'));
                const item = libationsList.find(l => l.id === id);
                if (item) {
                    item.status = item.status === 'active' ? 'cleared' : 'active';
                    await saveToCloud('libationsList', libationsList);
                    renderLibations();
                }
            });
        });
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
                <div class="manuscript-header toggle-collapse" style="cursor: pointer;">
                    <h4>Sanctuary of ${d}</h4>
                    <span class="manuscript-badge">Active Shrine</span>
                </div>
                <div class="manuscript-content hidden">
                    <div class="manuscript-section">
                        <p class="manuscript-label">⊹🩵ྀི Sacred Colors</p>
                        <div class="tag-container">
                            ${data.colors.length ? data.colors.map(c => `<span class="cute-tag">${c}</span>`).join('') : '<span class="empty-tag">No colors added</span>'}
                        </div>
                    </div>
                    <div class="manuscript-section">
                        <p class="manuscript-label">𓆣𓏲⋆ Sacred Symbols</p>
                        <div class="tag-container">
                            ${data.symbols.length ? data.symbols.map(s => `<span class="cute-tag">${s}</span>`).join('') : '<span class="empty-tag">No symbols added</span>'}
                        </div>
                    </div>
                    <div class="manuscript-section">
                        <p class="manuscript-label">˚˖𓍢ִ໋❁˚ Sacred Plants</p>
                        <div class="tag-container">
                            ${data.plants.length ? data.plants.map(p => `<span class="cute-tag">${p}</span>`).join('') : '<span class="empty-tag">No plants added</span>'}
                        </div>
                    </div>
                    <div class="manuscript-section">
                        <p class="manuscript-label">݁ ˖Ი𐑼⋆ Sacred Animals</p>
                        <div class="tag-container">
                            ${data.animals.length ? data.animals.map(a => `<span class="cute-tag">${a}</span>`).join('') : '<span class="empty-tag">No animals added</span>'}
                        </div>
                    </div>
                    <div class="manuscript-section">
                        <p class="manuscript-label">𓏢 Standard Offerings</p>
                        <div class="tag-container">
                            ${data.offerings.length ? data.offerings.map(o => `<span class="cute-tag">${o}</span>`).join('') : '<span class="empty-tag">No offerings added</span>'}
                        </div>
                    </div>
                    <div class="manuscript-footer">
                        <span>Canvas Items: ${shrine.offerings.length}</span>
                        <span>Petitions: ${shrine.petitions.length}</span>
                    </div>
                    <button class="cute-btn full-width margin-top edit-grimoire-btn" data-deity="${d}">Edit Grimoire Associations *:･ﾟ✧</button>
                    <button class="cute-btn full-width margin-top open-archive-btn" data-deity="${d}" style="background: #fbf9ff;">♡ Open Offering Archive</button>
                </div>
            `;
            grid.appendChild(card);
        });

        document.querySelectorAll('.toggle-collapse').forEach(header => {
            header.addEventListener('click', (e) => {
                const contentWrapper = header.nextElementSibling;
                if(contentWrapper && contentWrapper.classList.contains('manuscript-content')) {
                    contentWrapper.classList.toggle('hidden');
                }
            });
        });

        document.querySelectorAll('.edit-grimoire-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deity = e.target.getAttribute('data-deity');
                openGrimoireEditor(deity);
            });
        });

        document.querySelectorAll('.open-archive-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const deity = e.target.getAttribute('data-deity');
                openDeityArchiveModal(deity);
            });
        });
    }

    async function openDeityArchiveModal(deity) {
        const modal = document.getElementById('archive-modal');
        const title = document.getElementById('archive-modal-title');
        const content = document.getElementById('archive-modal-content');
        
        if(modal && title && content) {
            title.innerText = `${deity}'s Devotional Archive`;
            content.innerHTML = '<p class="center-text">Loading archives... ↺</p>';
            modal.classList.remove('hidden');

            try {
                let records = await loadFromCloud('archive_' + deity, []);
                
                if(records.length === 0) {
                    content.innerHTML = '<p class="center-text" style="font-size:0.85rem; color:var(--text-muted);">No records found for this deity yet. Log an offering to start building your ledger!</p>';
                } else {
                    content.innerHTML = '';
                    records.forEach(item => {
                        const div = document.createElement('div');
                        div.className = `libation-card ${item.status === 'cleared' ? 'libation-cleared' : ''}`;
                        div.innerHTML = `
                            <div class="libation-header">
                                <span>${item.name}</span>
                                <div class="libation-actions">
                                    <button class="action-icon-btn toggle-btn" data-id="${item.id}" data-deity="${deity}" title="Toggle Active/Cleared">${item.status === 'active' ? '⋆☀︎.' : '( ˘ ³˘)ノ'}</button>
                                    <button class="action-icon-btn delete-btn" data-id="${item.id}" data-deity="${deity}" title="Delete">(x.x)</button>
                                </div>
                            </div>
                            <div class="libation-tags">
                                <span class="libation-tag">${item.date}</span>
                                <span class="libation-tag">${item.type}</span>
                            </div>
                            ${item.note ? `<div class="libation-note">"${item.note}"</div>` : ''}
                        `;
                        content.appendChild(div);
                    });

                    content.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            if(confirm("Delete this record permanently? (x.x)")) {
                                const id = parseFloat(e.currentTarget.getAttribute('data-id'));
                                const d = e.currentTarget.getAttribute('data-deity');
                                let recs = await loadFromCloud('archive_' + d, []);
                                recs = recs.filter(r => r.id !== id);
                                await saveToCloud('archive_' + d, recs);
                                openDeityArchiveModal(d); 
                            }
                        });
                    });

                    content.querySelectorAll('.toggle-btn').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const id = parseFloat(e.currentTarget.getAttribute('data-id'));
                            const d = e.currentTarget.getAttribute('data-deity');
                            let recs = await loadFromCloud('archive_' + d, []);
                            const item = recs.find(r => r.id === id);
                            if(item) {
                                item.status = item.status === 'active' ? 'cleared' : 'active';
                                await saveToCloud('archive_' + d, recs);
                                openDeityArchiveModal(d); 
                            }
                        });
                    });
                }
            } catch (err) {
                content.innerHTML = '<p class="center-text">Error loading archives (x.x)</p>';
            }
        }
    }

    // --- CORRESPONDENCE JOURNAL & LORE CODEX LOGIC ---
    const toggleAssocBtn = document.getElementById('toggle-assoc-form-btn');
    const assocForm = document.getElementById('assoc-form-container');
    const saveAssocBtn = document.getElementById('save-assoc-btn');
    const cancelAssocBtn = document.getElementById('cancel-assoc-btn');
    const searchCorrInput = document.getElementById('search-corr-input');

    if(toggleAssocBtn && assocForm) {
        toggleAssocBtn.addEventListener('click', () => {
            assocForm.classList.remove('hidden');
            document.getElementById('edit-assoc-id').value = '';
            document.getElementById('assoc-name').value = '';
            document.getElementById('assoc-category').value = 'Flora & Herbs';
            document.getElementById('assoc-deities').value = '';
            document.getElementById('assoc-elements').value = '';
            document.getElementById('assoc-intent').value = '';
            document.getElementById('assoc-notes').value = '';
        });
    }

    if(cancelAssocBtn && assocForm) {
        cancelAssocBtn.addEventListener('click', () => {
            assocForm.classList.add('hidden');
        });
    }

    if(saveAssocBtn) {
        saveAssocBtn.addEventListener('click', async () => {
            const name = document.getElementById('assoc-name').value.trim();
            if(!name) { alert("Please provide a name for the entry."); return; }

            const editId = document.getElementById('edit-assoc-id').value;
            const newEntry = {
                id: editId ? parseInt(editId) : Date.now(),
                name: name,
                category: document.getElementById('assoc-category').value,
                deities: document.getElementById('assoc-deities').value.trim(),
                elements: document.getElementById('assoc-elements').value.trim(),
                intent: document.getElementById('assoc-intent').value.trim(),
                notes: document.getElementById('assoc-notes').value.trim()
            };

            if (editId) {
                const index = associationJournal.findIndex(a => a.id === parseInt(editId));
                if (index > -1) associationJournal[index] = newEntry;
            } else {
                associationJournal.unshift(newEntry);
            }

            await saveToCloud('associationJournal', associationJournal);
            assocForm.classList.add('hidden');
            
            if(searchCorrInput) {
                renderAssociationJournal(searchCorrInput.value);
            } else {
                renderAssociationJournal();
            }
        });
    }

    if (searchCorrInput) {
        searchCorrInput.addEventListener('input', (e) => {
            renderAssociationJournal(e.target.value);
        });
    }

    function renderAssociationJournal(filterText = '') {
        const list = document.getElementById('association-list');
        if(!list) return;
        list.innerHTML = '';
        
        let displayList = associationJournal;
        
        if (filterText.trim() !== '') {
            const term = filterText.toLowerCase();
            displayList = associationJournal.filter(entry => 
                (entry.name && entry.name.toLowerCase().includes(term)) ||
                (entry.category && entry.category.toLowerCase().includes(term)) ||
                (entry.deities && entry.deities.toLowerCase().includes(term)) ||
                (entry.intent && entry.intent.toLowerCase().includes(term)) ||
                (entry.elements && entry.elements.toLowerCase().includes(term)) ||
                (entry.notes && entry.notes.toLowerCase().includes(term))
            );
        }

        if (displayList.length === 0) {
            list.innerHTML = '<p class="center-text" style="font-size:0.8rem; color:var(--text-muted);">No entries found. ‧₊˚ ☁️⋅𓂃 ࣪</p>';
            return;
        }

        displayList.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'libation-card';
            
            card.innerHTML = `
                <div class="libation-header">
                    <span>${entry.name}</span>
                    <div class="libation-actions">
                        <button class="action-icon-btn edit-assoc-btn" data-id="${entry.id}" title="Edit Entry">≡</button>
                        <button class="action-icon-btn delete-assoc-btn" data-id="${entry.id}" title="Delete">(x.x)</button>
                    </div>
                </div>
                <div class="libation-tags" style="margin-bottom:6px;">
                    <span class="libation-tag">${entry.category}</span>
                </div>
                ${entry.deities ? `<div style="font-size:0.8rem; color:var(--text-dark); margin-bottom:2px;"><strong>Deities:</strong> ${entry.deities}</div>` : ''}
                ${entry.elements ? `<div style="font-size:0.8rem; color:var(--text-dark); margin-bottom:2px;"><strong>Elemental/Planet:</strong> ${entry.elements}</div>` : ''}
                ${entry.intent ? `<div style="font-size:0.8rem; color:var(--text-dark); margin-bottom:2px;"><strong>Intent:</strong> ${entry.intent}</div>` : ''}
                ${entry.notes ? `<div style="font-size:0.85rem; font-style:italic; line-height:1.4; margin-top:6px;">"${entry.notes}"</div>` : ''}
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.delete-assoc-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("Delete this lore entry permanently? (x.x)")) {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    associationJournal = associationJournal.filter(a => a.id !== id);
                    await saveToCloud('associationJournal', associationJournal);
                    if(searchCorrInput) {
                        renderAssociationJournal(searchCorrInput.value);
                    } else {
                        renderAssociationJournal();
                    }
                }
            });
        });

        document.querySelectorAll('.edit-assoc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                const entry = associationJournal.find(a => a.id === id);
                if(entry) {
                    document.getElementById('edit-assoc-id').value = entry.id;
                    document.getElementById('assoc-name').value = entry.name;
                    document.getElementById('assoc-category').value = entry.category;
                    document.getElementById('assoc-deities').value = entry.deities || "";
                    document.getElementById('assoc-elements').value = entry.elements || "";
                    document.getElementById('assoc-intent').value = entry.intent || "";
                    document.getElementById('assoc-notes').value = entry.notes || "";
                    document.getElementById('assoc-form-container').classList.remove('hidden');
                }
            });
        });
    }


    // --- ONEIROI ARCHIVE LOGIC ---
    const saveQuickDreamBtn = document.getElementById('save-quick-dream-btn');
    if(saveQuickDreamBtn) {
        saveQuickDreamBtn.addEventListener('click', async () => {
            const text = document.getElementById('quick-dream-text').value.trim();
            if(!text) return;
            oneiroiArchive.unshift({
                id: Date.now(),
                title: "Untitled Fragment",
                raw_notes: text,
                source: "Uncategorized",
                deity: "",
                context: "",
                tags: [],
                aftermath: "",
                date: new Date().toLocaleString()
            });
            document.getElementById('quick-dream-text').value = '';
            await saveToCloud('oneiroiArchive', oneiroiArchive);
            renderOneiroiArchive();
            
            const container = document.getElementById('quick-log-container');
            if(container) {
                const sparkle = document.createElement('div');
                sparkle.innerText = 'Dream Logged! (∩^ω^)⊃━☆ﾟ.*';
                sparkle.className = 'sparkle-anim';
                container.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 2500);
            }
        });
    }

    function renderOneiroiArchive() {
        const list = document.getElementById('oneiroi-list');
        if(!list) return;
        list.innerHTML = '';
        
        if (oneiroiArchive.length === 0) {
            list.innerHTML = '<p class="center-text" style="font-size:0.8rem; color:var(--text-muted);">No dreams logged yet. ‧₊˚ ☁️⋅𓂃 ࣪</p>';
            return;
        }

        oneiroiArchive.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'libation-card';
            
            let tagsHtml = (entry.tags || []).map(t => `<span class="libation-tag">#${t}</span>`).join('');
            
            card.innerHTML = `
                <div class="libation-header">
                    <span>${entry.title}</span>
                    <div class="libation-actions">
                        <button class="action-icon-btn edit-dream-btn" data-id="${entry.id}" title="Deep-Dive Analysis">✎</button>
                        <button class="action-icon-btn delete-dream-btn" data-id="${entry.id}" title="Delete">(x.x)</button>
                    </div>
                </div>
                <div style="font-size:0.85rem; font-style:italic; margin-bottom: 6px;">"${entry.raw_notes}"</div>
                <div class="libation-tags">
                    <span class="libation-tag">Source: ${entry.source}</span>
                    ${entry.deity ? `<span class="libation-tag">Deity: ${entry.deity}</span>` : ''}
                    ${tagsHtml}
                </div>
                ${entry.context ? `<div class="libation-note">Context: ${entry.context}</div>` : ''}
                ${entry.aftermath ? `<div class="libation-note">Aftermath: ${entry.aftermath}</div>` : ''}
                <div style="font-size:0.65rem; color:var(--text-muted); margin-top:4px; text-align:right;">${entry.date}</div>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.delete-dream-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("Delete this dream log? (x.x)")) {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    oneiroiArchive = oneiroiArchive.filter(d => d.id !== id);
                    await saveToCloud('oneiroiArchive', oneiroiArchive);
                    renderOneiroiArchive();
                }
            });
        });

        document.querySelectorAll('.edit-dream-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                const dream = oneiroiArchive.find(d => d.id === id);
                if(dream) {
                    document.getElementById('edit-dream-id').value = dream.id;
                    document.getElementById('edit-dream-title').value = dream.title === "Untitled Fragment" ? "" : dream.title;
                    document.getElementById('edit-dream-notes').value = dream.raw_notes;
                    document.getElementById('edit-dream-source').value = dream.source || "Theoi / Daimonic";
                    document.getElementById('edit-dream-deity').value = dream.deity || "";
                    document.getElementById('edit-dream-context').value = dream.context || "";
                    document.getElementById('edit-dream-tags').value = (dream.tags || []).join(', ');
                    document.getElementById('edit-dream-aftermath').value = dream.aftermath || "";
                    
                    document.getElementById('oneiroi-modal').classList.remove('hidden');
                }
            });
        });
    }

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
            card.style.position = 'relative'; 
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%; font-size:0.75rem; color:var(--text-muted); margin-bottom:6px; padding-right:30px;">
                    <span><strong>${entry.type}</strong></span>
                    <span>${entry.date}</span>
                </div>
                <div style="font-size:0.85rem; font-weight:normal; line-height:1.4;">
                    ${entry.text}
                </div>
                <button class="edit-archive-btn" data-id="${entry.id}">≡</button>
            `;
            list.appendChild(card);
        });

        document.querySelectorAll('.edit-archive-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const entryIndex = journalArchive.findIndex(item => item.id === id);
                if (entryIndex === -1) return;

                const action = prompt("Type 'edit' to change this entry or 'delete' to remove it (u_u):", "edit");
                if (action === null) return;
                
                if (action.toLowerCase() === 'delete') {
                    if (confirm("Are you sure you want to delete this entry?")) {
                        journalArchive.splice(entryIndex, 1);
                        await saveToCloud('journalArchive', journalArchive);
                        renderJournalArchive();
                    }
                } else if (action.toLowerCase() === 'edit') {
                    const newText = prompt("Update your reading/prayer:", journalArchive[entryIndex].text);
                    if (newText !== null && newText.trim() !== '') {
                        journalArchive[entryIndex].text = newText.trim();
                        await saveToCloud('journalArchive', journalArchive);
                        renderJournalArchive();
                    }
                }
            });
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
            
            img.addEventListener('click', () => {
                if(confirm("Remove this offering from the shrine?")) {
                    shrineData[currentShrine].offerings = shrineData[currentShrine].offerings.filter(o => o.id !== off.id);
                    saveAndRenderShrine();
                }
            });

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
                
                const canvas = document.getElementById("altar-canvas");
                const cellW = canvas ? (canvas.offsetWidth / 3) : 100;
                const cellH = canvas ? (canvas.offsetHeight / 3) : 85;

                const defaultX = (cellW / 2) - 27.5;
                const defaultY = (cellH / 2) - 27.5;

                shrineData[currentShrine].offerings.push({
                    id: Date.now(),
                    src: event.target.result,
                    x: defaultX, 
                    y: defaultY
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
            
            el.style.zIndex = "100";

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
            
            el.style.zIndex = "10";

            if (isDragging) {
                const canvas = document.getElementById("altar-canvas");
                
                const cellW = canvas.offsetWidth / 3;
                const cellH = canvas.offsetHeight / 3;

                let finalX = parseInt(el.style.left) || 0;
                let finalY = parseInt(el.style.top) || 0;

                let col = Math.round(finalX / cellW);
                let row = Math.round(finalY / cellH);

                col = Math.max(0, Math.min(col, 2));
                row = Math.max(0, Math.min(row, 2));

                if (col === 1 && row === 0) {
                    row = 1; 
                }

                const snappedX = (col * cellW) + (cellW / 2) - (el.offsetWidth / 2);
                const snappedY = (row * cellH) + (cellH / 2) - (el.offsetHeight / 2);

                el.style.left = snappedX + "px";
                el.style.top = snappedY + "px";

                const offering = shrineData[currentShrine].offerings.find(o => o.id === offeringId);
                if (offering) {
                    offering.x = snappedX;
                    offering.y = snappedY;
                    saveAndRenderShrine();
                }
            }
        }

        el.addEventListener('mousedown', dragStart);
        el.addEventListener('touchstart', dragStart, {passive: false});
    }

    // ==========================================
    // 5. HEARTH OF HESTIA RITUAL TOGGLE
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
                    <strong>𓍢ִ໋🀦 Hearth of Hestia Lit</strong><br>
                    <em>"First and last to Hestia we pour the sacred honey-sweet libation."</em><br>
                    Your sacred space is now opened and protected by the First Goddess.
                `;
                hestiaToggleBtn.textContent = "Extinguish / Close Hearth 🇽";
            } else {
                hestiaDisplay.innerHTML = `
                    <strong>🇽 Hearth Closed</strong><br>
                    <em>"Farewell gentle Hestia, guardian of our home."</em>
                `;
                setTimeout(() => {
                    hestiaDisplay.classList.add('hidden');
                }, 2000);
                hestiaToggleBtn.textContent = "Light the Hearth of Hestia 𓍢ִ໋🀦";
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
            
            journalArchive.unshift({
                id: Date.now(),
                type: `Petition to ${currentShrine}`,
                text: textArea.value.trim(),
                date: new Date().toLocaleString()
            });
            
            await saveToCloud('shrineData', shrineData);
            await saveToCloud('journalArchive', journalArchive);

            renderGrimoireArchive();
            renderJournalArchive(); 
            textArea.classList.add('fade-out');
            
            const container = document.getElementById('sparkle-container');
            if(container) {
                const sparkle = document.createElement('div');
                sparkle.innerText = '(∩^ω^)⊃━☆ﾟ.*';
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

    const saveJournalBtn = document.getElementById('save-journal-btn');
    if (saveJournalBtn) {
        saveJournalBtn.addEventListener('click', async () => {
            const journalEntry = document.getElementById('journal-entry');
            if (!journalEntry || journalEntry.value.trim() === '') return;

            journalArchive.unshift({
                id: Date.now(),
                type: 'Divination Reading',
                text: journalEntry.value.trim(),
                date: new Date().toLocaleString()
            });

            await saveToCloud('journalArchive', journalArchive);
            renderJournalArchive(); 

            journalEntry.value = '';
            alert("Entry saved to your archive! ⋆☀︎.");
        });
    }

    const sweepBtn = document.getElementById('sweep-altar-btn');
    if(sweepBtn) {
        sweepBtn.addEventListener('click', () => {
            if(shrineData[currentShrine]) {
                shrineData[currentShrine].offerings = [];
            }
            saveAndRenderShrine();
            
            kharisCount++;
            if(kharisCountSpan) kharisCountSpan.innerText = kharisCount;
            saveToCloud('kharisCount', kharisCount);

            alert("Make sure to clean your physical space as well! 𓇢𓆸");
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
        { date: "Aug 12, 2026", event: "Total Solar Eclipse 𑣲☾" },
        { date: "Aug 28, 2026", event: "Partial Lunar Eclipse ⋆" },
        { date: "Dec 24, 2026", event: "Super Full Moon ◯" },
        { date: "Feb 6, 2027", event: "Annular Solar Eclipse 𑣲☾" },
        { date: "Feb 20, 2027", event: "Penumbral Lunar Eclipse ⋆" },
        { date: "Jul 18, 2027", event: "Supermoon ◯" },
        { date: "Aug 2, 2027", event: "Total Solar Eclipse 𑣲☾" }
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

    const toggleWheelEvents = document.getElementById('toggle-wheel-events');
    if(toggleWheelEvents) {
        toggleWheelEvents.addEventListener('click', () => {
            const content = document.getElementById('wheel-of-year-content');
            if(content) content.classList.toggle('hidden');
        });
    }

    function renderWheelOfYear() {
        const now = new Date();
        
        const solarThresholds = [
            { name: "Autumnal Equinox (Pyanopsia / Thesmophoria)", date: new Date(2026, 8, 22), focus: "Gratitude, harvest offerings to Demeter & Persephone, and preparation for the dark half of the year." },
            { name: "Winter Solstice (Poseideia / Lenaia)", date: new Date(2026, 11, 21), focus: "The hearth fire (Hestia), honoring ancestral spirits, introspection, and welcoming the returning sun." },
            { name: "Vernal Equinox (Megalesia / Elaphebolion)", date: new Date(2027, 2, 20), focus: "Renewal, planting seeds, honoring Artemis & Dionysus, and the celebration of initial growth." },
            { name: "Summer Solstice (Skira / Thargelia)", date: new Date(2027, 5, 21), focus: "Peak light, thanking Apollo & Helios, mid-summer protection, and purification rites." }
        ];

        let nextSolar = solarThresholds.find(e => e.date > now);
        if(!nextSolar) nextSolar = solarThresholds[0]; 

        const nameSolarEl = document.getElementById('next-solar-name');
        const focusSolarEl = document.getElementById('next-solar-focus');
        const dateSolarEl = document.getElementById('next-solar-date');
        const countSolarEl = document.getElementById('next-solar-countdown');

        if(nameSolarEl) nameSolarEl.innerText = nextSolar.name;
        if(focusSolarEl) focusSolarEl.innerText = nextSolar.focus;
        
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        if(dateSolarEl) dateSolarEl.innerText = nextSolar.date.toLocaleDateString(undefined, options);

        const diffTimeSolar = Math.abs(nextSolar.date - now);
        const diffDaysSolar = Math.ceil(diffTimeSolar / (1000 * 60 * 60 * 24)); 
        if(countSolarEl) countSolarEl.innerText = `${diffDaysSolar} days away`;

        const sabbats = [
            { name: "Samhain", month: 9, date: 31, focus: "Chthonic Descent & Ancestor Veneration. Honor the Progonoi, Hekate, Hades, and Persephone." },
            { name: "Yule", month: 11, date: 21, focus: "The Sun's Rebirth. Honor Apollo, Helios, and the eternal flame of Hestia." },
            { name: "Imbolc", month: 1, date: 1, focus: "Hearth Flames & Purification. Cleanse the home with Khernips and honor Hestia." },
            { name: "Ostara", month: 2, date: 21, focus: "Vernal Awakening. Celebrate Persephone's return from the Underworld and Demeter's joy." },
            { name: "Beltane", month: 4, date: 1, focus: "Festival of Blossoms & Passion. Honor Aphrodite, Eros, and Dionysus with floral crowns and sweet wine." },
            { name: "Litha", month: 5, date: 21, focus: "Zenith of the Sun. Honor Apollo and Zeus. A time for great bonfires and protection magic." },
            { name: "Lammas", month: 7, date: 1, focus: "The First Harvest. Offerings of grain and bread to Demeter and Athena." },
            { name: "Mabon", month: 8, date: 21, focus: "The Second Harvest. A time of balance and wine, honoring Dionysus and giving thanks." }
        ];

        let nextSabbat = null;
        let minDiffSabbat = Infinity;

        sabbats.forEach(s => {
            let sDate = new Date(now.getFullYear(), s.month, s.date);
            if (sDate < now) {
                sDate = new Date(now.getFullYear() + 1, s.month, s.date);
            }
            const diff = sDate - now;
            if (diff < minDiffSabbat) {
                minDiffSabbat = diff;
                nextSabbat = { ...s, parsedDate: sDate };
            }
        });

        const nameSabbatEl = document.getElementById('next-sabbat-name');
        const focusSabbatEl = document.getElementById('next-sabbat-focus');
        const dateSabbatEl = document.getElementById('next-sabbat-date');
        const countSabbatEl = document.getElementById('next-sabbat-countdown');

        if(nameSabbatEl) nameSabbatEl.innerText = nextSabbat.name;
        if(focusSabbatEl) focusSabbatEl.innerText = nextSabbat.focus;
        if(dateSabbatEl) dateSabbatEl.innerText = nextSabbat.parsedDate.toLocaleDateString(undefined, options);

        const diffDaysSabbat = Math.ceil(minDiffSabbat / (1000 * 60 * 60 * 24));
        if(countSabbatEl) countSabbatEl.innerText = `${diffDaysSabbat} days away`;
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
        if (elongation < 3 || elongation > 357) phase = "[New Moon]";
        else if (elongation >= 3 && elongation < 87) phase = "[Waxing Crescent]";
        else if (elongation >= 87 && elongation < 93) phase = "[First Quarter]";
        else if (elongation >= 93 && elongation < 177) phase = "[Waxing Gibbous]";
        else if (elongation >= 177 && elongation < 183) phase = "[Full Moon]";
        else if (elongation >= 183 && elongation < 267) phase = "[Waning Gibbous]";
        else if (elongation >= 267 && elongation < 273) phase = "[Third Quarter]";
        else phase = "[Waning Crescent]";

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
    initApp();
    renderLunarEvents();
    renderWheelOfYear();
    loadMoonAndLocationData();
    loadDailyHymn();

});

