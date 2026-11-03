import { Sistema } from "./sistema.js";

const sistema = new Sistema("datos.json");
sistema.iniciar(process.argv.slice(2));
