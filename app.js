
// ---------------- Data Model ----------------
const PROGRAM = {
  phases: [
    { name: "Weeks 1–4 • Strength Foundation", weeks: [1,2,3,4], rules: {
        main: { sets: 4, reps: "5–6", rest: "120–180s" },
        accessory: { sets: 3, reps: "8–10", rest: "90s" },
        isolation: { sets: 3, reps: "12–15", rest: "45–60s" }
      },
      tips: [
        "Dial in form. Leave 1–2 reps in reserve (RIR).",
        "Log everything. Add weight when you hit the top of the rep range on all sets.",
        "Warm up: 5–10 min cardio + joint prep before compounds."
      ]
    },
    { name: "Weeks 5–8 • Hypertrophy Overload", weeks: [5,6,7,8], rules: {
        main: { sets: 4, reps: "6–8", rest: "120s" },
        accessory: { sets: 4, reps: "8–12", rest: "60–90s" },
        isolation: { sets: 3, reps: "12–20", rest: "45–60s" }
      },
      tips: [
        "Increase total weekly sets slightly, especially for lagging muscles.",
        "Use a 3s lowering (eccentric) on accessories and isolations.",
        "Optional intensity: last set rest-pause or drop set (once per exercise)."
      ]
    },
    { name: "Weeks 9–11 • Intensification", weeks: [9,10,11], rules: {
        main: { sets: 5, reps: "3–5", rest: "180s" },
        accessory: { sets: 3, reps: "6–8", rest: "120s" },
        isolation: { sets: 2, reps: "10–12", rest: "60–90s" }
      },
      tips: [
        "Heavier, crisp reps. Keep 1 rep in reserve on main lifts.",
        "Use supersets on isolation to save time without losing quality.",
        "Prioritise sleep and calories. Recovery drives progress now."
      ]
    },
    { name: "Week 12 • Deload", weeks: [12], rules: {
        main: { sets: "↓30–40%", reps: "keep light", rest: "comfortable" },
        accessory: { sets: "↓30–40%", reps: "keep light", rest: "comfortable" },
        isolation: { sets: "↓30–40%", reps: "keep light", rest: "comfortable" }
      },
      tips: [
        "Reduce loads to ~60–70% of usual. Move well, not heavy.",
        "Light mobility, keep blood flowing, exit the week hungry to train.",
        "Plan the next cycle while fresh."
      ]
    }
  ],
  days: [
    { name: "Day 1 • Upper (Push)", exercises: [
      { n:"Barbell Bench Press", cat:"main" },
      { n:"Overhead Press (BB/DB)", cat:"main" },
      { n:"Incline Dumbbell Press", cat:"accessory" },
      { n:"Lateral Raise", cat:"isolation" },
      { n:"Triceps Rope Pushdown", cat:"isolation" },
      { n:"Overhead Triceps Extension", cat:"isolation" }
    ]},
    { name: "Day 2 • Lower (Quad Dominant)", exercises: [
      { n:"Back Squat", cat:"main" },
      { n:"Bulgarian Split Squat", cat:"accessory" },
      { n:"Leg Press", cat:"accessory" },
      { n:"Leg Extension", cat:"isolation" },
      { n:"Standing Calf Raise", cat:"isolation" },
      { n:"Hanging Leg Raise", cat:"isolation" }
    ]},
    { name: "Day 3 • Upper (Pull)", exercises: [
      { n:"Pull-Up (weighted if strong)", cat:"main" },
      { n:"Barbell / Chest-Supported Row", cat:"main" },
      { n:"Lat Pulldown (neutral/wide)", cat:"accessory" },
      { n:"Face Pull", cat:"isolation" },
      { n:"Biceps Curl (BB/DB)", cat:"isolation" },
      { n:"Incline Dumbbell Curl", cat:"isolation" }
    ]},
    { name: "Day 4 • Lower (Posterior Chain)", exercises: [
      { n:"Barbell Deadlift", cat:"main" },
      { n:"Romanian Deadlift (BB/DB)", cat:"accessory" },
      { n:"Walking Lunge", cat:"accessory" },
      { n:"Seated Leg Curl", cat:"isolation" },
      { n:"Hip Thrust / Glute Bridge", cat:"accessory" },
      { n:"Standing Calf Raise", cat:"isolation" }
    ]}
  ],
  reminders: [
    { id:"warmup", text:"Warm-up: 5–10 min + dynamic mobility", default:true },
    { id:"tempo", text:"Tempo: control eccentrics (3s in weeks 5–8)", default:true },
    { id:"rest", text:"Rest: 90–120s compounds, 45–60s isolations", default:true },
    { id:"progression", text:"Progression: add load when top reps are achieved with good form", default:true },
    { id:"nutrition", text:"Protein 1.6–2.2 g/kg • Hydrate", default:true },
    { id:"sleep", text:"Sleep 7–8h", default:true },
    { id:"deload", text:"Week 12 is a deload (~60–70% load, fewer sets)", default:true }
  ]
};

// ---------------- Render Helper ----------------
function render(){
  renderPhase();
  renderWorkout();
}

// ---------------- State & Storage ----------------
const STORAGE_KEY = "lifting_tracker_v1";
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    return { week: 1, day: 0, data:{}, reminders: PROGRAM.reminders.reduce((acc,r)=>{acc[r.id]=r.default;return acc;},{}) };
  }
  try{
    const s = JSON.parse(raw);
    if(!s.reminders){
      s.reminders = PROGRAM.reminders.reduce((acc,r)=>{acc[r.id]=r.default;return acc;},{});
    }
    return s;
  }catch(e){
    console.warn("Bad state, resetting.");
    return { week: 1, day: 0, data:{}, reminders: PROGRAM.reminders.reduce((acc,r)=>{acc[r.id]=r.default;return acc;},{}) };
  }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
let state = loadState();

function getPhaseForWeek(week){
  return PROGRAM.phases.find(p => p.weeks.includes(week));
}
function keyFor(week, day){ return `w${week}-d${day}`; }

// ---------------- UI Elements ----------------
const weekSel = document.getElementById("week");
const daySel = document.getElementById("day");
const phaseEl = document.getElementById("phase");
const tipsEl = document.getElementById("tips");
const workoutEl = document.getElementById("workout");
const volumeEl = document.getElementById("volume");
const timerEl = document.getElementById("timer");
const startTimerBtn = document.getElementById("startTimer");
const stopTimerBtn = document.getElementById("stopTimer");
const exportBtn = document.getElementById("exportData");
const importBtn = document.getElementById("importData");
const fileInput = document.getElementById("fileInput");
const resetBtn = document.getElementById("resetDay");
const notifyBtn = document.getElementById("enableNotifs");
const remindersEl = document.getElementById("reminders");
const installBtn = document.getElementById("installBtn");
const iosInstallCard = document.getElementById("iosInstall");

function initSelectors(){
  for(let w=1; w<=12; w++){
    const opt = document.createElement("option");
    opt.value = w; opt.textContent = `Week ${w}`;
    weekSel.appendChild(opt);
  }
  PROGRAM.days.forEach((d, i)=>{
    const opt = document.createElement("option");
    opt.value = i; opt.textContent = d.name;
    daySel.appendChild(opt);
  });
  weekSel.value = state.week;
  daySel.value = state.day;
  weekSel.addEventListener("change", ()=>{ state.week = +weekSel.value; saveState(); render(); });
  daySel.addEventListener("change", ()=>{ state.day = +daySel.value; saveState(); render(); });
}

function renderPhase(){
  const phase = getPhaseForWeek(state.week);
  phaseEl.innerHTML = `<div class="flex"><span class="badge">${phase.name}</span><span class="kicker">Guidelines auto-applied to sets/reps/rest</span></div>`;
  tipsEl.innerHTML = phase.tips.map(t=>`<li>${t}</li>`).join("");
}

function getRules(cat){
  const phase = getPhaseForWeek(state.week);
  return phase.rules[cat];
}
function storedEntry(){
  const k = keyFor(state.week, state.day);
  if(!state.data[k]) state.data[k] = { notes:"", exercises:{} };
  return state.data[k];
}
function renderReminders(){
  remindersEl.innerHTML = "";
  PROGRAM.reminders.forEach(r=>{
    const wrap = document.createElement("div");
    wrap.className = "toggle";
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = !!state.reminders[r.id];
    cb.addEventListener("change", ()=>{ state.reminders[r.id]=cb.checked; saveState(); });
    const label = document.createElement("label");
    label.textContent = r.text; label.htmlFor = r.id;
    wrap.appendChild(cb); wrap.appendChild(label);
    remindersEl.appendChild(wrap);
  });
}

function renderWorkout(){
  const entry = storedEntry();
  const day = PROGRAM.days[state.day];
  workoutEl.innerHTML = "";
  day.exercises.forEach((ex, idx)=>{
    const rules = getRules(ex.cat);
    let setsCount = 3;
    if(typeof rules.sets === "number") setsCount = rules.sets;
    else if(typeof rules.sets === "string" && rules.sets.includes("↓")) setsCount = 2;

    const exKey = `ex${idx}`;
    if(!entry.exercises[exKey]){
      entry.exercises[exKey] = { name: ex.n, cat: ex.cat, sets: Array.from({length:setsCount}).map(()=>({weight:"", reps:"", rpe:""})) };
    }else{
      const cur = entry.exercises[exKey].sets.length;
      if(cur < setsCount){
        for(let i=0;i<(setsCount-cur);i++) entry.exercises[exKey].sets.push({weight:"", reps:"", rpe:""});
      }else if(cur > setsCount){
        entry.exercises[exKey].sets = entry.exercises[exKey].sets.slice(0, setsCount);
      }
    }

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="flex">
        <h3 style="margin:0">${ex.n}</h3>
        <span class="tag">${ex.cat.toUpperCase()}</span>
        <span class="tag">Target: ${rules.reps} • Rest ${rules.rest}</span>
      </div>
      <table class="table" id="t-${exKey}">
        <thead><tr><th>Set</th><th>Weight (kg)</th><th>Reps</th><th>RPE</th><th>Done</th></tr></thead>
        <tbody></tbody>
      </table>
    `;
    const tbody = card.querySelector("tbody");
    entry.exercises[exKey].sets.forEach((set, si)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${si+1}</td>
        <td><input type="number" min="0" step="0.5" value="${set.weight}"/></td>
        <td><input type="number" min="0" step="1" value="${set.reps}"/></td>
        <td><input type="number" min="1" max="10" step="0.5" value="${set.rpe}"/></td>
        <td><input type="checkbox" ${set.done?"checked":""}/></td>
      `;
      const inputs = tr.querySelectorAll("input");
      inputs[0].addEventListener("input", (e)=>{ set.weight = e.target.value; saveState(); calcVolume(); });
      inputs[1].addEventListener("input", (e)=>{ set.reps = e.target.value; saveState(); calcVolume(); });
      inputs[2].addEventListener("input", (e)=>{ set.rpe = e.target.value; saveState(); });
      inputs[3].addEventListener("change", (e)=>{ set.done = e.target.checked; saveState(); });
      tbody.appendChild(tr);
    });
    workoutEl.appendChild(card);
  });

  const notes = document.createElement("textarea");
  notes.placeholder = "Workout notes (sleep, soreness, cues, pain flags, etc.)";
  notes.rows = 3; notes.value = entry.notes || "";
  notes.addEventListener("input", ()=>{ entry.notes = notes.value; saveState(); });
  const notesWrap = document.createElement("div");
  notesWrap.className="card";
  notesWrap.innerHTML = `<h3 style="margin:0 0 8px 0">Notes</h3>`;
  notesWrap.appendChild(notes);
  workoutEl.appendChild(notesWrap);

  calcVolume();
}

function calcVolume(){
  const entry = storedEntry();
  let total = 0;
  Object.values(entry.exercises).forEach(ex=>{
    ex.sets.forEach(s=>{
      const w = parseFloat(s.weight||0), r=parseFloat(s.reps||0);
      if(!isNaN(w) && !isNaN(r)) total += w*r;
    });
  });
  volumeEl.textContent = Math.round(total) + " kg total volume";
}

function resetDay(){
  if(!confirm("Reset all inputs for this week & day?")) return;
  const k = keyFor(state.week, state.day);
  delete state.data[k];
  saveState();
  renderWorkout();
}

// ---------------- Timer ----------------
let timerInt=null, remaining=0;
function startTimer(seconds){
  clearInterval(timerInt);
  remaining = seconds;
  timerEl.textContent = fmtTime(remaining);
  timerInt = setInterval(()=>{
    remaining--;
    timerEl.textContent = fmtTime(remaining);
    if(remaining<=0){
      clearInterval(timerInt);
      timerInt = null;
      timerEl.textContent = "Rest finished";
      ping("Rest is up — next set.");
    }
  },1000);
}
function stopTimer(){
  clearInterval(timerInt); timerInt=null; timerEl.textContent = "—";
}
function fmtTime(s){
  const m = Math.floor(s/60).toString().padStart(2,"0");
  const ss = (s%60).toString().padStart(2,"0");
  return `${m}:${ss}`;
}

// ---------------- Export / Import ----------------
function exportData(){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "lifting-tracker-data.json";
  a.click();
  URL.revokeObjectURL(url);
}
function importData(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const incoming = JSON.parse(reader.result);
      if(!incoming || typeof incoming !== "object") throw new Error("Bad file");
      state = incoming;
      saveState();
      initUI();
    }catch(e){
      alert("Could not import data: " + e.message);
    }
  };
  reader.readAsText(file);
}

// ---------------- Notifications ----------------
function ping(message){
  try {
    if(Notification && Notification.permission === "granted"){
      new Notification("Lifting Tracker", { body: message });
    }
  } catch(e){ /* ignore */ }
}
async function enableNotifications(){
  if(!("Notification" in window)){ alert("Notifications not supported in this browser."); return; }
  const p = await Notification.requestPermission();
  if(p === "granted"){ ping("Notifications enabled. We'll nudge you during sessions."); }
}

// ---------------- Install Prompt ----------------
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  if(installBtn){ installBtn.style.display = 'inline-block'; }
});
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./service-worker.js');
  });
}
async function installApp(){
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if(outcome === 'accepted'){ installBtn.style.display = 'none'; }
  deferredPrompt = null;
}

// ------------- iOS Install Helper -------------
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
if(isIOS && !isStandalone && iosInstallCard){
  iosInstallCard.style.display = "block";
}

// ---------------- Init ----------------
function initUI(){
  weekSel.innerHTML = ""; daySel.innerHTML = "";
  initSelectors();
  renderPhase();
  renderReminders();
  renderWorkout();
}
document.addEventListener("DOMContentLoaded", ()=>{
  initUI();

  startTimerBtn.addEventListener("click", ()=>{
    const rules = getRules("main");
    let seconds = 90;
    if(rules && rules.rest){
      const m = rules.rest.match(/(\d+)/);
      if(m) seconds = parseInt(m[1],10);
    }
    startTimer(seconds);
  });
  stopTimerBtn.addEventListener("click", stopTimer);
  exportBtn.addEventListener("click", exportData);
  importBtn.addEventListener("click", ()=>fileInput.click());
  fileInput.addEventListener("change", ()=>{
    if(fileInput.files && fileInput.files[0]) importData(fileInput.files[0]);
  });
  resetBtn.addEventListener("click", resetDay);
  notifyBtn.addEventListener("click", enableNotifications);
  installBtn.addEventListener("click", installApp);

  // Timer presets
  const p60 = document.getElementById("preset60");
  const p90 = document.getElementById("preset90");
  const p120 = document.getElementById("preset120");
  if(p60) p60.addEventListener("click", ()=>startTimer(60));
  if(p90) p90.addEventListener("click", ()=>startTimer(90));
  if(p120) p120.addEventListener("click", ()=>startTimer(120));
});
