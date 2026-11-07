import type { Datos } from "../modelo.js";

export interface AlmacenamientoDatos {
  cargar(): Datos;
  guardar(datos: Datos): void;
}

export class ErrorArchivoAusente extends Error {
  constructor(ruta: string) {
    super("No se pudo leer el archivo: " + ruta);
    this.name = "ErrorArchivoAusente";
  }
}

export class ErrorJsonInvalido extends Error {
  constructor(ruta: string) {
    super("JSON inválido en: " + ruta);
    this.name = "ErrorJsonInvalido";
  }
}
