#!/usr/bin/env node
/*
 * zip.js
 *
 * Arma el zip de una "versión nueva" del sitio para pasárselo a Mica.
 *
 * Uso (desde la raíz del proyecto):
 *   npm run geo:zip                 corre build-seo (actualiza index.html,
 *                                   llms.txt y sitemap.xml del proyecto) y arma
 *                                   entrega-geo/polenta-web-AAAAMMDD-HHMM.zip
 *   npm run geo:zip -- --sin-build  arma el zip con los archivos tal como están,
 *                                   sin correr build-seo
 *   npm run geo:zip -- --dry-run    muestra qué entraría en el zip y no escribe nada
 *
 * El zip NO incluye data/tickets.json ni imgs/tickets/: los administra Mica en
 * producción y así el zip no puede pisarlos. Tampoco incluye archivos que no
 * son del sitio (ver EXCLUDED_*). Requiere el comando `zip` (macOS lo trae).
 * Sin dependencias externas (solo Node).
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { ROOT, splitTickets, artStamp, extractJsonLd, eventsOf } = require("./lib");

/* ---------- qué no viaja en el zip ---------- */

// Carpetas de la raíz que no son del sitio.
const EXCLUDED_ROOT_DIRS = new Set([
	".git",
	".vscode",
	"node_modules",
	"documentation",
	"scripts",
	"scss",
	"entrega-geo",
	"seo-out",
]);
// Archivos de la raíz que no son del sitio.
const EXCLUDED_ROOT_FILES = new Set([".gitignore", "package.json", "package-lock.json"]);
// Rutas que administra Mica en producción: no se pisan.
const EXCLUDED_FILES = new Set(["data/tickets.json"]);
const EXCLUDED_PREFIXES = ["imgs/tickets/"];

function isExcluded(rel) {
	const top = rel.split("/")[0];
	if (path.posix.basename(rel) === ".DS_Store") return true;
	if (!rel.includes("/") && EXCLUDED_ROOT_FILES.has(rel)) return true;
	if (rel.includes("/") && EXCLUDED_ROOT_DIRS.has(top)) return true;
	if (EXCLUDED_FILES.has(rel)) return true;
	return EXCLUDED_PREFIXES.some((prefix) => rel.startsWith(prefix));
}

function listFiles(dir, base = "") {
	const files = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const rel = base ? `${base}/${entry.name}` : entry.name;
		if (entry.isSymbolicLink()) continue;
		if (entry.isDirectory()) {
			if (!base && EXCLUDED_ROOT_DIRS.has(entry.name)) continue;
			files.push(...listFiles(path.join(dir, entry.name), rel));
		} else if (entry.isFile() && !isExcluded(rel)) {
			files.push(rel);
		}
	}
	return files.sort();
}

/* ---------- utilidades ---------- */

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SKIP_BUILD = args.includes("--sin-build");

function fail(message) {
	console.error(`\nERROR: ${message}`);
	process.exit(1);
}

function formatSize(bytes) {
	return bytes > 1024 * 1024
		? `${(bytes / 1024 / 1024).toFixed(1)} MB`
		: `${Math.ceil(bytes / 1024)} KB`;
}

/* ---------- 1. build-seo ---------- */

if (!DRY_RUN && !SKIP_BUILD) {
	console.log("1/4 Generando archivos GEO (npm run build-seo)...\n");
	const build = spawnSync(process.execPath, [path.join(ROOT, "scripts", "build-seo.js")], {
		cwd: ROOT,
		stdio: "inherit",
	});
	if (build.status !== 0) fail("build-seo falló; no se arma el zip.");
} else {
	console.log(
		DRY_RUN
			? "1/4 Dry-run: no se corre build-seo."
			: "1/4 --sin-build: no se corre build-seo; se usan los archivos tal como están.",
	);
}

/* ---------- 2. controles previos ---------- */

console.log("\n2/4 Controles previos...");
const problems = [];
const notes = [];

for (const required of ["index.html", "llms.txt", "sitemap.xml", "robots.txt"]) {
	if (!fs.existsSync(path.join(ROOT, required))) problems.push(`falta ${required} en la raíz del proyecto.`);
}

let tickets = [];
try {
	tickets = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "tickets.json"), "utf8"));
} catch (error) {
	problems.push(`no se pudo leer data/tickets.json: ${error.message}`);
}

if (fs.existsSync(path.join(ROOT, "index.html")) && Array.isArray(tickets)) {
	const { data, error } = extractJsonLd(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"));
	if (error) {
		problems.push(`index.html: ${error}.`);
	} else {
		const expected = splitTickets(tickets).vigentes.length;
		const actual = eventsOf(data).length;
		if (expected !== actual) {
			notes.push(
				`index.html tiene ${actual} eventos en el JSON-LD y data/tickets.json tiene ${expected} fechas vigentes: ` +
					"el JSON-LD está desactualizado (corré el comando sin --sin-build).",
			);
		} else {
			console.log(`  ✓ JSON-LD de index.html con ${actual} eventos (coincide con tickets.json).`);
		}
	}
}

notes.forEach((n) => console.log(`  ! ${n}`));
if (problems.length) {
	problems.forEach((p) => console.error(`  ✗ ${p}`));
	fail("hay problemas que impiden armar el zip.");
}

/* ---------- 3. lista de archivos ---------- */

const files = listFiles(ROOT);
const totalBytes = files.reduce((sum, f) => sum + fs.statSync(path.join(ROOT, f)).size, 0);

console.log(`\n3/4 Archivos que viajan en el zip: ${files.length} (${formatSize(totalBytes)} sin comprimir).`);
const byTop = new Map();
for (const f of files) {
	const top = f.includes("/") ? `${f.split("/")[0]}/` : "(raíz)";
	byTop.set(top, (byTop.get(top) || 0) + 1);
}
for (const [top, count] of [...byTop].sort()) console.log(`  ${top.padEnd(10)} ${count}`);
console.log("  No viajan: data/tickets.json, imgs/tickets/, .git, node_modules, documentation, scripts, scss, .vscode, package*.json, .gitignore.");

if (DRY_RUN) {
	console.log("\nDry-run: no se escribió ningún archivo.");
	process.exit(0);
}

/* ---------- 4. zip ---------- */

const outDir = path.join(ROOT, "entrega-geo");
fs.mkdirSync(outDir, { recursive: true });
const zipPath = path.join(outDir, `polenta-web-${artStamp()}.zip`);
if (fs.existsSync(zipPath)) fail(`ya existe ${path.relative(ROOT, zipPath)}; esperá un minuto y volvé a correr.`);

console.log("\n4/4 Armando el zip...");
const zip = spawnSync("zip", ["-q", "-X", zipPath, "-@"], {
	cwd: ROOT,
	input: files.join("\n") + "\n",
	encoding: "utf8",
});
if (zip.error || zip.status !== 0) {
	fs.rmSync(zipPath, { force: true });
	fail(`no se pudo crear el zip: ${zip.error ? zip.error.message : zip.stderr}`);
}

// Verificación del contenido real del zip.
const listing = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
if (listing.status !== 0) fail("no se pudo leer el zip recién creado.");
const entries = listing.stdout.split("\n").filter(Boolean);
const forbidden = entries.filter(
	(e) =>
		e === "data/tickets.json" ||
		e.startsWith("imgs/tickets/") ||
		e.startsWith(".git/") ||
		e.startsWith("node_modules/") ||
		e.endsWith(".DS_Store"),
);
if (forbidden.length) {
	fs.rmSync(zipPath, { force: true });
	fail(`el zip incluía archivos que no deben viajar (${forbidden.slice(0, 3).join(", ")}); se borró.`);
}
for (const required of ["index.html", "llms.txt", "sitemap.xml", "robots.txt"]) {
	if (!entries.includes(required)) {
		fs.rmSync(zipPath, { force: true });
		fail(`al zip le falta ${required}; se borró.`);
	}
}

console.log(`\nListo: ${path.relative(ROOT, zipPath)} (${formatSize(fs.statSync(zipPath).size)}, ${entries.length} archivos).`);
console.log(
	"\nPara Mica: descomprimir y pegar todo en CPanel. El zip no trae data/tickets.json ni imgs/tickets/,\n" +
		"así que no pisa lo que ya está publicado. Antes de publicar, confirmar que el tickets.json de producción\n" +
		"es el mismo que usó build-seo (el JSON-LD y llms.txt se generaron con el del proyecto).\n" +
		"Después de publicar: npm run geo:verificar",
);
