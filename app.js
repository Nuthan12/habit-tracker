const habits = JSON.parse(localStorage.getItem("habits")) || [];

function render() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";
  habits.forEach((h, i) => {
    list.innerHTML += `
      <li>
        <input type="checkbox" ${h.done ? "checked" : ""} 
               onchange="toggle(${i})">
        ${h.name}
      </li>`;
  });
  localStorage.setItem("habits", JSON.stringify(habits));
}
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

function addHabit() {
  const input = document.getElementById("habitInput");
  habits.push({ name: input.value, done: false });
  input.value = "";
  render();
}

function toggle(i) {
  habits[i].done = !habits[i].done;
  render();
}

render();