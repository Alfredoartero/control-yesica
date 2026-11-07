/* Centro de Control · Importaciones Yesica — lógica */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, getDoc, setDoc }
  from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAg4xJoxrfGahtrZeOpnfhCPe0zqNjkGxk",
  authDomain: "sistema-yesica.firebaseapp.com",
  projectId: "sistema-yesica",
  storageBucket: "sistema-yesica.firebasestorage.app",
  messagingSenderId: "108033864871",
  appId: "1:108033864871:web:ce001ff12edb9f44e51782"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app), storage = getStorage(app), auth = getAuth(app);

/* ════════ EQUIPO ════════ */
const EQUIPO = {
  alfre:  { nombre:"Alfredo", admin:true  },
  yesica: { nombre:"Yesica",  admin:true  },
  cesar:  { nombre:"César",   admin:false },
  carlos: { nombre:"Carlos",  admin:false },
  nehe:   { nombre:"Nehemías",admin:false },
  evelyn: { nombre:"Evelyn",  admin:false },
  leslie: { nombre:"Leslie",  admin:false },
};
const AREAS = [
  { k:"ventas",    n:"Ventas y clientes",   ic:"ventas" },
  { k:"marketing", n:"Marketing",           ic:"marketing" },
  { k:"compras",   n:"Compras y subastas",  ic:"compras" },
  { k:"finanzas",  n:"Finanzas y pagos",    ic:"finanzas" },
  { k:"naviera",   n:"Naviera y logística", ic:"naviera" },
  { k:"aduana",    n:"Aduana y llegada",    ic:"aduana" },
  { k:"legal",     n:"Legal y compraventa", ic:"legal" },
  { k:"direccion", n:"Dirección y precios", ic:"direccion" },
];
const areaN = k => (AREAS.find(a=>a.k===k)||{n:k}).n;
const areaI = (k, s=16) => ico(((AREAS.find(a=>a.k===k)||{}).ic)||'ok', s);
const fch = ms => { if(!ms) return ""; const d=new Date(ms); const hoy=new Date();
  const o = d.getFullYear()===hoy.getFullYear() ? {day:'numeric',month:'short'} : {day:'numeric',month:'short',year:'2-digit'};
  return d.toLocaleDateString('es-SV', o).replace('.',''); };

/* ════════ PROCESOS ════════ */
const FASES_ENC = ["1 · Inicio de proceso","2 · Adquisición y pago inicial","3 · Llegada y compraventa"];
const T_ENC = [
  {k:"e01",f:0,a:"ventas",   t:"Ingresar datos del cliente y vehículo deseado", d:"Nombre, foto de DUI, carro deseado, millaje, golpe y presupuesto inicial"},
  {k:"e02",f:0,a:"finanzas", t:"Confirmar pago de $100", d:"Anexar comprobante. Se abona al total de la venta", pago:true, foto:true},
  {k:"e03",f:0,a:"finanzas", t:"Facturar los $100 de inicio"},
  {k:"e04",f:0,a:"ventas",   t:"Crear grupo de WhatsApp"},
  {k:"e05",f:0,a:"marketing",t:"Enviar opciones al cliente", d:"De lunes a viernes hasta que se le gane una", multi:true},
  {k:"e06",f:1,a:"compras",  t:"Se ganó el vehículo en subasta"},
  {k:"e07",f:1,a:"direccion",t:"Registrar vehículo en sistema", d:"Vehículo, costo y precio de venta"},
  {k:"e08",f:1,a:"compras",  t:"Pagar la subasta (Copart / IAA)", d:"Evitar storage. Adjuntar comprobante del pago", foto:true},
  {k:"e09",f:1,a:"naviera",  t:"Asignar a naviera"},
  {k:"e10",f:1,a:"naviera",  t:"Brindar estatus al cliente", d:"Constante, una vez por semana hasta que venga", repetible:true},
  {k:"e11",f:1,a:"finanzas", t:"Confirmar pago del 50% de enganche", d:"Con comprobante en foto, o confirmar recibido si es efectivo", pago:true, foto:true},
  {k:"e12",f:1,a:"finanzas", t:"Facturar el abono del 50%"},
  {k:"e13",f:1,a:"legal",    t:"Crear promesa de venta"},
  {k:"e14",f:2,a:"aduana",   t:"Marcar llegada del vehículo al país"},
  {k:"e24",f:2,a:"ventas",   t:"Avisar al cliente que su vehículo llegó al país", d:"Mensaje al cliente apenas arriba, con los siguientes pasos y lo que falta pagar"},
  {k:"e15",f:2,a:"marketing",t:"Subir el carro como publicidad", d:"Cada quien en su canal (Facebook, grupo de WhatsApp, etc.)", multi:true},
  {k:"e16",f:2,a:"finanzas", t:"Pagar a la naviera", d:"Adjuntar comprobante del pago", foto:true},
  {k:"e17",f:2,a:"aduana",   t:"Cancelar impuestos de aduana", d:"Adjuntar comprobante / DUCA", foto:true},
  {k:"e18",f:2,a:"aduana",   t:"Revisión mecánica", d:"Subir fotos del estado del vehículo", foto:true},
  {k:"e19",f:2,a:"finanzas", t:"Cliente cancela el restante", d:"Siempre con comprobante", pago:true, foto:true},
  {k:"e20",f:2,a:"finanzas", t:"Facturar el monto pagado"},
  {k:"e21",f:2,a:"aduana",   t:"Liberación del vehículo"},
  {k:"e22",f:2,a:"legal",    t:"Crear compraventa y firmar contrato", d:"Adjuntar foto del contrato firmado por ambas partes", foto:true},
  {k:"e25",f:2,a:"ventas",   t:"Entregar el vehículo al cliente", d:"Coordinar la entrega y dejar constancia con foto", foto:true},
  {k:"e23",f:2,a:"legal",    t:"Hacer prórroga de compraventa", opc:true},
];
const FASES_STK = ["1 · Coste e introducción","2 · Preparación y logística USA","3 · Gestión comercial","4 · Arribo y finalización"];
const T_STK = [
  {k:"s01",f:0,a:"direccion",t:"Registrar coste e introducción del vehículo"},
  {k:"s02",f:1,a:"marketing",t:"Publicidad del vehículo", d:"Cada quien en su canal (Facebook, grupo de WhatsApp, etc.)", multi:true},
  {k:"s03",f:1,a:"compras",  t:"Pagos USA (Copart / IAA)", d:"Evitar storage. Adjuntar comprobante del pago", foto:true},
  {k:"s04",f:1,a:"naviera",  t:"Asignación de naviera"},
  {k:"s05",f:2,a:"direccion",t:"Definir precio a cliente", d:"Podría darse en menos"},
  {k:"s06",f:2,a:"ventas",   t:"Venta o asignación a cliente"},
  {k:"s07",f:2,a:"finanzas", t:"Pago de pre-reserva / reserva (≥50%)", d:"Con comprobante, o confirmar recibido si es efectivo", pago:true, foto:true},
  {k:"s08",f:2,a:"finanzas", t:"Facturar el abono recibido"},
  {k:"s09",f:2,a:"legal",    t:"Creación de promesa de venta"},
  {k:"s10",f:2,a:"naviera",  t:"Control de estatus al cliente", d:"Semanal hasta que llegue", repetible:true},
  {k:"s11",f:3,a:"aduana",   t:"Arribo al país"},
  {k:"s19",f:3,a:"ventas",   t:"Avisar al cliente que el vehículo llegó", d:"Solo si ya está asignado a un cliente"},
  {k:"s12",f:3,a:"aduana",   t:"Pago de impuestos en aduana", d:"Adjuntar comprobante / DUCA", foto:true},
  {k:"s13",f:3,a:"aduana",   t:"Revisión mecánica", d:"Subir fotos del estado del vehículo", foto:true},
  {k:"s14",f:3,a:"aduana",   t:"Liberación del vehículo"},
  {k:"s15",f:3,a:"finanzas", t:"Facturación del restante"},
  {k:"s16",f:3,a:"finanzas", t:"Cancelación total (pago final)", d:"Adjuntar comprobante del pago final", pago:true, foto:true},
  {k:"s17",f:3,a:"legal",    t:"Compraventa (firma contrato final)", d:"Adjuntar foto del contrato firmado", foto:true},
  {k:"s20",f:3,a:"ventas",   t:"Entregar el vehículo al cliente", d:"Coordinar la entrega y dejar constancia con foto", foto:true},
  {k:"s18",f:3,a:"legal",    t:"Crear prórroga de compraventa", opc:true},
];
const defT   = v => v.tipoProceso === "Encargo" ? T_ENC : T_STK;
const defF   = v => v.tipoProceso === "Encargo" ? FASES_ENC : FASES_STK;

/* ════════ ESTADO ════════ */
let yo = null, usersData = {}, autos = [], filtro = "todos", tipoNuevo = "Encargo", suscrito = false, abiertoId = null, editando = false;

const esc = s => String(s??"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => "$" + Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0});

/* ═══ Iconos de línea ═══ */
const ICO = {
  flota:    '<path d="M4.5 16.5v1.8a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9V13c0-.5.1-.9.3-1.3l1.5-3A2 2 0 0 1 5.6 7.6h8.8c.6 0 1.2.3 1.6.8l2 2.4 2.4.6c.8.2 1.4.9 1.4 1.8v3a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9"/><path d="M2.6 13.6h18.8M8.4 7.8l.6 5.6"/><circle cx="7" cy="16.4" r="1.9"/><circle cx="17" cy="16.4" r="1.9"/>',
  tareas:   '<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><path d="M8.5 12l2.4 2.4L15.5 9.6"/>',
  nueva:    '<path d="M12 5.5v13M5.5 12h13"/>',
  finanzas: '<path d="M4 19.5V10M10 19.5V5M16 19.5v-6.5M21.5 19.5h-19"/>',
  archivo:  '<path d="M4 8.5h16M6 8.5V6.5a2 2 0 0 1 2-2h2.4l1.6 2H18a2 2 0 0 1 2 2v2M4.5 8.5v9a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-9"/>',
  equipo:   '<circle cx="9" cy="8" r="3"/><path d="M3.5 19.5v-.6A4.9 4.9 0 0 1 8.4 14h1.2a4.9 4.9 0 0 1 4.9 4.9v.6M16 5.6a3 3 0 0 1 0 5.8M17.6 14.4a4 4 0 0 1 2.9 3.8v1.3"/>',
  ventas:   '<path d="M5.5 4.5h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 4 1.5v3a1.5 1.5 0 0 1-1.7 1.5A16 16 0 0 1 4 6.2 1.5 1.5 0 0 1 5.5 4.5z"/>',
  marketing:'<path d="M3.5 10v4a1 1 0 0 0 1 1H7l5 3.5V5.5L7 9H4.5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  compras:  '<path d="M3.5 6.5h17l-1.5 9a2 2 0 0 1-2 1.7H7a2 2 0 0 1-2-1.7l-1.5-9z"/><path d="M8.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5"/>',
  naviera:  '<path d="M3 17.6c1.4.9 2.8.9 4.2 0s2.8-.9 4.2 0 2.8.9 4.2 0 2.8-.9 4.2 0"/><path d="M5.5 14.2V9.6L12 7.2l6.5 2.4v4.6"/><path d="M12 4.6v2.6"/>',
  aduana:   '<path d="M3.5 20.5h17M5.5 20.5V9.6L12 4.5l6.5 5.1v10.9"/><path d="M10 20.5V16h4v4.5"/>',
  legal:    '<path d="M12 4.5v15M7 8.5l-3 5.5h6zM17 8.5l-3 5.5h6zM5 8.5h14"/>',
  direccion:'<path d="M3.5 3.5v17h17"/><path d="M7.5 15.2l3.6-3.6 2.5 2.5 4.9-5.4"/>',
  campana:  '<path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4.4 2 5.5 2 5.5h-15s2-1.1 2-5.5z"/><path d="M10.2 18.5a2 2 0 0 0 3.6 0"/>',
  reloj:    '<circle cx="12" cy="12" r="8"/><path d="M12 7.6V12l3 1.8"/>',
  buscar:   '<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8l4.2 4.2"/>',
  clip:     '<path d="M19.4 11.6l-7.5 7.5a4.2 4.2 0 1 1-5.9-5.9l7.9-7.9a2.8 2.8 0 0 1 4 4l-7.9 7.9a1.4 1.4 0 0 1-2-2l7.2-7.2"/>',
  editar:   '<path d="M16.5 4.8l2.7 2.7L8.4 18.3l-3.4.7.7-3.4z"/>',
  basura:   '<path d="M4.5 7h15M9.5 7V5.3h5V7M6.6 7l.9 12.2h9l.9-12.2"/>',
  cerrar:   '<path d="M6.6 6.6l10.8 10.8M17.4 6.6L6.6 17.4"/>',
  ok:       '<path d="M5 12.6l5 5 9-10"/>',
  mas:      '<path d="M12 6v12M6 12h12"/>',
  chat:     '<path d="M20 11.9a7.4 7.4 0 0 1-10.8 6.6L4 20l1.4-5A7.4 7.4 0 1 1 20 11.9z"/>',
  usuario:  '<circle cx="12" cy="8" r="3.4"/><path d="M4.6 20v-.8A5.2 5.2 0 0 1 9.8 14h4.4a5.2 5.2 0 0 1 5.2 5.2v.8"/>',
  caja:     '<path d="M3.6 7.6L12 3.5l8.4 4.1v8.8L12 20.5l-8.4-4.1z"/><path d="M3.6 7.6L12 11.7l8.4-4.1M12 11.7v8.8"/>',
  apreton:  '<path d="M8.5 10.5l2.5 2.5 1.5-1.5 3.5 3.5a1.8 1.8 0 1 1-2.5 2.5"/><path d="M12 6h4l4.5 4.5M11 6H7.5L3 10.5 6 13.5"/>',
  avion:    '<path d="M10.5 12.5L3 10l2-2 5.5 1.5L16 4a2 2 0 0 1 2.8 2.8L13.5 13 15 18.5l-2 2z"/>',
  alerta:   '<path d="M12 8.5v5M12 16.8v.1"/><circle cx="12" cy="12" r="8"/>',
  reloj2:   '<circle cx="12" cy="12" r="8"/><path d="M12 7.6V12l2.8 1.6"/>',
  robot:    '<rect x="4.5" y="8" width="15" height="11" rx="3"/><path d="M12 4.5V8M8.5 13v1.5M15.5 13v1.5"/><circle cx="12" cy="4" r="1.2"/>',
  foto:     '<rect x="3.5" y="6.5" width="17" height="13" rx="3"/><circle cx="12" cy="13" r="3.2"/><path d="M8.5 6.5l1.2-2h4.6l1.2 2"/>',
  candado:  '<rect x="5.5" y="10.5" width="13" height="9" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  flecha:   '<path d="M5 12h13M13 7l5 5-5 5"/>',
  sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  luna:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  auto:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none"/>',
  salir:    '<path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/><path d="M18 12H9M15.5 9l3 3-3 3"/>',
};
function ico(n, s=18, w=1.6){
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;display:block">${ICO[n]||ICO.ok}</svg>`;
}

// Anillo de progreso estilo dashboard
function anillo(pct, size=120, grosor=9, etiqueta=""){
  pct = Math.max(0, Math.min(100, Math.round(pct)));
  const r = (size/2) - grosor - 2, circ = 2*Math.PI*r, off = circ - (pct/100)*circ;
  return `<div class="ring-wrap" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(var(--fg),.06)" stroke-width="${grosor}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--cyan)" stroke-width="${grosor}"
        stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${off}"
        style="transition:stroke-dashoffset .6s ease"/>
    </svg>
    <div class="ring-txt">
      <div class="ring-num" style="font-size:${Math.round(size*0.21)}px;text-shadow:0 0 18px rgba(34,226,226,.6)">${pct}%</div>
      ${etiqueta?`<div class="ring-lbl">${esc(etiqueta)}</div>`:""}
    </div>
  </div>`;
}

// Chispas al completar una tarea
function celebrar(){
  const cols = ["#ff2e88","#22e2e2","#34d399","#fbbf24"];
  for(let i=0;i<14;i++){
    const p = document.createElement('div');
    const size = 5 + Math.random()*5;
    p.style.cssText = `position:fixed;left:${45+Math.random()*10}%;top:52%;width:${size}px;height:${size}px;
      background:${cols[i%cols.length]};border-radius:${Math.random()>.5?'999px':'2px'};z-index:400;pointer-events:none;
      box-shadow:0 0 8px currentColor;color:${cols[i%cols.length]}`;
    document.body.appendChild(p);
    const ang = Math.random()*Math.PI*2, dist = 90 + Math.random()*130;
    p.animate([
      { transform:'translate(0,0) scale(1)', opacity:1 },
      { transform:`translate(${Math.cos(ang)*dist}px, ${Math.sin(ang)*dist - 40}px) scale(0)`, opacity:0 }
    ], { duration: 700 + Math.random()*400, easing:'cubic-bezier(.15,.7,.4,1)' })
     .onfinish = ()=> p.remove();
  }
}

function toast(msg, tipo="ok"){
  const col = tipo==="err" ? "var(--danger)" : tipo==="warn" ? "var(--warn)" : "var(--ok)";
  const d = document.createElement('div');
  d.className = "toast"; d.style.color = col; d.style.borderColor = col;
  d.innerText = msg;
  document.getElementById('toaster').appendChild(d);
  setTimeout(()=>{ d.style.opacity="0"; d.style.transition="opacity .3s"; setTimeout(()=>d.remove(),300); }, 3400);
}

/* ════════ PERMISOS ════════ */
const puede = area => !!yo && (yo.admin || (yo.areas||[]).includes(area));
function quienes(area){
  const n = Object.keys(usersData).filter(u => (usersData[u].areas||[]).includes(area)).map(u=>usersData[u].nombre);
  return n.length ? n.join(", ") : "sin asignar";
}

/* ════════ LOGIN ════════ */
(function(){
  const s = document.getElementById('lgUser');
  Object.keys(EQUIPO).forEach(u=>{ const o=document.createElement('option'); o.value=u; o.innerText=EQUIPO[u].nombre; s.appendChild(o); });
})();

window.entrar = async function(){
  const u = document.getElementById('lgUser').value, p = document.getElementById('lgPass').value;
  const m = document.getElementById('lgMsg'), b = document.getElementById('lgBtn');
  m.innerText = "";
  if(!u){ m.innerText="Selecciona tu nombre."; return; }
  if(!p || p.length<6){ m.innerText="La contraseña debe tener mínimo 6 caracteres."; return; }
  b.disabled = true; b.innerText = "Entrando…";
  const mail = u + "@yesica.local";
  const explica = c => ({
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.":"La clave de conexión no es válida. Revisa la configuración de Firebase.",
    "auth/api-key-not-valid":"La clave de conexión no es válida. Revisa la configuración de Firebase.",
    "auth/operation-not-allowed":"Falta activar “Correo electrónico/contraseña” en Firebase → Authentication → Sign-in method.",
    "auth/unauthorized-domain":"Este dominio no está autorizado. Agrégalo en Firebase → Authentication → Settings → Authorized domains.",
    "auth/network-request-failed":"📶 Sin conexión a internet. Revisa tu red e intenta de nuevo.",
    "auth/too-many-requests":"⏳ Demasiados intentos. Espera unos minutos e intenta otra vez.",
    "auth/wrong-password":"Contraseña incorrecta.",
    "auth/weak-password":"La contraseña es muy débil. Usa mínimo 6 caracteres.",
    "auth/email-already-in-use":"Esa no es tu contraseña. Intenta de nuevo.",
  })[c] || null;

  const fallar = e => { m.innerText = explica(e.code) || ("Error: "+(e.code||e.message)); b.disabled=false; b.innerText="Entrar"; };

  try{
    await signInWithEmailAndPassword(auth, mail, p);
  }catch(e){
    if(["auth/user-not-found","auth/invalid-credential","auth/invalid-login-credentials"].includes(e.code)){
      try{ await createUserWithEmailAndPassword(auth, mail, p); }
      catch(e2){ fallar(e2); return; }
    } else { fallar(e); return; }
  }
  b.disabled=false; b.innerText="Entrar";
};
window.salir = ()=> signOut(auth);

onAuthStateChanged(auth, async user=>{
  if(!user){
    yo=null; document.getElementById('login').classList.remove('hidden'); document.getElementById('app').classList.add('hidden'); return;
  }
  const u = user.email.replace("@yesica.local","");
  if(!EQUIPO[u]){ document.getElementById('lgMsg').innerText="Cuenta no autorizada."; signOut(auth); return; }

  const r = doc(db,"usuarios",u);
  const s = await getDoc(r);
  if(!s.exists()){
    await setDoc(r,{ nombre:EQUIPO[u].nombre, admin:EQUIPO[u].admin, areas: [] });
  } else if(EQUIPO[u].admin && s.data().admin !== true){
    // Cuenta creada con una versión anterior donde aún no era admin: se repara sola.
    await updateDoc(r,{ admin:true });
  }

  onSnapshot(collection(db,"usuarios"), snap=>{
    usersData = {}; snap.forEach(d=> usersData[d.id]=d.data());
    if(!usersData[u]) return;
    yo = { usuario:u, ...usersData[u] };
    document.getElementById('login').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('dMe').innerText = yo.nombre;
    document.getElementById('avatarYo').innerText = (yo.nombre||"?").charAt(0).toUpperCase();
    document.getElementById('dRol').innerText = yo.admin ? "Administrador" : ((yo.areas||[]).length + " áreas");
    document.getElementById('dRol').style.color = "var(--t3)";
    document.getElementById('tbUsers').classList.toggle('hidden', !yo.admin);
    pintarUsers(); pintarTodo();
    if(!suscrito){
      suscrito = true;
      onSnapshot(doc(db,"config","telegram"), s=>{
        const d = s.exists() ? s.data() : {};
        tgToken = d.token || "";
        cfgRemota.botName = d.bot || "";
        pintarCfgNotis();
      });
      onSnapshot(doc(db,"config","notificaciones"), s=>{
        cfgRemota = s.exists() ? s.data() : {};
        if(cfgRemota.minTareas){                       // el robot manda: sincronizamos los tiempos
          ncfg = { ...ncfg, minTareas:cfgRemota.minTareas, minClientes:cfgRemota.minClientes,
                   clientesOn:cfgRemota.clientesOn!==false, soloHorario:cfgRemota.soloHorario!==false,
                   hIni:cfgRemota.hIni??ncfg.hIni, hFin:cfgRemota.hFin??ncfg.hFin };
          guardarCfg();
        }
        pintarCfgNotis();
      });
      onSnapshot(collection(db,"vehiculos"), sn=>{
        autos = []; sn.forEach(d=> autos.push({ id:d.id, ...d.data() }));
        autos.sort((a,b)=> (b.fecha_registro||"").localeCompare(a.fecha_registro||""));
        pintarTodo(); if(abiertoId) abrirDetalle(abiertoId, true);
      });
    }
  });
});

/* ════════ NAVEGACIÓN ════════ */
const PGS = { flota:["pgFlota","tbFlota"], mias:["pgMias","tbMias"], nuevo:["pgNuevo","tbNuevo"], finanzas:["pgFin","tbFin"], archivo:["pgArch","tbArch"], usuarios:["pgUsers","tbUsers"] };
let TITULOS = {   // [ceja, título, palabra en rosa, subtítulo]
  flota:    ["Flota activa",  "Tu flota",     "en proceso",  "Cada carro con su ruta, lo cobrado y lo que te toca."],
  mias:     ["Tu día",        "Mis",          "tareas",      "Lo que te toca a ti, empezando por lo más próximo."],
  nuevo:    ["Nueva unidad",  "Registra un",  "cliente",     "Una búsqueda personalizada: el carro se le asigna cuando se gane en subasta."],
  finanzas: ["Finanzas",      "Panel",        "financiero",  "Inversión, cobros y ganancia de las unidades activas."],
  archivo:  ["Archivo",       "Unidades",     "terminadas",  "Lo que ya completó su proceso o se archivó."],
  usuarios: ["Equipo",        "Equipo y",     "permisos",    "Marca qué áreas puede tocar cada persona."],
};
window.ir = function(p){
  if(p==='finanzas') pintarFinanzas();
  Object.keys(PGS).forEach(k=>{
    document.getElementById(PGS[k][0]).classList.toggle('hidden', k!==p);
    document.getElementById(PGS[k][1]).classList.toggle('on', k===p);
  });
  const t = TITULOS[p];
  if(t){
    document.getElementById('cejaPagina').textContent = t[0];
    ponTitulo(document.getElementById('tituloPagina'), t[1], t[2]);
    document.getElementById('subPagina').textContent = t[3];
    const sec = document.getElementById(PGS[p][0]); if(sec){ sec.classList.remove('entra'); void sec.offsetWidth; sec.classList.add('entra'); }
    window.__vistos = new Set();  // al cambiar de página las tarjetas vuelven a entrar
    const ph = document.getElementById('pageHead'); if(ph) ph.classList.toggle('hidden', p==='mias');
  }
  const sr = document.getElementById('statsRow');
  if(sr) sr.classList.toggle('hidden', p!=='flota');
  window.scrollTo({top:0, behavior:'smooth'});
};
window.setF = function(f){
  filtro=f;
  [["todos","fTodos"],["Encargo","fEnc"],["Stock","fStk"],["mios","fMios"]].forEach(([k,id])=>
    document.getElementById(id).classList.toggle('on', k===f));
  moverPastilla();
  pintarFlota();
};
let vehAbierto = false;
window.setTipo = function(t){
  tipoNuevo=t;
  document.getElementById('btEnc').classList.toggle('on', t==="Encargo");
  document.getElementById('btStk').classList.toggle('on', t==="Stock");
  const enc = t==="Encargo";
  document.getElementById('camposCli').style.display = enc ? "" : "none";
  vehAbierto = !enc || !!document.getElementById('fVeh').value.trim();
  pintarBloqueVeh();
  document.getElementById('btnCrear').textContent = enc ? "Registrar cliente" : "Registrar carro";
  TITULOS.nuevo = enc
    ? ["Nueva unidad", "Registra un", "cliente",  "Una búsqueda personalizada: el carro se le asigna cuando se gane en subasta."]
    : ["Nueva unidad", "Registra un", "vehículo", "Un carro que ya compramos para stock. Al venderlo le agregas el cliente."];
  const pg = document.getElementById('pgNuevo');
  if(pg && !pg.classList.contains('hidden')){
    ponTitulo(document.getElementById('tituloPagina'), TITULOS.nuevo[1], TITULOS.nuevo[2]);
    document.getElementById('subPagina').textContent = TITULOS.nuevo[3];
  }
  document.getElementById('tipoAyuda').textContent = enc
    ? "Su lista de tareas se abre sola. El carro se le asigna cuando se gane en subasta."
    : "Su lista de tareas se abre sola. Al venderlo le agregas el cliente desde la ficha.";
};
function pintarBloqueVeh(){
  const enc = tipoNuevo==="Encargo";
  document.getElementById('camposVeh').style.display = vehAbierto ? "" : "none";
  document.getElementById('toggleVeh').disabled = !enc;
  document.getElementById('lbVeh').textContent = enc ? "¿Ya se ganó el carro?" : "Vehículo";
  document.getElementById('lbVehNota').textContent = enc ? (vehAbierto ? "Llena lo que tengas" : "Opcional · se puede asignar después") : "";
  document.getElementById('chevVeh').textContent = enc ? (vehAbierto ? "–" : "+") : "";
}
window.verVehiculo = function(){ if(tipoNuevo!=="Encargo") return; vehAbierto = !vehAbierto; pintarBloqueVeh(); if(vehAbierto) document.getElementById('fVeh').focus(); };


/* ════════ CÁLCULOS ════════ */
function respons(area){ return Object.keys(usersData).filter(u => (usersData[u].areas||[]).includes(area)); }

// ¿La tarea está completa? En las "multi" solo cuando TODOS los responsables del área marcaron su parte.
function tareaOk(v, t){
  const st = v.tareas?.[t.k];
  if(!t.multi) return !!st?.ok;
  const req = respons(t.a);
  if(!req.length) return !!st?.ok;          // nadie asignado todavía → funciona como check normal
  const m = st?.marcas || {};
  return req.every(u => !!m[u]);
}
function miMarca(v, t){ return !!(v.tareas?.[t.k]?.marcas || {})[yo?.usuario]; }

function tareasDe(v){ return defT(v).filter(t=>!t.opc); }
function progreso(v){
  const ls = tareasDe(v); if(!ls.length) return 0;
  return Math.round(ls.filter(t=> tareaOk(v,t)).length / ls.length * 100);
}
function pendientesMias(v){
  if(!yo) return [];
  return defT(v).filter(t=>{
    if(t.opc || tareaOk(v,t) || !puede(t.a)) return false;
    if(t.multi){
      const req = respons(t.a);
      if(req.length) return req.includes(yo.usuario) && !miMarca(v,t);
    }
    return true;
  });
}
function pagado(v){ return (v.abonos||[]).reduce((s,a)=> s+Number(a.monto||0), 0); }
function saldo(v){ return Math.max(0, Number(v.precio_venta||0) - pagado(v)); }
function faseActual(v){
  const ls = tareasDe(v);
  const p = ls.find(t=> !tareaOk(v,t));
  return p ? p.f : defF(v).length-1;
}

/* ════════ RENDER ════════ */
function pintarTodo(){ pintarStats(); pintarFlota(); pintarMias(); pintarArchivo(); pintarFinanzas(); pintarCfgNotis(); actualizarTitulo(); }

// Mini gráfico de línea con el avance de cada unidad
function sparkline(vals, w=560, h=64){
  if(!vals.length) vals = [0];
  if(vals.length === 1) vals = [0, vals[0]];
  const max = 100, paso = w/(vals.length-1);
  const pts = vals.map((v,i)=> [i*paso, h - (v/max)*(h-10) - 5]);
  const linea = pts.map((p,i)=>{
    if(i===0) return `M ${p[0]},${p[1]}`;
    const pv = pts[i-1], cx = (pv[0]+p[0])/2;
    return `C ${cx},${pv[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }).join(" ");
  const area = `${linea} L ${w},${h} L 0,${h} Z`;
  const ult = pts[pts.length-1];
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px;overflow:visible">
    <defs>
      <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--brand)" stop-opacity=".28"/>
        <stop offset="100%" stop-color="var(--brand)" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="spLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="var(--cyan)"/><stop offset="100%" stop-color="var(--brand)"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#spGrad)"/>
    <path d="${linea}" fill="none" stroke="url(#spLine)" stroke-width="2.5" stroke-linecap="round"
      />
    <circle cx="${ult[0]}" cy="${ult[1]}" r="4.5" fill="var(--brand)" />
  </svg>`;
}

const COLORES_AV = ["#ff2e88","#22e2e2","#34d399","#fbbf24","#a78bfa","#fb7185","#38bdf8"];
function avatarDe(u, i){
  const n = usersData[u]?.nombre || u;
  return `<span class="avatar" title="${esc(n)}" style="background:${COLORES_AV[i % COLORES_AV.length]}">${esc(n.charAt(0).toUpperCase())}</span>`;
}

function pintarStats(){
  const act = autos.filter(a=>!a.archivado);
  const venta   = act.reduce((s,a)=> s+Number(a.precio_venta||0), 0);
  const cobrado = act.reduce((s,a)=> s+pagado(a), 0);
  const porCobrar = act.reduce((s,a)=> s+saldo(a), 0);
  const avance = act.length ? Math.round(act.reduce((s,a)=>s+progreso(a),0)/act.length) : 0;
  const enc = act.filter(a=>a.tipoProceso==="Encargo").length;
  const stk = act.length - enc;

  contar('sTot', act.length, n=>String(Math.round(n)));
  document.getElementById('sEnc').innerText = enc;
  document.getElementById('sStk').innerText = stk;
  document.getElementById('sMix').innerText = act.length ? `${enc} por encargo · ${stk} en stock` : "sin unidades";
  contar('sPro', avance, n=>Math.round(n)+"%");
  document.getElementById('sProBar').style.width = avance + "%";
  contar('sSal', porCobrar, n=>money(Math.round(n)));
  document.getElementById('sCobrado').innerText = venta ? `cobrado ${money(cobrado)} de ${money(venta)}` : "—";
  contar('sMias', yo ? contarMias() : 0, n=>String(Math.round(n)));
}
function ponTitulo(el, base, acento){
  if(!el) return;
  const clave = base+'|'+acento; if(el.dataset.clave===clave) return; el.dataset.clave = clave;
  // Texto normal + palabra en rosa. La entrada es una sola animación del título completo
  // (las animaciones palabra por palabra con texto degradado se trababan en Chrome/Safari).
  el.innerHTML = esc(base) + ' <em>' + esc(acento) + '</em>';
  el.classList.remove('entra-t'); void el.offsetWidth; el.classList.add('entra-t');
}
const _valores = {};
const quietos = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function contar(id, destino, fmt){
  const el = document.getElementById(id); if(!el) return;
  const desde = _valores[id] ?? 0; _valores[id] = destino;
  if(desde===destino || quietos()){ el.textContent = fmt(destino); return; }
  const t0 = performance.now(), dur = 1100;
  const paso = t => { const k = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-k,3);
    el.textContent = fmt(desde + (destino-desde)*e); if(k<1) requestAnimationFrame(paso); };
  requestAnimationFrame(paso);
}

/* La ruta del carro: un punto por fase, la línea se llena con el avance real */
function etapas(v){
  const ls = tareasDe(v), fa = faseActual(v);
  return defF(v).map((fn,fi)=>{
    const ts = ls.filter(t=>t.f===fi), h = ts.filter(t=>tareaOk(v,t)).length;
    const done = ts.length>0 && h===ts.length;
    return { n: fn.replace(/^\d+\s*·\s*/,''), done, cur: !done && fi===fa, pct: ts.length ? h/ts.length : 0, h, tot: ts.length };
  });
}
function ruta(v, grande=false){
  const e = etapas(v);
  const puntos = e.map((x,i)=>`
    <span class="ruta-p ${x.done?'ok':x.cur?'cur':''}" title="${esc(x.n)}">${x.done?ico('ok',grande?12:9,3):(grande?(i+1):'')}</span>
    ${i<e.length-1?`<span class="ruta-l"><i style="width:${x.done?100:x.cur?Math.round(x.pct*100):0}%"></i></span>`:''}`).join('');
  const nombres = grande ? `<div class="ruta-n" style="grid-template-columns:repeat(${e.length},1fr)">${e.map(x=>
      `<span class="${x.done?'ok':x.cur?'cur':''}">${esc(x.n)}<em>${x.h} de ${x.tot}</em></span>`).join('')}</div>` : '';
  return `<div class="ruta ${grande?'grande':''}">${puntos}</div>${nombres}`;
}

/* Estado visible de la unidad, sacado de las tareas que ya se marcaron (mismas palabras que la web) */
function estadoDe(v){
  const enc = v.tipoProceso==="Encargo";
  const ok = k => { const t = defT(v).find(x=>x.k===k); return t ? tareaOk(v,t) : false; };
  const K = enc ? {gan:"e06", nav:"e09", lleg:"e14", lib:"e21", ent:"e25"}
                : {gan:"s01", nav:"s04", lleg:"s11", lib:"s14", ent:"s20"};
  if(!tareasDe(v).some(t=>!tareaOk(v,t)) || ok(K.ent)) return {t:"Entregado", c:"e-neutro"};
  if(ok(K.lib))  return {t:"Liberado", c:"e-solido"};
  if(ok(K.lleg)) return {t:"En el país", c:"e-rosa"};
  if(ok(K.nav))  return {t:"En camino", c:"e-verde"};
  if(enc && !v.vehiculo) return {t:"Buscando carro", c:"e-ambar"};
  if(ok(K.gan) || v.vehiculo) return {t:"Ganado en subasta", c:"e-rosa"};
  return {t:"Por iniciar", c:"e-neutro"};
}
const pillEstado = v => { const e = estadoDe(v); return `<span class="estado ${e.c}">${e.c==='e-verde'?'<span class="dot"></span>':''}${e.t}</span>`; };

function pintarFlota(){
  const cont = document.getElementById('flota');
  const q = (document.getElementById('buscar').value||"").toLowerCase().trim();
  let ls = autos.filter(a=>!a.archivado);
  const cuenta = (id,n) => { const e=document.getElementById(id); if(e) e.textContent = n; };
  cuenta('cTodos', ls.length); cuenta('cEnc', ls.filter(a=>a.tipoProceso==="Encargo").length);
  cuenta('cStk', ls.filter(a=>a.tipoProceso!=="Encargo").length); cuenta('cMios', ls.filter(a=>pendientesMias(a).length>0).length);
  if(filtro==="Encargo") ls = ls.filter(a=>a.tipoProceso==="Encargo");
  if(filtro==="Stock")   ls = ls.filter(a=>a.tipoProceso!=="Encargo");
  if(filtro==="mios")    ls = ls.filter(a=> pendientesMias(a).length>0);
  if(q) ls = ls.filter(a => [a.vehiculo,a.nombreCliente,a.vin,a.plataforma,a.deseoCliente,a.telefonoCliente].join(" ").toLowerCase().includes(q));
  const rl = document.getElementById('resLinea'); if(rl) rl.innerHTML = `Mostrando <b>${ls.length}</b> ${ls.length===1?'unidad':'unidades'}`;
  const ib = document.getElementById('icoBuscar'); if(ib && !ib.innerHTML) ib.innerHTML = ico("buscar",16,2);

  if(!ls.length){
    cont.innerHTML = `<div class="vacio">
      <div style="color:var(--t3)">${ico("flota",30,1.3)}</div>
      <p class="t-md mt-3">${q||filtro!=="todos" ? "Ninguna unidad coincide" : "Todavía no hay unidades"}</p>
      <p class="t-sm mt-1">${q||filtro!=="todos" ? "Prueba con otro nombre o cambia el filtro." : "Registra la primera en Nueva unidad."}</p></div>`;
    return;
  }

  const vistos = (window.__vistos ||= new Set()); let n = 0;
  cont.innerHTML = ls.map(v=>{
    const nueva = !vistos.has(v.id); vistos.add(v.id);
    const retraso = nueva ? Math.min(n++,5)*60 : 0;
    const mias = pendientesMias(v).length;
    const enc = v.tipoProceso==="Encargo";
    const sig = tareasDe(v).find(t=> !tareaOk(v,t));
    const cob = pagado(v), vta = Number(v.precio_venta||0), falta = saldo(v);
    const meta = [
      `<span>${enc?'Encargo':'Stock'}</span>`,
      v.nombreCliente ? `<span>${esc(v.nombreCliente)}</span>` : (!enc ? `<span style="color:var(--warn)">Sin cliente</span>` : ""),
      v.vehiculo ? `<span>${esc(v.plataforma)}</span>` : `<span>${v.deseoCliente ? "Busca "+esc(v.deseoCliente) : "Sin vehículo"}</span>`,
      v.vehiculo && v.vin ? `<span class="mono">${esc(v.vin)}</span>` : ""
    ].join("");
    return `<article class="vcard${nueva?' pop':''}" style="${nueva?`animation-delay:${retraso}ms;--d:${retraso}ms`:''}" onclick="abrirDetalle('${v.id}')">
      <div class="vc-top">
        <div class="min-w-0">
          <h3 class="vc-t">${esc(v.vehiculo) || (v.nombreCliente ? "Encargo de "+esc(v.nombreCliente.split(" ")[0]) : "Carro por asignar")}</h3>
          <p class="vc-precio">${v.vehiculo ? `Venta <b>${vta?money(vta):'por definir'}</b>` : `Busca <b>${esc(v.deseoCliente||"por definir")}</b>`}</p>
        </div>
        ${pillEstado(v)}
      </div>
      <div class="meta">${meta}</div>
      <div class="vc-ruta">${ruta(v,true)}</div>
      <div class="vc-sig">${sig ? `<span class="vc-sig-l">Sigue</span><span class="truncate">${esc(sig.t)}</span>` : `<span style="color:var(--ok-txt)">Proceso completo</span>`}</div>
      <div class="vc-specs">
        <div><b class="num" style="color:var(--ok-txt)">${money(cob)}</b><small>Cobrado</small></div>
        <div><b class="num" style="color:${falta>0?'var(--warn)':'var(--t1)'}">${money(falta)}</b><small>Falta</small></div>
        <div><b class="num" style="color:${mias?'var(--brand-light)':'var(--t1)'}">${mias}</b><small>Tus tareas</small></div>
      </div>
      <button class="vc-btn" onclick="event.stopPropagation();abrirDetalle('${v.id}')">Ver detalles <span aria-hidden="true">→</span></button>
    </article>`;
  }).join("");
  requestAnimationFrame(moverPastilla);
}
window.pintarFlota = pintarFlota;   // el buscador lo llama desde el HTML

function pintarMias(){
  const cont = document.getElementById('mias'); if(!yo || !cont) return;

  const items = [];
  autos.filter(a=>!a.archivado).forEach(v=> pendientesMias(v).forEach(t=> items.push({v,t})));
  const bm = document.getElementById('badgeMias');
  bm.innerText = items.length; bm.classList.toggle('cero', items.length===0);

  // Cuántas se han completado hoy (de mis áreas) para dar sensación de avance
  const hoy = new Date().toDateString();
  let hechasHoy = 0, totalMias = items.length;
  autos.filter(a=>!a.archivado).forEach(v=> defT(v).forEach(t=>{
    if(t.opc || !puede(t.a)) return;
    const st = v.tareas?.[t.k];
    if(st?.ok && st.fecha && new Date(st.fecha).toDateString()===hoy) hechasHoy++;
    if(t.multi){ const m = st?.marcas?.[yo.usuario]; if(m && new Date(m).toDateString()===hoy) hechasHoy++; }
  }));
  const totalDia = hechasHoy + totalMias;
  const pctDia = totalDia ? Math.round((hechasHoy/totalDia)*100) : 100;

  document.getElementById('miasAnillo').innerHTML = `<div class="hoy-box"><p class="num">${hechasHoy}</p><p class="t-xs">hecha${hechasHoy===1?'':'s'} hoy</p></div>`;
  const tit = document.getElementById('miasTitulo');
  const sub = document.getElementById('miasSub');
  const h = new Date().getHours();
  const saludo = (h<12?"Buenos días":h<19?"Buenas tardes":"Buenas noches") + ", " + (yo.nombre||"").split(" ")[0];
  ponTitulo(tit, saludo.split(", ")[0] + ",", (yo.nombre||"").split(" ")[0]);
  if(!items.length){
    sub.innerText = hechasHoy ? `Completaste ${hechasHoy} tarea${hechasHoy>1?"s":""} hoy. Día limpio.` : "No tienes nada pendiente por ahora.";
  } else {
    sub.innerText = (hechasHoy ? `Llevas ${hechasHoy} hecha${hechasHoy>1?"s":""} hoy · ` : "") +
      `${items.length} pendiente${items.length>1?"s":""} en ${new Set(items.map(i=>i.v.id)).size} unidad${new Set(items.map(i=>i.v.id)).size>1?"es":""}`;
  }

  if(!items.length){
    cont.innerHTML = `<div class="glass rounded-3xl p-14 text-center fade-up">
      <div class="flex justify-center mb-3" style="color:${hechasHoy?'var(--ok)':'var(--t3)'}">${ico(hechasHoy?"ok":"tareas",38,1.3)}</div>
      <p class="t-lg">${hechasHoy?"Terminaste todo":"Sin pendientes"}</p>
      <p class="text-xs mt-1.5" style="color:var(--t3)">${hechasHoy?"Puedes tomarte un respiro.":"Cuando te asignen algo aparecerá aquí."}</p>
    </div>`;
    return;
  }

  // Tarea en foco: la primera de la lista, grande y con su botón
  const f0 = items[0];
  const accionFoco = f0.t.multi && respons(f0.t.a).length
      ? `<button onclick="event.stopPropagation();marcarMulti('${f0.v.id}','${f0.t.k}',false)" class="btn-p btn-lg">${ico("ok",16,2.4)} Marcar mi parte</button>`
      : f0.t.foto
        ? `<button onclick="event.stopPropagation();abrirDetalle('${f0.v.id}');setTimeout(()=>irATarea('${f0.v.id}','${f0.t.k}'),80)" class="btn-p btn-lg">${ico("foto",16,2)} Subir comprobante</button>`
        : `<button onclick="event.stopPropagation();marcarDesdeLista('${f0.v.id}','${f0.t.k}')" class="btn-p btn-lg">${ico("ok",16,2.4)} Marcar como hecha</button>`;
  const foco = `<div class="hero-sig cta-web fade-up" id="tc-${f0.v.id}-${f0.t.k}">
      <div class="blob b1" aria-hidden="true"></div><div class="blob b2" aria-hidden="true"></div>
      <div class="flex items-center justify-between gap-2">
        <p class="ceja" style="margin:0">Empieza por aquí</p>
        <span class="chip chip-gr">${areaI(f0.t.a,13)} ${esc(areaN(f0.t.a))}</span>
      </div>
      <p class="hero-t mt-4">${esc(f0.t.t)}</p>
      <p class="t-sm mt-1.5">${esc(f0.v.vehiculo)||"Carro por asignar"}${f0.v.nombreCliente?` · ${esc(f0.v.nombreCliente)}`:""}</p>
      ${f0.t.d?`<p class="t-xs mt-2" style="line-height:1.5">${esc(f0.t.d)}</p>`:""}
      <div class="flex items-center gap-2 mt-4 flex-wrap">
        ${accionFoco}
        <button onclick="abrirDetalle('${f0.v.id}')" class="btn-ghost-web">Ver unidad <span aria-hidden="true">→</span></button>
      </div>
      <span id="chk-${f0.v.id}-${f0.t.k}" class="hidden"></span>
    </div>`;

  const resto = items.slice(1);
  const grupos = {};
  resto.forEach(it => (grupos[it.t.a] ||= []).push(it));
  const MAX = 4;

  cont.innerHTML = foco + (resto.length ? `<p class="t-lbl" style="margin:26px 0 4px 2px!important">También pendiente · ${resto.length}</p>` : "") + Object.keys(grupos).map(a=>`
    <div class="group-head">
      <span class="gh-ico">${areaI(a)}</span>
      <span class="t-md">${esc(areaN(a))}</span>
      <span class="t-xs">${grupos[a].length}</span>
      <span class="gh-line"></span>
    </div>
    <div class="lista">${grupos[a].slice(0, verMas.has(a)?999:MAX).map(({v,t},i)=>`
      <div class="task-card" id="tc-${v.id}-${t.k}"
           onclick="${t.foto?`abrirDetalle('${v.id}')`:`marcarDesdeLista('${v.id}','${t.k}')`}">
        <div class="task-check" id="chk-${v.id}-${t.k}">${t.foto?ico("clip",13,2):ico("ok",14,2.4)}</div>
        <div class="flex-1 min-w-0">
          <p class="task-title truncate">${esc(t.t)}</p>
          <p class="task-meta truncate">${esc(v.vehiculo)||"Carro por asignar"}${v.nombreCliente?` · ${esc(v.nombreCliente)}`:""}${t.multi&&respons(t.a).length?` · tu parte (${respons(t.a).filter(u=>(v.tareas?.[t.k]?.marcas||{})[u]).length}/${respons(t.a).length})`:""}</p>
        </div>
        ${t.foto?`<span class="chip chip-wn flex-shrink-0 solo-pc">comprobante</span><span class="solo-movil flex-shrink-0" style="color:var(--warn)" title="Pide comprobante">${ico("clip",15,1.8)}</span>`:""}
        <button onclick="event.stopPropagation();abrirDetalle('${v.id}')" class="btn-g px-2.5 py-1.5 rounded-lg flex-shrink-0">Ver</button>
      </div>`).join("")}
    ${grupos[a].length>MAX ? `<button onclick="verMasArea('${a}')" class="ver-mas">${verMas.has(a)?'Ver menos':`Ver ${grupos[a].length-MAX} más`}</button>`:""}</div>
    ${false ? `<button onclick="verMasArea('${a}')" class="ver-mas">${verMas.has(a)?'Ver menos':`Ver ${grupos[a].length-MAX} más`}</button>`:""}
  `).join("");
}
const verMas = new Set();
window.verMasArea = function(a){ verMas.has(a)?verMas.delete(a):verMas.add(a); pintarMias(); };

// Marcar desde la lista con animación antes de guardar
window.marcarDesdeLista = function(id, k){
  const chk = document.getElementById(`chk-${id}-${k}`);
  const card = document.getElementById(`tc-${id}-${k}`);
  if(chk){ chk.classList.add('on','pop'); }
  if(card){ card.classList.add('done'); }
  setTimeout(()=> marcar(id, k, false), 260);
};

function pintarFinanzas(){
  const act = autos.filter(a=>!a.archivado);
  const costo   = act.reduce((s,a)=> s + Number(a.costo_subasta||0), 0);
  const venta   = act.reduce((s,a)=> s + Number(a.precio_venta||0), 0);
  const cobrado = act.reduce((s,a)=> s + pagado(a), 0);
  const porCobrar = act.reduce((s,a)=> s + saldo(a), 0);
  const ganancia  = venta - costo;
  const pctCobrado = venta > 0 ? (cobrado/venta)*100 : 0;
  const margen = venta > 0 ? (ganancia/venta)*100 : 0;

  const tarjeta = (icono,label,valor,color) => `
    <div class="stat">
      <div class="ico-box">${ico(icono,16)}</div>
      <p class="num text-[22px] font-semibold mt-1" style="color:${color}">${money(valor)}</p>
      <p class="t-lbl mt-1">${label}</p>
    </div>`;

  const celda = (l,val,col) => `<div><p class="t-sm">${l}</p><p class="res-n" style="color:${col}">${money(val)}</p></div>`;
  document.getElementById('finCifras').innerHTML =
      celda("Invertido", costo, "var(--t1)") + celda("Venta proyectada", venta, "var(--t1)")
    + celda("Ya cobrado", cobrado, "var(--ok)") + celda("Por cobrar", porCobrar, "var(--warn)");

  const barra = (label,val,tot,color) => {
    const p = tot>0 ? Math.round((val/tot)*100) : 0;
    return `<div>
      <div class="flex justify-between t-xs mb-1">
        <span style="color:var(--t3)">${label}</span>
        <span style="color:${color}">${money(val)} · ${p}%</span>
      </div>
      <div class="bar"><i style="width:${p}%;background:${color}!important"></i></div>
    </div>`;
  };
  document.getElementById('finBarras').innerHTML =
      barra("Costo sobre la venta", costo, venta, "var(--info)")
    + barra("Ganancia bruta proyectada", ganancia, venta, "var(--brand)")
    + barra("Cobrado hasta hoy", cobrado, venta, "var(--ok)");

  document.getElementById('finAnillo').innerHTML = anillo(pctCobrado, 165, 12, "cobrado");
  document.getElementById('finAnilloDet').innerHTML = `
    <p class="num text-lg font-semibold" style="color:var(--ok)">${money(cobrado)}</p>
    <p class="t-xs">de ${money(venta)} proyectados</p>
    <div class="mt-3 pt-3 border-t" style="border-color:var(--line)">
      <p class="t-lbl" style="color:var(--t3)">Ganancia proyectada</p>
      <p class="num text-base font-semibold" style="color:${ganancia>=0?'var(--brand)':'var(--danger)'}">${money(ganancia)} <span class="text-[10px]">(${Math.round(margen)}% margen)</span></p>
    </div>`;

  const t = document.getElementById('finTabla');
  if(!act.length){
    t.innerHTML = `<tr><td colspan="8" class="p-14 text-center t-md" style="color:var(--t3)"><div class="flex justify-center mb-2" style="color:var(--t3)">${ico("direccion",30,1.3)}</div>No hay unidades activas.</td></tr>`;
    return;
  }
  t.innerHTML = act.map(v=>{
    const g = Number(v.precio_venta||0) - Number(v.costo_subasta||0);
    return `<tr class="border-b hover:bg-white/5 cursor-pointer" style="border-color:var(--line)" onclick="abrirDetalle('${v.id}')">
      <td class="p-4 font-semibold" style="color:var(--t1)">${esc(v.vehiculo)||"Por asignar"}</td>
      <td class="p-4" style="color:var(--cyan)">${esc(v.nombreCliente)||"—"}</td>
      <td class="p-4 text-right num">${money(v.costo_subasta)}</td>
      <td class="p-4 text-right num" style="color:var(--info)">${money(v.precio_venta)}</td>
      <td class="p-4 text-right num" style="color:var(--ok)">${money(pagado(v))}</td>
      <td class="p-4 text-right num" style="color:var(--warn)">${money(saldo(v))}</td>
      <td class="p-4 text-right num font-semibold" style="color:${g>=0?'var(--brand)':'var(--danger)'}">${money(g)}</td>
      <td class="p-4 text-center num font-semibold" style="color:var(--cyan)">${progreso(v)}%</td>
    </tr>`;
  }).join("");
}

function pintarArchivo(){
  const t = document.getElementById('tArch');
  const ls = autos.filter(a=>a.archivado);
  if(!ls.length){ t.innerHTML = `<tr><td colspan="7" class="p-14 text-center t-md" style="color:var(--t3)"><div class="flex justify-center mb-2" style="color:var(--t3)">${ico("archivo",30,1.3)}</div>Nada archivado todavía.</td></tr>`; return; }
  t.innerHTML = ls.map(v=>`<tr class="border-b hover:bg-white/5" style="border-color:var(--line)">
    <td class="p-4 t-xs" style="color:var(--t3)">${v.fecha_registro? fch(v.fecha_registro):"—"}</td>
    <td class="p-4 font-semibold" style="color:var(--t1)">${esc(v.vehiculo)||"—"}</td>
    <td class="p-4" style="color:var(--cyan)">${esc(v.nombreCliente)||"—"}</td>
    <td class="p-4 t-xs" style="color:var(--t3)">${esc(v.vin)}</td>
    <td class="p-4 text-center num font-semibold" style="color:var(--cyan)">${progreso(v)}%</td>
    <td class="p-4 text-right num font-semibold">${money(v.costo_subasta)} / <span style="color:var(--brand)">${money(v.precio_venta)}</span></td>
    <td class="p-4 text-right whitespace-nowrap">
      <button onclick="archivar('${v.id}',false)" class="btn-g px-2.5 py-1.5 rounded-lg">Reactivar</button>
      ${yo?.admin ? `<button onclick="eliminar('${v.id}')" class="btn-g px-2.5 py-1.5 rounded-lg ml-1.5"
           style="color:var(--danger);border-color:rgba(255,69,58,.3)" title="Eliminar">${ico("basura",14)}</button>`:""}
    </td>
  </tr>`).join("");
}

function pintarUsers(){
  const c = document.getElementById('users'); if(!c || !yo?.admin) return;
  c.innerHTML = Object.keys(EQUIPO).map(u=>{
    const d = usersData[u] || { nombre:EQUIPO[u].nombre, admin:EQUIPO[u].admin, areas:[] };
    const creado = !!usersData[u];
    const body = (d.admin ? `<span class="chip chip-pk mb-1"><span class="dot"></span>Admin · puede todo</span>` : "")
      + AREAS.map(a=>{
          const on = (d.areas||[]).includes(a.k);
          return `<label class="perm ${on?'on':''}">
            <input type="checkbox" ${on?'checked':''} onchange="togArea('${u}','${a.k}',this.checked)">
            <span class="perm-box">${ico("ok",11,3)}</span>
            <span class="perm-ico">${areaI(a.k,15)}</span>
            <span class="perm-n">${esc(a.n)}</span></label>`;
        }).join("");
    return `<div class="deep lift rounded-2xl p-5 space-y-3">
      <div class="flex items-center justify-between gap-2">
        <span class="t-md">${esc(d.nombre)}</span>
        <span class="chip ${creado?'chip-ok':'chip-gr'}">${creado?'activo':'sin entrar'}</span>
      </div>
      <div class="flex flex-col gap-2">${body}</div>
    </div>`;
  }).join("");
}

/* ════════ DETALLE ════════ */
/* ── Detalle: siguiente paso + fases plegables ── */
const faseOpen = {};
window.faseTog = function(id, fi, abierta){ (faseOpen[id] ||= {})[fi] = abierta; };
window.irATarea = function(id, k){
  const v = autos.find(a=>a.id===id); if(!v) return;
  const t = defT(v).find(x=>x.k===k); if(!t) return;
  (faseOpen[id] ||= {})[t.f] = true;
  abrirDetalle(id, true);
  setTimeout(()=>{ const e=document.getElementById('tk-'+k); if(!e) return;
    e.scrollIntoView({behavior:'smooth', block:'center'}); e.classList.add('flash');
    setTimeout(()=>e.classList.remove('flash'), 1600); }, 60);
};
function heroSiguiente(v){
  const ls = tareasDe(v);
  const pend = ls.filter(t=>!tareaOk(v,t));
  const pct = progreso(v);
  const barra = `<div class="hero-bar"><i style="width:${pct}%"></i></div>`;
  if(!pend.length){
    return `<div class="hero-sig hero-ok">
      <div class="hero-ico" style="background:var(--ok);color:#04150a">${ico("ok",20,2.4)}</div>
      <div class="flex-1 min-w-0">
        <p class="t-lbl" style="color:var(--ok)">Proceso completo</p>
        <p class="hero-t">Todo listo con esta unidad</p>
        <p class="t-sm mt-1">Ya puedes archivarla para que no aparezca en la flota.</p>
      </div>
      ${!v.archivado?`<button onclick="archivar('${v.id}',true)" class="btn-p px-4 py-2.5 flex-shrink-0">Archivar</button>`:""}
    </div>`;
  }
  const t = pend[0];
  const paso = ls.indexOf(t) + 1;
  const req = t.multi ? respons(t.a) : [];
  const meToca = t.multi && req.length ? (req.includes(yo.usuario) && !miMarca(v,t)) : puede(t.a);
  const veh = esc(v.vehiculo).replace(/'/g,""), tt = esc(t.t).replace(/'/g,"");
  let accion;
  if(meToca){
    if(t.multi && req.length) accion = `<button onclick="marcarMulti('${v.id}','${t.k}',false)" class="btn-p btn-lg">${ico("ok",16,2.4)} Marcar mi parte</button>`;
    else if(t.foto)            accion = `<button onclick="irATarea('${v.id}','${t.k}')" class="btn-p btn-lg">${ico("foto",16,2)} Subir comprobante</button>`;
    else                       accion = `<button onclick="marcar('${v.id}','${t.k}',false)" class="btn-p btn-lg">${ico("ok",16,2.4)} Marcar como hecha</button>`;
  } else {
    accion = `<button onclick="avisarWhats('${t.a}','${tt}','${veh}','${esc(v.vin)}')" class="btn-g btn-lg">${ico("chat",16)} Recordar a ${esc(quienes(t.a))}</button>`;
  }
  const mias = pendientesMias(v);
  const otraMia = !meToca && mias.length ? mias[0] : null;
  const multiInfo = t.multi && req.length ? ` · ${req.filter(u=>(v.tareas?.[t.k]?.marcas||{})[u]).length} de ${req.length} marcaron` : "";
  return `<div class="hero-sig cta-web suave">
    <div class="blob b1" aria-hidden="true"></div><div class="blob b2" aria-hidden="true"></div>
    ${ruta(v,true)}
    <div class="hero-div"></div>
    <div class="flex items-center justify-between gap-2">
      <p class="ceja" style="margin:0">Siguiente paso</p>
      <span class="t-xs num">Paso ${paso} de ${ls.length}</span>
    </div>
    <p class="hero-t mt-2">${esc(t.t)}</p>
    ${t.d?`<p class="t-sm mt-1.5" style="line-height:1.5">${esc(t.d)}</p>`:""}
    <div class="flex items-center gap-2 mt-3 flex-wrap">
      <span class="chip chip-gr">${areaI(t.a,13)} ${esc(areaN(t.a))}</span>
      <span class="t-xs">${meToca?'Te toca a ti':'Le toca a '+esc(quienes(t.a))}${multiInfo}</span>
    </div>
    <div class="flex items-center gap-2 mt-4 flex-wrap">
      ${accion}
      ${pend.length>1?`<span class="t-xs ml-1">Después: ${esc(pend[1].t)}</span>`:""}
    </div>
    ${otraMia?`<button onclick="irATarea('${v.id}','${otraMia.k}')" class="hero-mia">
        <span class="flex-1 min-w-0 text-left"><span class="t-lbl block">Lo tuyo en esta unidad</span>
        <span class="t-sm block truncate" style="color:var(--t1)">${esc(otraMia.t)}</span></span>
        <span class="t-xs">${mias.length>1?`+${mias.length-1} más`:''}</span>${ico("flecha",14,1.8)}</button>`:""}
  </div>`;
}

window.abrirDetalle = function(id, silencioso){
  const v = autos.find(a=>a.id===id); if(!v){ cerrar(); return; }
  abiertoId = id;
  const m = document.getElementById('modal');
  m.className = "modal-bg" + (silencioso ? "" : " modal-anim");
  const fases = defF(v), p = progreso(v), enc = v.tipoProceso==="Encargo";

  const fAct = faseActual(v);
  let bloques = fases.map((fn,fi)=>{
    const ts = defT(v).filter(t=>t.f===fi);
    const req_ = ts.filter(t=>!t.opc), hechas_ = req_.filter(t=>tareaOk(v,t)).length;
    const estado = hechas_===req_.length ? 'lista' : (fi===fAct ? 'actual' : (fi<fAct ? 'atras' : 'luego'));
    const abierta = (faseOpen[v.id] && faseOpen[v.id][fi]!==undefined) ? faseOpen[v.id][fi] : fi===fAct;
    const etiqueta = {lista:'Completa', actual:'En curso', atras:'Pendientes atrasadas', luego:'Más adelante'}[estado];
    return `<details class="fase fase-${estado}" ${abierta?'open':''} ontoggle="faseTog('${v.id}',${fi},this.open)">
      <summary>
        <span class="fase-dot">${estado==='lista'?ico("ok",12,2.6):(fi+1)}</span>
        <span class="flex-1 min-w-0">
          <span class="fase-n">${esc(fn.replace(/^\d+\s*·\s*/,''))}</span>
          <span class="fase-s">${etiqueta} · ${hechas_} de ${req_.length}</span>
        </span>
        <span class="fase-bar"><i style="width:${req_.length?Math.round(hechas_/req_.length*100):0}%"></i></span>
        <span class="fase-chev">${ico("flecha",14,1.8)}</span>
      </summary>
      <div class="fase-body">` + ts.map(t=>{
      const st = v.tareas?.[t.k], ok = tareaOk(v,t), can = puede(t.a);
      const req = t.multi ? respons(t.a) : [];

      // ── Tarea con check individual por persona (marketing) ──
      if(t.multi && req.length){
        const marcas = st?.marcas || {};
        const listos = req.filter(u=>marcas[u]).length;
        const filas = req.map(u=>{
          const hecho = !!marcas[u], soyYo = u===yo.usuario;
          return `<div class="flex items-center gap-2 py-1">
            <div class="tbox ${hecho?'on':''} ${soyYo?'':'lock'}" style="width:17px;height:17px;font-size:10px"
              ${soyYo?`onclick="marcarMulti('${v.id}','${t.k}',${hecho})"`:'title="Solo esta persona puede marcar su parte"'}>${hecho?ico("ok",11,2.6):''}</div>
            <span class="t-xs ${hecho?'':'opacity-70'}" style="color:${hecho?'var(--ok)':'var(--txt-soft)'}">
              ${esc(usersData[u]?.nombre||u)}${soyYo?' (tú)':''}${hecho&&marcas[u]?` · ${fch(marcas[u])}`:''}
            </span></div>`;
        }).join("");
        if(ok) return `<div id="tk-${t.k}" class="tarea-ok">
          <div class="tbox on">${ico("ok",11,2.6)}</div>
          <span class="flex-1 min-w-0 truncate">${esc(t.t)}</span>
          <span class="t-xs flex-shrink-0">${listos}/${req.length} marcaron</span></div>`;
        return `<div id="tk-${t.k}" class="tarea" style="flex-direction:column;align-items:stretch;gap:6px">
          <div class="flex items-start gap-2">
            <span class="text-sm mt-0.5">${ok?ico("ok",15,2):ico("equipo",15)}</span>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold leading-snug ${ok?'line-through opacity-70':''}">${esc(t.t)}</p>
              ${t.d?`<p class="text-[10px] mt-0.5 leading-snug" style="color:var(--t3)">${esc(t.d)}</p>`:""}
            </div>
            <span class="chip ${ok?'chip-ok':'chip-wn'} flex-shrink-0">${listos}/${req.length}</span>
          </div>
          <div class="pl-6 pt-1 border-t" style="border-color:var(--line)">${filas}</div>
          ${!ok?`<div class="pl-6"><button onclick="avisarWhats('${t.a}','${esc(t.t).replace(/'/g,"")}','${esc(v.vehiculo).replace(/'/g,"")}','${esc(v.vin)}')"
             class="btn-g px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">${ico("chat",13)} Recordar a los que faltan</button></div>`:""}
        </div>`;
      }

      // ── Tarea normal ──
      const fotos = st?.fotos || [];
      const bloqueFotos = t.foto ? `
        <div class="mt-2 pt-2 border-t" style="border-color:var(--line)">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="chip ${fotos.length?'chip-ok':'chip-wn'}">${fotos.length?`${fotos.length} comprobante${fotos.length>1?'s':''}`:'sin comprobante'}</span>
            ${st?.sinComprobante?`<span class="t-xs" style="color:var(--warn)">${esc(st.sinComprobante)}</span>`:""}
          </div>
          ${fotos.length?`<div class="flex flex-wrap gap-1.5 mb-2">${fotos.map((f,i)=>`
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg deep">
              <a href="${esc(f.url)}" target="_blank" class="t-xs underline" style="color:var(--cyan)">${esc((f.nombre||'foto').slice(0,20))}</a>
              ${can?`<button onclick="borrarFoto('${v.id}','${t.k}',${i})" class="t-xs" style="color:var(--danger)" title="Quitar">${ico("cerrar",11,2)}</button>`:""}
            </span>`).join("")}</div>`:""}
          ${can?`<div class="flex gap-1.5 items-center">
            <label class="file-btn flex-1 min-w-0"><input type="file" id="f-${t.k}" accept="image/*,application/pdf" onchange="this.parentNode.querySelector('b').innerText=(this.files[0]?.name||'Elegir archivo')"><span>${ico("foto",13)}</span><b>Elegir archivo</b></label>
            <button onclick="subirFoto('${v.id}','${t.k}')" class="btn-g px-2.5 py-1.5 rounded-lg flex-shrink-0">Subir</button>
          </div>`:""}
        </div>` : "";

      if(ok){
        const nf = (st?.fotos||[]).length;
        return `<div id="tk-${t.k}" class="tarea-ok">
          <div class="tbox on" ${can?`onclick="marcar('${v.id}','${t.k}',true)" title="Reabrir"`:''}>${ico("ok",11,2.6)}</div>
          <span class="flex-1 min-w-0 truncate">${esc(t.t)}</span>
          ${nf?`<a href="${esc(st.fotos[0].url)}" target="_blank" class="t-xs flex items-center gap-1" style="color:var(--cyan)" onclick="event.stopPropagation()">${ico("clip",12)}${nf>1?nf:''}</a>`:""}
          <span class="t-xs flex-shrink-0">${st?.por?esc(usersData[st.por]?.nombre||st.por)+' · ':''}${fch(st?.fecha)}</span>
        </div>`;
      }
      return `<div id="tk-${t.k}" class="tarea ${ok?'hecha':''} ${!can?'bloq':''}" ${t.foto?'style="flex-direction:column;align-items:stretch;gap:0"':''}>
        <div class="flex items-start gap-2.5 w-full">
          <div class="tbox ${ok?'on':''} ${!can?'lock':''}" ${can?`onclick="marcar('${v.id}','${t.k}',${ok})"`:'title="No tienes esta área habilitada"'}>${ok?ico("ok",12,2.6):(can?'':ico("candado",11,1.8))}</div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold leading-snug ${ok?'line-through opacity-70':''}">${esc(t.t)}${t.opc?' <span class="t-xs">(opcional)</span>':''}${t.foto?' <span class="chip chip-wn" style="vertical-align:middle">comprobante</span>':''}</p>
            ${t.d?`<p class="text-[10px] mt-0.5 leading-snug" style="color:var(--t3)">${esc(t.d)}</p>`:""}
            <div class="flex flex-wrap items-center gap-2 mt-1.5">
              <span class="chip chip-gr">${areaI(t.a)} ${esc(areaN(t.a))}</span>
              ${ok && st?.por ? `<span class="t-xs" style="color:var(--ok)">${esc(usersData[st.por]?.nombre||st.por)} · ${fch(st.fecha)}</span>`
                            : `<span class="t-xs">→ ${esc(quienes(t.a))}</span>`}
            </div>
          </div>
          ${!ok ? `<button onclick="avisarWhats('${t.a}','${esc(t.t).replace(/'/g,"")}','${esc(v.vehiculo).replace(/'/g,"")}','${esc(v.vin)}')"
              class="btn-g text-xs px-2 py-1.5 rounded-lg flex-shrink-0" title="Recordar por WhatsApp">${ico("chat",14)}</button>`:""}
        </div>
        ${bloqueFotos}
      </div>`;
    }).join("") + `</div></details>`;
  }).join("");

  const abonos = (v.abonos||[]).map((a,i)=>`<div class="flex justify-between items-center t-sm py-1.5 border-b" style="border-color:var(--line)">
      <span style="color:var(--t3)">${[fch(a.fecha), esc(usersData[a.por]?.nombre||a.por||""), esc(a.nota||"")].filter(Boolean).join(" · ")}</span>
      <b style="color:var(--ok)">${money(a.monto)}</b></div>`).join("") ||
    `<p class="text-[11px] py-2" style="color:var(--t3)">Sin abonos registrados.</p>`;

  // ── Panel editable: asignar carro (encargo) o asignar cliente (stock) ──
  const sinCarro   = !v.vehiculo;
  const sinCliente = !v.nombreCliente;
  const opcPlat = p => ["Copart","IAAI","ADESA","Manheim","Otro"].map(x=>`<option ${p===x?'selected':''}>${x}</option>`).join("");
  const camposCarro = `
      <div class="rejilla">
        <div class="campo col-2"><label for="edVeh">Año, marca y modelo</label><input id="edVeh" class="inp" value="${esc(v.vehiculo)}" placeholder="2019 Toyota Corolla"></div>
        <div class="campo"><label for="edVin">VIN o lote</label><input id="edVin" class="inp" value="${esc(v.vin)}" style="text-transform:uppercase" autocomplete="off"></div>
        <div class="campo"><label for="edPlat">Subasta</label><select id="edPlat" class="inp">${opcPlat(v.plataforma||"Copart")}</select></div>
        <div class="campo"><label for="edCosto">Costo de compra ($)</label><input id="edCosto" type="number" inputmode="decimal" class="inp" value="${Number(v.costo_subasta||0)||""}" placeholder="0"></div>
        <div class="campo"><label for="edVenta">Precio de venta ($)</label><input id="edVenta" type="number" inputmode="decimal" class="inp" value="${Number(v.precio_venta||0)||""}" placeholder="0"></div>
      </div>`;
  const camposCli = `
      <div class="rejilla">
        <div class="campo"><label for="edCli">Nombre del cliente</label><input id="edCli" class="inp" value="${esc(v.nombreCliente)}"></div>
        <div class="campo"><label for="edTel">Teléfono</label><input id="edTel" class="inp" inputmode="tel" value="${esc(v.telefonoCliente)}" placeholder="7777-7777"></div>
        <div class="campo col-2"><label for="edDeseo">Qué busca y presupuesto</label><input id="edDeseo" class="inp" value="${esc(v.deseoCliente)}"></div>
      </div>`;
  let panelDatos = "";
  if(editando){
    const modo = sinCarro ? "carro" : (sinCliente && !enc ? "cliente" : "todo");
    panelDatos = `<div class="editor-web">
      <div class="editor-h">
        <div><p class="t-md">${modo==="carro" ? "Asignar el carro ganado" : modo==="cliente" ? "Asignar el cliente" : "Editar datos de la unidad"}</p>
          <p class="t-xs mt-1">${modo==="carro" ? (v.deseoCliente ? "El cliente busca: "+esc(v.deseoCliente) : "Llena los datos del carro que se ganó en subasta.") : modo==="cliente" ? "Datos de la persona que compró este carro." : "Cambia lo que necesites y guarda."}</p></div>
      </div>
      ${modo==="carro" ? camposCarro : modo==="cliente" ? camposCli : `<p class="bloque-t">Vehículo</p>${camposCarro}<p class="bloque-t mt-2">Cliente</p>${camposCli}`}
      <div class="flex gap-2 flex-wrap">
        <button onclick="guardarDatos('${v.id}')" class="btn-p px-5 py-2.5">${modo==="carro" ? "Asignar carro" : modo==="cliente" ? "Asignar cliente" : "Guardar cambios"}</button>
        <button onclick="toggleEditar()" class="btn-g px-4 py-2.5">Cancelar</button>
      </div>
    </div>`;
  } else if(sinCarro || (sinCliente && !enc)){
    panelDatos = `<div class="falta-web">
      <span class="falta-ico">${sinCarro?ico("buscar",20):ico("usuario",20)}</span>
      <div class="flex-1 min-w-0">
        <p class="t-md">${sinCarro?'Todavía sin carro':'Todavía sin cliente'}</p>
        <p class="t-sm mt-0.5">${sinCarro ? (v.deseoCliente ? "Busca: "+esc(v.deseoCliente) : "Cuando se gane en subasta, asígnale el carro.") : "Cuando lo vendas, agrega aquí al cliente."}</p>
      </div>
      <button onclick="toggleEditar()" class="btn-p px-4 py-2.5 flex-shrink-0">${sinCarro?'Asignar carro':'Asignar cliente'}</button>
    </div>`;
  }

  m.innerHTML = `<div class="glass rounded-3xl w-full max-w-2xl my-4 relative" onclick="event.stopPropagation()">
    
    <div class="p-6 border-b flex justify-between items-start gap-3 sticky top-0 rounded-t-3xl z-10" style="border-color:var(--line);background:var(--panel-hi)">
      <div class="min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="font-display text-xl font-bold truncate" style="color:var(--t1)">${esc(v.vehiculo) || (v.nombreCliente ? "Encargo de "+esc(v.nombreCliente.split(" ")[0]) : "Unidad sin datos")}</h2>
          ${pillEstado(v)}<span class="estado e-neutro">${enc?'Encargo':'Stock'}</span>
        </div>
        <p class="t-xs mt-1" style="color:var(--t3)">${v.vehiculo?`${esc(v.plataforma)} · ${esc(v.vin)||"sin VIN"}`:(v.deseoCliente?"Busca: "+esc(v.deseoCliente):"Sin vehículo asignado")}${v.nombreCliente?` · ${esc(v.nombreCliente)} ${v.telefonoCliente?"· "+esc(v.telefonoCliente):""}`:""}</p>
      </div>
      <div class="flex gap-1.5 flex-shrink-0">
        <button onclick="toggleEditar()" class="btn-g px-2.5 py-2 rounded-lg" title="Editar datos">${ico("editar",15)}</button>
        <button onclick="cerrar()" class="btn-g px-2.5 py-2 rounded-lg" title="Cerrar">${ico("cerrar",15)}</button>
      </div>
    </div>

    <div class="p-6 space-y-5">
      ${panelDatos}
      ${heroSiguiente(v)}

      <div class="dinero">
        <div><p class="t-lbl">Cobrado</p><p class="num text-[17px] font-semibold mt-0.5" style="color:var(--ok)">${money(pagado(v))}</p></div>
        ${Number(v.precio_venta||0) ? `
        <div><p class="t-lbl">Falta cobrar</p><p class="num text-[17px] font-semibold mt-0.5" style="color:${saldo(v)>0?'var(--warn)':'var(--t2)'}">${money(saldo(v))}</p></div>
        <div><p class="t-lbl">Ganancia</p><p class="num text-[17px] font-semibold mt-0.5" style="color:${(Number(v.precio_venta||0)-Number(v.costo_subasta||0))>=0?'var(--brand-light)':'var(--danger)'}">${money(Number(v.precio_venta||0)-Number(v.costo_subasta||0))}</p></div>`
        : `<div style="grid-column:span 2"><p class="t-lbl">Precio de venta</p><p class="t-sm mt-1" style="color:var(--t2)">Por definir · se pone al asignar el carro</p></div>`}
      </div>

      <details class="plegable">
        <summary><span class="flex-1">Pagos, costo y precio</span><span class="t-xs">${(v.abonos||[]).length} abono${(v.abonos||[]).length===1?'':'s'}</span><span class="fase-chev">${ico("flecha",14,1.8)}</span></summary>
        <div class="pt-3 space-y-3">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div class="deep rounded-xl p-3"><p class="t-lbl">Costo</p><p class="num text-base font-semibold mt-1">${money(v.costo_subasta)}</p></div>
            <div class="deep rounded-xl p-3"><p class="t-lbl">Precio venta</p>
              <div class="campo-num mt-1"><span>$</span><input type="number" value="${Number(v.precio_venta||0)}" onchange="setVenta('${v.id}',this.value)" class="num"></div></div>
            <div class="deep rounded-xl p-3"><p class="t-lbl">Registrada</p><p class="t-sm mt-1.5" style="color:var(--t1)">${fch(v.fecha_registro)||"—"}</p></div>
          </div>
          <div>${abonos}</div>
          ${puede('finanzas') ? `<div class="flex gap-2 flex-wrap">
            <input type="number" id="abMonto" placeholder="Monto $" class="inp flex-1 min-w-[110px] px-3 py-2 rounded-xl text-xs">
            <input type="text" id="abNota" placeholder="Nota (opcional)" class="inp flex-1 min-w-[140px] px-3 py-2 rounded-xl text-xs">
            <button onclick="addAbono('${v.id}')" class="btn-p px-4 py-2">Abonar</button>
          </div>` : `<p class="t-xs">Solo Finanzas puede registrar abonos.</p>`}
        </div>
      </details>

      <div>
        <p class="t-lbl mb-2.5">Proceso completo</p>
        <div class="space-y-2">${bloques}</div>
      </div>


      <div class="flex flex-wrap gap-2 pt-3 border-t" style="border-color:var(--line)">
        ${v.archivado ? `<button onclick="archivar('${v.id}',false)" class="btn-g px-4 py-2.5 rounded-xl flex items-center gap-2">${ico("flecha",14)} Reactivar</button>`
                      : `<button onclick="archivar('${v.id}',true)" class="btn-g px-4 py-2.5 rounded-xl flex items-center gap-2">${ico("archivo",14)} Archivar</button>`}
        ${v.telefonoCliente ? `<a href="https://wa.me/503${String(v.telefonoCliente).replace(/\\D/g,'')}" target="_blank" class="btn-g px-4 py-2.5 inline-flex items-center gap-2">${ico("chat",14)} Escribir al cliente</a>`:""}
        ${yo?.admin
          ? `<button onclick="eliminar('${v.id}')" class="btn-g btn-d px-4 py-2.5 flex items-center gap-2 ml-auto">${ico("basura",14)} Eliminar</button>`
          : `<span class="t-xs self-center flex items-center gap-1.5">${ico("candado",12)} Solo un admin puede eliminar</span>`}
      </div>
    </div>
  </div>`;
  m.onclick = cerrar;
};
window.cerrar = function(){ abiertoId=null; editando=false; const m=document.getElementById('modal'); m.className="hidden"; m.innerHTML=""; };

window.toggleEditar = function(){ editando = !editando; if(abiertoId) abrirDetalle(abiertoId, true); };

window.guardarDatos = function(id){
  const g = i => (document.getElementById(i)?.value || "").trim();
  const v = autos.find(a=>a.id===id) || {};
  const datos = {};
  if(document.getElementById('edVeh')){
    datos.vehiculo = g('edVeh'); datos.vin = g('edVin').toUpperCase(); datos.plataforma = g('edPlat') || "Copart";
    datos.costo_subasta = Number(g('edCosto'))||0; datos.precio_venta = Number(g('edVenta'))||0;
  }
  if(document.getElementById('edCli')){
    datos.nombreCliente = g('edCli'); datos.telefonoCliente = g('edTel'); datos.deseoCliente = g('edDeseo');
  }
  const asignaCarro = datos.vehiculo && !v.vehiculo, asignaCli = datos.nombreCliente && !v.nombreCliente;
  if(datos.vehiculo===""&&v.vehiculo){ toast("Escribe el vehículo.","warn"); return; }
  updateDoc(doc(db,"vehiculos",id), datos).catch(e=> toast("No se pudo guardar en el servidor: "+(e.code||e.message),"err"));
  Object.assign(v, datos);            // la ficha cambia al instante
  editando = false;
  toast(asignaCarro ? "Carro asignado a "+(v.nombreCliente||"la unidad")+"." : asignaCli ? "Cliente asignado." : "Datos actualizados.");
  if(asignaCarro || asignaCli) celebrar();
  abrirDetalle(id, true);
};


/* ════════ ACCIONES ════════ */
window.marcar = async function(id, k, ok){
  const v = autos.find(a=>a.id===id); if(!v) return;
  const def = defT(v).find(t=>t.k===k); if(!def) return;
  if(!puede(def.a)){ toast("No tienes el área "+areaN(def.a)+" habilitada.","err"); return; }
  if(def.multi && respons(def.a).length) return marcarMulti(id, k, miMarca(v,def));

  const st = v.tareas?.[k] || {};
  let sinComprobante = null;

  // Tareas que exigen comprobante: si no hay foto, se puede dejar constancia
  // (el esquema permite efectivo confirmado de recibido).
  if(!ok && def.foto && !(st.fotos||[]).length){
    const motivo = prompt(
      "Esta tarea pide comprobante y todavía no hay ninguna foto.\n\n"+
      def.t+"\n\n"+
      "Si el pago fue en EFECTIVO o no hay comprobante, escribe aquí quién lo recibió\n"+
      "y quedará registrado. Si no, cancela y sube la foto primero.",
      "Recibido en efectivo por "+(yo.nombre||"")
    );
    if(motivo===null) return;                       // canceló: sube la foto
    if(!motivo.trim()){ toast("Escribe una constancia o sube el comprobante.","warn"); return; }
    sinComprobante = motivo.trim();
  }

  const tareas = { ...(v.tareas||{}) };
  tareas[k] = ok
    ? { ...st, ok:false }
    : { ...st, ok:true, por:yo.usuario, fecha:new Date().toISOString(), ...(sinComprobante?{sinComprobante}:{}) };
  try{
    await updateDoc(doc(db,"vehiculos",id), { tareas });
    if(!ok){ celebrar(); toast(""+def.t); } else toast("Tarea reabierta.");
  }catch(e){ toast("No se pudo guardar: "+e.code,"err"); }
};

// ── Comprobantes ──
window.subirFoto = async function(id, k){
  const inp = document.getElementById(`f-${k}`);
  if(!inp || !inp.files.length){ toast("Elige una foto primero.","warn"); return; }
  const v = autos.find(a=>a.id===id); if(!v) return;
  const def = defT(v).find(t=>t.k===k);
  if(!puede(def.a)){ toast("No tienes esta área habilitada.","err"); return; }

  const file = inp.files[0];
  if(file.size > 8*1024*1024){ toast("La foto pesa más de 8 MB. Usa una más liviana.","warn"); return; }

  toast("Subiendo comprobante…","warn");
  try{
    const ruta = `comprobantes/${id}/${k}_${Date.now()}_${file.name.replace(/[^\w.\-]/g,"_")}`;
    const snap = await uploadBytes(ref(storage, ruta), file);
    const url  = await getDownloadURL(snap.ref);
    const st   = v.tareas?.[k] || {};
    const fotos = [ ...(st.fotos||[]), { url, nombre:file.name, por:yo.usuario, fecha:new Date().toISOString() } ];
    const tareas = { ...(v.tareas||{}) };
    tareas[k] = { ...st, fotos };
    await updateDoc(doc(db,"vehiculos",id), { tareas });
    inp.value = "";
    toast("Comprobante guardado.");
  }catch(e){
    toast(e.code==="storage/unauthorized"
      ? "Storage sin permisos. Revisa las reglas en Firebase."
      : "No se pudo subir: "+(e.code||e.message), "err");
  }
};

window.borrarFoto = async function(id, k, idx){
  const v = autos.find(a=>a.id===id); if(!v) return;
  const def = defT(v).find(t=>t.k===k);
  if(!puede(def.a)){ toast("No tienes esta área habilitada.","err"); return; }
  if(!confirm("¿Quitar este comprobante de la tarea?")) return;
  const st = v.tareas?.[k] || {};
  const fotos = (st.fotos||[]).filter((_,i)=>i!==idx);
  const tareas = { ...(v.tareas||{}) };
  tareas[k] = { ...st, fotos };
  try{ await updateDoc(doc(db,"vehiculos",id), { tareas }); toast("Comprobante quitado."); }
  catch(e){ toast("Error.","err"); }
};

// Cada persona marca SOLO su parte (marketing: Facebook, grupo de WhatsApp, etc.)
window.marcarMulti = async function(id, k, yaHecho){
  const v = autos.find(a=>a.id===id); if(!v) return;
  const def = defT(v).find(t=>t.k===k); if(!def) return;
  if(!puede(def.a)){ toast("No tienes el área "+areaN(def.a)+" habilitada.","err"); return; }
  const st = v.tareas?.[k] || {};
  const marcas = { ...(st.marcas||{}) };
  if(yaHecho) delete marcas[yo.usuario]; else marcas[yo.usuario] = new Date().toISOString();
  const tareas = { ...(v.tareas||{}) };
  tareas[k] = { ...st, marcas };
  try{
    await updateDoc(doc(db,"vehiculos",id), { tareas });
    const req = respons(def.a), listos = req.filter(u=>marcas[u]).length;
    if(!yaHecho) celebrar();
    toast(yaHecho ? "Quitaste tu marca." : `Tu parte lista (${listos}/${req.length})`);
  }catch(e){ toast("No se pudo guardar: "+e.code,"err"); }
};

window.togArea = async function(u, k, on){
  if(!yo?.admin) return;
  const cur = usersData[u]?.areas || [];
  const nue = on ? Array.from(new Set([...cur,k])) : cur.filter(x=>x!==k);
  try{ await updateDoc(doc(db,"usuarios",u), { areas:nue }); toast(`${usersData[u].nombre}: ${on?"+":"−"} ${areaN(k)}`); }
  catch(e){ toast("Error al guardar permiso.","err"); }
};

window.setVenta = async function(id, val){
  const n = Number(val); if(isNaN(n)) return;
  try{ await updateDoc(doc(db,"vehiculos",id), { precio_venta:n }); toast("Precio actualizado."); }catch(e){ toast("Error.","err"); }
};

window.addAbono = async function(id){
  const m = Number(document.getElementById('abMonto').value);
  const nota = document.getElementById('abNota').value;
  if(!m || m<=0){ toast("Escribe un monto válido.","warn"); return; }
  const v = autos.find(a=>a.id===id);
  const abonos = [ ...(v.abonos||[]), { monto:m, nota, por:yo.usuario, fecha:new Date().toISOString() } ];
  try{ await updateDoc(doc(db,"vehiculos",id), { abonos }); toast("Abono de "+money(m)+" registrado."); }
  catch(e){ toast("No se pudo registrar.","err"); }
};

window.archivar = async function(id, val){
  try{ await updateDoc(doc(db,"vehiculos",id), { archivado:val }); cerrar(); toast(val?"Unidad archivada.":"Unidad reactivada."); }
  catch(e){ toast("Error.","err"); }
};

window.eliminar = async function(id){
  if(!yo?.admin){ toast("Solo un administrador puede eliminar unidades.","err"); return; }
  const v = autos.find(a=>a.id===id); if(!v) return;
  const ok = confirm(
    "ELIMINAR PARA SIEMPRE\n\n"+
    (v.vehiculo||"Sin nombre")+(v.vin?" ("+v.vin+")":"")+"\n"+
    (v.tipoProceso==="Encargo" ? "Cliente: "+(v.nombreCliente||"—")+"\n" : "")+
    "\nSe borra el vehículo con todo su historial de tareas y abonos.\nEsto NO se puede deshacer.\n\n"+
    "Si solo quieres sacarlo de la lista, cancela y usa \"Archivar\".\n\n¿Eliminar de todas formas?"
  );
  if(!ok) return;
  try{
    await deleteDoc(doc(db,"vehiculos",id));
    cerrar();
    toast("Unidad eliminada definitivamente.");
  }catch(e){ toast("No se pudo eliminar: "+(e.code||e.message),"err"); }
};

window.avisarWhats = function(area, tarea, veh, vin){
  const msg = `🚨 *IMPORTACIONES YESICA*\nHola *${quienes(area)}*, tienes pendiente:\n\n📌 *${tarea}*\n🚗 ${veh||'(carro por asignar)'} ${vin?'('+vin+')':''}\n\nPor favor márcala en el sistema cuando la completes. ¡Gracias!`;
  window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg), "_blank");
};

window.crearUnidad = async function(){
  const b = document.getElementById('btnCrear');
  const veh = document.getElementById('fVeh').value.trim();
  const enc = tipoNuevo==="Encargo";
  const nomCli = document.getElementById('nCli').value.trim();
  const desCli = document.getElementById('dCli').value.trim();

  if(enc && !nomCli){ toast("Escribe el nombre del cliente.","warn"); return; }
  if(enc && !veh && !desCli){ toast("Escribe qué carro busca el cliente.","warn"); return; }
  if(!enc && !veh){ toast("Escribe el vehículo que compraste.","warn"); return; }

  b.disabled = true; b.innerText = "Guardando…";
  const nuevo = {
    tipoProceso: tipoNuevo,
    nombreCliente: enc ? nomCli : "",
    telefonoCliente: enc ? document.getElementById('tCli').value.trim() : "",
    deseoCliente: enc ? desCli : "",
    vehiculo: veh,
    vin: document.getElementById('fVin').value.trim().toUpperCase(),
    plataforma: document.getElementById('fPlat').value,
    costo_subasta: Number(document.getElementById('fCosto').value)||0,
    precio_venta: Number(document.getElementById('fVenta').value)||0,
    abonos: (enc && Number(document.getElementById('aCli').value)>0)
      ? [{ monto:Number(document.getElementById('aCli').value), nota:"Abono de inicio de proceso", por:yo.usuario, fecha:new Date().toISOString() }] : [],
    tareas: {},
    archivado: false,
    creadoPor: yo.usuario,
    fecha_registro: new Date().toISOString()
  };
  // Firestore guarda primero en el teléfono y luego sincroniza: no hay que esperar al servidor
  const ref = doc(collection(db,"vehiculos"));
  setDoc(ref, nuevo).catch(e=> toast("No se pudo guardar en el servidor: "+(e.code||e.message)+". Revisa tu internet.","err"));
  toast(veh ? "Carro registrado con su lista de tareas." : "Cliente registrado. Asígnale el carro cuando se gane.");
  ["fVeh","fVin","fCosto","fVenta","nCli","tCli","dCli"].forEach(i=> document.getElementById(i).value="");
  document.getElementById('aCli').value = "100";
  b.disabled = false; setTipo(tipoNuevo);
  ir('flota');
  abrirCuandoExista(ref.id);
};
function abrirCuandoExista(id, intentos=20){
  if(autos.some(a=>a.id===id)) { abrirDetalle(id); return; }
  if(intentos>0) setTimeout(()=>abrirCuandoExista(id, intentos-1), 100);
}

/* ════════ AVISOS POR TELEGRAM ════════
   Llegan aunque la persona tenga todo cerrado. Los envía el robot de GitHub Actions. */
let cfgRemota = {};      // config/notificaciones — la comparte la web con el robot
let tgToken   = "";      // config/telegram — token del bot

const escHtml = s => String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

async function enviarTelegram(chatId, textoHtml){
  if(!tgToken || !chatId) return false;
  try{
    const r = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ chat_id:String(chatId), text:textoHtml, parse_mode:"HTML" })
    });
    const d = await r.json();
    if(!d.ok) console.warn("Telegram:", d.description);
    return !!d.ok;
  }catch(e){ console.warn("Telegram falló:", e.message); return false; }
}

// ── Estado del robot ──
function minutosDesdeRevision(){
  if(!cfgRemota.ultimaRevision) return null;
  return Math.round((Date.now() - cfgRemota.ultimaRevision)/60000);
}
function robotVivo(){
  const m = minutosDesdeRevision();
  return m !== null && m < 20;     // debería revisar cada 5 min
}
function textoRobot(){
  const m = minutosDesdeRevision();
  const est = cfgRemota.ultimoEstado ? ` · ${cfgRemota.ultimoEstado}` : "";
  if(m === null) return "aún no ha corrido — revisa el workflow y los secretos en GitHub";
  if(m < 2)  return "revisó hace un momento" + est;
  if(m < 60) return `revisó hace ${m} min` + est;
  return `revisó hace ${Math.round(m/60)} h — puede estar detenido`;
}

// ── Conectar el bot (solo admin, una vez para todo el equipo) ──
window.guardarTokenTG = async function(){
  const t = (document.getElementById('tgTok')?.value || "").trim();
  if(!t.includes(":") || t.length < 25){ toast("Ese token no parece válido.","warn"); return; }
  try{
    const r = await fetch(`https://api.telegram.org/bot${t}/getMe`);
    const d = await r.json();
    if(!d.ok){ toast("Telegram rechazó ese token.","err"); return; }
    await setDoc(doc(db,"config","telegram"), { token:t, bot:d.result.username }, { merge:true });
    toast(`Bot @${d.result.username} conectado.`);
  }catch(e){ toast("No se pudo verificar el token.","err"); }
};

// ── Vinculación de cada persona ──
const miCodigoTG = () => usersData[yo?.usuario]?.tgCode || "";
const miChatTG   = () => usersData[yo?.usuario]?.telegram || "";

window.crearCodigoTG = async function(){
  const code = `vincular-${yo.usuario}-${Math.random().toString(36).slice(2,6)}`;
  await updateDoc(doc(db,"usuarios",yo.usuario), { tgCode:code });
  toast("Código listo. Envíaselo al bot en Telegram.");
};

window.copiarCodigoTG = async function(){
  const c = miCodigoTG(); if(!c) return;
  try{ await navigator.clipboard.writeText(c); toast("Copiado: "+c); }
  catch(e){ prompt("Copia este código y envíaselo al bot:", c); }
};

window.vincularTG = async function(){
  const code = miCodigoTG();
  if(!tgToken){ toast("El bot no está conectado todavía. Pídeselo al administrador.","warn"); return; }
  if(!code){ toast("Primero genera tu código.","warn"); return; }
  toast("Buscando tu mensaje en Telegram…","warn");
  try{
    const r = await fetch(`https://api.telegram.org/bot${tgToken}/getUpdates?limit=100`);
    const d = await r.json();
    if(!d.ok){ toast("Error del bot: "+(d.description||""),"err"); return; }
    const hit = (d.result||[]).reverse().find(u =>
      (u.message?.text||"").toLowerCase().includes(code.toLowerCase()));
    if(!hit){
      toast("No encontré tu mensaje. Envíale el código al bot y vuelve a intentar.","warn");
      return;
    }
    await updateDoc(doc(db,"usuarios",yo.usuario), {
      telegram: String(hit.message.chat.id),
      telegramNombre: hit.message.from?.first_name || ""
    });
    toast("Telegram vinculado correctamente.");
  }catch(e){ toast("No se pudo vincular: "+e.message,"err"); }
};

window.desvincularTG = async function(){
  if(!confirm("¿Desvincular tu Telegram? Dejarás de recibir avisos.")) return;
  await updateDoc(doc(db,"usuarios",yo.usuario), { telegram:"" });
  toast("Telegram desvinculado.","warn");
};

window.probarTG = async function(){
  const chat = miChatTG();
  if(!chat){ toast("Primero vincula tu Telegram.","warn"); return; }
  const ok = await enviarTelegram(chat,
    "🔔 <b>Prueba · Importaciones Yesica</b>\n\nSi ves esto en tu celular, tus avisos ya están funcionando. ✅");
  toast(ok ? "Enviado. Revisa Telegram." : "No se pudo enviar.", ok?"ok":"err");
};

/* ════════ NOTIFICACIONES ════════ */
const NK = "yesica_noti_cfg";
let ncfg = { on:false, minTareas:30, minClientes:15, clientesOn:true, soloHorario:true, hIni:7, hFin:20 };
let tmrTareas=null, tmrClientes=null, swReg=null;

(function(){ try{ ncfg = { ...ncfg, ...JSON.parse(localStorage.getItem(NK)||"{}") }; }catch(e){} })();
function guardarCfg(){ localStorage.setItem(NK, JSON.stringify(ncfg)); }

// El service worker es lo que permite avisos reales en Android/Chrome
(async function(){
  if(!('serviceWorker' in navigator)) return;
  try{ swReg = await navigator.serviceWorker.register('sw.js'); }
  catch(e){ console.warn('Service worker no disponible:', e.message); }
})();

const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
              (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const esApp = window.navigator.standalone===true ||
              window.matchMedia('(display-mode: standalone)').matches;

// "si" = avisos del sistema | "ios" = hay que instalarla como app | "no" = solo avisos dentro de la página
function soporteSistema(){
  if(!("Notification" in window)) return esIOS && !esApp ? "ios" : "no";
  return "si";
}

function enHorario(){
  if(!ncfg.soloHorario) return true;
  const h = new Date().getHours();
  return h >= ncfg.hIni && h < ncfg.hFin;
}
function puedeAvisar(){ return ncfg.on && yo && enHorario(); }

// Pitido corto (funciona aunque el celular no soporte notificaciones)
function pitido(){
  try{
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
    const ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type='sine'; o.frequency.value=880;
    g.gain.setValueAtTime(.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.25, ctx.currentTime+.02);
    g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime+.45);
    o.start(); o.stop(ctx.currentTime+.5);
    setTimeout(()=>ctx.close(), 900);
  }catch(e){}
}

// Aviso grande dentro de la página: el respaldo que SÍ funciona en todo celular
function bannerAviso(titulo, cuerpo){
  pitido();
  if(navigator.vibrate) { try{ navigator.vibrate([300,120,300]); }catch(e){} }
  document.getElementById('bannerNoti')?.remove();
  const d = document.createElement('div');
  d.id = "bannerNoti";
  d.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:300;padding:14px 16px;cursor:pointer;"+
    "background:var(--s2);color:var(--t1);border-bottom:1px solid var(--line-2);box-shadow:0 10px 30px -12px rgba(0,0,0,.8);"+
    "display:flex;align-items:center;gap:12px;animation:slideIn .3s ease";
  d.innerHTML = `<span style="color:var(--brand);display:flex">${ico("campana",20,1.7)}</span>
    <div style="flex:1;min-width:0">
      <p style="font-weight:600;font-size:13.5px;letter-spacing:-0.015em;margin:0">${esc(titulo)}</p>
      <p style="font-size:12px;color:var(--t2);margin:3px 0 0;white-space:pre-line">${esc(cuerpo)}</p>
    </div>
    <span style="font-weight:500;font-size:12px;opacity:.55">Ver</span>`;
  d.onclick = ()=>{ ir('mias'); d.remove(); };
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 25000);
}

async function lanzar(titulo, cuerpo, tag){
  // 1) Aviso del sistema (sale aunque estés en otra app), si el celular lo permite
  if(("Notification" in window) && Notification.permission==="granted"){
    const opts = { body:cuerpo, tag, renotify:true, vibrate:[300,120,300], badge:undefined };
    try{
      if(swReg && swReg.showNotification){ await swReg.showNotification(titulo, opts); return; }
      const n = new Notification(titulo, opts);
      n.onclick = ()=>{ window.focus(); ir('mias'); n.close(); };
      return;
    }catch(e){ /* algunos Android no dejan el constructor directo → cae al banner */ }
  }
  // 2) Respaldo: aviso dentro de la página, con sonido y vibración
  bannerAviso(titulo, cuerpo);
}

function contarMias(){
  let n=0; autos.filter(a=>!a.archivado).forEach(v=> n += pendientesMias(v).length); return n;
}

function avisoTareas(){
  if(!puedeAvisar()) return;
  const items=[];
  autos.filter(a=>!a.archivado).forEach(v=> pendientesMias(v).forEach(t=> items.push({v,t})));
  if(!items.length) return;
  const p = items[0];
  lanzar(
    `⏰ ${items.length} tarea${items.length>1?'s':''} sin marcar`,
    `${p.t.t}\n🚗 ${p.v.vehiculo||"Carro por asignar"}${items.length>1?`\n… y ${items.length-1} más`:''}`,
    "yesica-tareas"
  );
}
function avisoClientes(){
  if(!puedeAvisar() || !ncfg.clientesOn) return;
  if(!(puede('ventas') || puede('marketing'))) return;
  lanzar("💬 Contestar a clientes", "Revisa los chats y grupos de WhatsApp. No dejes mensajes sin responder.", "yesica-clientes");
}

function reiniciarTimers(){
  clearInterval(tmrTareas); clearInterval(tmrClientes);
  if(!ncfg.on) return;
  tmrTareas = setInterval(avisoTareas, Math.max(1,ncfg.minTareas)*60000);
  if(ncfg.clientesOn) tmrClientes = setInterval(avisoClientes, Math.max(1,ncfg.minClientes)*60000);
}

window.activarNotis = async function(){
  const sop = soporteSistema();
  if(sop === "si"){
    let p = Notification.permission;
    if(p === "default"){ try{ p = await Notification.requestPermission(); }catch(e){} }
    if(p !== "granted")
      toast("Sin permiso del sistema: te avisaré dentro de la página.","warn");
  } else if(sop === "ios"){
    toast("En iPhone: usa Compartir → “Añadir a inicio” para avisos fuera de la app.","warn");
  }
  ncfg.on = true; guardarCfg(); reiniciarTimers(); pintarCfgNotis();
  lanzar("🔔 Avisos activados",
    `Te recordaré tus tareas cada ${ncfg.minTareas} min${ncfg.clientesOn?` y contestar clientes cada ${ncfg.minClientes} min`:""}.`,
    "yesica-test");
};
window.apagarNotis = function(){ ncfg.on=false; guardarCfg(); reiniciarTimers(); pintarCfgNotis(); toast("Avisos apagados.","warn"); };
window.setCfg = async function(campo, val){
  if(campo==="clientesOn") ncfg.clientesOn = val;
  else if(campo==="soloHorario") ncfg.soloHorario = val;
  else ncfg[campo] = Math.max(0, Number(val)||0);
  guardarCfg(); reiniciarTimers(); pintarCfgNotis();
  // El admin define los tiempos que usa el robot
  if(yo?.admin){
    try{
      await setDoc(doc(db,"config","notificaciones"), {
        minTareas:ncfg.minTareas, minClientes:ncfg.minClientes,
        clientesOn:ncfg.clientesOn, soloHorario:ncfg.soloHorario,
        hIni:ncfg.hIni, hFin:ncfg.hFin
      }, { merge:true });
    }catch(e){ console.warn("no se pudo guardar la config del robot:", e.message); }
  }
};
window.probarNoti = function(){
  if(!ncfg.on){ toast("Primero activa los avisos.","warn"); return; }
  if(!enHorario()){ toast("Estás fuera del horario configurado.","warn"); return; }
  avisoTareas(); avisoClientes();
  setTimeout(()=>{ if(!contarMias()) lanzar("🔔 Prueba de aviso","Así se verán tus recordatorios.","yesica-test"); }, 300);
};

function pintarCfgNotis(){
  const c = document.getElementById('cfgNotis'); if(!c) return;
  const sop = soporteSistema();
  const permiso = ("Notification" in window) ? Notification.permission : "unsupported";
  const sistemaOk = sop==="si" && permiso==="granted";

  let nota = "";
  if(!ncfg.on) nota = "";
  else if(sistemaOk) nota = swReg
      ? "Avisos completos: te llegan aunque estés en otra app, mientras la página siga abierta en el navegador."
      : "Avisos del sistema activos. Deja esta página abierta en una pestaña.";
  else if(sop==="ios") nota = "<b style='color:var(--t1)'>iPhone:</b> toca Compartir en Safari y elige “Añadir a pantalla de inicio”. Abre la app desde ese ícono y vuelve a activar los avisos.";
  else if(permiso==="denied") nota = "Bloqueaste los avisos en este navegador. Actívalos desde el candado de la barra de dirección → Notificaciones → Permitir.";
  else nota = "Este navegador no da avisos del sistema; te aviso dentro de la página, con sonido y vibración.";

  const chatTG = miChatTG(), codeTG = miCodigoTG();
  const botName = cfgRemota.botName || "";

  const aviso = (color, texto) => `
    <div class="nota" style="--c:${color}">
      <span style="color:${color}">${ico('alerta',14,1.8)}</span>
      <p class="t-sm" style="line-height:1.55">${texto}</p>
    </div>`;

  const pushBox = `
    <div class="deep rounded-2xl p-4 mt-3">
      <div class="flex items-center justify-between gap-2 flex-wrap mb-3">
        <p class="t-md">Telegram</p>
        <span class="chip ${chatTG?'chip-ok':'chip-wn'}">${chatTG?'Vinculado':'Sin vincular'}</span>
      </div>

      ${!tgToken ? aviso('var(--warn)', `El bot todavía no está conectado.${yo?.admin?' Pega abajo el token que te dio BotFather.':' Pídeselo al administrador.'}`) : ""}

      ${chatTG ? `
        <p class="t-sm mb-3" style="line-height:1.55">Los avisos te llegan a Telegram${usersData[yo.usuario]?.telegramNombre?` como <b style="color:var(--t1)">${esc(usersData[yo.usuario].telegramNombre)}</b>`:""}, aunque tengas todo cerrado.</p>
        <div class="flex gap-2 flex-wrap">
          <button onclick="probarTG()" class="btn-p px-4 py-2">Probar aviso</button>
          <button onclick="desvincularTG()" class="btn-g px-3 py-2">Desvincular</button>
        </div>`
      : `
        <ol class="pasos">
          <li>Abre Telegram y busca el bot${botName?` <b style="color:var(--cyan)">@${esc(botName)}</b>`:" del negocio"}.</li>
          <li>Dale a <b style="color:var(--t1)">Iniciar</b> (o escribe /start).</li>
          <li>Genera tu código aquí abajo y envíaselo al bot.</li>
          <li>Vuelve y presiona <b style="color:var(--t1)">Ya lo envié</b>.</li>
        </ol>
        ${codeTG ? `
          <div class="flex gap-2 items-center mb-2 flex-wrap">
            <code class="mono px-3 py-2 rounded-lg flex-1 min-w-[180px] break-all" style="background:var(--bg);color:var(--cyan);border:1px solid var(--line-2)">${esc(codeTG)}</code>
            <button onclick="copiarCodigoTG()" class="btn-g px-3 py-2 rounded-lg">Copiar</button>
          </div>
          <button onclick="vincularTG()" class="btn-p px-4 py-2">Ya lo envié · Vincular</button>`
        : `<button onclick="crearCodigoTG()" class="btn-p px-4 py-2">Generar mi código</button>`}`}

      ${yo?.admin ? `
        <div class="mt-4 pt-3.5 border-t space-y-2.5" style="border-color:var(--line)">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="chip ${robotVivo()?'chip-ok':'chip-wn'}"><span class="dot"></span>Robot ${robotVivo()?'en línea':'sin señal'}</span>
            <span class="t-xs">${textoRobot()}</span>
          </div>
          ${!robotVivo() && minutosDesdeRevision()!==null
            ? aviso('var(--warn)','GitHub está saltando corridas (da baja prioridad a los repos gratuitos). Conecta el disparador externo de cron-job.org para que los avisos salgan puntuales.')
            : ""}
          <details>
            <summary class="t-xs cursor-pointer">Token del bot · ${tgToken?'conectado':'falta'}</summary>
            <div class="flex gap-2 mt-2.5 flex-wrap">
              <input id="tgTok" type="password" placeholder="1234567890:AAxx…" class="inp flex-1 min-w-[180px] px-3 py-2 rounded-xl text-xs">
              <button onclick="guardarTokenTG()" class="btn-g px-3 py-2">Guardar</button>
            </div>
            <p class="t-xs mt-2">Te lo da @BotFather al crear el bot. Se pone una sola vez y sirve para todo el equipo.</p>
          </details>
        </div>`:""}
    </div>`;

  c.innerHTML = `
    <div class="flex items-center gap-2 flex-wrap">
      <span class="chip ${chatTG?'chip-ok':'chip-wn'}"><span class="dot"></span>${chatTG?'Telegram activo':'Telegram sin vincular'}</span>
      ${chatTG && !enHorario() ? `<span class="chip chip-wn">En pausa hasta las ${ncfg.hIni}:00</span>`:""}
    </div>
    ${chatTG ? `<p class="t-sm mt-3" style="line-height:1.5">Te avisamos cada ${ncfg.minTareas} min lo que tengas pendiente${ncfg.soloHorario?`, de ${ncfg.hIni}:00 a ${ncfg.hFin}:00`:''}.</p>` : ""}
    ${chatTG ? `<details class="plegable mt-3"><summary><span class="flex-1">Ajustes de avisos</span><span class="fase-chev">${ico("flecha",14,1.8)}</span></summary><div class="px-3 pb-3">` : ""}
    ${pushBox}

    <div class="space-y-2.5 mt-3">
      <div class="deep rounded-2xl p-3.5">
        <p class="t-sm" style="color:var(--t1)">Repetir tareas pendientes</p>
        <div class="flex items-center gap-2 mt-2">
          <span class="t-xs">cada</span>
          <input type="number" min="1" value="${ncfg.minTareas}" onchange="setCfg('minTareas',this.value)" class="inp w-16 px-2.5 py-1.5 rounded-lg text-xs num">
          <span class="t-xs">minutos</span>
        </div>
      </div>

      <div class="deep rounded-2xl p-3.5">
        <label class="sw">
          <input type="checkbox" ${ncfg.clientesOn?'checked':''} onchange="setCfg('clientesOn',this.checked)">
          <span class="t-sm" style="color:var(--t1)">Recordar contestar clientes</span>
        </label>
        <div class="flex items-center gap-2 mt-2">
          <span class="t-xs">cada</span>
          <input type="number" min="1" value="${ncfg.minClientes}" onchange="setCfg('minClientes',this.value)" ${ncfg.clientesOn?'':'disabled'} class="inp w-16 px-2.5 py-1.5 rounded-lg text-xs num">
          <span class="t-xs">minutos</span>
        </div>
      </div>

      <div class="deep rounded-2xl p-3.5">
        <label class="sw">
          <input type="checkbox" ${ncfg.soloHorario?'checked':''} onchange="setCfg('soloHorario',this.checked)">
          <span class="t-sm" style="color:var(--t1)">Solo en horario de trabajo</span>
        </label>
        <div class="flex items-center gap-2 mt-2">
          <span class="t-xs">de</span>
          <input type="number" min="0" max="23" value="${ncfg.hIni}" onchange="setCfg('hIni',this.value)" ${ncfg.soloHorario?'':'disabled'} class="inp w-14 px-2.5 py-1.5 rounded-lg text-xs num">
          <span class="t-xs">a</span>
          <input type="number" min="1" max="24" value="${ncfg.hFin}" onchange="setCfg('hFin',this.value)" ${ncfg.soloHorario?'':'disabled'} class="inp w-14 px-2.5 py-1.5 rounded-lg text-xs num">
          <span class="t-xs">horas</span>
        </div>
      </div>

      <details>
        <summary class="t-xs cursor-pointer px-3.5 py-2.5 rounded-2xl deep">Avisos dentro del navegador — ${ncfg.on?'encendidos':'apagados'}</summary>
        <div class="mt-2 deep rounded-2xl p-3.5">
          <p class="t-sm mb-2.5" style="line-height:1.55">Esto es aparte de Telegram: solo salen mientras tengas esta página abierta. Con Telegram basta.</p>
          <div class="flex gap-2 flex-wrap">
            ${ncfg.on ? `<button onclick="probarNoti()" class="btn-g px-3 py-2">Probar</button>
                         <button onclick="apagarNotis()" class="btn-g px-3 py-2">Apagar</button>`
                      : `<button onclick="activarNotis()" class="btn-g px-3 py-2">Encender de todos modos</button>`}
          </div>
          ${nota?`<p class="t-xs mt-2.5" style="line-height:1.55">${nota}</p>`:""}
        </div>
      </details>
    </div>
    ${chatTG ? `</div></details>` : ""}`;
}

// El número de pendientes también se ve en el título de la pestaña
function actualizarTitulo(){
  const n = yo ? contarMias() : 0;
  document.title = (n ? `(${n}) ` : "") + "Centro de Control · Importaciones Yesica";
}
setInterval(()=>{ if(yo){ actualizarTitulo(); pintarCfgNotis(); } }, 60000);
reiniciarTimers();
setTimeout(()=>{ if(puedeAvisar()) avisoTareas(); }, 10000);

setTipo("Encargo");

// Íconos del riel y la barra superior
(function(){
  const map = { icAvisos:'campana', icNuevaH:'nueva', icAlertaH:'alerta', icFinH:'finanzas', icDirH:'direccion', icArchH:'archivo', icEqH1:'equipo', icEqH2:'equipo', icFlota:'flota', icTareas:'tareas', icNueva:'nueva', icFin:'finanzas',
                icArch:'archivo', icEquipo:'equipo' };
  Object.keys(map).forEach(id=>{ const e=document.getElementById(id); if(e) e.innerHTML = ico(map[id], 19, 1.6); });
  const k = { kiUnidades:'flota', kiAvance:'direccion', kiCobrar:'reloj', kiMias:'tareas' };
  Object.keys(k).forEach(id=>{ const e=document.getElementById(id); if(e) e.innerHTML = ico(k[id],16); });
  const be=document.getElementById('icEnc'); if(be) be.innerHTML = ico('apreton',16);
  const bs=document.getElementById('icStk'); if(bs) bs.innerHTML = ico('caja',16);
  const f = document.getElementById('icFecha'); if(f) f.innerHTML = ico('reloj', 14, 1.7);
  const s = document.getElementById('icSalir'); if(s) s.innerHTML = ico('salir', 15, 1.7);
})();
// Tema: auto → claro → oscuro
function pintarBtnTema(){
  const b=document.getElementById('btnTema'); if(!b) return;
  const p=window.__tema?.get()||'auto';
  b.innerHTML = ico(p==='light'?'sol':p==='dark'?'luna':'auto', 15, 1.7);
  b.title = p==='light'?'Tema: claro':p==='dark'?'Tema: oscuro':'Tema: automático (según tu teléfono)';
}
window.cambiarTema = function(){
  const orden=['dark','light','auto']; const p=window.__tema.get();
  const sig=orden[(orden.indexOf(p)+1)%3]; window.__tema.set(sig); pintarBtnTema();
  toast(sig==='auto'?'Tema automático, según tu teléfono':sig==='light'?'Modo claro':'Modo oscuro');
};
pintarBtnTema();
document.getElementById('fechaHoy').innerText =
  new Date().toLocaleDateString('es-SV',{ weekday:'short', day:'numeric', month:'short' });

// Menú de arriba: se vuelve vidrio al bajar (con margen, para no reaccionar a cada píxel ni al rebote del iPhone)
(function(){
  const tb = document.querySelector('.topbar'); if(!tb) return;
  let on = false;
  const revisar = () => { const y = window.scrollY;
    if(!on && y > 24){ on = true; tb.classList.add('scrolled'); }
    else if(on && y < 8){ on = false; tb.classList.remove('scrolled'); } };
  window.addEventListener('scroll', revisar, { passive:true }); revisar();
})();

// Pastilla rosa que se desliza al filtro activo (como el selector de /inventario)
function moverPastilla(){
  const cont = document.querySelector('.seg-f'); const on = cont && cont.querySelector('.tab.on');
  const p = cont && cont.querySelector('.seg-pill'); if(!p || !on) return;
  p.style.width = on.offsetWidth + 'px'; p.style.transform = `translateX(${on.offsetLeft}px)`;
}
window.addEventListener('resize', moverPastilla);
setTimeout(moverPastilla, 60);

// Brillo del borde que sigue al mouse en las tarjetas (solo compu)
if(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.addEventListener('pointermove', e=>{
    const c = e.target.closest && e.target.closest('.vcard, .hero-sig'); if(!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX-r.left)+'px'); c.style.setProperty('--my', (e.clientY-r.top)+'px');
  }, { passive:true });
  const g = document.createElement('div'); g.className = 'cursor-glow'; document.body.appendChild(g);
  let gx=0, gy=0, tx=0, ty=0, vivo=false;
  document.addEventListener('pointermove', e=>{ tx=e.clientX; ty=e.clientY; g.style.opacity='1'; if(!vivo){ vivo=true; requestAnimationFrame(seguir); } }, { passive:true });
  document.addEventListener('pointerleave', ()=> g.style.opacity='0');
  function seguir(){ gx+=(tx-gx)*.12; gy+=(ty-gy)*.12; g.style.transform=`translate(${gx}px,${gy}px)`;
    if(Math.abs(tx-gx)+Math.abs(ty-gy) > .5) requestAnimationFrame(seguir); else vivo=false; }
}

// Pantalla de carga: se va en cuanto el sistema está listo (nunca más de ~1.5 s)
(function(){
  const l = document.getElementById('cargador'); if(!l) return;
  const quitar = () => { l.classList.add('fuera'); setTimeout(()=>l.remove(), 700); };
  const t0 = performance.now();
  const listo = () => setTimeout(quitar, Math.max(0, 700 - (performance.now()-t0)));
  const obs = new MutationObserver(()=>{
    if(!document.getElementById('app').classList.contains('hidden') || !document.getElementById('login').classList.contains('hidden')){ obs.disconnect(); listo(); }
  });
  obs.observe(document.body, { subtree:true, attributes:true, attributeFilter:['class'] });
  setTimeout(quitar, 1600);
})();
