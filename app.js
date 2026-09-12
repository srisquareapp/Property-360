const portals={
meebhoomi:"https://meebhoomi.ap.gov.in/",
ec:"https://registration.ec.ap.gov.in/ecSearch",
lrs:"https://lrsdtcp.ap.gov.in/PublicApplicationSearch",
layouts:"https://lrsdtcp.ap.gov.in/dashBoard",
propertyTax:"https://guntur.emunicipal.ap.gov.in/ptis/citizen/search/search-searchForm.action#no-back-button"
};
let properties=JSON.parse(localStorage.getItem("p360_properties")||"[]");
let customers=JSON.parse(localStorage.getItem("p360_customers")||"[]");
let currentProperty=null;
const main=document.querySelector("#main");

function save(){localStorage.setItem("p360_properties",JSON.stringify(properties));localStorage.setItem("p360_customers",JSON.stringify(customers))}
function openOfficial(url){window.location.href=url}
function portal(name){if(portals[name])openOfficial(portals[name])}
function openMeeBhoomiNewTab(){window.open(portals.meebhoomi,"_blank")}
function openInChrome(url=portals.meebhoomi){
  const target=encodeURIComponent(url);
  const chromeScheme=(location.protocol==="https:"||location.protocol==="http:")?`googlechrome://navigate?url=${target}`:`googlechromes://navigate?url=${target}`;
  window.location.href=chromeScheme;
  setTimeout(()=>{
    if(document.visibilityState==="visible") window.location.href=url;
  },1400);
}
function shell(t,b){main.innerHTML=`<button class="back" onclick="render('home')">← Dashboard</button><h1>${t}</h1>${b}`}
function field(id,label,placeholder="",value=""){return `<div class="field"><label>${label}</label><input id="${id}" value="${esc(value)}" placeholder="${placeholder}"></div>`}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function count(p){return["ecStatus","lrsStatus","layoutStatus"].filter(k=>p[k]).length}
function card(p){return `<div class="panel property-card" onclick='openProfileById("${esc(p.id)}")'><b>${esc(p.name)}</b><div class="row"><span>Survey No.</span><b>${esc(p.survey||"—")}</b></div><div class="row"><span>Extent</span><b>${esc(p.extent||"—")}</b></div><div class="row"><span>Verification</span><span class="badge">${count(p)}/3 saved</span></div></div>`}
function openProfileById(id){currentProperty=properties.find(p=>p.id===id)||null;render("profile")}

function render(s){
if(s==="home")main.innerHTML=`<h1>Property Dashboard</h1><input class="search" placeholder="🔎 Search property, survey no., customer..." oninput="quickSearch(this.value)"><div class="grid">
<button class="card" onclick="render('new')"><div class="icon">➕</div><div class="title">New Property</div><div class="desc">Create a property file</div></button>
<button class="card" onclick="render('land')"><div class="icon">📜</div><div class="title">1-B / Adangal</div><div class="desc">MeeBhoomi • Safari / Chrome</div></button>
<button class="card" onclick="render('ec')"><div class="icon">📑</div><div class="title">EC Search</div><div class="desc">Document / Survey</div></button>
<button class="card" onclick="render('lrs')"><div class="icon">📋</div><div class="title">LRS Search</div><div class="desc">Applicant details</div></button>
<button class="card" onclick="render('layouts')"><div class="icon">🏘️</div><div class="title">Completed Layouts</div><div class="desc">LRS / DTCP dashboard</div></button>
<button class="card" onclick="render('propertyTax')"><div class="icon">🏛️</div><div class="title">Property Tax</div><div class="desc">Guntur Municipal Search</div></button>
</div><div class="section">Recent Properties</div><div id="recent">${properties.length?properties.slice(-3).reverse().map(card).join(""):'<div class="panel">No properties yet.</div>'}`;
else if(s==="properties")shell("My Properties",properties.length?properties.map(card).join(""):'<div class="panel">No properties saved yet.</div>');
else if(s==="customers")shell("Customers",customers.length?customers.map(c=>`<div class="panel"><b>${esc(c.name)}</b><div class="row"><span>Phone</span><b>${esc(c.phone||"—")}</b></div></div>`).join(""):'<div class="panel">No customers saved yet.</div>');
else if(s==="new")shell("New Property",`<div class="panel">${field("pname","Property Name","e.g. Guntur Site 01")}${field("district","District","Guntur")}${field("mandal","Mandal")}${field("village","Village")}${field("survey","Survey Number","123/2")}${field("extent","Extent","2.50 Acres")}${field("customer","Customer","Customer name")}${field("phone","Phone","Phone number")}<button class="btn" onclick="createProperty()">Create Property Profile</button></div>`);
else if(s==="profile")profile(currentProperty||properties[0]);
else if(s==="land")landForm();
else if(s==="ec")ecForm();
else if(s==="lrs")lrsForm();
else if(s==="layouts")layoutForm();
else if(s==="propertyTax")taxForm();
document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.screen===s))
}

function profile(p){if(!p){render("new");return}currentProperty=p;shell("Property Profile",`<div class="panel"><b style="font-size:18px">${esc(p.name)}</b><div class="row"><span>District</span><b>${esc(p.district||"—")}</b></div><div class="row"><span>Mandal / Village</span><b>${esc(p.mandal||"—")} / ${esc(p.village||"—")}</b></div><div class="row"><span>Survey No.</span><b>${esc(p.survey||"—")}</b></div><div class="row"><span>Extent</span><b>${esc(p.extent||"—")}</b></div><div class="row"><span>Customer</span><b>${esc(p.customer||"—")}</b></div></div><div class="section">Government Verification</div><div class="grid">
<button class="card" onclick="render('land')">📜<div class="title">1-B / Adangal</div><div class="desc">Official MeeBhoomi</div></button>
<button class="card" onclick="render('ec')">📑<div class="title">EC</div><div class="desc">${esc(p.ecStatus||"Not checked")}</div></button>
<button class="card" onclick="render('lrs')">📋<div class="title">LRS</div><div class="desc">${esc(p.lrsStatus||"Not checked")}</div></button>
<button class="card" onclick="render('layouts')">🏘️<div class="title">Layout</div><div class="desc">${esc(p.layoutStatus||"Not checked")}</div></button>
<button class="card" onclick="render('propertyTax')">🏛️<div class="title">Property Tax</div><div class="desc">${esc(p.taxStatus||"Not checked")}</div></button>
</div><div class="section">Saved Verification Notes</div><div class="panel"><div class="row"><span>EC</span><b>${esc(p.ecNote||"—")}</b></div><div class="row"><span>LRS</span><b>${esc(p.lrsNote||"—")}</b></div><div class="row"><span>Layout</span><b>${esc(p.layoutNote||"—")}</b></div><div class="row"><span>Property Tax</span><b>${esc(p.taxNote||"—")}</b></div></div>`)}
function landForm(){shell("1-B & Adangal",`<div class="panel">${field("landDistrict","District","",currentProperty?.district||"")}${field("landMandal","Mandal","",currentProperty?.mandal||"")}${field("landVillage","Village","",currentProperty?.village||"")}${field("landSurvey","Survey Number","",currentProperty?.survey||"")}<button class="btn" onclick="portal('meebhoomi')">Open Official MeeBhoomi</button><button class="btn" onclick="openInChrome()">Open MeeBhoomi in Chrome</button><button class="btn secondary" onclick="openMeeBhoomiNewTab()">Open MeeBhoomi in New Tab</button><div class="note">On iPhone, if Safari shows MeeBhoomi 403 but Chrome works, tap <b>Open MeeBhoomi in Chrome</b>. This uses Chrome's iOS URL scheme; if Chrome is unavailable, it falls back to Safari. Property 360 does not bypass CAPTCHA, OTP or other security controls.</div></div>`)}
function ecForm(){shell("EC Search",`<div class="panel"><div class="field"><label>Search Type</label><select id="ecType"><option>Document Number</option><option>Survey Number</option></select></div>${field("ecNumber","Document / Survey Number","",currentProperty?.survey||"")}${field("ecSro","Year / SRO","Optional")}<button class="btn" onclick="saveV('ec')">Save EC Search Details</button><button class="btn secondary" onclick="portal('ec')">Open Official EC Search</button></div>`)}
function lrsForm(){shell("LRS Applicant Search",`<div class="panel">${field("lrsApplicant","Applicant Name","",currentProperty?.customer||"")}${field("lrsNumber","Application Number","Optional")}${field("lrsLocation","District / Location","",currentProperty?.district||"")}<button class="btn" onclick="saveV('lrs')">Save LRS Search Details</button><button class="btn secondary" onclick="portal('lrs')">Open Official LRS Search</button></div>`)}
function layoutForm(){shell("Completed Layouts",`<div class="panel">${field("layDistrict","District","",currentProperty?.district||"")}${field("layMandal","Mandal","",currentProperty?.mandal||"")}${field("layName","Layout / Applicant","Optional")}<button class="btn" onclick="saveV('layout')">Save Layout Search Details</button><button class="btn secondary" onclick="portal('layouts')">Open Official LRS / DTCP Dashboard</button></div>`)}
function taxForm(){shell("Property Tax",`<div class="panel">${field("taxDistrict","District","Guntur",currentProperty?.district||"Guntur")}${field("taxOwner","Owner / Assessment Name","",currentProperty?.customer||"")}${field("taxAssessment","Assessment / Door No.","Optional")}${field("taxLocation","Location / Village","",currentProperty?.village||"")}<button class="btn" onclick="saveTax()">Save Property Tax Search</button><button class="btn secondary" onclick="portal('propertyTax')">Open Official Guntur Municipal Property Tax</button><div class="note">The official municipal portal is the source of record. Security controls are not bypassed.</div></div>`)}

function saveV(t){if(!currentProperty){alert("Create a property first.");return}let note="";let status="";if(t==="ec"){note=document.querySelector("#ecNumber").value.trim();status=document.querySelector("#ecType").value+" entered"}else if(t==="lrs"){note=document.querySelector("#lrsApplicant").value.trim();status="Applicant search entered"}else{note=document.querySelector("#layName").value.trim()||"Location search";status="Layout search entered"}currentProperty[t+"Status"]=status;currentProperty[t+"Note"]=note;properties=properties.map(p=>p.id===currentProperty.id?currentProperty:p);save();profile(currentProperty)}
function saveTax(){if(!currentProperty){alert("Create a property first.");return}currentProperty.taxStatus="Property tax search entered";currentProperty.taxNote=document.querySelector("#taxAssessment").value.trim()||document.querySelector("#taxOwner").value.trim()||"Search saved";properties=properties.map(p=>p.id===currentProperty.id?currentProperty:p);save();profile(currentProperty)}
function createProperty(){const p={id:"P360-"+Date.now().toString().slice(-6),name:document.querySelector("#pname").value.trim()||"Untitled Property",district:document.querySelector("#district").value.trim(),mandal:document.querySelector("#mandal").value.trim(),village:document.querySelector("#village").value.trim(),survey:document.querySelector("#survey").value.trim(),extent:document.querySelector("#extent").value.trim(),customer:document.querySelector("#customer").value.trim(),phone:document.querySelector("#phone").value.trim()};properties.push(p);if(p.customer)customers.push({name:p.customer,phone:p.phone});save();profile(p)}
function quickSearch(q){const r=document.querySelector("#recent");if(!r)return;const a=properties.filter(p=>JSON.stringify(p).toLowerCase().includes(q.toLowerCase().trim()));r.innerHTML=a.length?a.map(card).join(""):'<div class="panel">No matching property.</div>'}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>render(b.dataset.screen));
document.querySelector("#lang")?.addEventListener("click",()=>alert("Telugu interface will be added in the bilingual UI pass."));
render("home");