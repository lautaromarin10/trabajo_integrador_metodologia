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

export interface Datos {
  estudiantes: Estudiante[];
  responsables: Responsable[];
  estados: Estado[];
  solicitudes: Solicitud[];
}
