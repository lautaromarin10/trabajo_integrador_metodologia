# Gestión de solicitudes académicas

Este sistema de consola es para registrar y seguir solicitudes de estudiantes: certificados, equivalencias, cambios de comisión, justificaciones y mesas especiales.

Los datos de ejemplo son ficticios y se guardan en un archivo JSON.

## Instalación

- Es necesario tener Node.js o superior

```bash
pnpm install
```

## Uso

```bash
pnpm run dev
```

## Funcionalidades

- Registrar una solicitud de un estudiante existente.
- Cambiar el estado y la observación.
- Asignar un responsable de un área.
- Buscar por estado, por tipo o por prioridad.
- Reporte con totales por estado, tipo y prioridad, las solicitudes sin responsable y los estudiantes que aparecen.

## Tecnologías

- TypeScript
- Node.js
- Archivo JSON como almacenamiento
- `tsx` para ejecutar TypeScript sin un paso de compilación
