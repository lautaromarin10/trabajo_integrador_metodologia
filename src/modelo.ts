// MODELO INTERNO

export interface Estudiante {
  id: number;
  nombre: string;
  legajo: string;
  carrera: string;
  email: string;
}

export interface Responsable {
  id: number;
  nombre: string;
  area: string;
  email: string;
}

export interface Estado {
  codigo: number;
  nombre: string;
}

export interface Solicitud {
  id: number;
  estudianteId: number;
  responsableId: number | null;
  asunto: string;
  detalle: string;
  tipo: string;
  prioridad: number;
  estado: number;
  fecha: string;
  obs: string;
}

export interface Datos {
  estudiantes: Estudiante[];
  responsables: Responsable[];
  estados: Estado[];
  solicitudes: Solicitud[];
}

export const CodigoEstado = {
  PENDIENTE: 1,
  EN_REVISION: 2,
  APROBADA: 3,
  RECHAZADA: 4,
  CERRADA: 5,
} as const;

export const Prioridad = {
  BAJA: 1,
  MEDIA: 2,
  ALTA: 3,
} as const;

export const TipoSolicitud = {
  CERT: "CERT",
  EQUIV: "EQUIV",
  COM: "COM",
  JUST: "JUST",
  MESA: "MESA",
} as const;

export function esCodigoEstadoValido(codigo: number): boolean {
  return (
    codigo === CodigoEstado.PENDIENTE ||
    codigo === CodigoEstado.EN_REVISION ||
    codigo === CodigoEstado.APROBADA ||
    codigo === CodigoEstado.RECHAZADA ||
    codigo === CodigoEstado.CERRADA
  );
}

// CONTRATO JSON (PARA MANTENER COMPATIBILIDAD CON EL ARCHIVO DE DATOS)

export interface SolicitudJson {
  id: number;
  estId: number;
  respId: number | null;
  asunto: string;
  detalle: string;
  tipo: string;
  prio: number;
  est: number;
  fecha: string;
  obs: string;
}

export interface DatosJson {
  estudiantes: Estudiante[];
  responsables: Responsable[];
  estados: Estado[];
  solicitudes: SolicitudJson[];
}

// MAPEO JSON ENTRE EL MODELO INTERNO Y EL MODELO EXTERNO (JSON)

export function solicitudDesdeJson(s: SolicitudJson): Solicitud {
  return {
    id: s.id,
    estudianteId: s.estId,
    responsableId: s.respId,
    asunto: s.asunto,
    detalle: s.detalle,
    tipo: s.tipo,
    prioridad: s.prio,
    estado: s.est,
    fecha: s.fecha,
    obs: s.obs,
  };
}

export function solicitudHaciaJson(s: Solicitud): SolicitudJson {
  return {
    id: s.id,
    estId: s.estudianteId,
    respId: s.responsableId,
    asunto: s.asunto,
    detalle: s.detalle,
    tipo: s.tipo,
    prio: s.prioridad,
    est: s.estado,
    fecha: s.fecha,
    obs: s.obs,
  };
}

export function datosDesdeJson(crudo: DatosJson): Datos {
  return {
    estudiantes: crudo.estudiantes,
    responsables: crudo.responsables,
    estados: crudo.estados,
    solicitudes: crudo.solicitudes.map(solicitudDesdeJson),
  };
}

export function datosHaciaJson(datos: Datos): DatosJson {
  return {
    estudiantes: datos.estudiantes,
    responsables: datos.responsables,
    estados: datos.estados,
    solicitudes: datos.solicitudes.map(solicitudHaciaJson),
  };
}
