const SUPABASE_URL="https://vzfhuvoiryupmauumlsp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_M6aKA96AdJIFeLcG7U9lig_BeOM97Pp";
const {createClient}=supabase, db=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let memories=[]; const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const date=v=>v?new Date(v+"T00:00:00").toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"}):"Chưa có ngày";
const image=p=>!p?"":/^https?:/i.test(p)?p:db.storage.from("memories").getPublicUrl(p).data.publicUrl;

function render(){
 const q=$("#q").value.trim().toLowerCase(), cat=$("#filter").value;
 const list=memories.filter(m=>(!q||[m.title,m.description,m.author,m.category].filter(Boolean).join(" ").toLowerCase().includes(q))&&(!cat||m.category===cat));
 $("#grid").innerHTML=list.map(m=>{let u=image(m.image_url);return `<article class="card" data-id="${m.id}"><div class="photo">${u?`<img src="${esc(u)}" alt="${esc(m.title)}" loading="lazy">`:`<div class="noimg">📷</div>`}</div><div class="body"><span class="tag">${esc(m.category||"Khác")}</span><h3 class="title">${esc(m.title)}</h3><p class="desc">${esc(m.description||"Một kỉ niệm của 11C1.")}</p><div class="meta"><span>${esc(m.author||"11C1")}</span><span>${date(m.event_date)}</span></div></div></article>`}).join("");
 $("#grid").classList.toggle("hide",!list.length);$("#none").classList.toggle("hide",!memories.length||!!list.length);$("#empty").classList.toggle("hide",!!memories.length);
 document.querySelectorAll(".card").forEach(c=>c.onclick=()=>open(memories.find(m=>String(m.id)===c.dataset.id)));
}
function open(m){$("#mt").textContent=m.title||"Kỉ niệm";$("#mc").textContent=m.category||"Khác";$("#mm").textContent=(m.author?"Bởi "+m.author+" · ":"")+date(m.event_date);$("#md").textContent=m.description||"Không có mô tả.";let u=image(m.image_url);$("#mi").classList.toggle("hide",!u);$("#img").src=u||"";$("#modal").classList.remove("hide");document.body.style.overflow="hidden"}
function close(){ $("#modal").classList.add("hide");document.body.style.overflow=""}
document.querySelectorAll("[data-close]").forEach(x=>x.onclick=close);document.onkeydown=e=>e.key==="Escape"&&close();$("#q").oninput=render;$("#filter").onchange=render;

async function load(){
 const {data,error}=await db.from("memories").select("*").eq("visible",true).order("event_date",{ascending:false}).order("created_at",{ascending:false});
 $("#loading").classList.add("hide");
 if(error){console.error(error);$("#empty").classList.remove("hide");$("#empty h2").textContent="Không thể tải dữ liệu";$("#empty p").textContent="Kiểm tra Supabase URL, Publishable key và RLS của bảng memories.";return}
 memories=data||[];let cats=[...new Set(memories.map(m=>m.category||"Khác"))].sort();
 $("#filter").innerHTML='<option value="">Tất cả chủ đề</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
 $("#count").textContent=memories.length;$("#cats").textContent=cats.length;render();
}
load();