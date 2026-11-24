#!/usr/bin/env node
/*
 * verificar.js
 *
 * Verificación posterior a la publicación: comprueba el sitio publicado.
 *
 * Uso (desde la raíz del proyecto):
 *   npm run geo:verificar                              verifica https://fiestapolenta.com
 *   npm run geo:verificar -- --url https://otro.sitio  verifica otro origen (preview, staging)
 *   npm run geo:verificar -- --tickets <ruta>         compara con otro tickets.json local
 *                                                      (por defecto, data/tickets.json)
 *
 * Qué comprueba:
 *   - La home, /llms.txt, /sitemap.xml y /robots.txt responden y tienen el contenido esperado.
 *   - /data/tickets.json publicado es válido y coincide con el local.
 *   - La imagen de cada ticket vigente existe en producción.
 *   - El JSON-LD de la home se parsea, tiene un evento por ticket vigente y cada evento
 *     trae lo esencial (nombre, fecha, ubicación, imagen y oferta).
 *   - llms.txt tiene las fechas y los links de los tickets vigentes.
 *   - Las páginas del sitemap responden.
 *
 * Es una verificación estructural propia: NO reemplaza al Rich Results Test de Google,
 * que sigue siendo el paso manual final. Solo hace pedidos de lectura (GET/HEAD).
 * Sale con código 1 si hay errores. Requiere Node 18 o superior.
 */

const fs = require("fs");
const path = require("path");
const {
	ROOT,
	CONFIG,
	isoDate,
	formatLongDate,
	splitTickets,
	extractJsonLd,
	eventsOf,
	optionValue,
} = require("./lib");

const args = process.argv.slice(2);
const BASE = (optionValue(args, "--url") || CONFIG.baseUrl).replace(/\/+$/, "");
const LOCAL_TICKETS = optionValue(args, "--tickets") || path.join(ROOT, "data", "tickets.json");

/* ---------- resultados ---------- */

const counts = { ok: 0, warn: 0, err: 0 };

function ok(message) {
	counts.ok++;
	console.log(`  ✓ ${message}`);
}
function warn(message) {
	counts.warn++;
	console.log(`  ! ${message}`);
}
function err(message) {
	counts.err++;
	console.log(`  ✗ ${message}`);
}
function section(title) {
	console.log(`\n${title}`);
}

// JSON con las claves ordenadas, para comparar agendas sin que importe el orden de las claves.
function stableStringify(value) {
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
	if (value && typeof value === "object") {
		return `{${Object.keys(value)
			.sort()
			.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
			.join(",")}}`;
	}
	return JSON.stringify(value);
}

/* ---------- red ---------- */

// Pide una ruta con un parámetro anti-caché. Devuelve { res, body } o { error }.
async function request(pathname, { method = "GET", text = true } = {}) {
	const url = `${BASE}${pathname}${pathname.includes("?") ? "&" : "?"}_=${Date.now()}`;
	try {
		const res = await fetch(url, {
			method,
			redirect: "follow",
			headers: { "Cache-Control": "no-cache", "User-Agent": "polenta-geo-verificar/1.0" },
			signal: AbortSignal.timeout(20000),
		});
		const body = method === "GET" && text ? await res.text() : null;
		return { res, body };
	} catch (error) {
		return { error: error.cause && error.cause.code ? error.cause.code : error.message };
	}
}

// Comprueba que un recurso exista y sea una imagen. Prueba HEAD y, si no, GET.
async function checkImage(pathname) {
	let result = await request(pathname, { method: "HEAD" });
	if (result.res && (result.res.status === 405 || result.res.status === 501)) {
		result = await request(pathname, { text: false });
	}
	if (result.error) return `no responde (${result.error})`;
	if (result.res.status !== 200) return `responde ${result.res.status}`;
	const type = result.res.headers.get("content-type") || "";
	if (!type.startsWith("image/")) return `responde 200 pero no es una imagen (${type || "sin content-type"})`;
	return null;
}

/* ---------- verificación ---------- */

async function main() {
	console.log(`Verificando ${BASE}`);

	/* --- archivos del sitio --- */
	section("Archivos publicados");

	const home = await request("/");
	let homeHtml = null;
	if (home.error) err(`/ no responde (${home.error}).`);
	else if (home.res.status !== 200) err(`/ responde ${home.res.status}.`);
	else {
		homeHtml = home.body;
		ok("/ responde 200.");
	}

	const llms = await request("/llms.txt");
	let llmsText = null;
	if (llms.error) err(`/llms.txt no responde (${llms.error}).`);
	else if (llms.res.status !== 200) err(`/llms.txt responde ${llms.res.status}.`);
	else if (!llms.body.trimStart().startsWith("#")) err("/llms.txt responde 200 pero no parece un llms.txt (¿página de error del hosting?).");
	else {
		llmsText = llms.body;
		ok("/llms.txt responde 200 y tiene contenido.");
	}

	const sitemap = await request("/sitemap.xml");
	let sitemapText = null;
	if (sitemap.error) err(`/sitemap.xml no responde (${sitemap.error}).`);
	else if (sitemap.res.status !== 200) err(`/sitemap.xml responde ${sitemap.res.status}.`);
	else if (!sitemap.body.includes("<urlset")) err("/sitemap.xml responde 200 pero no es un sitemap (¿página de error del hosting?).");
	else {
		sitemapText = sitemap.body;
		ok("/sitemap.xml responde 200 y es un sitemap.");
	}

	const robots = await request("/robots.txt");
	if (robots.error) err(`/robots.txt no responde (${robots.error}).`);
	else if (robots.res.status !== 200) err(`/robots.txt responde ${robots.res.status}.`);
	else if (!/user-agent/i.test(robots.body)) err("/robots.txt responde 200 pero no parece un robots.txt.");
	else {
		ok("/robots.txt responde 200.");
		const line = `Sitemap: ${CONFIG.baseUrl}/sitemap.xml`;
		if (robots.body.includes(line)) ok("/robots.txt apunta al sitemap.");
		else warn(`/robots.txt no incluye la línea "${line}".`);
	}

	/* --- tickets.json --- */
	section("Agenda (data/tickets.json)");

	let tickets = null;
	const live = await request("/data/tickets.json");
	if (live.error) err(`/data/tickets.json no responde (${live.error}).`);
	else if (live.res.status !== 200) err(`/data/tickets.json responde ${live.res.status}.`);
	else {
		try {
			tickets = JSON.parse(live.body);
			if (!Array.isArray(tickets)) throw new Error("no es una lista");
			ok(`/data/tickets.json publicado es válido (${tickets.length} fechas).`);
		} catch (error) {
			tickets = null;
			err(`/data/tickets.json publicado no es JSON válido: ${error.message}. El sitio no muestra tickets.`);
		}
	}

	if (tickets && fs.existsSync(LOCAL_TICKETS)) {
		try {
			const local = JSON.parse(fs.readFileSync(LOCAL_TICKETS, "utf8"));
			if (stableStringify(local) === stableStringify(tickets)) ok("El tickets.json publicado coincide con el local.");
			else warn("El tickets.json publicado es distinto del local: el JSON-LD y llms.txt pueden haberse generado con otra agenda.");
		} catch (error) {
			warn(`No se pudo comparar con ${path.relative(ROOT, LOCAL_TICKETS)}: ${error.message}`);
		}
	}

	// Fuente de verdad: lo publicado. Si no está, se usa el local solo para seguir verificando.
	if (!tickets && fs.existsSync(LOCAL_TICKETS)) {
		try {
			tickets = JSON.parse(fs.readFileSync(LOCAL_TICKETS, "utf8"));
			warn("Se sigue verificando con el tickets.json local, porque el publicado no está disponible.");
		} catch {
			/* sin agenda: se omiten los controles que dependen de ella */
		}
	}

	const { vigentes, vencidos, invalidos } = tickets
		? splitTickets(tickets)
		: { vigentes: [], vencidos: [], invalidos: [] };

	if (tickets) {
		if (invalidos.length) err(`${invalidos.length} fecha(s) con formato inválido en tickets.json.`);
		console.log(`    Fechas vigentes: ${vigentes.length}. Vencidas: ${vencidos.length}.`);
		if (!vigentes.length) warn("No hay fechas vigentes: el sitio no muestra tickets.");
	}

	/* --- imágenes --- */
	if (vigentes.length) {
		section("Imágenes de los tickets vigentes");
		for (const { ticket } of vigentes) {
			const imgPath = `/imgs/tickets/${ticket.date}-${ticket.city}.png`;
			const problem = await checkImage(imgPath);
			if (problem) err(`${imgPath}: ${problem}.`);
			else ok(`${imgPath}`);
		}
	}

	/* --- home: metadatos y JSON-LD --- */
	section("Home: metadatos y JSON-LD");

	if (!homeHtml) {
		warn("Sin la home no se pueden comprobar los metadatos ni el JSON-LD.");
	} else {
		if (/<html[^>]*\blang=["']es["']/i.test(homeHtml)) ok('<html lang="es">.');
		else warn('La home no tiene <html lang="es">.');

		const canonical = homeHtml.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
		const canonicalHref = canonical && (canonical[0].match(/href=["']([^"']+)["']/i) || [])[1];
		if (!canonicalHref) warn("La home no tiene <link rel=\"canonical\">.");
		else if (canonicalHref.replace(/\/+$/, "") === CONFIG.baseUrl) ok(`canonical: ${canonicalHref}`);
		else warn(`canonical apunta a ${canonicalHref} (se esperaba ${CONFIG.baseUrl}/).`);

		const ogMatch = homeHtml.match(/<meta[^>]+property=["']og:image["'][^>]*>/i);
		const ogUrl = ogMatch && (ogMatch[0].match(/content=["']([^"']+)["']/i) || [])[1];
		if (!ogUrl) warn("La home no tiene og:image.");
		else {
			const ogPath = ogUrl.startsWith(CONFIG.baseUrl) ? ogUrl.slice(CONFIG.baseUrl.length) : null;
			const problem = ogPath ? await checkImage(ogPath) : null;
			if (problem) warn(`og:image (${ogUrl}): ${problem}.`);
			else ok("og:image existe.");
		}

		const { data: jsonLd, error: jsonLdError } = extractJsonLd(homeHtml);
		if (jsonLdError) {
			err(`JSON-LD: ${jsonLdError}.`);
		} else {
			ok("El JSON-LD de la home se parsea.");
			const graph = Array.isArray(jsonLd["@graph"]) ? jsonLd["@graph"] : [];
			for (const type of ["Organization", "WebSite"]) {
				if (graph.some((node) => node["@type"] === type)) ok(`JSON-LD incluye ${type}.`);
				else err(`JSON-LD no incluye ${type}.`);
			}

			const events = eventsOf(jsonLd);
			if (tickets) {
				if (events.length === vigentes.length) ok(`JSON-LD tiene ${events.length} eventos, uno por fecha vigente.`);
				else warn(`JSON-LD tiene ${events.length} eventos y hay ${vigentes.length} fechas vigentes: probablemente se generó con otra agenda.`);
			}

			const used = new Set();
			for (const { ticket, date } of vigentes) {
				const imageUrl = `${CONFIG.baseUrl}/imgs/tickets/${ticket.date}-${ticket.city}.png`;
				const label = `${ticket.date}-${ticket.city}`;
				const event = events.find((e) => e.image === imageUrl);
				if (!event) {
					err(`${label}: no tiene evento en el JSON-LD.`);
					continue;
				}
				used.add(event);
				const issues = [];
				if (!event.name) issues.push("sin name");
				if (!event.startDate || !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})?$/.test(event.startDate)) {
					issues.push(`startDate inválido (${event.startDate})`);
				} else if (!event.startDate.startsWith(isoDate(date))) {
					issues.push(`startDate ${event.startDate} no coincide con la fecha del ticket`);
				}
				if (ticket.link && !(event.offers && event.offers.url === ticket.link)) issues.push("la oferta no coincide con el link del ticket");
				if (issues.length) err(`${label}: ${issues.join("; ")}.`);
				else if (!event.location) warn(`${label}: el evento no tiene ubicación (¿ciudad sin cargar en seo-config.json?).`);
				else ok(`${label}: evento completo.`);
			}
			for (const event of events) {
				if (!used.has(event)) warn(`JSON-LD tiene un evento sin ticket vigente: "${event.name}" (${event.startDate}).`);
			}
		}
	}

	/* --- llms.txt --- */
	section("llms.txt");

	if (!llmsText) {
		warn("Sin llms.txt no se pueden comprobar las fechas.");
	} else if (tickets) {
		for (const { ticket, date } of vigentes) {
			const label = `${ticket.date}-${ticket.city}`;
			const missing = [];
			// llms.txt trae cada fecha en español y en inglés: se comprueban las dos.
			for (const lang of ["es", "en"]) {
				const text = formatLongDate(date, lang);
				if (!llmsText.includes(text)) missing.push(`la fecha "${text}" (${lang})`);
			}
			if (ticket.link) {
				const times = llmsText.split(ticket.link).length - 1;
				if (times < 2) missing.push(`el link de compra en ambos idiomas (aparece ${times} ${times === 1 ? "vez" : "veces"}, se esperaban 2)`);
			}
			if (missing.length) err(`${label}: llms.txt no incluye ${missing.join(" ni ")}.`);
			else ok(`${label}: presente.`);
		}
		for (const { ticket } of vencidos) {
			if (ticket.link && llmsText.includes(ticket.link)) {
				warn(`llms.txt todavía incluye el link de una fecha vencida (${ticket.date}-${ticket.city}).`);
			}
		}
	}

	/* --- sitemap --- */
	section("sitemap.xml");

	if (!sitemapText) {
		warn("Sin sitemap.xml no se pueden comprobar sus páginas.");
	} else {
		const locs = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
		const expected = CONFIG.sitemapPages.map((p) => `${CONFIG.baseUrl}${p.path}`);
		const missing = expected.filter((u) => !locs.includes(u));
		const extra = locs.filter((u) => !expected.includes(u));
		if (!missing.length && !extra.length) ok(`Lista las ${locs.length} páginas esperadas.`);
		if (missing.length) err(`Faltan páginas en el sitemap: ${missing.join(", ")}.`);
		if (extra.length) warn(`El sitemap lista páginas que no están en seo-config.json: ${extra.join(", ")}.`);

		for (const loc of locs) {
			const pathname = loc.startsWith(CONFIG.baseUrl) ? loc.slice(CONFIG.baseUrl.length) || "/" : null;
			if (!pathname) {
				warn(`${loc}: es de otro origen; no se comprueba.`);
				continue;
			}
			const page = await request(pathname, { method: "HEAD" });
			if (page.error) err(`${pathname} no responde (${page.error}).`);
			else if (page.res.status !== 200) err(`${pathname} responde ${page.res.status}.`);
			else ok(`${pathname} responde 200.`);
		}
	}

	/* --- resumen --- */
	console.log(`\nResumen: ${counts.ok} correctos, ${counts.warn} avisos, ${counts.err} errores.`);
	console.log(
		"\nPaso manual pendiente: validar el JSON-LD con el Rich Results Test de Google:\n" +
			`  https://search.google.com/test/rich-results?url=${encodeURIComponent(`${BASE}/`)}\n` +
			"(Esta verificación es estructural y no lo reemplaza.)",
	);
	if (BASE !== CONFIG.baseUrl) {
		console.log(`\nNota: se verificó ${BASE}, pero el JSON-LD y el sitemap declaran ${CONFIG.baseUrl}.`);
	}
	process.exit(counts.err ? 1 : 0);
}

main().catch((error) => {
	console.error(`ERROR inesperado: ${error.message}`);
	process.exit(1);
});
