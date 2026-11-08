# Esta documentación es la prueba final de que el refactor hecho fue satisfactorio y no se modificó el comportamiento externo del sistema

### Estado inicial

El estado inicial es el correspondiente al hash `7f59d980689b7fcd783287b4b610277fe751ea2b`

### Estado actual (con refactorización)

El estado actual en el que se va a realizar las pruebas es el del hash `a10b8ec204e5f74ad4cb0d6d9d7990f1a8c4a107`

Si bien este commit no es de refactorización, en este se realizaron modificaciones a la forma de hacer test para hacerlo compatible con Windows.

## Entorno en el que se realizó la prueba

El entorno es:

- Node en la versión 26.8.0
- pnpm en la versión 11.20.0
- macOS en la versión 27.0.1

## Comandos ejecutados

El comando ejecutado fue `pnpm test`, dicho comando ejecuta el script `tsx --test tests/caracterizacion.test.ts` declarado en el `package.json`.

Además se comparó el mismo test tanto en la versión inicial como en la versión actual para comprobar que el programa conserva el comportamiento externo a pesar de la modificación de su estado interno.

Para movernos al commit del estado inicial y realizar el test se ejecutó el comando:

```
git checkout 7f59d98 && pnpm test
```

Luego de ejecutar el test se volvió al estado actual con el comando:

```
git checkout main
```

## Resultados del test

### ESTADO INICIAL

```
lautaromarin@MacBook-Air-de-Lautaro trabajo_integrador_metodologia % git checkout 7f59d98 && pnpm test
Note: switching to '7f59d98'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 7f59d98 test: base para caracterización antes del refactor
$ tsx --test tests/caracterizacion.test.ts
✔ sin comando muestra la ayuda y no toca el JSON (213.672917ms)
✔ registra una solicitud valida (129.989083ms)
✔ el alta de una equivalencia informa 20 dias (127.043584ms)
✔ un legajo inexistente no modifica el archivo (128.939792ms)
✔ cambia el estado y la observacion (128.178ms)
✔ permite volver una solicitud cerrada a pendiente (135.820375ms)
✔ un id inexistente no modifica el archivo (142.810541ms)
✔ asigna un responsable existente (125.532667ms)
✔ un responsable inexistente deja la solicitud sin asignar (121.625084ms)
✔ busca por estado (122.221667ms)
✔ busca por tipo (125.45125ms)
✔ busca por prioridad (123.764708ms)
✔ una busqueda sin coincidencias no falla (124.608667ms)
✔ el reporte cuenta estados, tipos, prioridades y responsables (130.632833ms)
✔ una solicitud registrada se ve en la busqueda siguiente (255.289459ms)
✔ un archivo inexistente responde con el mismo error generico (125.992792ms)
✔ un JSON invalido responde igual que un archivo ausente (127.790375ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2340.901
```

## ESTADO ACTUAL (REFACTOR)

```
lautaromarin@MacBook-Air-de-Lautaro trabajo_integrador_metodologia % pnpm test
$ tsx --test tests/caracterizacion.test.ts
✔ sin comando muestra la ayuda y no toca el JSON (124.054166ms)
✔ registra una solicitud valida (126.063083ms)
✔ el alta de una equivalencia informa 20 dias (118.574625ms)
✔ un legajo inexistente no modifica el archivo (114.853166ms)
✔ cambia el estado y la observacion (115.545916ms)
✔ permite volver una solicitud cerrada a pendiente (115.356542ms)
✔ un id inexistente no modifica el archivo (114.409833ms)
✔ asigna un responsable existente (115.465542ms)
✔ un responsable inexistente deja la solicitud sin asignar (115.612792ms)
✔ busca por estado (115.490791ms)
✔ busca por tipo (120.496375ms)
✔ busca por prioridad (124.31225ms)
✔ una busqueda sin coincidencias no falla (119.905208ms)
✔ el reporte cuenta estados, tipos, prioridades y responsables (126.937083ms)
✔ una solicitud registrada se ve en la busqueda siguiente (239.824125ms)
✔ un archivo inexistente responde con el mismo error generico (115.938875ms)
✔ un JSON invalido responde igual que un archivo ausente (124.888375ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2232.8825
```

## Verificación de tipos

Además del test realizamos una validación de tipos, lo que nos permite confirmar que el código tipa correctamente tras el refactor.

### ESTADO INICIAL

Ejecutamos el comando

```
git checkout 7f59d98 && pnpm exec tsc --noEmit
```

```
lautaromarin@MacBook-Air-de-Lautaro trabajo_integrador_metodologia % git checkout 7f59d98 && pnpm exec tsc --noEmit
HEAD is now at 7f59d98 test: base para caracterización antes del refactor
```

### ESTADO ACTUAL

Desde el estado inicial, ejecutamos el comando

```
git checkout main && pnpm exec tsc --noEmit
```

```
lautaromarin@MacBook-Air-de-Lautaro trabajo_integrador_metodologia % git checkout main && pnpm exec tsc --noEmit
lautaromarin@MacBook-Air-de-Lautaro trabajo_integrador_metodologia %
```

Como podemos ver, la ausencia de mensajes de error en la salida indica que el compilador de TypeScript no detectó inconsistencias de tipos en el proyecto, según la configuración de `tsconfig.json`.

## Resumen caso → resultado

| Caso | Antes (`7f59d98`) | Después (`a10b8ec`) |
| --- | --- | --- |
| sin comando muestra la ayuda y no toca el JSON | OK (213.67 ms) | OK (124.05 ms) |
| registra una solicitud valida | OK (129.99 ms) | OK (126.06 ms) |
| el alta de una equivalencia informa 20 dias | OK (127.04 ms) | OK (118.57 ms) |
| un legajo inexistente no modifica el archivo | OK (128.94 ms) | OK (114.85 ms) |
| cambia el estado y la observacion | OK (128.18 ms) | OK (115.55 ms) |
| permite volver una solicitud cerrada a pendiente | OK (135.82 ms) | OK (115.36 ms) |
| un id inexistente no modifica el archivo | OK (142.81 ms) | OK (114.41 ms) |
| asigna un responsable existente | OK (125.53 ms) | OK (115.47 ms) |
| un responsable inexistente deja la solicitud sin asignar | OK (121.63 ms) | OK (115.61 ms) |
| busca por estado | OK (122.22 ms) | OK (115.49 ms) |
| busca por tipo | OK (125.45 ms) | OK (120.50 ms) |
| busca por prioridad | OK (123.76 ms) | OK (124.31 ms) |
| una busqueda sin coincidencias no falla | OK (124.61 ms) | OK (119.91 ms) |
| el reporte cuenta estados, tipos, prioridades y responsables | OK (130.63 ms) | OK (126.94 ms) |
| una solicitud registrada se ve en la busqueda siguiente | OK (255.29 ms) | OK (239.82 ms) |
| un archivo inexistente responde con el mismo error generico | OK (125.99 ms) | OK (115.94 ms) |
| un JSON invalido responde igual que un archivo ausente | OK (127.79 ms) | OK (124.89 ms) |
| **Total suite** (`duration_ms`) | **17/17 OK — 2340.90 ms** | **17/17 OK — 2232.88 ms** |
| `pnpm exec tsc --noEmit` | OK (sin errores) | OK (sin errores) |
