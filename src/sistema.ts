import fs from "node:fs";
import readline from "node:readline";
import type { Datos, Estudiante, Responsable, Solicitud } from "./modelo.js";

export class Sistema {
  ruta: string;
  datos: Datos;

  constructor(ruta: string) {
    this.ruta = ruta;
    this.datos = {
      estudiantes: [],
      responsables: [],
      estados: [],
      solicitudes: [],
    };
  }

  cargar(): boolean {
    try {
      const txt = fs.readFileSync(this.ruta, "utf8");
      this.datos = JSON.parse(txt) as Datos;
      return true;
    } catch (e) {
      return false;
    }
  }

  dump(): void {
    const texto = JSON.stringify(this.datos, null, 2) + "\n";
    fs.writeFileSync(this.ruta, texto, "utf8");
  }

  plazoSegunTipo(tipo: string): number {
    switch (tipo) {
      case "CERT":
        return 5;
      case "EQUIV":
        return 20;
      case "COM":
        return 7;
      case "JUST":
        return 3;
      case "MESA":
        return 10;
      default:
        return 15;
    }
  }

  fichaEstudiante(e: Estudiante): string {
    return e.legajo + " | " + e.nombre + " | " + e.carrera + " | " + e.email;
  }

  nombreDe(codigo: number): string {
    for (let i = 0; i < this.datos.estados.length; i++) {
      if (this.datos.estados[i].codigo === codigo) {
        return this.datos.estados[i].nombre;
      }
    }
    return String(codigo);
  }

  registrar(
    legajo: string,
    tipo: string,
    prio: number,
    asunto: string,
    detalle: string,
    obs: string,
    fecha: string,
  ): void {
    const legajoLimpio = legajo ? legajo.trim() : "";
    const tipoLimpio = tipo ? tipo.trim() : "";
    const asuntoLimpio = asunto ? asunto.trim() : "";
    const detalleLimpio = detalle ? detalle.trim() : "";
    const obsLimpia = obs ? obs.trim() : "";
    let fechaFinal = fecha ? fecha.trim() : "";

    if (!legajoLimpio) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }

    if (!fechaFinal) {
      const hoy = new Date();
      const anio = String(hoy.getFullYear());
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      fechaFinal = anio + "-" + mes + "-" + dia;
    }

    const partesFecha = fechaFinal.split("-");
    let anioNum = 0;
    let mesNum = 0;
    let diaNum = 0;
    if (partesFecha.length === 3) {
      anioNum = Number(partesFecha[0]);
      mesNum = Number(partesFecha[1]);
      diaNum = Number(partesFecha[2]);
      let mes = partesFecha[1];
      let dia = partesFecha[2];
      if (mes.length === 1) {
        mes = "0" + mes;
      }
      if (dia.length === 1) {
        dia = "0" + dia;
      }
      fechaFinal = String(anioNum) + "-" + mes + "-" + dia;
    }

    if (
      partesFecha.length !== 3 ||
      !anioNum ||
      mesNum < 1 ||
      mesNum > 12 ||
      diaNum < 1 ||
      diaNum > 31
    ) {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
      return;
    }
    if (mesNum === 2 && diaNum > 29) {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
      return;
    }
    if (
      (mesNum === 4 || mesNum === 6 || mesNum === 9 || mesNum === 11) &&
      diaNum > 30
    ) {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
      return;
    }

    let estudiante: Estudiante | undefined;
    for (let i = 0; i < this.datos.estudiantes.length; i++) {
      const actual = this.datos.estudiantes[i];
      if (actual.legajo === legajoLimpio) {
        estudiante = actual;
        break;
      }
    }

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

    let maxId = 0;
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      const actual = this.datos.solicitudes[i];
      if (actual.id > maxId) {
        maxId = actual.id;
      }
    }
    const nuevoId = maxId + 1;

    const nueva: Solicitud = {
      id: 0,
      estId: 0,
      respId: null,
      asunto: "",
      detalle: "",
      tipo: "",
      prio: 0,
      est: 0,
      fecha: "",
      obs: "",
    };
    nueva.id = nuevoId;
    nueva.estId = estudiante.id;
    nueva.respId = null;
    nueva.asunto = asuntoLimpio;
    nueva.detalle = detalleLimpio;
    nueva.tipo = tipoLimpio;
    nueva.prio = prio;
    nueva.est = 1;
    nueva.fecha = fechaFinal;
    nueva.obs = obsLimpia;

    this.datos.solicitudes.push(nueva);
    this.dump();

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
    if (
      codigo !== 1 &&
      codigo !== 2 &&
      codigo !== 3 &&
      codigo !== 4 &&
      codigo !== 5
    ) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }
    solicitud.est = codigo;
    solicitud.obs = obs ? obs : "";
    this.dump();
    const nombre = this.nombreDe(codigo);
    console.log(
      "Solicitud " + String(solicitud.id) + " actualizada a " + nombre + ".",
    );
    console.log("OK");
  }

  asignar(idTxt: string, respTxt: string): void {
    const id = Number(idTxt);
    const respId = Number(respTxt);
    let solicitud: Solicitud | undefined;
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      if (this.datos.solicitudes[i].id === id) {
        solicitud = this.datos.solicitudes[i];
      }
    }
    let responsable: Responsable | undefined;
    for (let i = 0; i < this.datos.responsables.length; i++) {
      if (this.datos.responsables[i].id === respId) {
        responsable = this.datos.responsables[i];
      }
    }
    if (!solicitud || !responsable) {
      console.log("ERROR: no encontrado");
      process.exitCode = 1;
      return;
    }
    solicitud.respId = responsable.id;
    this.dump();
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
      if (s.est === n) {
        encontradas.push(s);
      }
    }
    if (encontradas.length === 0) {
      console.log("Sin resultados");
      console.log("OK");
      return;
    }
    console.log(
      "ID | FECHA | ESTADO | TIPO | PRIO | LEGAJO | ASUNTO | RESPONSABLE",
    );
    for (let i = 0; i < encontradas.length; i++) {
      const s = encontradas[i];
      let prioTxt = "";
      if (s.prio === 1) {
        prioTxt = "baja";
      } else if (s.prio === 2) {
        prioTxt = "media";
      } else if (s.prio === 3) {
        prioTxt = "alta";
      } else {
        prioTxt = String(s.prio);
      }
      let nombreEstado = "";
      for (let j = 0; j < this.datos.estados.length; j++) {
        if (this.datos.estados[j].codigo === s.est) {
          nombreEstado = this.datos.estados[j].nombre;
        }
      }
      let legajo = "";
      for (let j = 0; j < this.datos.estudiantes.length; j++) {
        if (this.datos.estudiantes[j].id === s.estId) {
          legajo = this.datos.estudiantes[j].legajo;
        }
      }
      let respTxt = "(sin asignar)";
      if (s.respId !== null) {
        for (let j = 0; j < this.datos.responsables.length; j++) {
          if (this.datos.responsables[j].id === s.respId) {
            respTxt = this.datos.responsables[j].nombre;
          }
        }
      }
      console.log(
        String(s.id) +
          " | " +
          s.fecha +
          " | " +
          nombreEstado +
          " | " +
          s.tipo +
          " | " +
          prioTxt +
          " | " +
          legajo +
          " | " +
          s.asunto +
          " | " +
          respTxt,
      );
    }
    console.log("OK");
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
    if (encontradas.length === 0) {
      console.log("Sin resultados");
      console.log("OK");
      return;
    }
    console.log(
      "ID | FECHA | ESTADO | TIPO | PRIO | LEGAJO | ASUNTO | RESPONSABLE",
    );
    for (let i = 0; i < encontradas.length; i++) {
      const s = encontradas[i];
      let prioTxt = "";
      if (s.prio === 1) {
        prioTxt = "baja";
      } else if (s.prio === 2) {
        prioTxt = "media";
      } else if (s.prio === 3) {
        prioTxt = "alta";
      } else {
        prioTxt = String(s.prio);
      }
      let nombreEstado = "";
      for (let j = 0; j < this.datos.estados.length; j++) {
        if (this.datos.estados[j].codigo === s.est) {
          nombreEstado = this.datos.estados[j].nombre;
        }
      }
      let legajo = "";
      for (let j = 0; j < this.datos.estudiantes.length; j++) {
        if (this.datos.estudiantes[j].id === s.estId) {
          legajo = this.datos.estudiantes[j].legajo;
        }
      }
      let respTxt = "(sin asignar)";
      if (s.respId !== null) {
        for (let j = 0; j < this.datos.responsables.length; j++) {
          if (this.datos.responsables[j].id === s.respId) {
            respTxt = this.datos.responsables[j].nombre;
          }
        }
      }
      console.log(
        String(s.id) +
          " | " +
          s.fecha +
          " | " +
          nombreEstado +
          " | " +
          s.tipo +
          " | " +
          prioTxt +
          " | " +
          legajo +
          " | " +
          s.asunto +
          " | " +
          respTxt,
      );
    }
    console.log("OK");
  }

  buscarPorPrioridad(n: number): void {
    const encontradas: Solicitud[] = [];
    for (let i = 0; i < this.datos.solicitudes.length; i++) {
      const s = this.datos.solicitudes[i];
      if (s.prio === n) {
        encontradas.push(s);
      }
    }
    if (encontradas.length === 0) {
      console.log("Sin resultados");
      console.log("OK");
      return;
    }
    console.log(
      "ID | FECHA | ESTADO | TIPO | PRIO | LEGAJO | ASUNTO | RESPONSABLE",
    );
    for (let i = 0; i < encontradas.length; i++) {
      const s = encontradas[i];
      let prioTxt = "";
      if (s.prio === 1) {
        prioTxt = "baja";
      } else if (s.prio === 2) {
        prioTxt = "media";
      } else if (s.prio === 3) {
        prioTxt = "alta";
      } else {
        prioTxt = String(s.prio);
      }
      let nombreEstado = "";
      for (let j = 0; j < this.datos.estados.length; j++) {
        if (this.datos.estados[j].codigo === s.est) {
          nombreEstado = this.datos.estados[j].nombre;
        }
      }
      let legajo = "";
      for (let j = 0; j < this.datos.estudiantes.length; j++) {
        if (this.datos.estudiantes[j].id === s.estId) {
          legajo = this.datos.estudiantes[j].legajo;
        }
      }
      let respTxt = "(sin asignar)";
      if (s.respId !== null) {
        for (let j = 0; j < this.datos.responsables.length; j++) {
          if (this.datos.responsables[j].id === s.respId) {
            respTxt = this.datos.responsables[j].nombre;
          }
        }
      }
      console.log(
        String(s.id) +
          " | " +
          s.fecha +
          " | " +
          nombreEstado +
          " | " +
          s.tipo +
          " | " +
          prioTxt +
          " | " +
          legajo +
          " | " +
          s.asunto +
          " | " +
          respTxt,
      );
    }
    console.log("OK");
  }

  reporte(): void {
    const lista = this.datos.solicitudes;
    console.log("Total: " + String(lista.length));
    console.log("Por estado:");
    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    let c4 = 0;
    let c5 = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].est === 1) {
        c1 = c1 + 1;
      } else if (lista[i].est === 2) {
        c2 = c2 + 1;
      } else if (lista[i].est === 3) {
        c3 = c3 + 1;
      } else if (lista[i].est === 4) {
        c4 = c4 + 1;
      } else if (lista[i].est === 5) {
        c5 = c5 + 1;
      }
    }
    console.log("  " + this.nombreDe(1) + ": " + String(c1));
    console.log("  " + this.nombreDe(2) + ": " + String(c2));
    console.log("  " + this.nombreDe(3) + ": " + String(c3));
    console.log("  " + this.nombreDe(4) + ": " + String(c4));
    console.log("  " + this.nombreDe(5) + ": " + String(c5));

    console.log("Por tipo:");
    let cert = 0;
    let equiv = 0;
    let com = 0;
    let just = 0;
    let mesa = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].tipo === "CERT") {
        cert = cert + 1;
      } else if (lista[i].tipo === "EQUIV") {
        equiv = equiv + 1;
      } else if (lista[i].tipo === "COM") {
        com = com + 1;
      } else if (lista[i].tipo === "JUST") {
        just = just + 1;
      } else if (lista[i].tipo === "MESA") {
        mesa = mesa + 1;
      }
    }
    console.log("  CERT: " + String(cert));
    console.log("  EQUIV: " + String(equiv));
    console.log("  COM: " + String(com));
    console.log("  JUST: " + String(just));
    console.log("  MESA: " + String(mesa));

    const raros: string[] = [];
    for (let i = 0; i < lista.length; i++) {
      const t = lista[i].tipo;
      if (
        t !== "CERT" &&
        t !== "EQUIV" &&
        t !== "COM" &&
        t !== "JUST" &&
        t !== "MESA"
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
      if (lista[i].prio === 1) {
        baja = baja + 1;
      } else if (lista[i].prio === 2) {
        media = media + 1;
      } else if (lista[i].prio === 3) {
        alta = alta + 1;
      }
    }
    console.log("  baja: " + String(baja));
    console.log("  media: " + String(media));
    console.log("  alta: " + String(alta));

    let sin = 0;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].respId === null) {
        sin = sin + 1;
      }
    }
    console.log("Sin responsable: " + String(sin));

    for (let i = 0; i < lista.length; i++) {
      const s = lista[i];
      if (s.respId !== null) {
        continue;
      }
      let prioTxt = "";
      if (s.prio === 1) {
        prioTxt = "baja";
      } else if (s.prio === 2) {
        prioTxt = "media";
      } else if (s.prio === 3) {
        prioTxt = "alta";
      } else {
        prioTxt = String(s.prio);
      }
      let nombreEstado = "";
      for (let j = 0; j < this.datos.estados.length; j++) {
        if (this.datos.estados[j].codigo === s.est) {
          nombreEstado = this.datos.estados[j].nombre;
        }
      }
      let legajo = "";
      for (let j = 0; j < this.datos.estudiantes.length; j++) {
        if (this.datos.estudiantes[j].id === s.estId) {
          legajo = this.datos.estudiantes[j].legajo;
        }
      }
      let respTxt = "(sin asignar)";
      if (s.respId !== null) {
        for (let j = 0; j < this.datos.responsables.length; j++) {
          if (this.datos.responsables[j].id === s.respId) {
            respTxt = this.datos.responsables[j].nombre;
          }
        }
      }
      const plazo = this.plazoSegunTipo(s.tipo);
      console.log(
        String(s.id) +
          " | " +
          s.fecha +
          " | " +
          nombreEstado +
          " | " +
          s.tipo +
          " | " +
          prioTxt +
          " | " +
          legajo +
          " | " +
          s.asunto +
          " | " +
          respTxt +
          " | plazo " +
          String(plazo) +
          " dias",
      );
    }

    console.log("Estudiantes:");
    const vistos: number[] = [];
    for (let i = 0; i < lista.length; i++) {
      const idEst = lista[i].estId;
      if (vistos.indexOf(idEst) !== -1) {
        continue;
      }
      vistos.push(idEst);
      let alumno: Estudiante | undefined;
      for (let j = 0; j < this.datos.estudiantes.length; j++) {
        if (this.datos.estudiantes[j].id === idEst) {
          alumno = this.datos.estudiantes[j];
        }
      }
      if (!alumno) {
        continue;
      }
      console.log(this.fichaEstudiante(alumno));
    }
    console.log("OK");
  }

  mostrarAyuda(): void {
    console.log("Gestión de solicitudes académicas");
    console.log("1) Registrar solicitud");
    console.log("2) Cambiar estado");
    console.log("3) Asignar responsable");
    console.log("4) Buscar");
    console.log("5) Reporte");
    console.log("0) Salir");
  }

  tomar(args: string[], flag: string): string {
    const i = args.indexOf(flag);
    if (i < 0 || i + 1 >= args.length) {
      return "";
    }
    return args[i + 1];
  }

  hayComando(argv: string[]): boolean {
    const args = [...argv];
    const i = args.indexOf("--datos");
    if (i >= 0) {
      args.splice(i, 2);
    }
    return args.length > 0 && !args[0].startsWith("--");
  }

  proc(argv: string[]): void {
    const args = [...argv];
    const i = args.indexOf("--datos");
    if (i >= 0) {
      if (args[i + 1]) {
        this.ruta = args[i + 1];
      }
      args.splice(i, 2);
    }
    const cmd = args[0];
    if (!cmd) {
      this.mostrarAyuda();
      return;
    }
    try {
      const leyo = this.cargar();
      if (!leyo) {
        console.log("ERROR: no se pudo leer el archivo");
        process.exitCode = 1;
        return;
      }
      if (cmd === "registrar") {
        const legajo = this.tomar(args, "--legajo");
        const tipo = this.tomar(args, "--tipo");
        const prio = Number(this.tomar(args, "--prioridad"));
        const asunto = this.tomar(args, "--asunto");
        const detalle = this.tomar(args, "--detalle");
        const obs = this.tomar(args, "--obs");
        const fecha = this.tomar(args, "--fecha");
        this.registrar(legajo, tipo, prio, asunto, detalle, obs, fecha);
      } else if (cmd === "estado") {
        this.cambiarEstado(
          this.tomar(args, "--id"),
          this.tomar(args, "--estado"),
          this.tomar(args, "--obs"),
        );
      } else if (cmd === "asignar") {
        this.asignar(
          this.tomar(args, "--id"),
          this.tomar(args, "--responsable"),
        );
      } else if (cmd === "buscar") {
        if (args.indexOf("--estado") >= 0) {
          this.ver("estado", this.tomar(args, "--estado"));
        } else if (args.indexOf("--tipo") >= 0) {
          this.ver("tipo", this.tomar(args, "--tipo"));
        } else if (args.indexOf("--prioridad") >= 0) {
          this.ver("prioridad", this.tomar(args, "--prioridad"));
        } else {
          console.log("ERROR: no se pudo completar la operacion");
          process.exitCode = 1;
        }
      } else if (cmd === "reporte") {
        this.reporte();
      } else {
        console.log("ERROR: no se pudo completar la operacion");
        process.exitCode = 1;
      }
    } catch (e) {
      console.log("ERROR: no se pudo completar la operacion");
      process.exitCode = 1;
    }
  }

  menuInteractivo(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const preguntar = (texto: string) =>
      new Promise<string>((resolve) => {
        rl.question(texto, (respuesta) => resolve(respuesta));
      });

    const ciclo = async () => {
      let seguir = true;
      while (seguir) {
        this.mostrarAyuda();
        const op = (await preguntar("Opcion: ")).trim();
        if (op === "0") {
          seguir = false;
          break;
        }
        const leyo = this.cargar();
        if (!leyo) {
          console.log("ERROR: no se pudo leer el archivo");
          process.exitCode = 1;
          seguir = false;
          break;
        }
        try {
          if (op === "1") {
            const legajo = (await preguntar("Legajo: ")).trim();
            if (!legajo) {
              console.log("ERROR: no se pudo completar la operacion");
            } else {
              const tipo = (
                await preguntar("Tipo (CERT, EQUIV, COM, JUST, MESA): ")
              ).trim();
              const prioTxt = (
                await preguntar("Prioridad (1 baja, 2 media, 3 alta): ")
              ).trim();
              const asunto = (await preguntar("Asunto: ")).trim();
              const detalle = (await preguntar("Detalle: ")).trim();
              const fecha = (
                await preguntar("Fecha (AAAA-MM-DD, vacio = hoy): ")
              ).trim();
              const obs = (await preguntar("Observacion: ")).trim();
              this.registrar(
                legajo,
                tipo,
                Number(prioTxt),
                asunto,
                detalle,
                obs,
                fecha,
              );
            }
          } else if (op === "2") {
            const id = (await preguntar("Id de solicitud: ")).trim();
            const estado = (await preguntar("Estado (1 a 5): ")).trim();
            const obs = (await preguntar("Observacion: ")).trim();
            this.cambiarEstado(id, estado, obs);
          } else if (op === "3") {
            const id = (await preguntar("Id de solicitud: ")).trim();
            const resp = (await preguntar("Id de responsable: ")).trim();
            this.asignar(id, resp);
          } else if (op === "4") {
            const campo = (
              await preguntar("Buscar por (estado, tipo, prioridad): ")
            ).trim();
            const valor = (await preguntar("Valor: ")).trim();
            this.ver(campo, valor);
          } else if (op === "5") {
            this.reporte();
          } else {
            console.log("ERROR: no se pudo completar la operacion");
            process.exitCode = 1;
          }
        } catch (e) {
          console.log("ERROR: no se pudo completar la operacion");
          process.exitCode = 1;
        }
      }
      rl.close();
    };

    void ciclo();
  }

  iniciar(argv: string[]): void {
    if (this.hayComando(argv)) {
      this.proc(argv);
      return;
    }
    if (!process.stdin.isTTY) {
      this.mostrarAyuda();
      return;
    }
    this.menuInteractivo();
  }
}
