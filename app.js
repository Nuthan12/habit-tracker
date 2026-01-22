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

function onHabitChange() {
  const habit = document.getElementById("habitSelect").value;

  document.getElementById("timeSection").style.display =
    habit === "reading" ? "block" : "none";

  document.getElementById("booleanSection").style.display =
    habit === "walking" ? "block" : "none";

  if (habit) loadHabitChart(habit);
}

async function loadHabitChart(habitId) {
  const snap = await db.collection("activities")
    .where("userId", "==", auth.currentUser.uid)
    .where("habitId", "==", habitId)
    .orderBy("date")
    .get();

  const labels = [];
  const values = [];

  snap.forEach(doc => {
    const d = doc.data();
    labels.push(d.date);
    values.push(
      habitId === "reading"
        ? d.durationMinutes / 60
        : d.status === "SUCCESS" ? 1 : 0
    );
  });

  renderChart(labels, values, habitId);
}

async function saveBoolean(success) {
  const habitId = document.getElementById("habitSelect").value;

  await db.collection("activities").add({
    userId: auth.currentUser.uid,
    habitId,
    date: new Date().toISOString().slice(0, 10),
    status: success ? "SUCCESS" : "FAILED",
    createdAt: Date.now()
  });

  loadHabitChart(habitId);
}

async function saveHabit() {
  const habitId = document.getElementById("habitSelect").value;
  if (!habitId) return alert("Select a habit");

  let data = {
    userId: auth.currentUser.uid,
    habitId,
    date: new Date().toISOString().slice(0, 10),
    createdAt: Date.now()
  };

  if (habitId === "reading") {
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;

    const duration = calculateMinutes(start, end);

    data.startTime = start;
    data.endTime = end;
    data.durationMinutes = duration;
    data.status = duration > 0 ? "SUCCESS" : "FAILED";
  }

  await db.collection("activities").add(data);
  loadHabitChart(habitId);
}

function calculateMinutes(start, end) {
  let startDate = new Date(`1970-01-01T${start}`);
  let endDate = new Date(`1970-01-01T${end}`);

  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  return (endDate - startDate) / 60000;
}



function calculateMinutes(start, end) {
  let startDate = new Date(`1970-01-01T${start}`);
  let endDate = new Date(`1970-01-01T${end}`);

  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  return (endDate - startDate) / 60000;
}

async function saveHabit() {
  const habitId = document.getElementById("habitSelect").value;
  if (!habitId) return alert("Select a habit");

  let data = {
    userId: auth.currentUser.uid,
    habitId,
    date: new Date().toISOString().slice(0, 10),
    createdAt: Date.now()
  };

  if (habitId === "reading") {
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;

    const duration = calculateMinutes(start, end);

    data.startTime = start;
    data.endTime = end;
    data.durationMinutes = duration;
    data.status = duration > 0 ? "SUCCESS" : "FAILED";
  }

  await db.collection("activities").add(data);
  loadHabitChart(habitId);
}

async function saveBoolean(success) {
  const habitId = document.getElementById("habitSelect").value;

  await db.collection("activities").add({
    userId: auth.currentUser.uid,
    habitId,
    date: new Date().toISOString().slice(0, 10),
    status: success ? "SUCCESS" : "FAILED",
    createdAt: Date.now()
  });

  loadHabitChart(habitId);
}

async function loadHabitChart(habitId) {
  const snap = await db.collection("activities")
    .where("userId", "==", auth.currentUser.uid)
    .where("habitId", "==", habitId)
    .orderBy("date")
    .get();

  const labels = [];
  const values = [];

  snap.forEach(doc => {
    const d = doc.data();
    labels.push(d.date);
    values.push(
      habitId === "reading"
        ? d.durationMinutes / 60
        : d.status === "SUCCESS" ? 1 : 0
    );
  });

  renderChart(labels, values, habitId);
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

function renderChart(labels, values, habitId) {
  const ctx = document.getElementById("habitChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: habitId === "reading" ? "Hours" : "Done (1)",
        data: values
      }]
    },
    options: { responsive: true }
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