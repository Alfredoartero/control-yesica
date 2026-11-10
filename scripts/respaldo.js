/* Respaldo diario · Centro de Control Importaciones Yesica
   Copia todas las colecciones a respaldo/respaldo-AAAA-MM-DD.json.
   GitHub lo guarda 90 días en la pestaña Actions → "Respaldo diario" → Artifacts. */
import admin from "firebase-admin";
import fs from "node:fs";

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SA)) });
const db = admin.firestore();
const COLECCIONES = ["usuarios", "vehiculos", "finanzas", "config", "historial"];

const limpiar = x => JSON.parse(JSON.stringify(x, (k, v) =>
  v && typeof v.toDate === "function" ? v.toDate().toISOString() : v));

const out = { fecha: new Date().toISOString(), proyecto: "sistema-yesica" };
for (const c of COLECCIONES) {
  const sn = await db.collection(c).get();
  out[c] = {};
  sn.forEach(d => { out[c][d.id] = limpiar(d.data()); });
  console.log(`${c}: ${sn.size}`);
}
fs.mkdirSync("respaldo", { recursive: true });
const dia = new Date().toLocaleDateString("en-CA", { timeZone: "America/El_Salvador" });
fs.writeFileSync(`respaldo/respaldo-${dia}.json`, JSON.stringify(out, null, 1));
console.log("Respaldo listo:", dia);
