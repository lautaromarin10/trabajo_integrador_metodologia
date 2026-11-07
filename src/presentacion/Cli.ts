import readline from "node:readline";
import type { ServicioSolicitudes } from "../servicios/ServicioSolicitudes.js";
import type { RepositorioJson } from "../persistencia/RepositorioJson.js";

export class Cli {
  constructor(
    private readonly servicio: ServicioSolicitudes,
    private readonly repositorio: RepositorioJson,
  ) {}

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
        this.repositorio.configurarRuta(args[i + 1]);
      }
      args.splice(i, 2);
    }
    const cmd = args[0];
    if (!cmd) {
      this.mostrarAyuda();
      return;
    }
    try {
      const leyo = this.servicio.intentarCargar();
      if (!leyo) {
        console.log("ERROR: no se pudo leer el archivo");
        process.exitCode = 1;
        return;
      }
      if (cmd === "registrar") {
        const legajo = this.tomar(args, "--legajo");
        const tipo = this.tomar(args, "--tipo");
        const prioridad = Number(this.tomar(args, "--prioridad"));
        const asunto = this.tomar(args, "--asunto");
        const detalle = this.tomar(args, "--detalle");
        const obs = this.tomar(args, "--obs");
        const fecha = this.tomar(args, "--fecha");
        this.servicio.registrar({
          legajo,
          tipo,
          prioridad,
          asunto,
          detalle,
          obs,
          fecha,
        });
      } else if (cmd === "estado") {
        this.servicio.cambiarEstado(
          this.tomar(args, "--id"),
          this.tomar(args, "--estado"),
          this.tomar(args, "--obs"),
        );
      } else if (cmd === "asignar") {
        this.servicio.asignar(
          this.tomar(args, "--id"),
          this.tomar(args, "--responsable"),
        );
      } else if (cmd === "buscar") {
        if (args.indexOf("--estado") >= 0) {
          this.servicio.ver("estado", this.tomar(args, "--estado"));
        } else if (args.indexOf("--tipo") >= 0) {
          this.servicio.ver("tipo", this.tomar(args, "--tipo"));
        } else if (args.indexOf("--prioridad") >= 0) {
          this.servicio.ver("prioridad", this.tomar(args, "--prioridad"));
        } else {
          console.log("ERROR: no se pudo completar la operacion");
          process.exitCode = 1;
        }
      } else if (cmd === "reporte") {
        this.servicio.reporte();
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
        const leyo = this.servicio.intentarCargar();
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
              const prioridadTxt = (
                await preguntar("Prioridad (1 baja, 2 media, 3 alta): ")
              ).trim();
              const asunto = (await preguntar("Asunto: ")).trim();
              const detalle = (await preguntar("Detalle: ")).trim();
              const fecha = (
                await preguntar("Fecha (AAAA-MM-DD, vacio = hoy): ")
              ).trim();
              const obs = (await preguntar("Observacion: ")).trim();
              this.servicio.registrar({
                legajo,
                tipo,
                prioridad: Number(prioridadTxt),
                asunto,
                detalle,
                obs,
                fecha,
              });
            }
          } else if (op === "2") {
            const id = (await preguntar("Id de solicitud: ")).trim();
            const estado = (await preguntar("Estado (1 a 5): ")).trim();
            const obs = (await preguntar("Observacion: ")).trim();
            this.servicio.cambiarEstado(id, estado, obs);
          } else if (op === "3") {
            const id = (await preguntar("Id de solicitud: ")).trim();
            const resp = (await preguntar("Id de responsable: ")).trim();
            this.servicio.asignar(id, resp);
          } else if (op === "4") {
            const campo = (
              await preguntar("Buscar por (estado, tipo, prioridad): ")
            ).trim();
            const valor = (await preguntar("Valor: ")).trim();
            this.servicio.ver(campo, valor);
          } else if (op === "5") {
            this.servicio.reporte();
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
