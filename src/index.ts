import { RepositorioJson } from "./persistencia/RepositorioJson.js";
import { ServicioSolicitudes } from "./servicios/ServicioSolicitudes.js";
import { Cli } from "./presentacion/Cli.js";

const repositorio = new RepositorioJson("datos.json");
const servicio = new ServicioSolicitudes(repositorio);
const cli = new Cli(servicio, repositorio);
cli.iniciar(process.argv.slice(2));
