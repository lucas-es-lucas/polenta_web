#!/usr/bin/env node
/*
 * build-seo.js
 *
 * Genera a partir de data/tickets.json y scripts/seo-config.json:
 *   - el bloque JSON-LD de index.html (entre los marcadores SEO:JSONLD),
 *   - llms.txt,
 *   - sitemap.xml.
 *
 * Uso (desde la raíz del proyecto):
 *   npm run build-seo                      escribe los archivos en el proyecto
 *   npm run build-seo -- --out seo-out     deja copias en la carpeta indicada
 *                                          sin tocar los archivos del proyecto
 *   npm run build-seo -- --dry-run         muestra el resultado sin escribir nada
 *
 * No tiene dependencias externas (solo Node).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONFIG = JSON.parse(
	fs.readFileSync(path.join(__dirname, "seo-config.json"), "utf8"),
);

const MARKER_START = "<!-- SEO:JSONLD:START";
const MARKER_END = "<!-- SEO:JSONLD:END -->";

/* ---------- argumentos ---------- */

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const outIndex = args.indexOf("--out");
const OUT_DIR = outIndex !== -1 ? args[outIndex + 1] : null;

if (outIndex !== -1 && (!OUT_DIR || OUT_DIR.startsWith("--"))) {
	fail("Falta la carpeta después de --out.");
}

/* ---------- utilidades ---------- */

const warnings = [];

function warn(message) {
	warnings.push(message);
}

function fail(message) {
	console.error(`ERROR: ${message}`);
	process.exit(1);
}

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

function parseTime(value) {
	const match = typeof value === "string" && value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
	return match ? { h: Number(match[1]), m: Number(match[2]) } : null;
}

// Offset UTC (en minutos) de una zona horaria en un instante dado.
function tzOffsetMinutes(timeZone, instant) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		timeZoneName: "longOffset",
	}).formatToParts(instant);
	const name = parts.find((p) => p.type === "timeZoneName").value; // GMT+01:00
	const match = name.match(/GMT([+-])(\d{2}):(\d{2})/);
	if (!match) return 0;
	const minutes = Number(match[2]) * 60 + Number(match[3]);
	return match[1] === "-" ? -minutes : minutes;
}

// Devuelve "YYYY-MM-DDTHH:MM:00+01:00" para una fecha/hora local de una zona.
function dateTimeWithOffset(y, mo, d, time, timeZone) {
	const asUtc = Date.UTC(y, mo - 1, d, time.h, time.m);
	let offset = tzOffsetMinutes(timeZone, new Date(asUtc));
	offset = tzOffsetMinutes(timeZone, new Date(asUtc - offset * 60000));
	const sign = offset < 0 ? "-" : "+";
	const abs = Math.abs(offset);
	const base = new Date(Date.UTC(y, mo - 1, d));
	return (
		`${base.getUTCFullYear()}-${pad(base.getUTCMonth() + 1)}-${pad(base.getUTCDate())}` +
		`T${pad(time.h)}:${pad(time.m)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
	);
}

function formatLongDate(date, lang) {
	return new Intl.DateTimeFormat(lang === "es" ? "es-AR" : "en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
}

function escapeXml(value) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/* ---------- carga y filtrado de tickets ---------- */

let rawTickets;
try {
	rawTickets = JSON.parse(
		fs.readFileSync(path.join(ROOT, "data", "tickets.json"), "utf8"),
	);
} catch (error) {
	fail(`No se pudo leer data/tickets.json: ${error.message}`);
}
if (!Array.isArray(rawTickets)) fail("data/tickets.json debe ser una lista.");

// Misma regla que tickets.js: se muestran los tickets de hoy y de los
// DAYS_TO_KEEP días anteriores. Si se cambia allí, cambiarla en seo-config.json.
const today = new Date();
today.setHours(0, 0, 0, 0);
const cutoff = new Date(today);
cutoff.setDate(cutoff.getDate() - CONFIG.daysToKeep);

let expiredCount = 0;
const events = [];

for (const ticket of rawTickets) {
	const date = parseTicketDate(ticket.date);
	if (!date) {
		warn(`Ticket omitido: fecha inválida (${JSON.stringify(ticket.date)}, ciudad "${ticket.city}").`);
		continue;
	}
	if (date < cutoff) {
		expiredCount++;
		continue;
	}
	if (!ticket.link) {
		warn(`Ticket ${ticket.date}-${ticket.city}: sin link de compra; se incluye sin oferta.`);
	}
	events.push({ ticket, date });
}

events.sort((a, b) => a.date - b.date || String(a.ticket.city).localeCompare(String(b.ticket.city)));

/* ---------- datos derivados de cada evento ---------- */

function describeEvent({ ticket, date }) {
	const place = CONFIG.cities[ticket.city];
	if (!place) {
		warn(`Ciudad "${ticket.city}" no está en scripts/seo-config.json: el evento ${ticket.date} se genera sin ubicación.`);
	}
	const country = place ? CONFIG.countries[place.country] : null;

	const name =
		ticket.name ||
		(place && place.defaultName) ||
		(place ? `Fiesta Polenta* en ${place.es}` : "Fiesta Polenta*");

	return { ticket, date, place, country, name };
}

function buildEventJsonLd(info) {
	const { ticket, date, place, name } = info;
	const baseUrl = CONFIG.baseUrl;
	const startTime = parseTime(ticket.startTime);
	if (ticket.startTime && !startTime) {
		warn(`Ticket ${ticket.date}-${ticket.city}: startTime inválido (${ticket.startTime}); se usa solo la fecha.`);
	}
	const endTime = startTime ? parseTime(ticket.endTime) : null;

	const event = {
		"@type": ticket.type || CONFIG.defaultEventType,
		name,
		eventStatus: "https://schema.org/EventScheduled",
		eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
	};

	const y = date.getFullYear();
	const mo = date.getMonth() + 1;
	const d = date.getDate();

	if (startTime && place) {
		event.startDate = dateTimeWithOffset(y, mo, d, startTime, place.timezone);
		if (endTime) {
			const crossesMidnight =
				endTime.h * 60 + endTime.m <= startTime.h * 60 + startTime.m;
			const endDay = new Date(y, mo - 1, d + (crossesMidnight ? 1 : 0));
			event.endDate = dateTimeWithOffset(
				endDay.getFullYear(), endDay.getMonth() + 1, endDay.getDate(), endTime, place.timezone,
			);
		}
	} else {
		if (startTime && !place) {
			warn(`Ticket ${ticket.date}-${ticket.city}: hay startTime pero no zona horaria (ciudad desconocida); se usa solo la fecha.`);
		}
		event.startDate = isoDate(date);
	}

	// Ubicación: solo con datos conocidos.
	const address = {};
	if (ticket.address) address.streetAddress = ticket.address;
	if (place) {
		if (place.region) address.addressRegion = place.es;
		else address.addressLocality = place.es;
		address.addressCountry = place.country;
	}
	if (ticket.venue || Object.keys(address).length) {
		const location = { "@type": "Place" };
		if (ticket.venue) location.name = ticket.venue;
		if (Object.keys(address).length) {
			location.address = { "@type": "PostalAddress", ...address };
		}
		event.location = location;
	}

	event.image = `${baseUrl}/imgs/tickets/${ticket.date}-${ticket.city}.png`;
	event.organizer = { "@id": `${baseUrl}/#organization` };

	if (ticket.link) {
		const offer = { "@type": "Offer", url: ticket.link };
		if (ticket.price !== undefined && ticket.price !== null && ticket.price !== "") {
			offer.price = String(ticket.price);
			const currency =
				ticket.currency || (info.country && info.country.currency);
			if (currency) offer.priceCurrency = currency;
			else warn(`Ticket ${ticket.date}-${ticket.city}: hay price pero no currency; se omite la moneda.`);
		}
		event.offers = offer;
	}

	return event;
}

/* ---------- JSON-LD ---------- */

function buildJsonLd(infos) {
	const org = CONFIG.organization;
	const baseUrl = CONFIG.baseUrl;

	const organization = {
		"@type": "Organization",
		"@id": `${baseUrl}/#organization`,
		name: org.name,
		alternateName: org.alternateName,
		url: `${baseUrl}/`,
		logo: `${baseUrl}${org.logo}`,
		foundingDate: org.foundingDate,
		description: org.description,
		email: org.email,
		founder: org.founders.map((f) => {
			const person = { "@type": "Person", name: f.name };
			if (f.alternateName) person.alternateName = f.alternateName;
			return person;
		}),
		sameAs: org.sameAs,
	};

	const website = {
		"@type": "WebSite",
		"@id": `${baseUrl}/#website`,
		url: `${baseUrl}/`,
		name: CONFIG.website.name,
		inLanguage: CONFIG.website.language,
		publisher: { "@id": `${baseUrl}/#organization` },
	};

	return {
		"@context": "https://schema.org",
		"@graph": [organization, website, ...infos.map(buildEventJsonLd)],
	};
}

function renderJsonLdBlock(jsonLd) {
	// Se escapa "<" para que ningún texto pueda cerrar el <script>.
	const json = JSON.stringify(jsonLd, null, 2).replace(/</g, "\\u003c");
	const indented = json.split("\n").map((line) => `\t\t${line}`).join("\n");
	return (
		`${MARKER_START} (generado por scripts/build-seo.js; no editar a mano) -->\n` +
		`\t<script type="application/ld+json">\n${indented}\n\t</script>\n` +
		`\t${MARKER_END}`
	);
}

function replaceJsonLdBlock(html, block) {
	const start = html.indexOf(MARKER_START);
	const end = html.indexOf(MARKER_END);
	if (start === -1 || end === -1 || end < start) {
		fail("index.html no tiene los marcadores <!-- SEO:JSONLD:START ... --> y <!-- SEO:JSONLD:END -->.");
	}
	return html.slice(0, start) + block + html.slice(end + MARKER_END.length);
}

/* ---------- llms.txt ---------- */

function buildDateLines(infos, lang) {
	if (!infos.length) {
		return lang === "es"
			? "No hay fechas vigentes publicadas en este momento."
			: "There are no upcoming dates published at the moment.";
	}
	return infos
		.map(({ ticket, date, place, country, name }) => {
			// "display" permite un texto propio (por ejemplo, para una provincia).
			const where = place
				? place.display
					? place.display[lang]
					: `${place[lang]}, ${country[lang]}`
				: null;
			const parts = [`- ${formatLongDate(date, lang)}: ${name}`];
			if (where) parts.push(` (${where})`);
			if (ticket.venue) parts.push(`, ${ticket.venue}`);
			if (ticket.link) parts.push(lang === "es" ? `. Entradas: ${ticket.link}` : `. Tickets: ${ticket.link}`);
			return parts.join("");
		})
		.join("\n");
}

function buildLlmsTxt(infos) {
	const template = fs.readFileSync(path.join(__dirname, "llms.template.txt"), "utf8");
	return template
		.replace("{{FECHAS_ES}}", buildDateLines(infos, "es"))
		.replace("{{FECHAS_EN}}", buildDateLines(infos, "en"));
}

/* ---------- sitemap.xml ---------- */

function buildSitemap() {
	const lastmod = isoDate(new Date());
	const urls = CONFIG.sitemapPages
		.map((page) => {
			const loc = escapeXml(`${CONFIG.baseUrl}${page.path}`);
			const mod = page.isHome ? `\n\t\t<lastmod>${lastmod}</lastmod>` : "";
			return `\t<url>\n\t\t<loc>${loc}</loc>${mod}\n\t</url>`;
		})
		.join("\n");
	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
	);
}

/* ---------- ejecución ---------- */

const infos = events.map(describeEvent);
const jsonLd = buildJsonLd(infos);
const block = renderJsonLdBlock(jsonLd);

const indexPath = path.join(ROOT, "index.html");
const indexHtml = replaceJsonLdBlock(fs.readFileSync(indexPath, "utf8"), block);
const llms = buildLlmsTxt(infos);
const sitemap = buildSitemap();

const outputs = [
	{ file: "index.html", content: indexHtml },
	{ file: "llms.txt", content: llms },
	{ file: "sitemap.xml", content: sitemap },
];

console.log(`Eventos incluidos: ${events.length}. Vencidos omitidos: ${expiredCount}.`);
if (warnings.length) {
	console.log("\nAvisos:");
	warnings.forEach((w) => console.log(`  - ${w}`));
}

if (DRY_RUN) {
	console.log("\n--- JSON-LD ---\n" + block);
	console.log("\n--- llms.txt (sección Próximas fechas) ---");
	console.log(buildDateLines(infos, "es"));
	console.log(buildDateLines(infos, "en"));
	console.log("\n--- sitemap.xml ---\n" + sitemap);
	for (const { file, content } of outputs) {
		const current = fs.existsSync(path.join(ROOT, file))
			? fs.readFileSync(path.join(ROOT, file), "utf8")
			: null;
		console.log(`${file}: ${current === content ? "sin cambios" : current === null ? "se crearía" : "cambiaría"}`);
	}
	console.log("\nDry-run: no se escribió ningún archivo.");
} else {
	const targetDir = OUT_DIR ? path.resolve(process.cwd(), OUT_DIR) : ROOT;
	fs.mkdirSync(targetDir, { recursive: true });
	for (const { file, content } of outputs) {
		fs.writeFileSync(path.join(targetDir, file), content);
		console.log(`Escrito: ${path.relative(process.cwd(), path.join(targetDir, file)) || file}`);
	}
}
