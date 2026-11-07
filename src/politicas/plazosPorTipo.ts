const plazaPorTipo: Record<string, number> = {
  CERT: 5,
  EQUIV: 20,
  COM: 7,
  JUST: 3,
  MESA: 10,
  default: 15,
};

export const obtenerPlazoSegunTipo = (tipo: string): number => {
  return plazaPorTipo[tipo] || plazaPorTipo.default;
};
