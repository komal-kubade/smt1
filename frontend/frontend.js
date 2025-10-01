// ================== DOM Elements ==================
const searchBtn = document.getElementById("searchBtn");
const mentionsEl = document.getElementById("mentions");
const likesEl = document.getElementById("likes");
const sharesEl = document.getElementById("shares");
const keywordInput = document.getElementById("keyword");
const tabButtons = document.querySelectorAll(".tab-btn");
const trendCanvas = document.getElementById("trendChart");
const sentimentCanvas = document.getElementById("sentimentChart");
const linkedinCanvas = document.getElementById("linkedinChart");
const authButtons = document.querySelector(".auth-buttons");

let currentPlatform = "twitter";
let liveInterval;

// ================== Check Login Status ==================
function checkLoginStatus() {
  const token = localStorage.getItem("token");

  if (token) {
    authButtons.innerHTML = `
      <p>✅ Logged in <button id="logoutBtn">Logout</button></p>
    `;
    document.getElementById("logoutBtn").addEventListener("click", logout);
  } else {
    authButtons.innerHTML = `
      <button onclick="window.location.href='signup.html'">Signup</button>
      <button onclick="window.location.href='login.html'">Login</button>
    `;
  }
}

// ================== Logout ==================
function logout() {
  localStorage.removeItem("token");
  checkLoginStatus();
}

// ================== Helpers ==================
const generateRandomData = (size = 7) =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 100));

const generateRandomSentiment = () => [
  Math.floor(Math.random() * 60 + 20),
  Math.floor(Math.random() * 30 + 10),
  Math.floor(Math.random() * 30 + 10),
];

const generateTrendData = (base) =>
  Array.from({ length: 7 }, () =>
    Math.max(0, base + Math.floor(Math.random() * 20 - 10))
  );

// ================== Charts ==================
const ctxLine = trendCanvas.getContext("2d");
let trendChart = new Chart(ctxLine, {
  type: "line",
  data: {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    datasets: [
      { label: "Mentions", data: [], borderColor: "#ff6b6b", fill: false },
      { label: "Likes", data: [], borderColor: "#1dd1a1", fill: false },
      { label: "Shares", data: [], borderColor: "#54a0ff", fill: false },
    ],
  },
  options: { responsive: true },
});

const ctxPie = sentimentCanvas.getContext("2d");
let sentimentChart = new Chart(ctxPie, {
  type: "pie",
  data: {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      { data: [0, 0, 0], backgroundColor: ["#1dd1a1", "#feca57", "#ff6b6b"] },
    ],
  },
  options: { responsive: true },
});

const ctxBar = linkedinCanvas.getContext("2d");
let linkedinChart = new Chart(ctxBar, {
  type: "bar",
  data: {
    labels: ["Mentions", "Likes", "Shares"],
    datasets: [
      {
        label: "LinkedIn Metrics",
        data: [0, 0, 0],
        backgroundColor: ["#1e90ff", "#00ced1", "#ff8c00"],
      },
    ],
  },
  options: { responsive: true },
});

// ================== Fetch Trends ==================
async function fetchTrends() {
  const keyword = keywordInput.value.trim() || currentPlatform;

  // ===== Twitter =====
  if (currentPlatform === "twitter") {
    trendCanvas.style.display = "block";
    sentimentCanvas.style.display = "none";
    linkedinCanvas.style.display = "none";

    try {
      const res = await fetch(`http://localhost:5000/api/twitter/${keyword}`);
      const data = await res.json();
      const mentions = data.mentions ?? generateRandomData(1)[0];
      const likes = data.likes ?? generateRandomData(1)[0];
      const shares = data.shares ?? generateRandomData(1)[0];

      mentionsEl.textContent = mentions;
      likesEl.textContent = likes;
      sharesEl.textContent = shares;

      trendChart.data.datasets[0].data = generateTrendData(mentions);
      trendChart.data.datasets[1].data = generateTrendData(likes);
      trendChart.data.datasets[2].data = generateTrendData(shares);
      trendChart.update();
    } catch {
      const mentions = generateRandomData(1)[0];
      const likes = generateRandomData(1)[0];
      const shares = generateRandomData(1)[0];
      mentionsEl.textContent = mentions;
      likesEl.textContent = likes;
      sharesEl.textContent = shares;
      trendChart.data.datasets[0].data = generateTrendData(mentions);
      trendChart.data.datasets[1].data = generateTrendData(likes);
      trendChart.data.datasets[2].data = generateTrendData(shares);
      trendChart.update();
    }
  }

  // ===== Instagram =====
  if (currentPlatform === "instagram") {
    trendCanvas.style.display = "none";
    sentimentCanvas.style.display = "block";
    linkedinCanvas.style.display = "none";

    try {
      const res = await fetch(`http://localhost:5000/api/instagram/${keyword}`);
      const data = await res.json();
      const positive = data.positive ?? Math.floor(Math.random() * 60 + 20);
      const neutral = data.neutral ?? Math.floor(Math.random() * 30 + 10);
      const negative = data.negative ?? Math.floor(Math.random() * 30 + 10);

      mentionsEl.textContent = positive;
      likesEl.textContent = neutral;
      sharesEl.textContent = negative;

      sentimentChart.data.datasets[0].data = [positive, neutral, negative];
      sentimentChart.update();
    } catch {
      const rand = generateRandomSentiment();
      mentionsEl.textContent = rand[0];
      likesEl.textContent = rand[1];
      sharesEl.textContent = rand[2];
      sentimentChart.data.datasets[0].data = rand;
      sentimentChart.update();
    }
  }

  // ===== LinkedIn =====
  if (currentPlatform === "linkedin") {
    trendCanvas.style.display = "none";
    sentimentCanvas.style.display = "none";
    linkedinCanvas.style.display = "block";

    try {
      const res = await fetch(`http://localhost:5000/api/linkedin/${keyword}`);
      const data = await res.json();
      const mentions = data.mentions ?? generateRandomData(1)[0];
      const likes = data.likes ?? generateRandomData(1)[0];
      const shares = data.shares ?? generateRandomData(1)[0];

      mentionsEl.textContent = mentions;
      likesEl.textContent = likes;
      sharesEl.textContent = shares;
      linkedinChart.data.datasets[0].data = [mentions, likes, shares];
      linkedinChart.update();
    } catch {
      const rand = generateRandomData(3);
      mentionsEl.textContent = rand[0];
      likesEl.textContent = rand[1];
      sharesEl.textContent = rand[2];
      linkedinChart.data.datasets[0].data = rand;
      linkedinChart.update();
    }
  }
}

// ================== Events ==================
searchBtn.addEventListener("click", () => {
  fetchTrends();
  startLiveUpdates();
});
keywordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchTrends();
    startLiveUpdates();
  }
});
tabButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentPlatform = btn.dataset.platform;
    fetchTrends();
  })
);

// ================== Auto-update ==================
function startLiveUpdates() {
  clearInterval(liveInterval);
  liveInterval = setInterval(fetchTrends, 5000);
}

// ================== Analytics ==================
function addAnalytics(platform, followers, likes, comments) {
  console.log(
    `Analytics added: ${platform} - Followers:${followers}, Likes:${likes}, Comments:${comments}`
  );
}
function getAnalytics() {
  alert("Analytics data is logged in console");
}

// ================== Initial Load ==================
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  fetchTrends();
  startLiveUpdates();
});
