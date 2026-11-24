/*
 * lib.js
 *
 * Utilidades compartidas por los comandos GEO (geo:zip, geo:verificar).
 * Sin dependencias externas (solo Node).
 *
 * La regla de fechas vigentes (hoy y los `daysToKeep` días anteriores) repite
 * la de tickets.js y la de scripts/build-seo.js. Si cambia en una, debe
 * cambiar en las tres.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CONFIG = JSON.parse(
	fs.readFileSync(path.join(ROOT, "scripts", "seo-config.json"), "utf8"),
);

function pad(n) {
	return String(n).padStart(2, "0");
}

// Parsea YYYYMMDD como fecha local a las 00:00. Devuelve null si no es válida.
function parseTicketDate(value) {
	if (typeof value !== "string" || !/^\d{8}$/.test(value)) return null;
	const y = Number(value.slice(0, 4));
	const m = Number(value.slice(4, 6));
	const d = Number(value.slice(6, 8));
	const date = new Date(y, m - 1, d);
	if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
		return null;
	}
	return date;
}

function isoDate(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Fecha larga igual a la de llms.txt, por ejemplo "28 de noviembre de 2026".
function formatLongDate(date, lang = "es") {
	return new Intl.DateTimeFormat(lang === "es" ? "es-AR" : "en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
}

// Separa los tickets en vigentes, vencidos e inválidos según la regla de fechas.
function splitTickets(tickets, now = new Date()) {
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const cutoff = new Date(today);
	cutoff.setDate(cutoff.getDate() - CONFIG.daysToKeep);

	const vigentes = [];
	const vencidos = [];
	const invalidos = [];
	for (const ticket of tickets) {
		const date = parseTicketDate(ticket && ticket.date);
		if (!date) invalidos.push(ticket);
		else if (date < cutoff) vencidos.push({ ticket, date });
		else vigentes.push({ ticket, date });
	}
	return { vigentes, vencidos, invalidos, cutoff };
}

// Marca de tiempo AAAAMMDD-HHMM en hora de Argentina (ART), como los commits.
function artStamp(now = new Date()) {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-CA", {
			timeZone: "America/Argentina/Buenos_Aires",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
		})
			.formatToParts(now)
			.map((p) => [p.type, p.value]),
	);
	return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}`;
}

// Extrae y parsea el bloque <script type="application/ld+json"> de un HTML.
// Devuelve { data } o { error }.
function extractJsonLd(html) {
	const match = html.match(
		/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
	);
	if (!match) return { error: "no se encontró el bloque JSON-LD" };
	try {
		return { data: JSON.parse(match[1]) };
	} catch (error) {
		return { error: `el JSON-LD no se puede parsear: ${error.message}` };
	}
}

// Eventos de un JSON-LD con @graph: tipos schema.org que terminan en "Event"
// (DanceEvent, MusicEvent...) o en "Festival" (Festival, MusicFestival...).
function eventsOf(jsonLd) {
	const graph = Array.isArray(jsonLd["@graph"]) ? jsonLd["@graph"] : [];
	return graph.filter(
		(node) => typeof node["@type"] === "string" && /(Event|Festival)$/.test(node["@type"]),
	);
}

// Valor de una opción "--nombre valor". Devuelve null si no está.
function optionValue(args, name) {
	const i = args.indexOf(name);
	if (i === -1) return null;
	const value = args[i + 1];
	if (!value || value.startsWith("--")) {
		console.error(`ERROR: falta el valor después de ${name}.`);
		process.exit(1);
	}
	return value;
}

// Ruta del tickets.json a procesar: --tickets <ruta> o, por defecto, ~/Downloads/tickets.json.
// Si no existe, lo informa (con los archivos parecidos de Descargas) y termina con código 1.
function resolveTicketsPath(args, command) {
	const given = optionValue(args, "--tickets");
	if (given) return path.resolve(process.cwd(), given);

	const downloads = path.join(os.homedir(), "Downloads");
	const exact = path.join(downloads, "tickets.json");
	if (fs.existsSync(exact)) return exact;

	console.log(`No hay un tickets.json en ${downloads}.`);
	try {
		const candidates = fs
			.readdirSync(downloads)
			.filter((f) => /^tickets.*\.json$/i.test(f))
			.sort();
		if (candidates.length) {
			console.log("Archivos parecidos en Descargas (renombrar a tickets.json o pasar --tickets):");
			candidates.forEach((f) => console.log(`  - ${f}`));
		}
	} catch {
		/* Descargas no legible: se sigue con el mensaje general */
	}
	console.log(`Usar: npm run ${command} -- --tickets <ruta al tickets.json>`);
	process.exit(1);
}

module.exports = {
	resolveTicketsPath,
	ROOT,
	CONFIG,
	pad,
	parseTicketDate,
	isoDate,
	formatLongDate,
	splitTickets,
	artStamp,
	extractJsonLd,
	eventsOf,
	optionValue,
};
