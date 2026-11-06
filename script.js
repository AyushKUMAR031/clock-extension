window.onload = () => {
  // ===============================
  // ELEMENTS
  // ===============================
  const hourHand = document.querySelector(".hour");
  const minuteHand = document.querySelector(".minute");
  const secondHand = document.querySelector(".second");

  const digital = document.getElementById("digital");
  const greetingEl = document.getElementById("greeting");
  const dateEl = document.getElementById("date");
  const themeEl = document.getElementById("theme");
  const calendarEl = document.getElementById("calendar");

  const body = document.body;

  // ===============================
  // FALLBACK GRADIENTS (for missing images)
  // ===============================
  const fallbackGradients = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #2c003e 0%, #4b006e 50%, #6a0dad 100%)',
    'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
    'linear-gradient(135deg, #1b1b2f 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #2d1b4e 0%, #3e1f5b 50%, #5d2e7a 100%)'
  ];

  // ===============================
  // DEFAULT THEMES REMOVED - Only custom themes from storage
  // ===============================
  let customThemes = [];
  let userName = "";
  let lastCalendarDay = new Date().toDateString();

  // ===============================
  // LOAD SETTINGS FROM STORAGE
  // ===============================
  async function loadSettings() {
    try {
      const [syncData, localData] = await Promise.all([
        chrome.storage.sync.get({ userName: "" }),
        chrome.storage.local.get({ customThemes: [] })
      ]);
      userName = syncData.userName;
      customThemes = localData.customThemes || [];
      updateGreeting();
    } catch (err) {
      console.log("Storage not available, using defaults:", err);
    }
  }

  // ===============================
  // GET ALL THEMES (ONLY CUSTOM FROM STORAGE)
  // ===============================
  function getAllThemes() {
    return customThemes;
  }

  // ===============================
  // RANDOM THEME SETTER
  // ===============================
  function setTheme() {
    const themes = getAllThemes();
    
    // No custom themes - show simple gradient, no theme label
    if (themes.length === 0) {
      const fallback = fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)];
      body.style.backgroundImage = fallback;
      themeEl.innerText = '';
      return;
    }

    // 1+ custom themes - pick random
    const random = themes[Math.floor(Math.random() * themes.length)];

    // Set fallback gradient first (immediate)
    const fallback = fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)];
    body.style.backgroundImage = fallback;

    // Try to load the actual image
    const img = new Image();
    img.onload = () => {
      body.style.backgroundImage = `url(${random.img})`;
    };
    img.onerror = () => {
      // Keep fallback gradient
      console.log(`Failed to load theme image: ${random.img}`);
    };
    img.src = random.img;

    themeEl.innerText = `Theme: ${random.name}`;
  }

  // ===============================
  // CALENDAR
  // ===============================
  function renderCalendar() {
    if (!calendarEl) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let cells = weekdays
      .map(day => `<span class="cal-weekday">${day}</span>`)
      .join("");

    for (let i = 0; i < firstDay; i++) {
      cells += '<span class="cal-day"></span>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today ? " today" : "";
      cells += `<span class="cal-day${isToday}">${day}</span>`;
    }

    calendarEl.innerHTML = `
      <div class="cal-header">${monthNames[month]} ${year}</div>
      <div class="cal-grid">${cells}</div>
    `;
  }

  // ===============================
  // CLOCK ENGINE (SMOOTH)
  // ===============================
  function updateClock() {
    const now = new Date();

    // Re-render calendar when the day changes (e.g. tab left open overnight)
    if (now.toDateString() !== lastCalendarDay) {
      lastCalendarDay = now.toDateString();
      renderCalendar();
    }

    const ms = now.getMilliseconds();
    const sec = now.getSeconds() + ms / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = now.getHours() % 12 + min / 60;

    const secDeg = sec * 6;
    const minDeg = min * 6;
    const hrDeg = hr * 30;

    hourHand.style.transform = `translateX(-50%) rotate(${hrDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;

    // DIGITAL CLOCK
    digital.innerText = now.toLocaleTimeString();

    // DATE
    dateEl.innerText = now.toDateString();

    requestAnimationFrame(updateClock);
  }

  // ===============================
  // GREETING SYSTEM
  // ===============================
  function updateGreeting() {
    const hour = new Date().getHours();

    let greet = "Good Evening";

    if (hour < 12) greet = "Good Morning";
    else if (hour < 18) greet = "Good Afternoon";

    const namePart = userName ? `, ${userName} 👋` : ' 👋';
    greetingEl.innerText = `${greet}${namePart}`;
  }

  // ===============================
  // WEATHER (GEOLOCATION + API)
  // ===============================
  function loadWeather() {
    const locationEl = document.getElementById("location");
    const tempEl = document.getElementById("temp");
    const iconEl = document.getElementById("weather-icon");

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const apiKey = "ae3c46e647f3cdde386f8d9483e2cf43";

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );

        const data = await res.json();

        locationEl.innerText = data.name;
        tempEl.innerText = `${Math.round(data.main.temp)}°C`;

        const weather = data.weather[0].main;

        const icons = {
          Clear: "☀️",
          Clouds: "☁️",
          Rain: "🌧",
          Thunderstorm: "⛈",
          Snow: "❄️",
          Mist: "🌫"
        };

        iconEl.innerText = icons[weather] || "🌤";

      } catch (err) {
        console.log("Weather error:", err);
      }
    });
  }

  // ===============================
  // STORAGE CHANGE LISTENER (REAL-TIME SYNC)
  // ===============================
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.customThemes) {
      customThemes = changes.customThemes.newValue || [];
      setTheme(); // Immediately apply new theme
    }
    if (area === 'sync' && changes.userName) {
      userName = changes.userName.newValue;
      updateGreeting();
    }
  });

  // ===============================
  // INITIALIZE
  // ===============================
  async function init() {
    await loadSettings();
    setTheme();
    renderCalendar();
    updateClock();
    loadWeather();
  }

  init();
};