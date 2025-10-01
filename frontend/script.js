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

let currentPlatform = "twitter";
let liveInterval;

// ================== Charts ==================
// Twitter Line Chart
const ctxLine = trendCanvas.getContext("2d");
let trendChart = new Chart(ctxLine, {
  type: "line",
  data: {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    datasets: [
      {
        label: "Mentions",
        data: [],
        borderColor: "#ff6b6b",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Likes",
        data: [],
        borderColor: "#1dd1a1",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Shares",
        data: [],
        borderColor: "#54a0ff",
        fill: false,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { position: "top", labels: { color: "#fff" } } },
    scales: {
      y: { ticks: { color: "#fff" } },
      x: { ticks: { color: "#fff" } },
    },
  },
});

// Instagram Pie Chart
const ctxPie = sentimentCanvas.getContext("2d");
let sentimentChart = new Chart(ctxPie, {
  type: "pie",
  data: {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      { data: [0, 0, 0], backgroundColor: ["#1dd1a1", "#feca57", "#ff6b6b"] },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { position: "top", labels: { color: "#fff" } } },
  },
});

// LinkedIn Bar Chart
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
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#fff" } },
      x: { ticks: { color: "#fff" } },
    },
  },
});

// ================== Helpers ==================
const generateRandomData = (size = 7) =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 100));
const generateRandomSentiment = () => [
  Math.floor(Math.random() * 60 + 20),
  Math.floor(Math.random() * 30 + 10),
  Math.floor(Math.random() * 30 + 10),
];
const generateRandomLinkedIn = () => [
  Math.floor(Math.random() * 100),
  Math.floor(Math.random() * 150),
  Math.floor(Math.random() * 80),
];

// Generates trending data with small variation so line is visible
const generateTrendData = (base) =>
  Array.from({ length: 7 }, () =>
    Math.max(0, base + Math.floor(Math.random() * 20 - 10))
  );

// ================== Fetch Trends ==================
async function fetchTrends() {
  const keyword = keywordInput.value.trim() || currentPlatform;

  // ===== Twitter =====
  if (currentPlatform === "twitter") {
    trendCanvas.style.display = "block";
    sentimentCanvas.style.display = "none";
    linkedinCanvas.style.display = "none";

    try {
      const res = await fetch(
        `http://localhost:5000/api/twitter/trends/${keyword}`
      );
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
    } catch (err) {
      console.error("Twitter fetch error:", err);
      const randomMentions = generateRandomData(1)[0];
      const randomLikes = generateRandomData(1)[0];
      const randomShares = generateRandomData(1)[0];

      mentionsEl.textContent = randomMentions;
      likesEl.textContent = randomLikes;
      sharesEl.textContent = randomShares;

      trendChart.data.datasets[0].data = generateTrendData(randomMentions);
      trendChart.data.datasets[1].data = generateTrendData(randomLikes);
      trendChart.data.datasets[2].data = generateTrendData(randomShares);
      trendChart.update();
    }
  }

  // ===== Instagram =====
  if (currentPlatform === "instagram") {
    trendCanvas.style.display = "none";
    sentimentCanvas.style.display = "block";
    linkedinCanvas.style.display = "none";

    try {
      const res = await fetch(
        `http://localhost:5000/api/instagram/trends/${keyword}`
      );
      const data = await res.json();

      const positive = data.positive ?? Math.floor(Math.random() * 60 + 20);
      const neutral = data.neutral ?? Math.floor(Math.random() * 30 + 10);
      const negative = data.negative ?? Math.floor(Math.random() * 30 + 10);

      mentionsEl.textContent = positive;
      likesEl.textContent = neutral;
      sharesEl.textContent = negative;

      sentimentChart.data.datasets[0].data = [positive, neutral, negative];
      sentimentChart.update();
    } catch (err) {
      console.error("Instagram fetch error:", err);
      const randomSentiment = generateRandomSentiment();
      mentionsEl.textContent = randomSentiment[0];
      likesEl.textContent = randomSentiment[1];
      sharesEl.textContent = randomSentiment[2];
      sentimentChart.data.datasets[0].data = randomSentiment;
      sentimentChart.update();
    }
  }

  // ===== LinkedIn =====
  if (currentPlatform === "linkedin") {
    trendCanvas.style.display = "none";
    sentimentCanvas.style.display = "none";
    linkedinCanvas.style.display = "block";

    try {
      const res = await fetch(
        `http://localhost:5000/api/linkedin/trends/${keyword}`
      );
      const data = await res.json();

      const mentions = data.mentions ?? generateRandomLinkedIn()[0];
      const likes = data.likes ?? generateRandomLinkedIn()[1];
      const shares = data.shares ?? generateRandomLinkedIn()[2];

      mentionsEl.textContent = mentions;
      likesEl.textContent = likes;
      sharesEl.textContent = shares;

      linkedinChart.data.datasets[0].data = [mentions, likes, shares];
      linkedinChart.update();
    } catch (err) {
      console.error("LinkedIn fetch error:", err);
      const randomData = generateRandomLinkedIn();
      mentionsEl.textContent = randomData[0];
      likesEl.textContent = randomData[1];
      sharesEl.textContent = randomData[2];
      linkedinChart.data.datasets[0].data = randomData;
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

// ================== Initial Load ==================
fetchTrends();
startLiveUpdates();
