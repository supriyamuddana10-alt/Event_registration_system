/* Campus Events - offline-first event registration system */
const STORE_KEY = "campusEventsSystem_v1";
let db = loadData();
let modalState = null;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.events) && Array.isArray(saved.students) && Array.isArray(saved.registrations)) return saved;
  } catch (e) {}
  return { events: [], students: [], registrations: [] };
}
function saveData() { localStorage.setItem(STORE_KEY, JSON.stringify(db)); renderAll(); }
function uid(prefix) { return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,7); }
function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function eventRegs(id) { return db.registrations.filter(r => r.eventId === id); }
function eventName(id) { return db.events.find(e => e.id === id)?.name || "Deleted event"; }
function studentName(id) { return db.students.find(s => s.id === id)?.name || "Deleted student"; }
function isOver(e) { return eventRegs(e.id).length > Number(e.capacity); }
function remaining(e) { return Number(e.capacity) - eventRegs(e.id).length; }
function toast(msg) { const el=document.getElementById("toast"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2400); }
function empty(msg) { return `<div class="empty">${esc(msg)}</div>`; }

function showPage(page) {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(page+"-page").classList.add("active");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  document.getElementById("page-title").textContent = page[0].toUpperCase()+page.slice(1);
  renderAll();
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));

function renderAll(){ renderDashboard(); renderEvents(); renderStudents(); renderRegistrations(); updateRegistrationEventFilter(); }
function renderDashboard(){
  document.getElementById("statEvents").textContent=db.events.length;
  document.getElementById("statStudents").textContent=db.students.length;
  document.getElementById("statRegistrations").textContent=db.registrations.length;
  document.getElementById("statOver").textContent=db.events.filter(isOver).length;
  const recent=[...db.events].slice(-5).reverse();
  document.getElementById("dashboardEvents").innerHTML=recent.length?table(["EVENT","DATE","PARTICIPANTS","STATUS"],recent.map(e=>`<tr><td class="primary-cell">${esc(e.name)}<span class="sub-cell">${esc(e.venue)}</span></td><td>${esc(e.date||"—")}</td><td>${eventRegs(e.id).length} / ${e.capacity}</td><td>${statusTag(e)}</td></tr>`)):empty("No events yet. Add your first event.");
  const over=db.events.filter(isOver);
  document.getElementById("dashboardAlerts").innerHTML=over.length?over.map(e=>`<div class="alert-item"><strong>${esc(e.name)}</strong><p>${eventRegs(e.id).length} registrations for a capacity of ${e.capacity}. Existing registrations are preserved.</p></div>`).join(""):empty("No capacity alerts. Everything looks good!");
}
function table(headers,rows){return `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;}
function statusTag(e){const n=eventRegs(e.id).length;if(n>Number(e.capacity))return `<span class="tag bad">Over capacity</span>`;if(n===Number(e.capacity))return `<span class="tag warn">Full</span>`;return `<span class="tag good">Open</span>`;}
function renderEvents(){
 const q=(document.getElementById("eventSearch")?.value||"").toLowerCase(), f=document.getElementById("eventFilter")?.value||"all";
 const list=db.events.filter(e=>(e.name+" "+e.venue+" "+e.description).toLowerCase().includes(q)).filter(e=>f==="all"||(f==="available"&&remaining(e)>0)||(f==="full"&&remaining(e)===0)||(f==="over"&&isOver(e)));
 document.getElementById("eventsTable").innerHTML=list.length?table(["EVENT","DATE","VENUE","PARTICIPANTS","STATUS","ACTIONS"],list.map(e=>`<tr><td class="primary-cell">${esc(e.name)}<span class="sub-cell">${esc(e.description||"")}</span></td><td>${esc(e.date||"—")}</td><td>${esc(e.venue||"—")}</td><td>${eventRegs(e.id).length} / ${e.capacity}<span class="sub-cell">${Math.max(0,remaining(e))} seats available</span></td><td>${statusTag(e)}</td><td><div class="actions"><button class="mini-btn" data-action="participants" data-id="${e.id}">List</button><button class="mini-btn" data-action="edit-event" data-id="${e.id}">Edit</button><button class="mini-btn" data-action="delete-event" data-id="${e.id}">Delete</button></div></td></tr>`)):empty("No matching events found.");
}
function renderStudents(){
 const q=(document.getElementById("studentSearch")?.value||"").toLowerCase();
 const list=db.students.filter(s=>(s.name+" "+s.roll+" "+s.email+" "+s.department).toLowerCase().includes(q));
 document.getElementById("studentsTable").innerHTML=list.length?table(["STUDENT","ROLL NUMBER","EMAIL","DEPARTMENT","REGISTRATIONS","ACTIONS"],list.map(s=>`<tr><td class="primary-cell">${esc(s.name)}</td><td>${esc(s.roll)}</td><td>${esc(s.email||"—")}</td><td>${esc(s.department||"—")}</td><td>${db.registrations.filter(r=>r.studentId===s.id).length}</td><td><div class="actions"><button class="mini-btn" data-action="edit-student" data-id="${s.id}">Edit</button><button class="mini-btn" data-action="delete-student" data-id="${s.id}">Delete</button></div></td></tr>`)):empty("No students found.");
}
function updateRegistrationEventFilter(){
 const sel=document.getElementById("registrationEventFilter");if(!sel)return;
 const old=sel.value;sel.innerHTML='<option value="all">All events</option>'+db.events.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join("");
 if([...sel.options].some(o=>o.value===old))sel.value=old;
}
function renderRegistrations(){
 const q=(document.getElementById("registrationSearch")?.value||"").toLowerCase(), f=document.getElementById("registrationEventFilter")?.value||"all";
 const list=db.registrations.filter(r=>(f==="all"||r.eventId===f)).filter(r=>(studentName(r.studentId)+" "+eventName(r.eventId)+" "+(db.students.find(s=>s.id===r.studentId)?.roll||"")).toLowerCase().includes(q));
 document.getElementById("registrationsTable").innerHTML=list.length?table(["STUDENT","EVENT","REGISTERED ON","ACTIONS"],list.map(r=>`<tr><td class="primary-cell">${esc(studentName(r.studentId))}<span class="sub-cell">${esc(db.students.find(s=>s.id===r.studentId)?.roll||"")}</span></td><td>${esc(eventName(r.eventId))}</td><td>${esc(r.createdAt)}</td><td><button class="mini-btn" data-action="delete-registration" data-id="${r.id}">Remove</button></td></tr>`)):empty("No registrations match your filters.");
}

function openModal(title, eyebrow, fields, onSave){
 modalState={onSave};document.getElementById("modalTitle").textContent=title;document.getElementById("modalEyebrow").textContent=eyebrow;document.getElementById("formMessage").textContent="";
 document.getElementById("modalFields").innerHTML=fields.map(f=>`<div class="field ${f.full?"full":""}"><label for="${f.id}">${f.label}</label>${f.type==="select"?`<select id="${f.id}" ${f.required?"required":""}>${f.options}</select>`:f.type==="textarea"?`<textarea id="${f.id}" placeholder="${f.placeholder||""}">${esc(f.value||"")}</textarea>`:`<input id="${f.id}" type="${f.type||"text"}" value="${esc(f.value||"")}" placeholder="${f.placeholder||""}" ${f.required?"required":""} ${f.min!==undefined?`min="${f.min}"`:""} ${f.max!==undefined?`max="${f.max}"`:""}>`}</div>`).join("");
 document.getElementById("modalBackdrop").classList.remove("hidden");
}
function closeModal(){document.getElementById("modalBackdrop").classList.add("hidden");modalState=null;}
document.getElementById("closeModal").onclick=closeModal;document.getElementById("cancelModal").onclick=closeModal;
document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
document.getElementById("modalForm").addEventListener("submit",e=>{e.preventDefault();if(!modalState)return;const values={};document.querySelectorAll("#modalFields input,#modalFields select,#modalFields textarea").forEach(x=>values[x.id]=x.value.trim());const error=modalState.onSave(values);if(error){document.getElementById("formMessage").textContent=error;return;}closeModal();saveData();});

function editEvent(id=null){
 const e=id?db.events.find(x=>x.id===id):null;
 openModal(e?"Edit event":"Add event","EVENT DETAILS",[
 {id:"name",label:"Event name",value:e?.name,required:true,full:true},{id:"date",label:"Event date",type:"date",value:e?.date,required:true},{id:"capacity",label:"Maximum capacity",type:"number",min:1,value:e?.capacity??50,required:true},{id:"venue",label:"Venue",value:e?.venue,required:true,full:true},{id:"description",label:"Description",type:"textarea",value:e?.description,full:true}
 ],v=>{if(!v.name||!v.date||!v.venue||!v.capacity||Number(v.capacity)<1)return "Enter event name, date, venue and a capacity of at least 1.";if(e){Object.assign(e,{name:v.name,date:v.date,capacity:Number(v.capacity),venue:v.venue,description:v.description});}else db.events.push({id:uid("evt"),name:v.name,date:v.date,capacity:Number(v.capacity),venue:v.venue,description:v.description});return "";});
}
function editStudent(id=null){
 const s=id?db.students.find(x=>x.id===id):null;
 openModal(s?"Edit student":"Add student","STUDENT DETAILS",[
 {id:"name",label:"Student name",value:s?.name,required:true},{id:"roll",label:"Roll number",value:s?.roll,required:true},{id:"email",label:"Email",type:"email",value:s?.email},{id:"department",label:"Department / Branch",value:s?.department}
 ],v=>{if(!v.name||!v.roll)return "Student name and roll number are required.";if(db.students.some(x=>x.roll.toLowerCase()===v.roll.toLowerCase()&&x.id!==s?.id))return "This roll number already exists.";if(s)Object.assign(s,v);else db.students.push({id:uid("stu"),...v});return "";});
}
function registerStudent(){
 if(!db.events.length||!db.students.length){toast("Add at least one event and one student first.");return;}
 const eventOptions=db.events.map(e=>{const count=eventRegs(e.id).length, disabled=count>=Number(e.capacity);return `<option value="${e.id}" ${disabled?"disabled":""}>${esc(e.name)} (${count}/${e.capacity}${isOver(e)?" - over capacity":""})${disabled?" - FULL":""}</option>`;}).join("");
 const studentOptions=db.students.map(s=>`<option value="${s.id}">${esc(s.name)} — ${esc(s.roll)}</option>`).join("");
 openModal("Register student","NEW REGISTRATION",[
 {id:"eventId",label:"Select event",type:"select",options:eventOptions,required:true,full:true},
 {id:"studentId",label:"Select student",type:"select",options:studentOptions,required:true,full:true}
 ],v=>{const ev=db.events.find(x=>x.id===v.eventId);if(!ev)return "Please select an event.";if(eventRegs(ev.id).length>=Number(ev.capacity))return "This event has reached its capacity. No new registration is allowed.";if(db.registrations.some(r=>r.eventId===v.eventId&&r.studentId===v.studentId))return "This student is already registered for this event.";db.registrations.push({id:uid("reg"),eventId:v.eventId,studentId:v.studentId,createdAt:new Date().toLocaleString()});return "";});
}
function showParticipants(eventId){document.getElementById("registrationEventFilter").value=eventId;showPage("registrations");}
document.getElementById("addEventBtn").onclick=()=>editEvent();
document.getElementById("addStudentBtn").onclick=()=>editStudent();
document.getElementById("addRegistrationBtn").onclick=registerStudent;
["eventSearch","eventFilter"].forEach(id=>document.getElementById(id).addEventListener("input",renderEvents));
document.getElementById("studentSearch").addEventListener("input",renderStudents);
document.getElementById("registrationSearch").addEventListener("input",renderRegistrations);
document.getElementById("registrationEventFilter").addEventListener("change",renderRegistrations);

document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b)return;const id=b.dataset.id,action=b.dataset.action;
 if(action==="edit-event")editEvent(id);
 if(action==="edit-student")editStudent(id);
 if(action==="participants")showParticipants(id);
 if(action==="delete-event"){const ev=db.events.find(x=>x.id===id),n=eventRegs(id).length;if(confirm(`Delete "${ev.name}" and its ${n} registration(s)? This cannot be undone.`)){db.events=db.events.filter(x=>x.id!==id);db.registrations=db.registrations.filter(r=>r.eventId!==id);saveData();toast("Event deleted.");}}
 if(action==="delete-student"){const st=db.students.find(x=>x.id===id),n=db.registrations.filter(r=>r.studentId===id).length;if(confirm(`Delete "${st.name}" and remove ${n} linked registration(s)?`)){db.students=db.students.filter(x=>x.id!==id);db.registrations=db.registrations.filter(r=>r.studentId!==id);saveData();toast("Student deleted.");}}
 if(action==="delete-registration"){if(confirm("Remove this registration?")){db.registrations=db.registrations.filter(r=>r.id!==id);saveData();toast("Registration removed.");}}
});

document.getElementById("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="event-registration-backup.json";a.click();URL.revokeObjectURL(url);toast("Backup exported.");};
document.getElementById("importInput").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.events)||!Array.isArray(data.students)||!Array.isArray(data.registrations))throw Error();if(!confirm("Importing a backup will replace the current data. Continue?"))return;db=data;saveData();toast("Backup imported.");}catch(err){alert("Invalid backup file. Please choose a JSON backup exported by this app.");}e.target.value="";});

renderAll();
