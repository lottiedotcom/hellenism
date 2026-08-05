document.addEventListener("DOMContentLoaded", () => {
  // Navigation Handler
  const navButtons = document.querySelectorAll(".nav-btn[data-target]");
  const views = document.querySelectorAll(".view");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      playSound();
      navButtons.forEach(b => b.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.getAttribute("data-target")).classList.add("active");
    });
  });

  // Sound Handler
  const soundToggle = document.getElementById("sound-toggle");
  const sfx = document.getElementById("action-sound");
  
  function playSound() {
    if (soundToggle && soundToggle.checked) {
      sfx.currentTime = 0;
      sfx.play().catch(e => console.log("Audio play blocked", e));
    }
  }

  // Phase Data: Text-based Kaomojis & Energy Keywords
  const phaseDetails = {
    "New Moon": { kaomoji: "( ●_● )", keywords: "Intentions • Beginnings • Clarity" },
    "Waxing Crescent": { kaomoji: "( ☽◡☾ )", keywords: "Growth • Action • Momentum" },
    "First Quarter": { kaomoji: "( ◑‿◐ )", keywords: "Challenge • Decisions • Strength" },
    "Waxing Gibbous": { kaomoji: "( ◖◡◗ )", keywords: "Refinement • Patience • Adjustment" },
    "Full Moon": { kaomoji: "( ◯ ▽ ◯ )", keywords: "Power • Culmination • Gratitude" },
    "Waning Gibbous": { kaomoji: "( ◗◡◖ )", keywords: "Release • Reflection • Introspection" },
    "Last Quarter": { kaomoji: "( ◐‿◑ )", keywords: "Cleansing • Forgiveness • Letting Go" },
    "Waning Crescent": { kaomoji: "( ☾◡☽ )", keywords: "Rest • Banishing • Preparation" }
  };

  // Rotating Quotes
  const nightQuotes = [
    "\"Mother of mysteries, Nyx, wrap the world in your starry cloak.\"",
    "\"Selene’s silver light guides the path through the dark.\"",
    "\"Hekate, keep my steps steady at the crossroads.\"",
    "\"Hypnos, bring quiet rest to a weary soul.\"",
    "\"Asteria, star-born, falling beautifully through the night sky.\"",
    "\"Erebus, quiet the noise of the day in your gentle shadows.\""
  ];

  // Schedule-based Greeting Logic
  function updateGreeting() {
    const wakeTime = localStorage.getItem("wakeTime") || "18:00";
    const sleepTime = localStorage.getItem("sleepTime") || "06:00";
    
    document.getElementById("wake-time").value = wakeTime;
    document.getElementById("sleep-time").value = sleepTime;

    const now = new Date();
    const currentHour = now.getHours();
    const wakeHour = parseInt(wakeTime.split(":")[0]);
    const sleepHour = parseInt(sleepTime.split(":")[0]);

    const greetingEl = document.getElementById("user-greeting");

    if (currentHour >= wakeHour && currentHour < (wakeHour + 4) % 24) {
      greetingEl.innerText = "Time to greet the day ( ˘▽˘)っ♨";
    } else if (currentHour >= sleepHour - 2 || currentHour < (sleepHour + 1) % 24) {
      greetingEl.innerText = "The stars are out, time to rest (u_u)";
    } else {
      greetingEl.innerText = "Welcome back (´｡• ᵕ •｡`)";
    }
  }

  // Zodiac Sign Estimator for Moon
  function getMoonZodiac(date) {
    const zodiacs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = Math.floor(((dayOfYear * 13.368) / 30) % 12);
    return zodiacs[index];
  }

  // Real-time Moon Phase & Household Countdown Math
  function updateMoon() {
    const date = new Date();
    const cycle = 29.53058770576;
    const knownNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
    const age = ((date.getTime() - knownNewMoon) / 86400000) % cycle;
    
    let phaseName = "";
    if (age < 1 || age > 28.5) phaseName = "New Moon";
    else if (age < 7) phaseName = "Waxing Crescent";
    else if (age < 8.5) phaseName = "First Quarter";
    else if (age < 14) phaseName = "Waxing Gibbous";
    else if (age < 15.5) phaseName = "Full Moon";
    else if (age < 21) phaseName = "Waning Gibbous";
    else if (age < 23) phaseName = "Last Quarter";
    else if (age < 28.5) phaseName = "Waning Crescent";

    document.getElementById("moon-age").innerText = `${age.toFixed(1)} days`;
    document.getElementById("moon-phase-name").innerText = phaseName;
    document.getElementById("moon-percentage").innerText = `${Math.round((0.5 * (1 - Math.cos((age / cycle) * Math.PI * 2))) * 100)}%`;

    const details = phaseDetails[phaseName] || phaseDetails["New Moon"];
    document.getElementById("moon-phase-kaomoji").innerText = details.kaomoji;
    document.getElementById("moon-keywords").innerText = details.keywords;
    document.getElementById("moon-zodiac").innerText = getMoonZodiac(date);

    const progressPercent = Math.min(100, Math.round((age / cycle) * 100));
    document.getElementById("deipnon-progress").style.width = `${progressPercent}%`;
    document.getElementById("deipnon-percent").innerText = `${progressPercent}%`;

    const daysToDeipnon = cycle - age;
    const daysToNoumenia = (cycle - age + 1) % cycle;
    const daysToAgathos = (cycle - age + 2) % cycle;

    function formatDays(daysRemaining) {
      if (daysRemaining < 1) return "Today! (★ω★)";
      if (daysRemaining < 2) return "Tomorrow";
      return `In ${Math.ceil(daysRemaining)} days`;
    }

    document.getElementById("countdown-deipnon").innerText = formatDays(daysToDeipnon);
    document.getElementById("countdown-noumenia").innerText = formatDays(daysToNoumenia);
    document.getElementById("countdown-agathos").innerText = formatDays(daysToAgathos);

    const dayIndex = Math.floor(date.getTime() / 86400000) % nightQuotes.length;
    document.getElementById("night-quote").innerText = nightQuotes[dayIndex];
  }

  updateMoon();
  updateGreeting();

  // Sundown Geolocation
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
        const data = await res.json();
        const sunsetTime = new Date(data.results.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById("sundown-time").innerText = sunsetTime;
      } catch (e) {
        document.getElementById("sundown-time").innerText = "Manual tracking needed";
      }
    });
  }

  // Home Screen Trackers
  document.getElementById("save-schedule-btn").addEventListener("click", () => {
    playSound();
    localStorage.setItem("wakeTime", document.getElementById("wake-time").value);
    localStorage.setItem("sleepTime", document.getElementById("sleep-time").value);
    updateGreeting();
    alert("Schedule updated! (^_^)");
  });

  let khernipsCount = 0;
  document.getElementById("khernips-btn").addEventListener("click", (e) => {
    playSound();
    khernipsCount++;
    e.target.innerText = `Wash Hands (${khernipsCount})`;
  });

  let libations = JSON.parse(localStorage.getItem("libations")) || ["Honey", "Spring Water", "Barley"];
  const renderLibations = () => {
    const list = document.getElementById("libation-list");
    list.innerHTML = "";
    libations.forEach((lib, index) => {
      const div = document.createElement("div");
      div.className = "libation-item";
      div.innerHTML = `<span>${lib}</span> <button class="delete-btn" data-index="${index}">(x)</button>`;
      list.appendChild(div);
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        playSound();
        libations.splice(e.target.getAttribute("data-index"), 1);
        localStorage.setItem("libations", JSON.stringify(libations));
        renderLibations();
      });
    });
  };
  renderLibations();

  document.getElementById("add-libation-btn").addEventListener("click", () => {
    playSound();
    const input = document.getElementById("new-libation");
    if (input.value) {
      libations.push(input.value);
      localStorage.setItem("libations", JSON.stringify(libations));
      input.value = "";
      renderLibations();
    }
  });

  const hymns = [
    "Homeric Hymn to Hestia: 'Hestia, you who tend the holy house...'",
    "Orphic Hymn to the Stars: 'With holy voice I call the sacred stars...'",
    "Homeric Hymn to Earth: 'I will sing of well-founded Earth...'",
    "Orphic Hymn to Hekate: 'I call Hekate of the Crossroads...'"
  ];
  document.getElementById("daily-hymn").innerText = hymns[new Date().getDay() % hymns.length];

  let kharisLogs = parseInt(localStorage.getItem("kharisLogs") || "0");
  document.getElementById("kharis-count").innerText = kharisLogs;
  document.getElementById("kharis-btn").addEventListener("click", () => addKharis());

  function addKharis() {
    playSound();
    kharisLogs++;
    localStorage.setItem("kharisLogs", kharisLogs);
    document.getElementById("kharis-count").innerText = kharisLogs;
  }

  // ----------- NEW ALTAR TAB LOGIC ----------- //
  
  let altarData = JSON.parse(localStorage.getItem('altarData')) || {
    Hestia: { items: [], sketch: null },
    Hekate: { items: [], sketch: null },
    Apollo: { items: [], sketch: null },
    Hermes: { items: [], sketch: null }
  };
  let currentShrine = document.getElementById('shrine-selector').value;
  const canvas = document.getElementById('altar-canvas');
  const sketchFrame = document.getElementById('sketch-frame');

  // Shrine Switcher
  document.getElementById('shrine-selector').addEventListener('change', (e) => {
    playSound();
    currentShrine = e.target.value;
    renderAltar();
  });

  // Tiny Image Resizer (Keeps localStorage from filling up!)
  function resizeImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const MAX_WIDTH = 100; // Cute small size
        const scale = MAX_WIDTH / img.width;
        tempCanvas.width = MAX_WIDTH;
        tempCanvas.height = img.height * scale;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        callback(tempCanvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Upload Offering
  document.getElementById('upload-offering').addEventListener('change', (e) => {
    if (!e.target.files[0]) return;
    playSound();
    resizeImage(e.target.files[0], (base64) => {
      altarData[currentShrine].items.push({
        id: Date.now(),
        src: base64,
        x: 50,
        y: 50
      });
      saveAndRenderAltar();
    });
  });

  // Upload Sketch
  document.getElementById('upload-sketch').addEventListener('change', (e) => {
    if (!e.target.files[0]) return;
    playSound();
    const reader = new FileReader();
    reader.onload = (event) => {
      altarData[currentShrine].sketch = event.target.result;
      saveAndRenderAltar();
    };
    reader.readAsDataURL(e.target.files[0]);
  });

  function saveAndRenderAltar() {
    try {
      localStorage.setItem('altarData', JSON.stringify(altarData));
    } catch (e) {
      alert("Storage full! Try sweeping the altar first. (>_<)");
    }
    renderAltar();
  }

  function renderAltar() {
    // Clear canvas except for sketch frame
    Array.from(canvas.children).forEach(child => {
      if (child.id !== 'sketch-frame') child.remove();
    });

    const data = altarData[currentShrine];

    // Render Sketch
    if (data.sketch) {
      sketchFrame.style.backgroundImage = `url(${data.sketch})`;
      sketchFrame.classList.remove('hidden');
    } else {
      sketchFrame.classList.add('hidden');
    }

    // Render Offerings
    data.items.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'draggable-item';
      div.style.left = `${item.x}px`;
      div.style.top = `${item.y}px`;
      
      const img = document.createElement('img');
      img.src = item.src;
      img.style.width = '100%';
      
      const delBtn = document.createElement('div');
      delBtn.className = 'delete-overlay';
      delBtn.innerText = 'x';
      delBtn.onclick = () => {
        playSound();
        altarData[currentShrine].items.splice(index, 1);
        saveAndRenderAltar();
      };

      div.appendChild(img);
      div.appendChild(delBtn);
      canvas.appendChild(div);

      // Drag Logic
      let isDragging = false;
      let startX, startY;

      const startDrag = (e) => {
        isDragging = true;
        startX = (e.clientX || e.touches[0].clientX) - div.offsetLeft;
        startY = (e.clientY || e.touches[0].clientY) - div.offsetTop;
        div.style.zIndex = 1000;
      };

      const doDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        let newX = clientX - startX;
        let newY = clientY - startY;
        
        // Boundaries
        newX = Math.max(0, Math.min(newX, canvas.clientWidth - div.clientWidth));
        newY = Math.max(0, Math.min(newY, canvas.clientHeight - div.clientHeight));
        
        div.style.left = `${newX}px`;
        div.style.top = `${newY}px`;
        item.x = newX;
        item.y = newY;
      };

      const stopDrag = () => {
        if (isDragging) {
          isDragging = false;
          div.style.zIndex = 1;
          saveAndRenderAltar(); // Save new position silently
        }
      };

      div.addEventListener('mousedown', startDrag);
      div.addEventListener('touchstart', startDrag, {passive: false});
      document.addEventListener('mousemove', doDrag);
      document.addEventListener('touchmove', doDrag, {passive: false});
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);
    });
  }

  // Sweep Routine
  document.getElementById('sweep-altar-btn').addEventListener('click', () => {
    playSound();
    altarData[currentShrine].items = [];
    saveAndRenderAltar();
    addKharis();
    alert("Make sure to clean your physical space as well! ( ˘▽˘)っ彡");
  });

  // Time-based Prompt Generator
  document.getElementById('petition-prompt-btn').addEventListener('click', () => {
    playSound();
    const hour = new Date().getHours();
    const textArea = document.getElementById('petition-text');
    
    if (hour >= 5 && hour < 12) {
      textArea.value = "What energy are you bringing into today? ( ˘▽˘)";
    } else if (hour >= 12 && hour < 18) {
      textArea.value = "What challenges are you overcoming right now? (O_O)";
    } else {
      textArea.value = "What are you letting go of before you rest? (u_u)";
    }
  });

  // Send to the Gods Animation
  document.getElementById('petition-send-btn').addEventListener('click', () => {
    playSound();
    const textArea = document.getElementById('petition-text');
    const sparkleContainer = document.getElementById('sparkle-container');
    
    if (textArea.value.trim() === "") return;

    textArea.classList.add('fading');
    setTimeout(() => {
      sparkleContainer.innerText = "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧";
      sparkleContainer.classList.add('animating');
      textArea.value = "";
      
      setTimeout(() => {
        textArea.classList.remove('fading');
        sparkleContainer.classList.remove('animating');
        sparkleContainer.innerText = "";
      }, 2000);
    }, 1000);
  });

  // Init Altar
  renderAltar();


  // ----------- END ALTAR LOGIC ----------- //

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

  // Deity Profile Cards
  let cards = JSON.parse(localStorage.getItem("tradingCards")) || [];
  const renderCards = () => {
    const grid = document.getElementById("archive-grid");
    grid.innerHTML = "";
    cards.forEach(c => {
      const div = document.createElement("div");
      div.className = "trading-card";
      div.innerHTML = `<h4>${c.name}</h4><p><strong>Epithets:</strong> ${c.epithets}</p><p><strong>Offerings:</strong> ${c.offerings}</p>`;
      grid.appendChild(div);
    });
  };
  renderCards();

  document.getElementById("save-card-btn").addEventListener("click", () => {
    playSound();
    const name = document.getElementById("card-name-input").value;
    const epithets = document.getElementById("card-epithet-input").value;
    const offerings = document.getElementById("card-offerings-input").value;
    if (name) {
      cards.push({ name, epithets, offerings });
      localStorage.setItem("tradingCards", JSON.stringify(cards));
      renderCards();
      document.getElementById("card-name-input").value = "";
      document.getElementById("card-epithet-input").value = "";
      document.getElementById("card-offerings-input").value = "";
    }
  });

  // Vercel Postgres Journal Save
  document.getElementById("save-journal-btn").addEventListener("click", async () => {
    playSound();
    const entry = document.getElementById("journal-entry").value;
    const btn = document.getElementById("save-journal-btn");
    
    if (!entry) return;
    btn.innerText = "Saving... (O_O)";
    
    try {
      const res = await fetch('/api/saveJournal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry })
      });
      const data = await res.json();
      
      if (res.ok) {
        btn.innerText = "Saved! (^_^)";
        setTimeout(() => btn.innerText = "Save to Cloud", 2000);
      } else {
        btn.innerText = "Error (>_<)";
        console.error(data.error);
      }
    } catch (e) {
      btn.innerText = "Failed (>_<)";
      console.error(e);
    }
  });
});
