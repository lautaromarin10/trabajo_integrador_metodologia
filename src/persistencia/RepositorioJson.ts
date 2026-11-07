import fs from "node:fs";
import type { Datos, DatosJson } from "../modelo.js";
import { datosDesdeJson, datosHaciaJson } from "../modelo.js";
import {
  AlmacenamientoDatos,
  ErrorArchivoAusente,
  ErrorJsonInvalido,
} from "./AlmacenamientoDatos.js";

export class RepositorioJson implements AlmacenamientoDatos {
  private ruta: string;

  constructor(ruta: string) {
    this.ruta = ruta;
  }

  configurarRuta(ruta: string): void {
    this.ruta = ruta;
  }

  cargar(): Datos {
    let txt: string;
    try {
      txt = fs.readFileSync(this.ruta, "utf8");
    } catch {
      throw new ErrorArchivoAusente(this.ruta);
    }
    try {
      const crudo = JSON.parse(txt) as DatosJson;
      return datosDesdeJson(crudo);
    } catch (e) {
      if (e instanceof ErrorArchivoAusente) {
        throw e;
      }
      throw new ErrorJsonInvalido(this.ruta);
    }
  }

  guardar(datos: Datos): void {
    const texto = JSON.stringify(datosHaciaJson(datos), null, 2) + "\n";
    fs.writeFileSync(this.ruta, texto, "utf8");
  }
}
