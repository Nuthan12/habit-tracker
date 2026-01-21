/***********************
 * 1. FIREBASE CONFIG
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyBoj4T7WEzbt5XjJbx3vgDm3cuS_gReTX4",
  authDomain: "habit-tracker-2c135.firebaseapp.com",
  projectId: "habit-tracker-2c135",
  storageBucket: "habit-tracker-2c135.firebasestorage.app",
  messagingSenderId: "552760735524",
  appId: "1:552760735524:web:91f2ce529ce36d9f3165b1",
  measurementId: "G-RDVZTEV302"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/***********************
 * 2. AUTH HANDLING
 ***********************/
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    loadCharts(user.uid);
  } else {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
  }
});

/***********************
 * 3. UTILITIES
 ***********************/
function today() {
  return new Date().toISOString().slice(0, 10);
}

function minutesBetween(start, end) {
  return (new Date(`1970-01-01T${end}`) -
          new Date(`1970-01-01T${start}`)) / 60000;
}

/***********************
 * 4. SAVE READING (DURATION)
 ***********************/
async function saveReading() {
  const start = document.getElementById("readingStart").value;
  const end = document.getElementById("readingEnd").value;

  if (!start || !end) {
    alert("Please select start and end time");
    return;
  }

  const durationMinutes = minutesBetween(start, end);

  await db.collection("activities").add({
    userId: auth.currentUser.uid,
    habit: "reading",
    date: today(),
    startTime: start,
    endTime: end,
    durationMinutes,
    status: durationMinutes > 0 ? "SUCCESS" : "FAILED",
    createdAt: Date.now()
  });

  loadCharts(auth.currentUser.uid);
}

/***********************
 * 5. SAVE WALKING (BOOLEAN)
 ***********************/
async function markWalking(success) {
  await db.collection("activities").add({
    userId: auth.currentUser.uid,
    habit: "walking",
    date: today(),
    status: success ? "SUCCESS" : "FAILED",
    createdAt: Date.now()
  });

  loadCharts(auth.currentUser.uid);
}

/***********************
 * 6. LOAD & PROCESS DATA
 ***********************/
async function loadCharts(uid) {
  const snapshot = await db.collection("activities")
    .where("userId", "==", uid)
    .orderBy("date")
    .get();

  const readingByDate = {};
  const walkingByDate = {};

  snapshot.forEach(doc => {
    const d = doc.data();

    if (d.habit === "reading") {
      readingByDate[d.date] =
        (readingByDate[d.date] || 0) + d.durationMinutes / 60;
    }

    if (d.habit === "walking") {
      walkingByDate[d.date] = d.status === "SUCCESS" ? 1 : 0;
    }
  });

  renderChart(readingByDate, walkingByDate);
}

/***********************
 * 7. CHART RENDERING
 ***********************/
let chart;

function renderChart(reading, walking) {
  const labels = Array.from(
    new Set([...Object.keys(reading), ...Object.keys(walking)])
  ).sort();

  const readingData = labels.map(d => reading[d] || 0);
  const walkingData = labels.map(d => walking[d] || 0);

  const ctx = document.getElementById("habitChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Reading (hours)",
          data: readingData
        },
        {
          label: "Walking (done=1)",
          data: walkingData
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/***********************
 * 8. AGGREGATIONS (READY)
 ***********************/

// Weekly / Monthly / Yearly helpers (future use)
function aggregateBy(entries, type) {
  const map = {};
  entries.forEach(e => {
    let key;
    if (type === "week") key = e.date.slice(0, 7);
    if (type === "month") key = e.date.slice(0, 7);
    if (type === "year") key = e.date.slice(0, 4);

    map[key] = (map[key] || 0) + (e.durationMinutes || 0);
  });
  return map;
}