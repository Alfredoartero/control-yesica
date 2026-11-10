/* ═══════════════════════════════════════════════════════════════
   ROBOT DE AVISOS · Importaciones Yesica
   Corre solo en GitHub Actions cada 15 minutos.
   Nadie necesita tener nada abierto.

   Las tareas se leen de proceso.json (vienen del tablero). La lista de abajo es solo respaldo.
   ═══════════════════════════════════════════════════════════════ */
import admin from "firebase-admin";

const sa = JSON.parse(process.env.FIREBASE_SA);
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const T_ENC = [   // respaldo: el proceso real viene del editor (config/proceso)
  {"k": "e01", "f": 0, "a": "ventas", "t": "Ingresar datos del cliente y vehículo deseado", "d": "Nombre, foto de DUI, carro deseado, millaje, golpe y presupuesto inicial", "foto": true, "personas": ["yesica", "leslie", "alfre"]},
  {"k": "e02", "f": 0, "a": "finanzas", "t": "Confirmar pago de $100", "d": "Anexar comprobante. Se abona al total de la venta", "pago": true, "foto": true},
  {"k": "e03", "f": 0, "a": "finanzas", "t": "Facturar los $100 de inicio"},
  {"k": "e04", "f": 0, "a": "ventas", "t": "Crear grupo de WhatsApp"},
  {"k": "e05", "f": 0, "a": "marketing", "t": "Enviar opciones al cliente", "d": "De lunes a viernes hasta que se le gane una", "multi": true, "repetible": true, "hasta": "e06", "personas": ["cesar"]},
  {"k": "e06", "f": 1, "a": "compras", "t": "Se ganó el vehículo en subasta", "personas": ["alfre", "yesica"]},
  {"k": "e07", "f": 1, "a": "direccion", "t": "Registrar vehículo en sistema", "d": "Vehículo, costo y precio de venta", "personas": ["alfre", "yesica", "leslie"]},
  {"k": "e08", "f": 1, "a": "compras", "t": "Pagar la subasta (Copart / IAA)", "d": "Evitar storage. Adjuntar comprobante del pago", "foto": true},
  {"k": "e11", "f": 1, "a": "finanzas", "t": "Confirmar pago del 50% de enganche", "d": "Con comprobante en foto, o confirmar recibido si es efectivo", "pago": true, "foto": true},
  {"k": "e12", "f": 1, "a": "finanzas", "t": "Facturar el abono del 50%"},
  {"k": "e13", "f": 1, "a": "legal", "t": "Crear promesa de venta"},
  {"k": "e09", "f": 1, "a": "naviera", "t": "Asignar a naviera"},
  {"k": "e10", "f": 1, "a": "naviera", "t": "Brindar estatus al cliente", "d": "Constante, una vez por semana hasta que venga", "repetible": true, "hasta": "e14"},
  {"k": "e14", "f": 2, "a": "aduana", "t": "Marcar llegada del vehículo al país"},
  {"k": "e24", "f": 2, "a": "ventas", "t": "Avisar al cliente que su vehículo llegó al país", "d": "Mensaje al cliente apenas arriba, con los siguientes pasos y lo que falta pagar"},
  {"k": "e16", "f": 2, "a": "finanzas", "t": "Pagar a la naviera", "d": "Adjuntar comprobante del pago", "foto": true},
  {"k": "e17", "f": 2, "a": "aduana", "t": "Cancelar impuestos de aduana", "d": "Adjuntar comprobante / DUCA", "foto": true},
  {"k": "e21", "f": 2, "a": "aduana", "t": "Liberación del vehículo"},
  {"k": "e18", "f": 2, "a": "aduana", "t": "Revisión mecánica", "d": "Subir fotos del estado del vehículo", "foto": true},
  {"k": "e19", "f": 2, "a": "finanzas", "t": "Cliente cancela el restante", "d": "Siempre con comprobante", "pago": true, "foto": true},
  {"k": "e20", "f": 2, "a": "finanzas", "t": "Facturar el monto pagado"},
  {"k": "e22", "f": 2, "a": "legal", "t": "Crear compraventa y firmar contrato", "d": "Adjuntar foto del contrato firmado por ambas partes", "foto": true},
  {"k": "e25", "f": 2, "a": "ventas", "t": "Entregar el vehículo al cliente", "d": "Coordinar la entrega y dejar constancia con foto", "foto": true},
  {"k": "e15", "f": 2, "a": "marketing", "t": "Publicar la entrega del carro", "d": "Foto o video de la entrega, cada quien en su canal", "multi": true, "opc": true},
  {"k": "e23", "f": 2, "a": "legal", "t": "Hacer prórroga de compraventa", "opc": true}
];
const T_STK = [   // respaldo: el proceso real viene del editor (config/proceso)
  {"k": "s01", "f": 0, "a": "direccion", "t": "Registrar coste e introducción del vehículo"},
  {"k": "s03", "f": 1, "a": "compras", "t": "Pagar la subasta (Copart / IAA)", "d": "Evitar storage. Adjuntar comprobante del pago", "foto": true},
  {"k": "s04", "f": 1, "a": "naviera", "t": "Asignar a naviera"},
  {"k": "s05", "f": 2, "a": "direccion", "t": "Definir precio a cliente", "d": "Podría darse en menos"},
  {"k": "s02", "f": 2, "a": "marketing", "t": "Publicidad del vehículo", "d": "Cada quien en su canal (Facebook, grupo de WhatsApp, etc.)", "multi": true, "personas": ["nehe", "leslie", "alfre"]},
  {"k": "s10", "f": 2, "a": "naviera", "t": "Brindar estatus al cliente", "d": "Solo si se vendió antes de llegar: una vez por semana hasta que venga", "repetible": true, "hasta": "s11", "opc": true},
  {"k": "s11", "f": 3, "a": "aduana", "t": "Marcar llegada del vehículo al país"},
  {"k": "nmw6nog5q", "f": 3, "a": "finanzas", "t": "Pagar a la naviera", "d": "Adjuntar comprobante del pago", "foto": true},
  {"k": "s12", "f": 3, "a": "aduana", "t": "Cancelar impuestos de aduana", "d": "Adjuntar comprobante / DUCA", "foto": true},
  {"k": "s14", "f": 3, "a": "aduana", "t": "Liberación del vehículo"},
  {"k": "s13", "f": 3, "a": "aduana", "t": "Revisión mecánica", "d": "Subir fotos del estado del vehículo", "foto": true},
  {"k": "s06", "f": 4, "a": "ventas", "t": "Venta o asignación a cliente"},
  {"k": "s07", "f": 4, "a": "finanzas", "t": "Pago de pre-reserva / reserva (≥50%)", "d": "Con comprobante, o confirmar recibido si es efectivo", "pago": true, "foto": true},
  {"k": "s08", "f": 4, "a": "finanzas", "t": "Facturar el abono recibido"},
  {"k": "s09", "f": 4, "a": "legal", "t": "Crear promesa de venta"},
  {"k": "s19", "f": 4, "a": "ventas", "t": "Avisar al cliente que su vehículo llegó al país", "d": "Solo si se vendió antes de llegar", "opc": true},
  {"k": "s16", "f": 4, "a": "finanzas", "t": "Cliente cancela el restante", "d": "Adjuntar comprobante del pago final", "pago": true, "foto": true},
  {"k": "s15", "f": 4, "a": "finanzas", "t": "Facturar el monto pagado"},
  {"k": "s17", "f": 4, "a": "legal", "t": "Crear compraventa y firmar contrato", "d": "Adjuntar foto del contrato firmado", "foto": true},
  {"k": "s20", "f": 4, "a": "ventas", "t": "Entregar el vehículo al cliente", "d": "Coordinar la entrega y dejar constancia con foto", "foto": true},
  {"k": "s18", "f": 4, "a": "legal", "t": "Hacer prórroga de compraventa", "opc": true}
];

/* Orden lógico del proceso (versión 2): primero lo urgente de dinero y logística, la venta no tapa la aduana.
   Conserva las personas y las tareas propias que ya tenga el proceso; solo reordena y corrige nombres. */
const PROC_V = 2;
function ajustarProcesoV2(p){
  const q = JSON.parse(JSON.stringify(p));
  const plan = {
    Encargo:{ orden:[['e01',0],['e02',0],['e03',0],['e04',0],['e05',0],
        ['e06',1],['e07',1],['e08',1],['e11',1],['e12',1],['e13',1],['e09',1],['e10',1],
        ['e14',2],['e24',2],['e16',2],['e17',2],['e21',2],['e18',2],['e19',2],['e20',2],['e22',2],['e25',2],['e15',2],['e23',2]],
      cambios:{ e15:{ t:"Publicar la entrega del carro", d:"Foto o video de la entrega, cada quien en su canal", opc:true } } },
    Stock:{ fases:["Coste","Compra y envío","Precio y anuncio","Aduana","Venta y entrega"],
      orden:[['s01',0],['s03',1],['s04',1],['s05',2],['s02',2],['s10',2],
        ['s11',3],['nmw6nog5q',3],['s12',3],['s14',3],['s13',3],
        ['s06',4],['s07',4],['s08',4],['s09',4],['s19',4],['s16',4],['s15',4],['s17',4],['s20',4],['s18',4]],
      cambios:{ s03:{ t:"Pagar la subasta (Copart / IAA)" }, s04:{ t:"Asignar a naviera" },
        s10:{ t:"Brindar estatus al cliente", d:"Solo si se vendió antes de llegar: una vez por semana hasta que venga", opc:true },
        s11:{ t:"Marcar llegada del vehículo al país" },
        nmw6nog5q:{ t:"Pagar a la naviera", a:"finanzas", d:"Adjuntar comprobante del pago", foto:true },
        s12:{ t:"Cancelar impuestos de aduana" }, s09:{ t:"Crear promesa de venta" },
        s19:{ t:"Avisar al cliente que su vehículo llegó al país", d:"Solo si se vendió antes de llegar", opc:true },
        s16:{ t:"Cliente cancela el restante" }, s15:{ t:"Facturar el monto pagado" },
        s17:{ t:"Crear compraventa y firmar contrato" }, s18:{ t:"Hacer prórroga de compraventa" } } }
  };
  for(const tipo of ['Encargo','Stock']){
    const pl = plan[tipo], ts = q.tareas?.[tipo]; if(!Array.isArray(ts)) continue;
    const by = new Map(ts.map(t=>[t.k,t])), out = [];
    pl.orden.forEach(([k,f])=>{ const t = by.get(k); if(!t) return; t.f = f; Object.assign(t, pl.cambios[k]||{}); out.push(t); by.delete(k); });
    by.forEach(t=>{ let i = -1; out.forEach((x,j)=>{ if(x.f<=t.f) i = j; }); out.splice(i+1, 0, t); });   // tareas propias: al final de su etapa
    q.tareas[tipo] = out;
    if(pl.fases){ q.fases = q.fases || {}; q.fases[tipo] = pl.fases; }
  }
  q.version = PROC_V;
  return q;
}

// Tareas del tablero (proceso.json). Si falta o viene mal, se queda la lista de arriba.
try{
  const fs = await import("node:fs");
  const p = JSON.parse(fs.readFileSync(new URL("../proceso.json", import.meta.url), "utf8"));
  if(p?.tareas?.Encargo?.length && p?.tareas?.Stock?.length){
    T_ENC.splice(0, T_ENC.length, ...p.tareas.Encargo.filter(t => !t.archivada));
    T_STK.splice(0, T_STK.length, ...p.tareas.Stock.filter(t => !t.archivada));
    console.log(`Tareas del tablero: ${T_ENC.length} encargo · ${T_STK.length} stock`);
  }
}catch(e){ console.log("Sin proceso.json, uso la lista de respaldo:", e.message); }

// Si un admin editó las tareas en el control (Equipo → Tareas del proceso), mandan esas
async function cargarProcesoFirestore(){
  try{
    const s = await db.doc("config/proceso").get();
    let p = s.exists ? s.data() : null;
    if(p?.tareas && (p.version||0) < PROC_V) p = ajustarProcesoV2(p);
    if(p?.tareas?.Encargo?.length && p?.tareas?.Stock?.length){
      T_ENC.splice(0, T_ENC.length, ...p.tareas.Encargo.filter(t => !t.archivada));
      T_STK.splice(0, T_STK.length, ...p.tareas.Stock.filter(t => !t.archivada));
      console.log(`Tareas editadas en el control: ${T_ENC.length} encargo · ${T_STK.length} stock`);
    }
  }catch(e){ console.log("No se pudo leer config/proceso:", e.message); }
}

const defT = v => v.tipoProceso === "Encargo" ? T_ENC : T_STK;
// Días desde el último avance del carro (tarea marcada o abono)
const ms_ = x => typeof x === "number" ? x : (Date.parse(x) || 0);
function diasQuieto(v){
  let m = ms_(v.fecha_registro) || ms_(v.creado) || 0;
  Object.values(v.tareas || {}).forEach(st => {
    if(st?.ok && st.fecha) m = Math.max(m, ms_(st.fecha));
    Object.values(st?.marcas || {}).forEach(x => m = Math.max(m, ms_(x)));
  });
  (v.abonos || []).forEach(a => m = Math.max(m, ms_(a.fecha)));
  return m ? Math.floor((Date.now() - m) / 86400000) : 0;
}

// ── Configuración por defecto (la web puede cambiarla y se guarda en Firestore) ──
const DEF = { minTareas:30, minClientes:15, clientesOn:true, soloHorario:true, hIni:7, hFin:20 };

const respons = (usuarios, area) =>
  Object.keys(usuarios).filter(u => (usuarios[u].areas || []).includes(area));
// Quién hace la tarea: las personas del tablero; si no tiene, la gente de su área
const resp = (usuarios, t) => {
  const p = (t.personas || []).filter(u => usuarios[u]);
  return p.length ? p : respons(usuarios, t.a);
};

function tareaOk(usuarios, v, t){
  const st = v.tareas?.[t.k];
  if(!t.multi) return !!st?.ok;
  const req = resp(usuarios, t);
  if(!req.length) return !!st?.ok;
  const m = st?.marcas || {};
  return req.every(u => !!m[u]);
}

const TG = process.env.TELEGRAM_TOKEN;
const escHtml = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

async function enviarTelegram(chatId, textoHtml){
  if(!TG){ console.error("Falta el secreto TELEGRAM_TOKEN en GitHub."); return false; }
  if(!chatId) return false;
  try{
    const r = await fetch(`https://api.telegram.org/bot${TG}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: String(chatId), text: textoHtml, parse_mode: "HTML" })
    });
    const d = await r.json();
    if(!d.ok) console.error("Telegram:", d.description);
    return !!d.ok;
  }catch(e){ console.error("Telegram falló:", e.message); return false; }
}

function horaSV(){
  return Number(new Intl.DateTimeFormat("es-SV", {
    timeZone: "America/El_Salvador", hour: "2-digit", hour12: false
  }).format(new Date()));
}

// Reinicios de contraseña que pidió un admin desde el control (colección "cuentas")
async function reiniciarClaves(){
  try{
    const sn = await db.collection("cuentas").get();
    for(const d of sn.docs){
      const { clave } = d.data() || {};
      try{
        if(!clave || String(clave).length < 6) throw new Error("clave muy corta");
        const email = d.id + "@yesica.local";
        let user;
        try{ user = await admin.auth().getUserByEmail(email); }
        catch(e){ user = await admin.auth().createUser({ email, password: String(clave) }); }
        await admin.auth().updateUser(user.uid, { password: String(clave) });
        await db.doc("usuarios/" + d.id).set({ debeCambiar: true }, { merge: true });
        console.log("Contraseña reiniciada:", d.id);
      }catch(e){ console.log("No se pudo reiniciar", d.id, e.message); }
      await d.ref.delete();
    }
  }catch(e){ console.log("Sin reinicios pendientes:", e.message); }
}

async function main(){
  await reiniciarClaves();
  await cargarProcesoFirestore();
  const cfgRef = db.doc("config/notificaciones");
  const cfgSnap = await cfgRef.get();
  const cfg = { ...DEF, ...(cfgSnap.exists ? cfgSnap.data() : {}) };
  const ahora = Date.now();

  // Dejar constancia SIEMPRE de que el robot corrió, aunque no toque enviar nada.
  // (Así el sistema sabe que sigue vivo.)
  const latir = async (estado) => {
    await cfgRef.set({ ultimaRevision: ahora, robot: true, ultimoEstado: estado }, { merge: true });
  };

  if(cfg.soloHorario){
    const h = horaSV();
    if(h < cfg.hIni || h >= cfg.hFin){
      console.log(`Fuera de horario (son las ${h}:00 en SV). No se envía nada.`);
      await latir(`fuera de horario (${h}:00)`);
      return;
    }
  }

  const tocaTareas   = ahora - (cfg.ultimoTareas   || 0) >= cfg.minTareas   * 60000;
  const tocaClientes = cfg.clientesOn && (ahora - (cfg.ultimoClientes || 0) >= cfg.minClientes * 60000);
  if(!tocaTareas && !tocaClientes){
    console.log("Todavía no toca enviar (el intervalo aún no se cumple).");
    await latir("sin envíos, esperando el intervalo");
    return;
  }

  // Traer usuarios y vehículos
  const usuarios = {};
  (await db.collection("usuarios").get()).forEach(d => usuarios[d.id] = d.data());
  const autos = [];
  (await db.collection("vehiculos").get()).forEach(d => {
    const a = { id: d.id, ...d.data() };
    if(!a.archivado) autos.push(a);
  });
  console.log(`${Object.keys(usuarios).length} usuarios · ${autos.length} unidades activas`);

  const marcar = {};

  // ── Aviso de tareas pendientes ──
  if(tocaTareas){
    // Por cada carro, SOLO su siguiente tarea pendiente (en el orden del proceso).
    // Si ya se hizo hasta el paso 9, se avisa el paso 10, y solo a quien le toca.
    const mapa = {};
    autos.forEach(v => {
      const ls = defT(v).filter(t => !t.opc);
      const i = ls.findIndex(t => !tareaOk(usuarios, v, t));
      if(i < 0) return;                                   // proceso completo
      const t = ls[i];
      let quien = resp(usuarios, t);
      // Si nadie tiene esa tarea (sin persona y nadie con el área), se avisa a los admin para que no se quede trabada
      if(!quien.length) quien = Object.keys(usuarios).filter(u => usuarios[u].admin);
      quien.forEach(u => {
        if(t.multi && (v.tareas?.[t.k]?.marcas || {})[u]) return;  // ya hizo su parte
        (mapa[u] ||= []).push({ v, t, paso:i+1, total:ls.length, quieto:diasQuieto(v) });
      });
    });

    let enviados = 0;
    for(const u of Object.keys(mapa)){
      const chat = usuarios[u]?.telegram;
      if(!chat){ console.log(`· ${usuarios[u]?.nombre||u}: ${mapa[u].length} carro(s) esperando, pero SIN Telegram vinculado`); continue; }
      const ls = mapa[u];
      const nombreCarro = v => v.vehiculo || (v.nombreCliente ? "Encargo de " + v.nombreCliente.split(" ")[0] : "Carro por asignar");
      const lista = ls.map(x =>
        `\u{1F697} <b>${escHtml(nombreCarro(x.v))}</b>\n   \u{27A1}\u{FE0F} ${escHtml(x.t.t)}  <i>(paso ${x.paso} de ${x.total})</i>` + (x.quieto>=7 ? `\n   \u{26A0}\u{FE0F} <b>${x.quieto} d\u00edas sin avance</b>` : '')).join("\n\n");
      const texto =
        `\u{23F0} <b>${ls.length===1 ? "Un carro espera" : ls.length+" carros esperan"} tu siguiente paso</b>\n\n` +
        lista +
        `\n\n<i>M\u00e1rcalo en el sistema cuando lo completes.</i>`;
      const ok = await enviarTelegram(chat, texto);
      if(ok){ enviados++; console.log(`\u2713 ${usuarios[u].nombre}: ${ls.length} carro(s)`); }
    }
    console.log(`Avisos de tareas enviados: ${enviados}`);
    marcar.ultimoTareas = ahora;
  }

  // ── Recordatorio de contestar clientes ──
  if(tocaClientes){
    let enviados = 0;
    for(const u of Object.keys(usuarios)){
      const areas = usuarios[u].areas || [];
      if(!(areas.includes("ventas") || areas.includes("marketing"))) continue;
      const chat = usuarios[u].telegram;
      if(!chat) continue;
      const ok = await enviarTelegram(chat,
        "\u{1F4AC} <b>Contestar a clientes</b>\n\nRevisa los chats y grupos de WhatsApp. No dejes mensajes sin responder.");
      if(ok) enviados++;
    }
    console.log(`Recordatorios de clientes enviados: ${enviados}`);
    marcar.ultimoClientes = ahora;
  }

  marcar.ultimaRevision = ahora;
  marcar.robot = true;
  marcar.ultimoEstado = "avisos enviados";
  await cfgRef.set(marcar, { merge: true });
  console.log("Listo.");
}

main().catch(e => { console.error(e); process.exit(1); });
