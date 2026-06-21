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
  const search = document.getElementById("search");

  const body = document.body;

  // ===============================
  // THEMES (ANIME WALLPAPERS)
  // ===============================
  const themes = [
    { name: "Itachi Uchiha", img: "images/itachi.png" },
    { name: "Kakashi Hatake", img: "images/kakashi.png" },
    { name: "Sung Jin-Woo", img: "images/sungJinWoo.png" },
    { name: "Cyberpunk", img: "images/cyberpunk.jpg" },
    { name: "Last of Us", img: "images/lastOfUs.jpg" },
    { name: "Your Name", img: "images/yourName.jpg" },
    { name: "Professor", img: "images/professor.png" },
    { name: "Bella Ciao", img: "images/bellaCiao.jpg" }
  ];

  // ===============================
  // RANDOM THEME SETTER
  // ===============================
  function setTheme() {
    const random = themes[Math.floor(Math.random() * themes.length)];

    body.style.backgroundImage = `url(${random.img})`;
    themeEl.innerText = `Theme: ${random.name}`;
  }

  setTheme();

  // ===============================
  // CLOCK ENGINE (SMOOTH)
  // ===============================
  function updateClock() {
    const now = new Date();

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

  updateClock();

  // ===============================
  // GREETING SYSTEM
  // ===============================
  function setGreeting() {
    const hour = new Date().getHours();

    let greet = "Good Evening";

    if (hour < 12) greet = "Good Morning";
    else if (hour < 18) greet = "Good Afternoon";

    greetingEl.innerText = `${greet}, Itachi 👋`;
  }

  setGreeting();

  // ===============================
  // SEARCH BAR
  // ===============================
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = search.value.trim();

      if (query.startsWith("http")) {
        window.location.href = query;
      } else {
        window.location.href = `https://www.google.com/search?q=${query}`;
      }
    }
  });

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

  loadWeather();

};