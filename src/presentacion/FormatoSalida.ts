import type { Datos, Estudiante, Solicitud } from "../modelo.js";
import { Prioridad } from "../modelo.js";

/** Formateo de salida. fichaEstudiante solo depende de Estudiante (Move Method). */
export class FormatoSalida {
  constructor(private readonly obtenerDatos: () => Datos) {}

  fichaEstudiante(e: Estudiante): string {
    return e.legajo + " | " + e.nombre + " | " + e.carrera + " | " + e.email;
  }

  nombreDe(codigo: number): string {
    const datos = this.obtenerDatos();
    for (let i = 0; i < datos.estados.length; i++) {
      if (datos.estados[i].codigo === codigo) {
        return datos.estados[i].nombre;
      }
    }
    return String(codigo);
  }

  private textoPrioridad(prioridad: number): string {
    if (prioridad === Prioridad.BAJA) {
      return "baja";
    } else if (prioridad === Prioridad.MEDIA) {
      return "media";
    } else if (prioridad === Prioridad.ALTA) {
      return "alta";
    } else {
      return String(prioridad);
    }
  }

  private nombreEstado(codigo: number): string {
    const datos = this.obtenerDatos();
    let nombreEstado = "";
    for (let j = 0; j < datos.estados.length; j++) {
      if (datos.estados[j].codigo === codigo) {
        nombreEstado = datos.estados[j].nombre;
      }
    }
    return nombreEstado;
  }

  private estudiantePorId(id: number): Estudiante | undefined {
    const datos = this.obtenerDatos();
    let encontrado: Estudiante | undefined;
    for (let i = 0; i < datos.estudiantes.length; i++) {
      if (datos.estudiantes[i].id === id) {
        encontrado = datos.estudiantes[i];
      }
    }
    return encontrado;
  }

  private legajoDe(estudianteId: number): string {
    const estudiante = this.estudiantePorId(estudianteId);
    if (!estudiante) {
      return "";
    }
    return estudiante.legajo;
  }

  private nombreResponsable(responsableId: number | null): string {
    const datos = this.obtenerDatos();
    let respTxt = "(sin asignar)";
    if (responsableId !== null) {
      for (let j = 0; j < datos.responsables.length; j++) {
        if (datos.responsables[j].id === responsableId) {
          respTxt = datos.responsables[j].nombre;
        }
      }
    }
    return respTxt;
  }

  lineaSolicitud(s: Solicitud): string {
    return (
      String(s.id) +
      " | " +
      s.fecha +
      " | " +
      this.nombreEstado(s.estado) +
      " | " +
      s.tipo +
      " | " +
      this.textoPrioridad(s.prioridad) +
      " | " +
      this.legajoDe(s.estudianteId) +
      " | " +
      s.asunto +
      " | " +
      this.nombreResponsable(s.responsableId)
    );
  }

  listar(encontradas: Solicitud[]): void {
    if (encontradas.length === 0) {
      console.log("Sin resultados");
      console.log("OK");
      return;
    }
    console.log(
      "ID | FECHA | ESTADO | TIPO | PRIO | LEGAJO | ASUNTO | RESPONSABLE",
    );
    for (let i = 0; i < encontradas.length; i++) {
      console.log(this.lineaSolicitud(encontradas[i]));
    }
    console.log("OK");
  }
}
