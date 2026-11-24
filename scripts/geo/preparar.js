#!/usr/bin/env node
/*
 * preparar.js
 *
 * Publicación semanal: toma el tickets.json nuevo, lo valida, corre build-seo y deja los
 * archivos listos para Mica en una carpeta nueva: entrega-geo/AAAAMMDD-HHMM/.
 *
 * Uso (desde la raíz del proyecto):
 *   npm run geo:preparar                     usa ~/Downloads/tickets.json
 *   npm run geo:preparar -- --tickets <ruta> usa otro tickets.json
 *   npm run geo:preparar -- --imgs <carpeta> --url <origen> --sin-red
 *                                            se pasan tal cual a geo:validar
 *   npm run geo:preparar -- --dry-run        hace todo menos escribir la carpeta de entrega
 *
 * Pasos:
 *   1. Valida el tickets.json con geo:validar. Si hay errores, se detiene.
 *   2. Corre build-seo en una carpeta temporal (copia de index.html, scripts/ y el tickets.json
 *      nuevo). NO modifica index.html, llms.txt, sitemap.xml ni data/tickets.json del proyecto.
 *   3. Controla el resultado: index.html cambia solo dentro del bloque JSON-LD, un evento por
 *      fecha vigente, llms.txt con fechas y links, sitemap con sus páginas.
 *   4. Deja en entrega-geo/AAAAMMDD-HHMM/: index.html, llms.txt, sitemap.xml, tickets.json
 *      (copia exacta del validado) y LEEME.txt con las instrucciones para Mica.
 *
 * No incluye imágenes ni robots.txt. Sin dependencias externas (solo Node).
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const {
	ROOT,
	CONFIG,
	formatLongDate,
	splitTickets,
	artStamp,
	extractJsonLd,
	eventsOf,
	optionValue,
	resolveTicketsPath,
} = require("./lib");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const MARKER_START = "<!-- SEO:JSONLD:START";
const MARKER_END = "<!-- SEO:JSONLD:END -->";

function fail(message) {
	console.error(`\nERROR: ${message}`);
	process.exit(1);
}

// index.html sin el bloque JSON-LD generado; null si faltan los marcadores.
function withoutJsonLdBlock(html) {
	const start = html.indexOf(MARKER_START);
	const end = html.indexOf(MARKER_END);
	if (start === -1 || end === -1 || end < start) return null;
	return html.slice(0, start) + html.slice(end + MARKER_END.length);
}

const ticketsPath = resolveTicketsPath(args, "geo:preparar");

/* ---------- 1. validación ---------- */

console.log("1/4 Validando el tickets.json (geo:validar)...\n");
const validarArgs = ["--tickets", ticketsPath];
for (const name of ["--imgs", "--url"]) {
	const value = optionValue(args, name);
	if (value) validarArgs.push(name, value);
}
if (args.includes("--sin-red")) validarArgs.push("--sin-red");

const validation = spawnSync(process.execPath, [path.join(__dirname, "validar.js"), ...validarArgs], {
	cwd: process.cwd(),
	encoding: "utf8",
});
process.stdout.write(validation.stdout || "");
process.stderr.write(validation.stderr || "");
if (validation.status !== 0) fail("La validación encontró errores; no se generó nada. Corregir el tickets.json y volver a correr.");
const validationAvisos = (validation.stdout || "").split("\n").filter((l) => l.startsWith("  ! "));

/* ---------- 2. build-seo en una carpeta temporal ---------- */

console.log("\n2/4 Generando los archivos GEO (build-seo) en una carpeta temporal...\n");
const staging = fs.mkdtempSync(path.join(os.tmpdir(), "polenta-geo-"));
let outputs;
try {
	fs.mkdirSync(path.join(staging, "scripts"));
	fs.mkdirSync(path.join(staging, "data"));
	for (const file of ["build-seo.js", "seo-config.json", "llms.template.txt"]) {
		fs.copyFileSync(path.join(ROOT, "scripts", file), path.join(staging, "scripts", file));
	}
	fs.copyFileSync(path.join(ROOT, "index.html"), path.join(staging, "index.html"));
	fs.copyFileSync(ticketsPath, path.join(staging, "data", "tickets.json"));

	const build = spawnSync(process.execPath, [path.join(staging, "scripts", "build-seo.js")], {
		cwd: staging,
		encoding: "utf8",
	});
	process.stdout.write(build.stdout || "");
	process.stderr.write(build.stderr || "");
	if (build.status !== 0) fail("build-seo falló; no se generó nada.");

	outputs = {
		"index.html": fs.readFileSync(path.join(staging, "index.html"), "utf8"),
		"llms.txt": fs.readFileSync(path.join(staging, "llms.txt"), "utf8"),
		"sitemap.xml": fs.readFileSync(path.join(staging, "sitemap.xml"), "utf8"),
	};
} finally {
	fs.rmSync(staging, { recursive: true, force: true });
}

/* ---------- 3. controles del resultado ---------- */

console.log("\n3/4 Controlando el resultado...");
const problems = [];
const tickets = JSON.parse(fs.readFileSync(ticketsPath, "utf8"));
const { vigentes } = splitTickets(tickets);

// index.html: solo puede cambiar el bloque JSON-LD.
const originalHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const originalRest = withoutJsonLdBlock(originalHtml);
const newRest = withoutJsonLdBlock(outputs["index.html"]);
if (originalRest === null || newRest === null) problems.push("index.html no tiene los marcadores del bloque JSON-LD.");
else if (originalRest !== newRest) problems.push("index.html cambió fuera del bloque JSON-LD (no debería).");
else console.log("  ✓ index.html: solo cambia el bloque JSON-LD.");

// JSON-LD: un evento por fecha vigente.
const { data: jsonLd, error: jsonLdError } = extractJsonLd(outputs["index.html"]);
if (jsonLdError) problems.push(`JSON-LD: ${jsonLdError}.`);
else {
	const events = eventsOf(jsonLd).length;
	if (events === vigentes.length) console.log(`  ✓ JSON-LD con ${events} eventos, uno por fecha vigente.`);
	else problems.push(`JSON-LD con ${events} eventos y ${vigentes.length} fechas vigentes.`);
}

// llms.txt: fechas (es y en) y links (uno por idioma) de cada fecha vigente.
const llms = outputs["llms.txt"];
if (llms.includes("{{")) problems.push("llms.txt quedó con marcas {{...}} sin reemplazar.");
let llmsOk = true;
for (const { ticket, date } of vigentes) {
	for (const lang of ["es", "en"]) {
		if (!llms.includes(formatLongDate(date, lang))) {
			problems.push(`llms.txt no incluye la fecha ${formatLongDate(date, lang)} (${lang}).`);
			llmsOk = false;
		}
	}
	if (ticket.link && llms.split(ticket.link).length - 1 < 2) {
		problems.push(`llms.txt no incluye el link de ${ticket.date}-${ticket.city} en ambos idiomas.`);
		llmsOk = false;
	}
}
if (llmsOk && !llms.includes("{{")) console.log("  ✓ llms.txt: fechas y links de todas las fechas vigentes.");

// sitemap.xml: las páginas de seo-config.json.
const locs = [...outputs["sitemap.xml"].matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const expectedLocs = CONFIG.sitemapPages.map((p) => `${CONFIG.baseUrl}${p.path}`);
if (expectedLocs.every((u) => locs.includes(u)) && locs.length === expectedLocs.length) {
	console.log(`  ✓ sitemap.xml con las ${locs.length} páginas esperadas.`);
} else problems.push("sitemap.xml no coincide con las páginas de seo-config.json.");

if (problems.length) {
	problems.forEach((p) => console.error(`  ✗ ${p}`));
	fail("el resultado no pasó los controles; no se escribió la entrega.");
}

/* ---------- 4. carpeta de entrega ---------- */

const stamp = artStamp();
const outDir = path.join(ROOT, "entrega-geo", stamp);

const imageNames = vigentes.map(({ ticket }) => `${ticket.date}-${ticket.city}.png`);
const leeme = [
	"ENTREGA GEO - Fiesta Polenta*",
	`Generada el ${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)} a las ${stamp.slice(9, 11)}:${stamp.slice(11, 13)} (hora de Argentina).`,
	`Fechas vigentes: ${vigentes.length}.`,
	"",
	"QUÉ SUBIR (CPanel > Administrador de archivos; reemplazar los existentes)",
	"  1. index.html      -> en la carpeta raíz del sitio",
	"  2. llms.txt        -> en la carpeta raíz del sitio",
	"  3. sitemap.xml     -> en la carpeta raíz del sitio",
	"  4. tickets.json    -> dentro de la carpeta data/ (queda data/tickets.json)",
	"",
	"IMÁGENES (no vienen en esta carpeta)",
	"  Deben estar en imgs/tickets/ antes de verificar. Una por fecha vigente:",
	...imageNames.map((n) => `    - ${n}`),
	"  Recomendado: subir primero las imágenes que falten y después los 4 archivos.",
	"",
	"NO TOCAR: robots.txt (no cambia).",
	"",
	"AVISOS DE LA VALIDACIÓN",
	...(validationAvisos.length ? validationAvisos.map((l) => `  ${l.trim()}`) : ["  Ninguno."]),
	"",
	"DESPUÉS DE SUBIR - VERIFICACIÓN (Mica)",
	"  1. Recargar fiestapolenta.com sin caché y comprobar que los tickets nuevos aparecen,",
	"     cada uno con su imagen y su link.",
	"  2. Abrir fiestapolenta.com/llms.txt, /sitemap.xml y /robots.txt: ninguno debe dar 404.",
	"  3. Comprobar que las fechas de /llms.txt coinciden con las del sitio.",
	"  4. Avisar a Lucas, que valida el JSON-LD (Rich Results Test) y corre geo:verificar.",
	"",
].join("\n");

console.log(`\n4/4 ${DRY_RUN ? "Dry-run: no se escribe la carpeta de entrega." : "Escribiendo la carpeta de entrega..."}`);
if (DRY_RUN) {
	console.log(`  Se crearía: entrega-geo/${stamp}/ (index.html, llms.txt, sitemap.xml, tickets.json, LEEME.txt).`);
	process.exit(0);
}

if (fs.existsSync(outDir)) fail(`ya existe entrega-geo/${stamp}; esperá un minuto y volvé a correr.`);
fs.mkdirSync(outDir, { recursive: true });
for (const [file, content] of Object.entries(outputs)) fs.writeFileSync(path.join(outDir, file), content);
fs.copyFileSync(ticketsPath, path.join(outDir, "tickets.json"));
fs.writeFileSync(path.join(outDir, "LEEME.txt"), leeme);

// Comprobación final: lo escrito es lo controlado.
for (const file of ["index.html", "llms.txt", "sitemap.xml", "tickets.json", "LEEME.txt"]) {
	if (!fs.existsSync(path.join(outDir, file))) fail(`falta ${file} en la carpeta de entrega.`);
}
if (!fs.readFileSync(path.join(outDir, "tickets.json")).equals(fs.readFileSync(ticketsPath))) {
	fail("el tickets.json de la entrega no es idéntico al validado.");
}

console.log(`\nListo: entrega-geo/${stamp}/`);
for (const file of fs.readdirSync(outDir).sort()) {
	console.log(`  - ${file} (${fs.statSync(path.join(outDir, file)).size} bytes)`);
}
console.log(
	"\nPara Mica: los 4 archivos de la carpeta (el LEEME.txt tiene las instrucciones).\n" +
		"Este comando no modificó nada del proyecto: data/tickets.json, index.html, llms.txt y\n" +
		"sitemap.xml del repo siguen como estaban (actualizarlos con los de la entrega, si\n" +
		"querés que el repo refleje lo publicado, es un paso aparte).\n" +
		"Después de publicar: npm run geo:verificar",
);
