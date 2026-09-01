/* ═══════════════════════════════════════════════════════════════
   ROBOT DE AVISOS · Importaciones Yesica
   Corre solo en GitHub Actions cada 15 minutos.
   Nadie necesita tener nada abierto.

   ⚠️ Si cambias las tareas en control.html, cámbialas también aquí abajo.
   ═══════════════════════════════════════════════════════════════ */
import admin from "firebase-admin";

const sa = JSON.parse(process.env.FIREBASE_SA);
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

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
  {k:"e15",f:2,a:"marketing",t:"Subir el carro como publicidad", d:"Cada quien en su canal (Facebook, grupo de WhatsApp, etc.)", multi:true},
  {k:"e16",f:2,a:"finanzas", t:"Pagar a la naviera", d:"Adjuntar comprobante del pago", foto:true},
  {k:"e17",f:2,a:"aduana",   t:"Cancelar impuestos de aduana", d:"Adjuntar comprobante / DUCA", foto:true},
  {k:"e18",f:2,a:"aduana",   t:"Revisión mecánica", d:"Subir fotos del estado del vehículo", foto:true},
  {k:"e19",f:2,a:"finanzas", t:"Cliente cancela el restante", d:"Siempre con comprobante", pago:true, foto:true},
  {k:"e20",f:2,a:"finanzas", t:"Facturar el monto pagado"},
  {k:"e21",f:2,a:"aduana",   t:"Liberación del vehículo"},
  {k:"e22",f:2,a:"legal",    t:"Crear compraventa y entregar vehículo", d:"Adjuntar foto del contrato firmado", foto:true},
  {k:"e23",f:2,a:"legal",    t:"Hacer prórroga de compraventa", opc:true},
];
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
  {k:"s12",f:3,a:"aduana",   t:"Pago de impuestos en aduana", d:"Adjuntar comprobante / DUCA", foto:true},
  {k:"s13",f:3,a:"aduana",   t:"Revisión mecánica", d:"Subir fotos del estado del vehículo", foto:true},
  {k:"s14",f:3,a:"aduana",   t:"Liberación del vehículo"},
  {k:"s15",f:3,a:"finanzas", t:"Facturación del restante"},
  {k:"s16",f:3,a:"finanzas", t:"Cancelación total (pago final)", d:"Adjuntar comprobante del pago final", pago:true, foto:true},
  {k:"s17",f:3,a:"legal",    t:"Compraventa (firma contrato final)", d:"Adjuntar foto del contrato firmado", foto:true},
  {k:"s18",f:3,a:"legal",    t:"Crear prórroga de compraventa", opc:true},
];

const defT = v => v.tipoProceso === "Encargo" ? T_ENC : T_STK;

// ── Configuración por defecto (la web puede cambiarla y se guarda en Firestore) ──
const DEF = { minTareas:30, minClientes:15, clientesOn:true, soloHorario:true, hIni:7, hFin:20 };

const respons = (usuarios, area) =>
  Object.keys(usuarios).filter(u => (usuarios[u].areas || []).includes(area));

function tareaOk(usuarios, v, t){
  const st = v.tareas?.[t.k];
  if(!t.multi) return !!st?.ok;
  const req = respons(usuarios, t.a);
  if(!req.length) return !!st?.ok;
  const m = st?.marcas || {};
  return req.every(u => !!m[u]);
}

async function enviarPush(topic, title, message, tags){
  if(!topic) return false;
  try{
    const r = await fetch("https://ntfy.sh/", {
      method: "POST",
      body: JSON.stringify({ topic, title, message, priority: 4, tags: tags || ["bell"] })
    });
    return r.ok;
  }catch(e){ console.error("Push falló:", e.message); return false; }
}

function horaSV(){
  return Number(new Intl.DateTimeFormat("es-SV", {
    timeZone: "America/El_Salvador", hour: "2-digit", hour12: false
  }).format(new Date()));
}

async function main(){
  const cfgRef = db.doc("config/notificaciones");
  const cfgSnap = await cfgRef.get();
  const cfg = { ...DEF, ...(cfgSnap.exists ? cfgSnap.data() : {}) };
  const ahora = Date.now();

  if(cfg.soloHorario){
    const h = horaSV();
    if(h < cfg.hIni || h >= cfg.hFin){
      console.log(`Fuera de horario (son las ${h}:00 en SV). No se envía nada.`);
      return;
    }
  }

  const tocaTareas   = ahora - (cfg.ultimoTareas   || 0) >= cfg.minTareas   * 60000;
  const tocaClientes = cfg.clientesOn && (ahora - (cfg.ultimoClientes || 0) >= cfg.minClientes * 60000);
  if(!tocaTareas && !tocaClientes){ console.log("Todavía no toca enviar."); return; }

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
    const mapa = {};
    autos.forEach(v => {
      defT(v).forEach(t => {
        if(t.opc || tareaOk(usuarios, v, t)) return;
        respons(usuarios, t.a).forEach(u => {
          if(t.multi && (v.tareas?.[t.k]?.marcas || {})[u]) return;  // ya hizo su parte
          (mapa[u] ||= []).push({ v, t });
        });
      });
    });

    let enviados = 0;
    for(const u of Object.keys(mapa)){
      const topic = usuarios[u]?.ntfy;
      if(!topic){ console.log(`· ${u}: ${mapa[u].length} pendientes, pero SIN canal conectado`); continue; }
      const ls = mapa[u], p = ls[0];
      const cuerpo = `${p.t.t}\n🚗 ${p.v.vehiculo || "Carro por asignar"}` +
                     (ls.length > 1 ? `\n\n… y ${ls.length - 1} pendiente${ls.length > 2 ? "s" : ""} más.` : "");
      const ok = await enviarPush(topic,
        `⏰ ${ls.length} tarea${ls.length > 1 ? "s" : ""} pendiente${ls.length > 1 ? "s" : ""}`,
        cuerpo, ["hourglass"]);
      if(ok){ enviados++; console.log(`✓ ${usuarios[u].nombre}: ${ls.length} tarea(s)`); }
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
      const topic = usuarios[u].ntfy;
      if(!topic) continue;
      const ok = await enviarPush(topic, "💬 Contestar a clientes",
        "Revisa los chats y grupos de WhatsApp. No dejes mensajes sin responder.", ["speech_balloon"]);
      if(ok) enviados++;
    }
    console.log(`Recordatorios de clientes enviados: ${enviados}`);
    marcar.ultimoClientes = ahora;
  }

  marcar.ultimaRevision = ahora;
  marcar.robot = true;
  await cfgRef.set(marcar, { merge: true });
  console.log("Listo.");
}

main().catch(e => { console.error(e); process.exit(1); });
