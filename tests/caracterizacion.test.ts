import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tsx = path.join(root, "node_modules", ".bin", "tsx");
const fixture = path.join(root, "tests", "fixture", "datos.json");
const datosDefault = path.join(root, "datos.json");

function copiaTemporal(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "solicitudes-"));
  const archivo = path.join(dir, "datos.json");
  fs.copyFileSync(fixture, archivo);
  return archivo;
}

function correr(args: string[]) {
  return spawnSync(tsx, ["src/index.ts", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

const ayuda =
  [
    "Gestión de solicitudes académicas",
    "1) Registrar solicitud",
    "2) Cambiar estado",
    "3) Asignar responsable",
    "4) Buscar",
    "5) Reporte",
    "0) Salir",
  ].join("\n") + "\n";

const encabezado =
  "ID | FECHA | ESTADO | TIPO | PRIO | LEGAJO | ASUNTO | RESPONSABLE";

test("sin comando muestra la ayuda y no toca el JSON", () => {
  const antes = fs.readFileSync(datosDefault, "utf8");
  const res = correr([]);
  assert.equal(res.status, 0);
  assert.equal(res.stdout, ayuda);
  assert.equal(fs.readFileSync(datosDefault, "utf8"), antes);
});

test("registra una solicitud valida", () => {
  const archivo = copiaTemporal();
  const antes = JSON.parse(fs.readFileSync(archivo, "utf8"));
  const res = correr([
    "--datos",
    archivo,
    "registrar",
    "--legajo",
    "45210",
    "--tipo",
    "CERT",
    "--prioridad",
    "2",
    "--asunto",
    "Certificado de alumno regular",
    "--detalle",
    "Lo pide para una beca",
    "--fecha",
    "2026-04-01",
    "--obs",
    "",
  ]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    "Solicitud 5 registrada. Plazo estimado: 5 dias.\nOK\n",
  );
  const despues = JSON.parse(fs.readFileSync(archivo, "utf8"));
  assert.equal(despues.solicitudes.length, 5);
  assert.deepEqual(despues.solicitudes[4], {
    id: 5,
    estId: 1,
    respId: null,
    asunto: "Certificado de alumno regular",
    detalle: "Lo pide para una beca",
    tipo: "CERT",
    prio: 2,
    est: 1,
    fecha: "2026-04-01",
    obs: "",
  });
  assert.deepEqual(despues.solicitudes.slice(0, 4), antes.solicitudes);
  assert.deepEqual(despues.estudiantes, antes.estudiantes);
  assert.deepEqual(despues.responsables, antes.responsables);
  assert.deepEqual(despues.estados, antes.estados);
});

test("el alta de una equivalencia informa 20 dias", () => {
  const archivo = copiaTemporal();
  const res = correr([
    "--datos",
    archivo,
    "registrar",
    "--legajo",
    "45102",
    "--tipo",
    "EQUIV",
    "--prioridad",
    "3",
    "--asunto",
    "Equivalencia de Química",
    "--detalle",
    "Materia cursada en otra facultad",
    "--fecha",
    "2026-04-02",
    "--obs",
    "",
  ]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    "Solicitud 5 registrada. Plazo estimado: 20 dias.\nOK\n",
  );
  const despues = JSON.parse(fs.readFileSync(archivo, "utf8"));
  assert.equal(despues.solicitudes[4].tipo, "EQUIV");
  assert.equal(despues.solicitudes[4].estId, 2);
});

test("un legajo inexistente no modifica el archivo", () => {
  const archivo = copiaTemporal();
  const antes = fs.readFileSync(archivo, "utf8");
  const res = correr([
    "--datos",
    archivo,
    "registrar",
    "--legajo",
    "99999",
    "--tipo",
    "CERT",
    "--prioridad",
    "2",
    "--asunto",
    "Algo",
    "--detalle",
    "Nada",
    "--fecha",
    "2026-04-01",
    "--obs",
    "",
  ]);
  assert.equal(res.status, 1);
  assert.equal(res.stdout, "ERROR: no encontrado\n");
  assert.equal(fs.readFileSync(archivo, "utf8"), antes);
});

test("cambia el estado y la observacion", () => {
  const archivo = copiaTemporal();
  const res = correr([
    "--datos",
    archivo,
    "estado",
    "--id",
    "1",
    "--estado",
    "2",
    "--obs",
    "Pasa a revision",
  ]);
  assert.equal(res.status, 0);
  assert.equal(res.stdout, "Solicitud 1 actualizada a En revision.\nOK\n");
  const despues = JSON.parse(fs.readFileSync(archivo, "utf8"));
  assert.equal(despues.solicitudes[0].est, 2);
  assert.equal(despues.solicitudes[0].obs, "Pasa a revision");
  assert.equal(despues.solicitudes[0].asunto, "Certificado de alumno regular");
  assert.equal(despues.solicitudes[0].respId, null);
});

test("permite volver una solicitud cerrada a pendiente", () => {
  const archivo = copiaTemporal();
  const datos = JSON.parse(fs.readFileSync(archivo, "utf8"));
  datos.solicitudes[0].est = 5;
  fs.writeFileSync(archivo, JSON.stringify(datos, null, 2) + "\n");
  const res = correr([
    "--datos",
    archivo,
    "estado",
    "--id",
    "1",
    "--estado",
    "1",
    "--obs",
    "Se reabre",
  ]);
  assert.equal(res.status, 0);
  assert.equal(res.stdout, "Solicitud 1 actualizada a Pendiente.\nOK\n");
  const despues = JSON.parse(fs.readFileSync(archivo, "utf8"));
  assert.equal(despues.solicitudes[0].est, 1);
});

test("un id inexistente no modifica el archivo", () => {
  const archivo = copiaTemporal();
  const antes = fs.readFileSync(archivo, "utf8");
  const res = correr([
    "--datos",
    archivo,
    "estado",
    "--id",
    "99",
    "--estado",
    "2",
    "--obs",
    "nada",
  ]);
  assert.equal(res.status, 1);
  assert.equal(res.stdout, "ERROR: no encontrado\n");
  assert.equal(fs.readFileSync(archivo, "utf8"), antes);
});

test("asigna un responsable existente", () => {
  const archivo = copiaTemporal();
  const res = correr([
    "--datos",
    archivo,
    "asignar",
    "--id",
    "1",
    "--responsable",
    "1",
  ]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    "Solicitud 1 asignada a Carla Méndez (Alumnado).\nOK\n",
  );
  const despues = JSON.parse(fs.readFileSync(archivo, "utf8"));
  assert.equal(despues.solicitudes[0].respId, 1);
});

test("un responsable inexistente deja la solicitud sin asignar", () => {
  const archivo = copiaTemporal();
  const antes = fs.readFileSync(archivo, "utf8");
  const res = correr([
    "--datos",
    archivo,
    "asignar",
    "--id",
    "1",
    "--responsable",
    "99",
  ]);
  assert.equal(res.status, 1);
  assert.equal(res.stdout, "ERROR: no encontrado\n");
  assert.equal(fs.readFileSync(archivo, "utf8"), antes);
  const despues = JSON.parse(fs.readFileSync(archivo, "utf8"));
  assert.equal(despues.solicitudes[0].respId, null);
});

test("busca por estado", () => {
  const archivo = copiaTemporal();
  const res = correr(["--datos", archivo, "buscar", "--estado", "1"]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    [
      encabezado,
      "1 | 2026-03-02 | Pendiente | CERT | media | 45210 | Certificado de alumno regular | (sin asignar)",
      "4 | 2026-04-01 | Pendiente | JUST | media | 45210 | Justificación de inasistencia | (sin asignar)",
      "OK",
      "",
    ].join("\n"),
  );
});

test("busca por tipo", () => {
  const archivo = copiaTemporal();
  const res = correr(["--datos", archivo, "buscar", "--tipo", "EQUIV"]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    [
      encabezado,
      "2 | 2026-03-10 | En revision | EQUIV | alta | 45102 | Equivalencia de Análisis | Carla Méndez",
      "OK",
      "",
    ].join("\n"),
  );
});

test("busca por prioridad", () => {
  const archivo = copiaTemporal();
  const res = correr(["--datos", archivo, "buscar", "--prioridad", "3"]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    [
      encabezado,
      "2 | 2026-03-10 | En revision | EQUIV | alta | 45102 | Equivalencia de Análisis | Carla Méndez",
      "OK",
      "",
    ].join("\n"),
  );
});

test("una busqueda sin coincidencias no falla", () => {
  const archivo = copiaTemporal();
  const antes = fs.readFileSync(archivo, "utf8");
  const res = correr(["--datos", archivo, "buscar", "--tipo", "MESA"]);
  assert.equal(res.status, 0);
  assert.equal(res.stdout, "Sin resultados\nOK\n");
  assert.equal(fs.readFileSync(archivo, "utf8"), antes);
});

test("el reporte cuenta estados, tipos, prioridades y responsables", () => {
  const archivo = copiaTemporal();
  const res = correr(["--datos", archivo, "reporte"]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    [
      "Total: 4",
      "Por estado:",
      "  Pendiente: 2",
      "  En revision: 1",
      "  Aprobada: 1",
      "  Rechazada: 0",
      "  Cerrada: 0",
      "Por tipo:",
      "  CERT: 1",
      "  EQUIV: 1",
      "  COM: 1",
      "  JUST: 1",
      "  MESA: 0",
      "Por prioridad:",
      "  baja: 1",
      "  media: 2",
      "  alta: 1",
      "Sin responsable: 2",
      "1 | 2026-03-02 | Pendiente | CERT | media | 45210 | Certificado de alumno regular | (sin asignar) | plazo 5 dias",
      "4 | 2026-04-01 | Pendiente | JUST | media | 45210 | Justificación de inasistencia | (sin asignar) | plazo 3 dias",
      "Estudiantes:",
      "45210 | Lucía Benítez | Ingeniería en Sistemas | lucia.benitez@estudiantes.utn.example",
      "45102 | Mateo Ruiz | Ingeniería Electrónica | mateo.ruiz@estudiantes.utn.example",
      "46018 | Ana Gómez | Ingeniería Química | ana.gomez@estudiantes.utn.example",
      "OK",
      "",
    ].join("\n"),
  );
});

test("una solicitud registrada se ve en la busqueda siguiente", () => {
  const archivo = copiaTemporal();
  const alta = correr([
    "--datos",
    archivo,
    "registrar",
    "--legajo",
    "45210",
    "--tipo",
    "CERT",
    "--prioridad",
    "2",
    "--asunto",
    "Constancia de titulo en tramite",
    "--detalle",
    "Para el trabajo",
    "--fecha",
    "2026-05-01",
    "--obs",
    "",
  ]);
  assert.equal(alta.status, 0);
  const res = correr(["--datos", archivo, "buscar", "--estado", "1"]);
  assert.equal(res.status, 0);
  assert.equal(
    res.stdout,
    [
      encabezado,
      "1 | 2026-03-02 | Pendiente | CERT | media | 45210 | Certificado de alumno regular | (sin asignar)",
      "4 | 2026-04-01 | Pendiente | JUST | media | 45210 | Justificación de inasistencia | (sin asignar)",
      "5 | 2026-05-01 | Pendiente | CERT | media | 45210 | Constancia de titulo en tramite | (sin asignar)",
      "OK",
      "",
    ].join("\n"),
  );
});

test("un archivo inexistente responde con el mismo error generico", () => {
  const archivo = path.join(
    os.tmpdir(),
    "solicitudes-no-existe-" + String(process.pid) + ".json",
  );
  if (fs.existsSync(archivo)) {
    fs.unlinkSync(archivo);
  }
  const res = correr(["--datos", archivo, "reporte"]);
  assert.equal(res.status, 1);
  assert.equal(res.stdout, "ERROR: no se pudo leer el archivo\n");
});

test("un JSON invalido responde igual que un archivo ausente", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "solicitudes-roto-"));
  const archivo = path.join(dir, "datos.json");
  fs.writeFileSync(archivo, "esto no es json", "utf8");
  const res = correr(["--datos", archivo, "reporte"]);
  assert.equal(res.status, 1);
  assert.equal(res.stdout, "ERROR: no se pudo leer el archivo\n");
});
