/* ═══════════════════════════════════════════════════════════════
   Convierte las tareas del tablero ("Tareas del proceso Yesica")
   en proceso.json, que es lo que leen el control y el robot de avisos.

   Uso:  node scripts/proceso.mjs <carpeta-con-el-volcado>
   La carpeta trae:  tareas.json  (lista de {id, data} de la colección "tareas")
                     fases.json   (el documento config/fases)
   ═══════════════════════════════════════════════════════════════ */
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if(!dir){ console.error("Falta la carpeta del volcado"); process.exit(1); }
const leer = f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const existe = f => fs.existsSync(path.join(dir, f));
let tareas, fases;
if(existe("tareas.json")){            // un solo archivo con la lista
  tareas = leer("tareas.json");
  if(!Array.isArray(tareas)) tareas = Object.entries(tareas).map(([id,data])=>({id,data}));
} else {                               // una carpeta tareas/ con un archivo por tarea (así las guarda Claude)
  tareas = fs.readdirSync(path.join(dir,"tareas")).filter(f=>f.endsWith(".json"))
    .map(f => ({ id:f.slice(0,-5), data:leer(path.join("tareas",f)) }));
}
fases = existe("fases.json") ? leer("fases.json") : leer(path.join("config","fases.json"));
tareas = tareas.map(x => ({ id:x.id, data:(x.data && x.data.data && !x.data.t) ? x.data.data : (x.data||x) }));
if(fases.data) fases = fases.data;

// Nombres del tablero → usuario del control
const EQUIPO = { alfre:"Alfredo", yesica:"Yesica", cesar:"César", carlos:"Carlos", nehe:"Nehemías", evelyn:"Evelyn", leslie:"Leslie", fer:"Fer" };
const norm = s => String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
function usuarioDe(nombre){
  const n = norm(nombre); if(!n) return null;
  for(const [u, nom] of Object.entries(EQUIPO)){
    const a = norm(nom);
    if(n===u || n===a || a.startsWith(n) || n.startsWith(u) || u.startsWith(n)) return u;
  }
  return null;
}

const AREAS = ["ventas","marketing","compras","finanzas","naviera","aduana","legal","direccion"];
const PROC = { inicio:"Encargo", inventario:"Stock" };
const out = { fuente:"tablero", actualizado:new Date().toISOString(), fases:{}, tareas:{ Encargo:[], Stock:[] }, sinUsuario:[] };

for(const [p, tipo] of Object.entries(PROC)){
  const fs_ = Array.isArray(fases[p]) && fases[p].length ? fases[p] : null;
  if(!fs_) throw new Error("No vienen las etapas de "+p);
  out.fases[tipo] = fs_.map(String);
}

const lista = tareas.map(x => ({ id:x.id, ...(x.data||x) }))
  .filter(t => PROC[t.proc] && String(t.t||"").trim())
  .sort((a,b) => (a.fase-b.fase) || ((a.orden??0)-(b.orden??0)) || String(a.id).localeCompare(String(b.id)));

for(const t of lista){
  const tipo = PROC[t.proc];
  const nf = out.fases[tipo].length;
  const personas = [];
  for(const nom of (t.personas||[])){
    const u = usuarioDe(nom);
    if(u){ if(!personas.includes(u)) personas.push(u); }
    else if(!out.sinUsuario.includes(nom)) out.sinUsuario.push(nom);
  }
  const o = {
    k: String(t.id),
    f: Math.max(0, Math.min(nf-1, Number(t.fase)||0)),
    a: AREAS.includes(t.a) ? t.a : "direccion",
    t: String(t.t).trim(),
  };
  if(t.d) o.d = String(t.d);
  if(t.pago) o.pago = true;
  if(t.foto) o.foto = true;
  if(t.multi) o.multi = true;
  if(t.opc) o.opc = true;
  if(t.constante){ o.repetible = true; if(t.hasta && t.hasta!=="fin") o.hasta = String(t.hasta); }
  if(personas.length) o.personas = personas;
  out.tareas[tipo].push(o);
}

if(!out.tareas.Encargo.length || !out.tareas.Stock.length) throw new Error("Algún proceso quedó sin tareas; no se escribe nada.");
const destino = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "proceso.json");
try{
  const antes = JSON.parse(fs.readFileSync(destino, "utf8"));
  const igual = JSON.stringify({f:antes.fases,t:antes.tareas}) === JSON.stringify({f:out.fases,t:out.tareas});
  if(igual){ console.log("Sin cambios: proceso.json ya está igual que el tablero."); process.exit(0); }
}catch(e){}
fs.writeFileSync(destino, JSON.stringify(out, null, 1) + "\n");
console.log(`proceso.json · Encargo ${out.tareas.Encargo.length} · Stock ${out.tareas.Stock.length}` +
  (out.sinUsuario.length ? ` · nombres sin usuario: ${out.sinUsuario.join(", ")}` : ""));
