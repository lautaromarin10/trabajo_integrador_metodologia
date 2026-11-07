import type { Datos, Estudiante, Responsable, Solicitud } from "../modelo.js";
import {
  CodigoEstado,
  Prioridad,
  TipoSolicitud,
  esCodigoEstadoValido,
} from "../modelo.js";
import type { RegistrarSolicitudInput } from "../dto/RegistrarSolicitudInput.js";
import { obtenerPlazoSegunTipo } from "../politicas/plazosPorTipo.js";
import type { AlmacenamientoDatos } from "../persistencia/AlmacenamientoDatos.js";
import { FormatoSalida } from "../presentacion/FormatoSalida.js";

function datosVacios(): Datos {
  return {
    estudiantes: [],
    responsables: [],
    estados: [],
    solicitudes: [],
  };
}

export class ServicioSolicitudes {
  private datos: Datos;
  private readonly almacenamiento: AlmacenamientoDatos;
  private readonly formato: FormatoSalida;

  constructor(almacenamiento: AlmacenamientoDatos) {
    this.almacenamiento = almacenamiento;
    this.datos = datosVacios();
    this.formato = new FormatoSalida(() => this.datos);
  }

  intentarCargar(): boolean {
    try {
      this.datos = this.almacenamiento.cargar();
      return true;
    } catch {
      return false;
    }
  }

  private guardar(): void {
    this.almacenamiento.guardar(this.datos);
  }

  plazoSegunTipo(tipo: string): number {
    return obtenerPlazoSegunTipo(tipo);
  }

  private limpiarEntrada(texto: string): string {
    return texto ? texto.trim() : "";
  }

  private esLegajoValido(legajo: string): boolean {
    return Boolean(legajo && legajo.trim() !== "");
  }

  private generarFechaFinal(): string {
    const hoy = new Date();
    const anio = String(hoy.getFullYear());
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return anio + "-" + mes + "-" + dia;
  }

  private fechaConCeros(fechaFinal: string): string {
    const partesFecha = fechaFinal.split("-");
    if (partesFecha.length === 3) {
      const anioNum = Number(partesFecha[0]);
      let mes = partesFecha[1];
      let dia = partesFecha[2];
      if (mes.length === 1) {
        mes = "0" + mes;
      }
      if (dia.length === 1) {
        dia = "0" + dia;
      }
      return String(anioNum) + "-" + mes + "-" + dia;
    }
    return fechaFinal;
  }

  private esFechaValida(fecha: string): boolean {
    const partesFecha = fecha.split("-");
    let anioNum = 0;
    let mesNum = 0;
    let diaNum = 0;
    if (partesFecha.length === 3) {
      anioNum = Number(partesFecha[0]);
      mesNum = Number(partesFecha[1]);
      diaNum = Number(partesFecha[2]);
    }
    if (
      partesFecha.length !== 3 ||
      !anioNum ||
      mesNum < 1 ||
      mesNum > 12 ||
      diaNum < 1 ||
      diaNum > 31
    ) {
      return false;
    }
    if (mesNum === 2 && diaNum > 29) {
      return false;
    }
    if (
      (mesNum === 4 || mesNum === 6 || mesNum === 9 || mesNum === 11) &&
      diaNum > 30
    ) {
      return false;
    }
    return true;
  }

  private estudiantePorLegajo(legajo: string): Estudiante | undefined {
    for (let i = 0; i < this.datos.estudiantes.length; i++) {
      const actual = this.datos.estudiantes[i];
      if (actual.legajo === legajo) {
        return actual;
      }
    }
    return undefined;
  }

  private estudiantePorId(id: number): Estudiante | undefined {
    let encontrado: Estudiante | undefined;
    for (let i = 0; i < this.datos.estudiantes.length; i++) {
      if (this.datos.estudiantes[i].id === id) {
        encontrado = this.datos.estudiantes[i];
      }
    }
    return encontrado;
  }

  private obtenerProximoId(): number {
    let maxId = 0;
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      const actual = this.datos.solicitudes[i];
      if (actual.id > maxId) {
        maxId = actual.id;
      }
    }
    return maxId + 1;
  }

  private nuevaSolicitud(
    id: number,
    estudianteId: number,
    asunto: string,
    detalle: string,
    tipo: string,
    prioridad: number,
    fecha: string,
    obs: string,
  ): Solicitud {
    const nueva: Solicitud = {
      id: 0,
      estudianteId: 0,
      responsableId: null,
      asunto: "",
      detalle: "",
      tipo: "",
      prioridad: 0,
      estado: 0,
      fecha: "",
      obs: "",
    };
    nueva.id = id;
    nueva.estudianteId = estudianteId;
    nueva.responsableId = null;
    nueva.asunto = asunto;
    nueva.detalle = detalle;
    nueva.tipo = tipo;
    nueva.prioridad = prioridad;
    nueva.estado = CodigoEstado.PENDIENTE;
    nueva.fecha = fecha;
    nueva.obs = obs;
    return nueva;
  }

  registrar(input: RegistrarSolicitudInput): void {
    const { legajo, tipo, prioridad, asunto, detalle, obs, fecha } = input;
    const legajoLimpio = this.limpiarEntrada(legajo);
    const tipoLimpio = this.limpiarEntrada(tipo);
    const asuntoLimpio = this.limpiarEntrada(asunto);
    const detalleLimpio = this.limpiarEntrada(detalle);
    const obsLimpia = this.limpiarEntrada(obs);
    let fechaFinal = this.limpiarEntrada(fecha);

    if (!this.esLegajoValido(legajoLimpio)) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }

    if (!fechaFinal) {
      fechaFinal = this.generarFechaFinal();
    }

    fechaFinal = this.fechaConCeros(fechaFinal);
    if (!this.esFechaValida(fechaFinal)) {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
      return;
    }

    const estudiante = this.estudiantePorLegajo(legajoLimpio);

    if (!estudiante) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }

    if (!estudiante.nombre || estudiante.nombre.trim() === "") {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
      return;
    }

    const carrera = estudiante.carrera;
    const email = estudiante.email;
    if (!carrera || carrera.trim() === "" || !email || email.trim() === "") {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
      return;
    }

    const plazo = this.plazoSegunTipo(tipoLimpio);
    const nueva = this.nuevaSolicitud(
      this.obtenerProximoId(),
      estudiante.id,
      asuntoLimpio,
      detalleLimpio,
      tipoLimpio,
      prioridad,
      fechaFinal,
      obsLimpia,
    );

    this.datos.solicitudes.push(nueva);
    this.guardar();

    let mensaje = "Solicitud " + String(nueva.id);
    mensaje = mensaje + " registrada. ";
    mensaje = mensaje + "Plazo estimado: " + String(plazo) + " dias.";
    console.log(mensaje);
    console.log("OK");
  }

  cambiarEstado(idTxt: string, estadoTxt: string, obs: string): void {
    const id = Number(idTxt);
    const codigo = Number(estadoTxt);
    let solicitud: Solicitud | undefined;
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      if (this.datos.solicitudes[i].id === id) {
        solicitud = this.datos.solicitudes[i];
      }
    }
    if (!solicitud) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }
    if (!esCodigoEstadoValido(codigo)) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }
    solicitud.estado = codigo;
    solicitud.obs = obs ? obs : "";
    this.guardar();
    const nombre = this.formato.nombreDe(codigo);
    console.log(
      "Solicitud " + String(solicitud.id) + " actualizada a " + nombre + ".",
    );
    console.log("OK");
  }

  asignar(idTxt: string, respTxt: string): void {
    const id = Number(idTxt);
    const responsableId = Number(respTxt);
    let solicitud: Solicitud | undefined;
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      if (this.datos.solicitudes[i].id === id) {
        solicitud = this.datos.solicitudes[i];
      }
    }
    let responsable: Responsable | undefined;
    for (let i = 0; i < this.datos.responsables.length; i++) {
      if (this.datos.responsables[i].id === responsableId) {
        responsable = this.datos.responsables[i];
      }
    }
    if (!solicitud || !responsable) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }
    solicitud.responsableId = responsable.id;
    this.guardar();
    console.log(
      "Solicitud " +
        String(solicitud.id) +
        " asignada a " +
        responsable.nombre +
        " (" +
        responsable.area +
        ").",
    );
    console.log("OK");
  }

  ver(campo: string, valor: string): void {
    if (campo === "estado") {
      this.buscarPorEstado(Number(valor));
    } else if (campo === "tipo") {
      this.buscarPorTipo(valor);
    } else if (campo === "prioridad") {
      this.buscarPorPrioridad(Number(valor));
    } else {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
    }
  }

  buscarPorEstado(n: number): void {
    const encontradas: Solicitud[] = [];
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      const s = this.datos.solicitudes[i];
      if (s.estado === n) {
        encontradas.push(s);
      }
    }
    this.formato.listar(encontradas);
  }

  buscarPorTipo(tipo: string): void {
    const buscado = tipo ? tipo.trim() : "";
    const encontradas: Solicitud[] = [];
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      const s = this.datos.solicitudes[i];
      if (s.tipo === buscado) {
        encontradas.push(s);
      }
    }
    this.formato.listar(encontradas);
  }

  buscarPorPrioridad(n: number): void {
    const encontradas: Solicitud[] = [];
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      const s = this.datos.solicitudes[i];
      if (s.prioridad === n) {
        encontradas.push(s);
      }
    }
    this.formato.listar(encontradas);
  }

  reporte(): void {
    const lista = this.datos.solicitudes;
    console.log("Total: " + String(lista.length));
    console.log("Por estado:");
    let cPendiente = 0;
    let cEnRevision = 0;
    let cAprobada = 0;
    let cRechazada = 0;
    let cCerrada = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].estado === CodigoEstado.PENDIENTE) {
        cPendiente = cPendiente + 1;
      } else if (lista[i].estado === CodigoEstado.EN_REVISION) {
        cEnRevision = cEnRevision + 1;
      } else if (lista[i].estado === CodigoEstado.APROBADA) {
        cAprobada = cAprobada + 1;
      } else if (lista[i].estado === CodigoEstado.RECHAZADA) {
        cRechazada = cRechazada + 1;
      } else if (lista[i].estado === CodigoEstado.CERRADA) {
        cCerrada = cCerrada + 1;
      }
    }
    console.log(
      "  " +
        this.formato.nombreDe(CodigoEstado.PENDIENTE) +
        ": " +
        String(cPendiente),
    );
    console.log(
      "  " +
        this.formato.nombreDe(CodigoEstado.EN_REVISION) +
        ": " +
        String(cEnRevision),
    );
    console.log(
      "  " +
        this.formato.nombreDe(CodigoEstado.APROBADA) +
        ": " +
        String(cAprobada),
    );
    console.log(
      "  " +
        this.formato.nombreDe(CodigoEstado.RECHAZADA) +
        ": " +
        String(cRechazada),
    );
    console.log(
      "  " +
        this.formato.nombreDe(CodigoEstado.CERRADA) +
        ": " +
        String(cCerrada),
    );

    console.log("Por tipo:");
    let cert = 0;
    let equiv = 0;
    let com = 0;
    let just = 0;
    let mesa = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].tipo === TipoSolicitud.CERT) {
        cert = cert + 1;
      } else if (lista[i].tipo === TipoSolicitud.EQUIV) {
        equiv = equiv + 1;
      } else if (lista[i].tipo === TipoSolicitud.COM) {
        com = com + 1;
      } else if (lista[i].tipo === TipoSolicitud.JUST) {
        just = just + 1;
      } else if (lista[i].tipo === TipoSolicitud.MESA) {
        mesa = mesa + 1;
      }
    }
    console.log("  " + TipoSolicitud.CERT + ": " + String(cert));
    console.log("  " + TipoSolicitud.EQUIV + ": " + String(equiv));
    console.log("  " + TipoSolicitud.COM + ": " + String(com));
    console.log("  " + TipoSolicitud.JUST + ": " + String(just));
    console.log("  " + TipoSolicitud.MESA + ": " + String(mesa));

    const raros: string[] = [];
    for (let i = 0; i < lista.length; i++) {
      const t = lista[i].tipo;
      if (
        t !== TipoSolicitud.CERT &&
        t !== TipoSolicitud.EQUIV &&
        t !== TipoSolicitud.COM &&
        t !== TipoSolicitud.JUST &&
        t !== TipoSolicitud.MESA
      ) {
        if (raros.indexOf(t) === -1) {
          raros.push(t);
        }
      }
    }
    for (let i = 0; i < raros.length; i++) {
      let n = 0;
      for (let j = 0; j < lista.length; j++) {
        if (lista[j].tipo === raros[i]) {
          n = n + 1;
        }
      }
      console.log("  " + raros[i] + ": " + String(n));
    }

    console.log("Por prioridad:");
    let baja = 0;
    let media = 0;
    let alta = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].prioridad === Prioridad.BAJA) {
        baja = baja + 1;
      } else if (lista[i].prioridad === Prioridad.MEDIA) {
        media = media + 1;
      } else if (lista[i].prioridad === Prioridad.ALTA) {
        alta = alta + 1;
      }
    }
    console.log("  baja: " + String(baja));
    console.log("  media: " + String(media));
    console.log("  alta: " + String(alta));

    let sin = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].responsableId === null) {
        sin = sin + 1;
      }
    }
    console.log("Sin responsable: " + String(sin));

    for (let i = 0; i < lista.length; i++) {
      const s = lista[i];
      if (s.responsableId !== null) {
        continue;
      }
      const plazo = this.plazoSegunTipo(s.tipo);
      console.log(
        this.formato.lineaSolicitud(s) +
          " | plazo " +
          String(plazo) +
          " dias",
      );
    }

    console.log("Estudiantes:");
    const vistos: number[] = [];
    for (let i = 0; i < lista.length; i++) {
      const idEst = lista[i].estudianteId;
      if (vistos.indexOf(idEst) !== -1) {
        continue;
      }
      vistos.push(idEst);
      const alumno = this.estudiantePorId(idEst);
      if (!alumno) {
        continue;
      }
      console.log(this.formato.fichaEstudiante(alumno));
    }
    console.log("OK");
  }
}
