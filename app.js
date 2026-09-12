const portals = {
  meebhoomi: "https://meebhoomi.ap.gov.in/",
  ec: "https://registration.ec.ap.gov.in/ecSearch",
  lrs: "https://lrsdtcp.ap.gov.in/PublicApplicationSearch",
  layouts: "https://lrsdtcp.ap.gov.in/dashBoard",
  propertyTax: "https://guntur.emunicipal.ap.gov.in/ptis/citizen/search/search-searchForm.action#no-back-button"
};

let properties = JSON.parse(localStorage.getItem("p360_properties") || "[]");
let customers = JSON.parse(localStorage.getItem("p360_customers") || "[]");
let currentProperty = null;
const main = document.querySelector("#main");

function save() {
  localStorage.setItem("p360_properties", JSON.stringify(properties));
  localStorage.setItem("p360_customers", JSON.stringify(customers));
}

function portal(name) {
  const url = portals[name];
  if (!url) return;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();
}

function shell(title, body) {
  main.innerHTML = `<button class="back" onclick="render('home')">← Dashboard</button><h1>${title}</h1>${body}`;
}

function render(screen) {
  if (screen === "home") {
    main.innerHTML = `
      <h1>Property Dashboard</h1>
      <input class="search" placeholder="🔎 Search property, survey no., customer..." oninput="quickSearch(this.value)">
      <div class="grid">
        <button class="card" onclick="render('new')"><div class="icon">➕</div><div class="title">New Property</div><div class="desc">Create a property file</div></button>
        <button class="card" onclick="render('land')"><div class="icon">📜</div><div class="title">1-B / Adangal</div><div class="desc">Official MeeBhoomi</div></button>
        <button class="card" onclick="render('ec')"><div class="icon">📑</div><div class="title">EC Search</div><div class="desc">Document / Survey</div></button>
        <button class="card" onclick="render('lrs')"><div class="icon">📋</div><div class="title">LRS Search</div><div class="desc">Applicant details</div></button>
        <button class="card wide" onclick="render('layouts')"><div class="icon">🏘️</div><div class="title">Completed Layouts</div><div class="desc">LRS / DTCP dashboard</div></button>
        <button class="card wide" onclick="render('propertyTax')"><div class="icon">🏛️</div><div class="title">Property Tax</div><div class="desc">Guntur Municipal Property Tax Search</div></button>
      </div>
      <div class="section">Recent Properties</div>
      <div id="recent">${properties.length ? properties.slice(-3).reverse().map(propCard).join("") : '<div class="panel">No properties yet. Create your first property file.</div>'}</div>`;
  } else if (screen === "properties") {
    shell("My Properties", properties.length ? properties.map(propCard).join("") : '<div class="panel">No properties saved yet.</div>');
  } else if (screen === "new") {
    shell("New Property", `
      <div class="panel">
        ${field("pname", "Property Name", "e.g. Guntur Site 01")}
        ${field("district", "District", "Guntur")}
        ${field("mandal", "Mandal", "Mandal")}
        ${field("village", "Village", "Village")}
        ${field("survey", "Survey Number", "123/2")}
        ${field("extent", "Extent", "2.50 Acres")}
        ${field("customer", "Customer", "Customer name")}
        ${field("phone", "Phone", "Phone number", "tel")}
        <button class="btn" onclick="createProperty()">Create Property Profile</button>
      </div>`);
  } else if (screen === "profile") {
    profile(currentProperty || properties[0]);
  } else if (screen === "customers") {
    shell("Customers", customers.length ? customers.map(c => `<div class="panel"><b>${escapeHtml(c.name)}</b><div class="row"><span>Phone</span><b>${escapeHtml(c.phone || "—")}</b></div></div>`).join("") : '<div class="panel">No customers saved yet.</div>');
  } else if (screen === "land") {
    landForm();
  } else if (screen === "ec") {
    ecForm();
  } else if (screen === "lrs") {
    lrsForm();
  } else if (screen === "layouts") {
    layoutForm();
  } else if (screen === "propertyTax") {
    propertyTaxForm();
  }

  document.querySelectorAll("nav button").forEach(b => b.classList.toggle("active", b.dataset.screen === screen));
}

function field(id, label, placeholder, type = "text") {
  return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}"></div>`;
}

function propCard(p) {
  return `<div class="panel property-card" onclick='openProfileById("${escapeAttr(p.id)}")'>
    <b>${escapeHtml(p.name)}</b>
    <div class="row"><span>Survey No.</span><b>${escapeHtml(p.survey || "—")}</b></div>
    <div class="row"><span>Extent</span><b>${escapeHtml(p.extent || "—")}</b></div>
    <div class="row"><span>Verification</span><span class="badge">${verificationCount(p)}/3 saved</span></div>
  </div>`;
}

function verificationCount(p) {
  return ["ecStatus", "lrsStatus", "layoutStatus"].filter(k => p[k]).length;
}

function openProfileById(id) {
  currentProperty = properties.find(p => p.id === id) || null;
  render("profile");
}

function profile(p) {
  if (!p) {
    render("new");
    return;
  }
  currentProperty = p;

  shell("Property Profile", `
    <div class="panel">
      <b style="font-size:18px">${escapeHtml(p.name)}</b>
      <div class="row"><span>District</span><b>${escapeHtml(p.district || "—")}</b></div>
      <div class="row"><span>Mandal / Village</span><b>${escapeHtml(p.mandal || "—")} / ${escapeHtml(p.village || "—")}</b></div>
      <div class="row"><span>Survey No.</span><b>${escapeHtml(p.survey || "—")}</b></div>
      <div class="row"><span>Extent</span><b>${escapeHtml(p.extent || "—")}</b></div>
      <div class="row"><span>Customer</span><b>${escapeHtml(p.customer || "—")}</b></div>
    </div>
    <div class="section">Government Verification</div>
    <div class="grid">
      <button class="card" onclick="render('land')">📜<div class="title">1-B / Adangal</div><div class="desc">Official MeeBhoomi</div></button>
      <button class="card" onclick="render('ec')">📑<div class="title">EC</div><div class="desc">${escapeHtml(p.ecStatus || "Not checked")}</div></button>
      <button class="card" onclick="render('lrs')">📋<div class="title">LRS</div><div class="desc">${escapeHtml(p.lrsStatus || "Not checked")}</div></button>
      <button class="card" onclick="render('layouts')">🏘️<div class="title">Layout</div><div class="desc">${escapeHtml(p.layoutStatus || "Not checked")}</div></button>
    </div>
    <div class="section">Saved Verification Notes</div>
    <div class="panel">
      <div class="row"><span>EC</span><b>${escapeHtml(p.ecNote || "—")}</b></div>
      <div class="row"><span>LRS</span><b>${escapeHtml(p.lrsNote || "—")}</b></div>
      <div class="row"><span>Layout</span><b>${escapeHtml(p.layoutNote || "—")}</b></div>
    </div>
    <div class="note">Official government portals remain the source of record. PROPERTY 360 stores your search details and verification notes on this device.</div>`);
}

function landForm() {
  shell("1-B & Adangal", `
    <div class="panel">
      ${fieldWithValue("landDistrict", "District", currentProperty?.district || "")}
      ${fieldWithValue("landMandal", "Mandal", currentProperty?.mandal || "")}
      ${fieldWithValue("landVillage", "Village", currentProperty?.village || "")}
      ${fieldWithValue("landSurvey", "Survey Number", currentProperty?.survey || "")}
      <button class="btn" onclick="portal('meebhoomi')">Open Official MeeBhoomi</button>
      <div class="note">Use these details on the official MeeBhoomi portal. CAPTCHA, OTP and other security controls are not bypassed.</div>
    </div>`);
}

function ecForm() {
  shell("EC Search", `
    <div class="panel">
      <div class="field"><label>Search Type</label><select id="ecType"><option>Document Number</option><option>Survey Number</option></select></div>
      ${fieldWithValue("ecNumber", "Document / Survey Number", currentProperty?.survey || "", "Enter number")}
      ${field("ecSro", "Year / SRO", "Optional")}
      <button class="btn" onclick="saveVerification('ec')">Save EC Search Details</button>
      <button class="btn secondary" onclick="portal('ec')">Open Official EC Search</button>
      <div class="note">Enter the same details on the official EC portal and record the result/status here.</div>
    </div>`);
}

function lrsForm() {
  shell("LRS Applicant Search", `
    <div class="panel">
      ${fieldWithValue("lrsApplicant", "Applicant Name", currentProperty?.customer || "")}
      ${field("lrsNumber", "Application Number", "Optional")}
      ${fieldWithValue("lrsLocation", "District / Location", currentProperty?.district || "")}
      <button class="btn" onclick="saveVerification('lrs')">Save LRS Search Details</button>
      <button class="btn secondary" onclick="portal('lrs')">Open Official LRS Search</button>
      <div class="note">Use the official LRS portal for the actual search. CAPTCHA, OTP and login controls are not bypassed.</div>
    </div>`);
}

function layoutForm() {
  shell("Completed Layouts", `
    <div class="panel">
      ${fieldWithValue("layDistrict", "District", currentProperty?.district || "")}
      ${fieldWithValue("layMandal", "Mandal", currentProperty?.mandal || "")}
      ${field("layName", "Layout / Applicant", "Optional")}
      <button class="btn" onclick="saveVerification('layout')">Save Layout Search Details</button>
      <button class="btn secondary" onclick="portal('layouts')">Open Official LRS / DTCP Dashboard</button>
      <div class="note">Use the official dashboard for the authoritative completed-layout result, then save your status here.</div>
    </div>`);
}

function fieldWithValue(id, label, value, placeholder = "") {
  return `<div class="field"><label>${label}</label><input id="${id}" value="${escapeAttr(value)}" placeholder="${placeholder}"></div>`;
}

function propertyTaxForm() {
  shell("Property Tax", `
    <div class="panel">
      ${fieldWithValue("taxDistrict", "District", currentProperty?.district || "Guntur")}
      ${fieldWithValue("taxOwner", "Owner / Assessment Name", currentProperty?.customer || "")}
      ${field("taxAssessment", "Assessment / Door No.", "Optional")}
      ${fieldWithValue("taxLocation", "Location / Village", currentProperty?.village || "")}
      <button class="btn secondary" onclick="portal('propertyTax')">Open Official Guntur Municipal Property Tax Search</button>
      <div class="note">Use the official Guntur Municipal portal for the actual property-tax search. CAPTCHA, OTP, login and other security controls are not bypassed.</div>
    </div>`);
}

function saveVerification(type) {
  if (!currentProperty) {
    alert("Create a property first.");
    return;
  }

  let status = "";
  let note = "";

  if (type === "ec") {
    const number = document.querySelector("#ecNumber").value.trim();
    const sro = document.querySelector("#ecSro").value.trim();
    const searchType = document.querySelector("#ecType").value;
    status = `${searchType} entered`;
    note = number + (sro ? ` / ${sro}` : "");
  }

  if (type === "lrs") {
    const applicant = document.querySelector("#lrsApplicant").value.trim();
    const number = document.querySelector("#lrsNumber").value.trim();
    status = "Applicant search entered";
    note = applicant + (number ? ` / ${number}` : "");
  }

  if (type === "layout") {
    const name = document.querySelector("#layName").value.trim();
    status = "Layout search entered";
    note = name || "Location search";
  }

  currentProperty[type + "Status"] = status;
  currentProperty[type + "Note"] = note;
  properties = properties.map(p => p.id === currentProperty.id ? currentProperty : p);
  save();
  profile(currentProperty);
}

function createProperty() {
  const p = {
    id: "P360-" + Date.now().toString().slice(-6),
    name: document.querySelector("#pname").value.trim() || "Untitled Property",
    district: document.querySelector("#district").value.trim(),
    mandal: document.querySelector("#mandal").value.trim(),
    village: document.querySelector("#village").value.trim(),
    survey: document.querySelector("#survey").value.trim(),
    extent: document.querySelector("#extent").value.trim(),
    customer: document.querySelector("#customer").value.trim(),
    phone: document.querySelector("#phone").value.trim()
  };

  properties.push(p);
  if (p.customer) customers.push({ name: p.customer, phone: p.phone });
  save();
  profile(p);
}

function quickSearch(q) {
  const r = document.querySelector("#recent");
  if (!r) return;
  const query = q.toLowerCase().trim();
  const matches = properties.filter(p => JSON.stringify(p).toLowerCase().includes(query));
  r.innerHTML = matches.length ? matches.map(propCard).join("") : '<div class="panel">No matching property.</div>';
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

document.querySelectorAll("nav button").forEach(b => {
  b.onclick = () => render(b.dataset.screen);
});

const langButton = document.querySelector("#lang");
if (langButton) {
  langButton.onclick = () => alert("Telugu interface will be added in the bilingual UI pass.");
}

render("home");
