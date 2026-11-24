#!/usr/bin/env node
/*
 * ciudad.js
 *
 * Agrega ciudades nuevas a scripts/seo-config.json (y, si hace falta, su país).
 * Es el ÚNICO comando GEO que modifica un archivo del proyecto, y solo después de mostrar
 * exactamente qué va a escribir y de que lo confirmes.
 *
 * Uso (desde la raíz del proyecto):
 *   npm run geo:ciudad                       detecta en ~/Downloads/tickets.json las ciudades
 *                                            que no están en seo-config.json y pregunta los datos
 *   npm run geo:ciudad -- --tickets <ruta>   idem con otro tickets.json
 *   npm run geo:ciudad -- --id <ciudad>      agrega esa ciudad sin leer ningún tickets.json
 *                                            (por ejemplo, cuando Mica avisa antes de mandarlo)
 *
 * Datos que se pueden pasar por opción en lugar de responder las preguntas:
 *   --es <nombre>            nombre de la ciudad en español (obligatorio)
 *   --en <nombre>            nombre en inglés (por defecto, el mismo que en español)
 *   --pais <AR|ES|...>       código del país (si no está en seo-config.json, se pide también
 *                            --pais-es, --pais-en y --moneda)
 *   --zona <zona horaria>    por ejemplo America/Argentina/Buenos_Aires
 *   --nombre-evento <texto>  nombre fijo del evento (defaultName); si no, el sitio usa
 *                            "Fiesta Polenta* en {ciudad}"
 *   --si                     guarda sin preguntar la confirmación
 *   --dry-run                muestra lo que escribiría y no guarda nada
 *
 * Sin --si, pide confirmación; si no hay nadie para responder (stdin cerrado), no guarda.
 * Los casos especiales (region, display) se editan a mano en seo-config.json.
 * Se agrega el texto al final de cada bloque, sin reformatear el resto del archivo.
 * Sin dependencias externas (solo Node).
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { ROOT, optionValue, resolveTicketsPath } = require("./lib");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const AUTO_YES = args.includes("--si");
const CONFIG_PATH = path.join(ROOT, "scripts", "seo-config.json");

/* ---------- entrada por teclado (o por pipe) ---------- */

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: Boolean(process.stdin.isTTY),
});
const queue = [];
let waiter = null;
let closed = false;
rl.on("line", (line) => {
	if (waiter) {
		const w = waiter;
		waiter = null;
		w(line);
	} else queue.push(line);
});
rl.on("close", () => {
	closed = true;
	if (waiter) {
		const w = waiter;
		waiter = null;
		w(null);
	}
});

// Devuelve el texto ingresado o null si no hay nadie que responda.
function ask(question) {
	process.stdout.write(question);
	if (queue.length) return Promise.resolve(queue.shift());
	if (closed) return Promise.resolve(null);
	return new Promise((resolve) => (waiter = resolve));
}

class Aborted extends Error {}

// Pide un dato: usa la opción si vino, si no pregunta. Valida y repite si es inválido.
async function need({ flag, question, defaultValue, validate }) {
	let value = optionValue(args, flag);
	let fromFlag = value !== null;
	for (;;) {
		if (value === null) {
			const answer = await ask(`${question}${defaultValue ? ` [${defaultValue}]` : ""}: `);
			if (answer === null) {
				// Nadie responde: se usa el valor por defecto, si lo hay (se ve en la vista previa).
				if (!defaultValue) throw new Aborted(`falta ${flag} y no hay quién responda.`);
				console.log(`(sin respuesta: se usa ${defaultValue})`);
				value = defaultValue;
			} else value = answer.trim() || defaultValue || "";
		}
		const problem = validate(value);
		if (!problem) return value;
		console.log(`  ✗ ${problem}`);
		if (fromFlag) throw new Aborted(`${flag}: ${problem}`);
		value = null;
	}
}

/* ---------- edición del archivo ---------- */

// Agrega `entryText` al final del bloque `blockKey` (que va justo antes de `nextKey`).
function appendToBlock(text, blockKey, nextKey, entryText) {
	const next = text.indexOf(`"${nextKey}"`);
	if (next === -1) throw new Error(`no se encontró "${nextKey}" en seo-config.json.`);
	const blockClose = text.lastIndexOf("}", next);
	const lastEntryEnd = text.lastIndexOf("}", blockClose - 1);
	if (blockClose === -1 || lastEntryEnd === -1) throw new Error(`no se pudo ubicar el bloque "${blockKey}".`);
	return `${text.slice(0, lastEntryEnd + 1)},\n${entryText}${text.slice(lastEntryEnd + 1)}`;
}

function countryEntryText(code, c) {
	return `\t\t${JSON.stringify(code)}: { "es": ${JSON.stringify(c.es)}, "en": ${JSON.stringify(c.en)}, "currency": ${JSON.stringify(c.currency)} }`;
}

function cityEntryText(id, c) {
	const lines = [
		`\t\t${JSON.stringify(id)}: {`,
		`\t\t\t"es": ${JSON.stringify(c.es)}, "en": ${JSON.stringify(c.en)},`,
		`\t\t\t"country": ${JSON.stringify(c.country)}, "timezone": ${JSON.stringify(c.timezone)}${c.defaultName ? "," : ""}`,
	];
	if (c.defaultName) lines.push(`\t\t\t"defaultName": ${JSON.stringify(c.defaultName)}`);
	lines.push("\t\t}");
	return lines.join("\n");
}

const stable = (v) => JSON.stringify(v);

/* ---------- validaciones de datos ---------- */

const validId = (v) => (/^[a-z0-9-]+$/.test(v) ? null : "el id debe tener solo minúsculas, números y guiones.");
const validText = (v) => (v.trim() ? null : "no puede estar vacío.");
const validCountryCode = (v) => (/^[A-Z]{2}$/.test(v) ? null : "el código de país son 2 letras mayúsculas (por ejemplo AR).");
const validCurrency = (v) => (/^[A-Z]{3}$/.test(v) ? null : "la moneda son 3 letras mayúsculas (por ejemplo ARS).");
function validTimezone(v) {
	if (!/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)+$/.test(v)) return "formato inválido (por ejemplo America/Argentina/Buenos_Aires).";
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: v });
	} catch {
		return "esa zona horaria no existe.";
	}
	return null;
}

/* ---------- alta de una ciudad ---------- */

async function addCity(id) {
	const text = fs.readFileSync(CONFIG_PATH, "utf8");
	const config = JSON.parse(text);

	if (config.cities[id]) {
		console.log(`  ! "${id}" ya está en seo-config.json; no se hace nada.`);
		return false;
	}

	console.log(`\nCiudad nueva: ${id}`);
	const es = await need({ flag: "--es", question: "  Nombre en español", validate: validText });
	const en = await need({ flag: "--en", question: "  Nombre en inglés", defaultValue: es, validate: validText });

	console.log(`  Países cargados: ${Object.keys(config.countries).join(", ")}`);
	const country = await need({ flag: "--pais", question: "  Código de país (2 letras)", validate: validCountryCode });

	let newCountry = null;
	if (!config.countries[country]) {
		console.log(`  El país ${country} no está en seo-config.json; hay que cargarlo también.`);
		newCountry = {
			es: await need({ flag: "--pais-es", question: `  Nombre de ${country} en español`, validate: validText }),
			en: await need({ flag: "--pais-en", question: `  Nombre de ${country} en inglés`, validate: validText }),
			currency: await need({ flag: "--moneda", question: `  Moneda de ${country} (3 letras)`, validate: validCurrency }),
		};
	}

	// Zona horaria sugerida: la única que usan las ciudades ya cargadas de ese país.
	const zones = [...new Set(Object.values(config.cities).filter((c) => c.country === country).map((c) => c.timezone))];
	const timezone = await need({
		flag: "--zona",
		question: "  Zona horaria",
		defaultValue: zones.length === 1 ? zones[0] : undefined,
		validate: validTimezone,
	});

	let defaultName = optionValue(args, "--nombre-evento");
	if (defaultName === null) {
		const answer = await ask("  Nombre fijo del evento (Enter para usar «Fiesta Polenta* en " + es + "»): ");
		defaultName = answer ? answer.trim() : "";
	}

	const city = { es, en, country, timezone, ...(defaultName ? { defaultName } : {}) };

	// Se arma el texto nuevo y se comprueba que el archivo siga siendo JSON y que solo cambie lo agregado.
	let newText = text;
	const expected = JSON.parse(text);
	if (newCountry) {
		newText = appendToBlock(newText, "countries", "cities", countryEntryText(country, newCountry));
		expected.countries[country] = newCountry;
	}
	newText = appendToBlock(newText, "cities", "sitemapPages", cityEntryText(id, city));
	expected.cities[id] = city;

	let reparsed;
	try {
		reparsed = JSON.parse(newText);
	} catch (error) {
		throw new Error(`el resultado no es un JSON válido (${error.message}); no se guarda nada.`);
	}
	if (stable(reparsed) !== stable(expected)) {
		throw new Error("el resultado difiere de lo esperado más allá de lo agregado; no se guarda nada.");
	}

	console.log("\nSe agregaría a scripts/seo-config.json:");
	if (newCountry) console.log(`  en "countries":\n${countryEntryText(country, newCountry)}`);
	console.log(`  en "cities":\n${cityEntryText(id, city)}\n`);

	if (DRY_RUN) {
		console.log("Dry-run: no se guardó nada.");
		return false;
	}

	if (!AUTO_YES) {
		const answer = await ask("¿Guardar en scripts/seo-config.json? (s/N): ");
		if (!answer || !/^s(i|í)?$/i.test(answer.trim())) {
			console.log("No se guardó nada.");
			return false;
		}
	}

	fs.writeFileSync(CONFIG_PATH, newText);
	console.log(`Guardado: "${id}" agregada a scripts/seo-config.json.`);
	return true;
}

/* ---------- ejecución ---------- */

async function main() {
	const explicitId = optionValue(args, "--id");
	let ids;

	if (explicitId !== null) {
		const problem = validId(explicitId);
		if (problem) throw new Aborted(`--id: ${problem}`);
		ids = [explicitId];
	} else {
		const ticketsPath = resolveTicketsPath(args, "geo:ciudad");
		let tickets;
		try {
			tickets = JSON.parse(fs.readFileSync(ticketsPath, "utf8"));
		} catch (error) {
			throw new Aborted(`no se pudo leer ${ticketsPath}: ${error.message}`);
		}
		if (!Array.isArray(tickets)) throw new Aborted("el tickets.json debe ser una lista.");
		const known = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")).cities;
		const found = [];
		for (const t of tickets) {
			const city = t && t.city;
			if (typeof city !== "string" || known[city] || found.includes(city)) continue;
			if (validId(city)) console.log(`  ! Se omite la ciudad "${city}": ${validId(city)}`);
			else found.push(city);
		}
		console.log(`Revisado ${ticketsPath}`);
		if (!found.length) {
			console.log("No hay ciudades nuevas: todas están en seo-config.json.");
			return;
		}
		console.log(`Ciudades que faltan en seo-config.json: ${found.join(", ")}`);
		ids = found;
	}

	let saved = 0;
	for (const id of ids) {
		if (await addCity(id)) saved++;
	}

	console.log(
		saved
			? `\nListo: ${saved} ciudad(es) agregada(s). scripts/seo-config.json quedó modificado (sin commitear).\nSiguiente: npm run geo:validar`
			: "\nNo se modificó ningún archivo.",
	);
}

main()
	.catch((error) => {
		console.error(`\nERROR: ${error.message}${error instanceof Aborted ? " No se guardó nada." : ""}`);
		process.exitCode = 1;
	})
	.finally(() => rl.close());
