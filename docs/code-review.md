# Checklist de Code Review Profesional - Sistema de Gestión de Solicitudes Académicas
## Criterios de Evaluación y Verificación Técnica

| Ítem del Checklist | Cumple (Sí/No) | Observación / Evidencia | Corrección Realizada |
| :--- | :---: | :--- | :--- |
| **1. Principio de Responsabilidad Única (SRP)** | Sí | La clase `Sistema` original concentraba negocio, persistencia, consola y reportes (más de 800 líneas)[cite: 6, 9]. | Se desacopló en `ServicioSolicitudes`, `RepositorioJson`, `FormatoSalida` y la CLI[cite: 9, 11]. |
| **2. Principio Abierto/Cerrado (OCP)** | Sí | El método `plazoSegunTipo` utilizaba un switch rígido que obligaba a modificar código ante nuevos tipos[cite: 8, 9]. | Se extrajo la lógica a un módulo de políticas independiente (`plazosPorTipo.ts`). |
| **3. Inversión de Dependencias (DIP)** | Sí | El sistema dependía directamente de `fs` para la persistencia, impidiendo pruebas unitarias aisladas[cite: 9]. | Se implementó una interfaz de almacenamiento inyectada al servicio. |
| **4. Eliminación de Parámetros Largos** | Sí | El método `registrar` recibía 7 parámetros posicionales frágiles al orden de paso[cite: 8, 11]. | Se introdujo el objeto DTO `RegistrarSolicitudInput`[cite: 11]. |
| **5. Nombres limpios (Clean Code)** | Sí | Existían variables con abreviaturas confusas (`estid`, `prio`)[cite: 10]. | Se renombraron a `estudianteId` y `prioridad` siguiendo estándares de legibilidad[cite: 10]. |
| **6. Pruebas de Regresión** | Sí | El repositorio inicial carecía de pruebas automatizadas de cobertura[cite: 12]. | Se implementaron tests de caracterización previos en `tests/caracterizacion.test.ts`[cite: 12]. |

---

## Criterios de Aceptación Técnica
**Compilación:** El código transpila en TypeScript sin errores.
**Comportamiento Externo:** La interfaz por consola mantiene exactamente el mismo menú, flujos y códigos de salida que la versión base, garantizando cero regresiones funcionales[cite: 5].