import { TipoSolicitud } from "../modelo.js";

const DEFAULT_PLAZO = 15;

const plazosPorTipo: Record<string, number> = {
  [TipoSolicitud.CERT]: 5,
  [TipoSolicitud.EQUIV]: 20,
  [TipoSolicitud.COM]: 7,
  [TipoSolicitud.JUST]: 3,
  [TipoSolicitud.MESA]: 10,
};

export const obtenerPlazoSegunTipo = (tipo: string): number => {
  const plazo = plazosPorTipo[tipo];
  if (plazo === undefined) {
    return DEFAULT_PLAZO;
  }
  return plazo;
};
