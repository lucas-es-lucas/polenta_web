#!/usr/bin/env node
/*
 * validar.js
 *
 * Validación previa a la generación: revisa un tickets.json antes de correr build-seo.
 * No escribe ni modifica ningún archivo.
 *
 * Uso (desde la raíz del proyecto):
 *   npm run geo:validar                              valida ~/Downloads/tickets.json
 *   npm run geo:validar -- --tickets <ruta>          valida otro tickets.json
 *                                                    (por ejemplo data/tickets.json)
 *   npm run geo:validar -- --imgs <carpeta>          además busca las imágenes en esa carpeta
 *   npm run geo:validar -- --url <origen>            origen de producción (por defecto, el de seo-config.json)
 *   npm run geo:validar -- --sin-red                 no consulta producción
 *
 * Errores (bloquean, salida con código 1):
 *   JSON inválido, campos obligatorios, fechas, ciudades que no están en seo-config.json,
 *   duplicados, links, horarios, precio y moneda, imágenes que no son PNG o con otro uso
 *   de mayúsculas.
 * Avisos (no bloquean):
 *   claves desconocidas, fechas sin ordenar o lejanas, imágenes que no están en el proyecto
 *   ni en producción, y otras incoherencias menores.
 *
 * Las imágenes de cada ticket vigente se buscan, en este orden: en --imgs, en imgs/tickets/
 * del proyecto y, por último, en producción (HEAD a /imgs/tickets/AAAAMMDD-ciudad.png).
 * No verifica que los links de compra respondan. Sin dependencias externas (solo Node).
 */

const fs = require("fs");
const path = require("path");
const { ROOT, CONFIG, parseTicketDate, splitTickets, optionValue, resolveTicketsPath } = require("./lib");

const args = process.argv.slice(2);
const NO_NETWORK = args.includes("--sin-red");
const BASE = (optionValue(args, "--url") || CONFIG.baseUrl).replace(/\/+$/, "");
const IMGS_DIR = optionValue(args, "--imgs");
const REPO_TICKETS = path.join(ROOT, "data", "tickets.json");
const REPO_IMGS = path.join(ROOT, "imgs", "tickets");

const REQUIRED = ["date", "city", "alt", "link"];
const OPTIONAL = ["name", "venue", "address", "startTime", "endTime", "price", "currency", "type"];
const ALLOWED = new Set([...REQUIRED, ...OPTIONAL]);
const KNOWN_TYPES = new Set([
	"Event", "DanceEvent", "MusicEvent", "SocialEvent", "TheaterEvent", "ComedyEvent",
	"ExhibitionEvent", "BusinessEvent", "FoodEvent", "SportsEvent", "EducationEvent",
	"Festival", "MusicFestival",
]);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/* ---------- resultados ---------- */

const counts = { ok: 0, warn: 0, err: 0 };
const ok = (m) => (counts.ok++, console.log(`  ✓ ${m}`));
const warn = (m) => (counts.warn++, console.log(`  ! ${m}`));
const err = (m) => (counts.err++, console.log(`  ✗ ${m}`));
const info = (m) => console.log(`    ${m}`);
const section = (t) => console.log(`\n${t}`);

function finish() {
	console.log(`\nResumen: ${counts.ok} correctos, ${counts.warn} avisos, ${counts.err} errores.`);
	if (counts.err) console.log("Hay errores: corregir el tickets.json antes de generar los archivos.");
	else if (counts.warn) console.log("Sin errores. Revisar los avisos antes de seguir.");
	else console.log("Sin errores ni avisos.");
	process.exit(counts.err ? 1 : 0);
}

/* ---------- ubicar el tickets.json ---------- */

/* ---------- red ---------- */

async function headImage(pathname) {
	const url = `${BASE}${pathname}?_=${Date.now()}`;
	const options = {
		redirect: "follow",
		headers: { "Cache-Control": "no-cache", "User-Agent": "polenta-geo-validar/1.0" },
		signal: AbortSignal.timeout(15000),
	};
	try {
		let res = await fetch(url, { ...options, method: "HEAD" });
		if (res.status === 405 || res.status === 501) res = await fetch(url, { ...options, method: "GET" });
		if (res.status !== 200) return { found: false, status: res.status };
		const type = res.headers.get("content-type") || "";
		if (!type.startsWith("image/")) return { found: false, status: 200, notImage: type };
		return { found: true };
	} catch (error) {
		return { error: error.cause && error.cause.code ? error.cause.code : error.message };
	}
}

/* ---------- imágenes locales ---------- */

const dirCache = new Map();
function listDir(dir) {
	if (!dirCache.has(dir)) {
		try {
			dirCache.set(dir, fs.readdirSync(dir));
		} catch {
			dirCache.set(dir, null);
		}
	}
	return dirCache.get(dir);
}

// Busca el archivo en una carpeta. Devuelve null si no hay nada parecido.
function findLocal(dir, fileName) {
	const entries = listDir(dir);
	if (!entries) return null;
	if (entries.includes(fileName)) return { dir, exact: true, fileName };
	const similar = entries.find((e) => e.toLowerCase() === fileName.toLowerCase());
	return similar ? { dir, exact: false, fileName: similar } : null;
}

function isPng(filePath) {
	try {
		const fd = fs.openSync(filePath, "r");
		const buf = Buffer.alloc(8);
		const read = fs.readSync(fd, buf, 0, 8, 0);
		fs.closeSync(fd);
		return read === 8 && buf.equals(PNG_SIGNATURE);
	} catch {
		return false;
	}
}

/* ---------- validación ---------- */

const isText = (v) => typeof v === "string" && v.trim() !== "";
const hasValue = (v) => v !== undefined && v !== null && v !== "";

function parseHm(value) {
	const m = typeof value === "string" && value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
	return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

async function main() {
	const ticketsPath = resolveTicketsPath(args, "geo:validar");
	console.log(`Validando ${ticketsPath}`);

	/* --- lectura --- */
	section("Archivo");
	let text;
	try {
		text = fs.readFileSync(ticketsPath, "utf8");
	} catch (error) {
		err(`No se pudo leer el archivo: ${error.message}`);
		return finish();
	}
	let tickets;
	try {
		tickets = JSON.parse(text.replace(/^﻿/, ""));
	} catch (error) {
		err(`JSON inválido: ${error.message}`);
		const trailing = /,\s*[}\]]/.exec(text);
		if (trailing) {
			const line = text.slice(0, trailing.index).split("\n").length;
			info(`Posible coma de más antes de } o ] en la línea ${line}.`);
		} else {
			info("Suele ser una coma o una comilla que falta, o una coma de más.");
		}
		return finish();
	}
	if (!Array.isArray(tickets)) {
		err("El archivo debe ser una lista de tickets ([ ... ]).");
		return finish();
	}
	ok(`JSON válido: ${tickets.length} tickets.`);
	if (!tickets.length) warn("La lista está vacía: el sitio no mostraría tickets.");

	/* --- campos de cada ticket --- */
	section("Campos de cada ticket");
	const label = (t, i) => `#${i + 1} ${t && t.date}-${t && t.city}`;
	const before = counts.err + counts.warn;
	const seen = new Map();
	const links = new Map();

	tickets.forEach((t, i) => {
		if (!t || typeof t !== "object" || Array.isArray(t)) {
			err(`#${i + 1}: no es un objeto.`);
			return;
		}
		const name = label(t, i);

		for (const key of REQUIRED) {
			if (!isText(t[key])) err(`${name}: falta "${key}" o está vacío.`);
		}

		for (const key of Object.keys(t)) {
			if (!ALLOWED.has(key)) warn(`${name}: clave desconocida "${key}" (se ignora). ¿Error de tipeo?`);
		}

		if (isText(t.date) && !parseTicketDate(t.date)) {
			err(`${name}: fecha inválida "${t.date}" (debe ser AAAAMMDD y existir en el calendario).`);
		}

		if (isText(t.city)) {
			if (!/^[a-z0-9-]+$/.test(t.city)) {
				err(`${name}: ciudad "${t.city}" con formato inválido (solo minúsculas, números y guiones).`);
			} else if (!CONFIG.cities[t.city]) {
				err(`${name}: la ciudad "${t.city}" no está en scripts/seo-config.json. Hay que cargarla antes de generar (npm run geo:ciudad).`);
			}
		}

		if (isText(t.date) && isText(t.city)) {
			const key = `${t.date}-${t.city}`;
			if (seen.has(key)) err(`${name}: repetido (mismo ticket que #${seen.get(key)}).`);
			else seen.set(key, i + 1);
		}

		if (isText(t.link)) {
			let url = null;
			try {
				url = new URL(t.link);
			} catch {
				/* inválido: se informa abajo */
			}
			if (!url || !/^https?:$/.test(url.protocol)) err(`${name}: link inválido "${t.link}".`);
			else {
				if (url.protocol === "http:") warn(`${name}: el link usa http, no https.`);
				if (links.has(t.link)) warn(`${name}: usa el mismo link que #${links.get(t.link)}.`);
				else links.set(t.link, i + 1);
			}
			if (t.link !== t.link.trim()) err(`${name}: el link tiene espacios al principio o al final.`);
		}

		for (const key of ["name", "venue", "address", "type", "startTime", "endTime", "currency"]) {
			if (hasValue(t[key]) && !isText(t[key])) err(`${name}: "${key}" debe ser texto.`);
		}

		const start = hasValue(t.startTime) ? parseHm(t.startTime) : null;
		if (isText(t.startTime) && start === null) err(`${name}: startTime "${t.startTime}" inválido (debe ser HH:MM).`);
		if (isText(t.endTime) && parseHm(t.endTime) === null) err(`${name}: endTime "${t.endTime}" inválido (debe ser HH:MM).`);
		if (hasValue(t.endTime) && !hasValue(t.startTime)) {
			err(`${name}: hay endTime pero no startTime (el script descartaría el horario).`);
		}

		if (hasValue(t.price)) {
			const price = typeof t.price === "number" ? t.price : Number(String(t.price).trim());
			if (!Number.isFinite(price) || price < 0 || String(t.price).trim() === "") {
				const hint = /^\d+,\d+$/.test(String(t.price).trim()) ? " Usar punto como separador decimal." : "";
				err(`${name}: price "${t.price}" no es un número válido.${hint}`);
			}
			const country = CONFIG.cities[t.city] && CONFIG.countries[CONFIG.cities[t.city].country];
			if (!hasValue(t.currency) && !(country && country.currency)) {
				warn(`${name}: hay price pero no currency, y la ciudad no tiene moneda por defecto.`);
			}
		}
		if (isText(t.currency) && !/^[A-Z]{3}$/.test(t.currency)) {
			err(`${name}: currency "${t.currency}" inválida (código de 3 letras en mayúsculas, por ejemplo ARS).`);
		}

		if (isText(t.type) && !KNOWN_TYPES.has(t.type)) {
			warn(`${name}: type "${t.type}" no es un tipo de evento habitual de schema.org (DanceEvent, MusicEvent, Festival...).`);
		}
	});

	if (counts.err + counts.warn === before) ok("Campos obligatorios y opcionales correctos.");

	/* --- fechas --- */
	section("Fechas");
	const valid = tickets.filter((t) => t && typeof t === "object" && parseTicketDate(t.date));
	const { vigentes, vencidos } = splitTickets(valid);

	if (valid.length > 1) {
		const sorted = valid.every((t, i) => i === 0 || valid[i - 1].date <= t.date);
		if (sorted) ok("Ordenadas por fecha.");
		else warn("Las fechas no están en orden: el sitio muestra los tickets en el orden del archivo.");
	}
	info(`Vigentes: ${vigentes.length}. Vencidas (no se muestran): ${vencidos.length}.`);
	if (valid.length && !vigentes.length) warn("No hay ninguna fecha vigente: el sitio no mostraría tickets.");
	const limit = new Date();
	limit.setDate(limit.getDate() + 400);
	for (const { ticket, date } of vigentes) {
		if (date > limit) warn(`${ticket.date}-${ticket.city}: la fecha está a más de un año. ¿Error de tipeo?`);
	}

	/* --- novedades respecto del proyecto --- */
	if (path.resolve(ticketsPath) !== REPO_TICKETS && fs.existsSync(REPO_TICKETS)) {
		try {
			const current = JSON.parse(fs.readFileSync(REPO_TICKETS, "utf8"));
			const keyOf = (t) => `${t.date}-${t.city}`;
			const currentKeys = new Set(current.map(keyOf));
			const newKeys = new Set(valid.map(keyOf));
			const added = valid.filter((t) => !currentKeys.has(keyOf(t))).map(keyOf);
			const removed = current.filter((t) => !newKeys.has(keyOf(t))).map(keyOf);
			section("Cambios respecto de data/tickets.json del proyecto");
			info(`Agregadas: ${added.length ? added.join(", ") : "ninguna"}.`);
			info(`Quitadas: ${removed.length ? removed.join(", ") : "ninguna"}.`);
		} catch {
			/* el del proyecto no se pudo leer: se omite la comparación */
		}
	}

	/* --- imágenes --- */
	section("Imágenes de los tickets vigentes");
	const searchDirs = [];
	if (IMGS_DIR) searchDirs.push(path.resolve(process.cwd(), IMGS_DIR));
	searchDirs.push(REPO_IMGS);
	if (IMGS_DIR && !listDir(searchDirs[0])) warn(`No se pudo leer la carpeta de imágenes ${IMGS_DIR}.`);

	let networkDown = false;
	for (const { ticket } of vigentes) {
		if (!isText(ticket.city) || !/^[a-z0-9-]+$/.test(ticket.city)) continue;
		const fileName = `${ticket.date}-${ticket.city}.png`;
		const name = `${ticket.date}-${ticket.city}`;

		const hits = searchDirs.map((dir) => findLocal(dir, fileName)).filter(Boolean);
		const exact = hits.find((h) => h.exact);
		if (exact) {
			if (!isPng(path.join(exact.dir, exact.fileName))) {
				err(`${fileName}: el archivo en ${path.relative(process.cwd(), exact.dir) || exact.dir} no es un PNG válido.`);
			} else {
				ok(`${fileName} (${exact.dir === REPO_IMGS ? "en el proyecto" : "en la carpeta indicada"}).`);
			}
			continue;
		}
		if (hits.length) {
			err(`${name}: existe "${hits[0].fileName}" pero el nombre debe ser exactamente "${fileName}" (el hosting puede distinguir mayúsculas y la Mac no).`);
			continue;
		}

		if (NO_NETWORK) {
			warn(`${fileName}: no está en el proyecto y no se consultó producción (--sin-red).`);
			continue;
		}
		if (networkDown) {
			warn(`${fileName}: no está en el proyecto y no se pudo consultar producción.`);
			continue;
		}
		const remote = await headImage(`/imgs/tickets/${fileName}`);
		if (remote.error) {
			networkDown = true;
			warn(`${fileName}: no está en el proyecto y no se pudo consultar producción (${remote.error}).`);
		} else if (remote.found) {
			ok(`${fileName} (ya está en producción).`);
		} else if (remote.notImage !== undefined) {
			warn(`${fileName}: producción responde 200 pero no es una imagen (${remote.notImage || "sin content-type"}).`);
		} else {
			warn(`${fileName}: no está en el proyecto ni en producción (${remote.status}). Mica debe subirla antes de publicar.`);
		}
	}

	finish();
}

main().catch((error) => {
	console.error(`ERROR inesperado: ${error.message}`);
	process.exit(1);
});
