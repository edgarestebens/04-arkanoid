# SPEC 02 — Destrucción de bloques con animación

> **Status:** Borrador
> **Depends on:** SPEC 01
> **Date:** 2026-09-11
> **Objective:** Formalizar y dejar verificable la destrucción de ladrillos con la animación de explosión ya definida en los assets del spritesheet, +10 puntos y sonido de rotura.

## Scope

**In:**

- Al colisionar la bola con un ladrillo vivo: marcarlo destruido, sumar exactamente 10 puntos y reproducir `assets/sounds/break-sound.mp3`.
- **Obligatorio:** usar solo las animaciones de destrucción ya definidas en `assets/spritesheet.js` → `EXPLOSION_FRAMES` (4 frames por color: `red`, `cyan`, `green`, `magenta`, `yellow`, `hotpink`, `gray`) dibujadas desde `assets/spritesheet-breakout.png` vía `drawFrame`.
- Duración de la animación = `EXPLOSION_DURATION` (150 ms) del mismo archivo; no inventar otro timing.
- Dibujar las explosiones activas en el canvas hasta que terminen; luego eliminarlas del estado.
- Reutilizar la lógica y estructuras ya previstas en SPEC 01 (`destroyBrick`, `state.explosions`, colisión bola–ladrillo).

**Out of scope (for future specs):**

- Ladrillos multi-golpe o indestructibles.
- Power-ups al romper.
- Animaciones inventadas (partículas, fade, escala, CSS, canvas libre) que no usen `EXPLOSION_FRAMES`.
- Redefinir coordenadas de frames, añadir frames nuevos o tocar el PNG del sheet.
- Animaciones propias del overlay de victoria / game over.

## Data model

Esta feature no introduce estructuras nuevas. Reutiliza el modelo de SPEC 01:

```js
// En state (ya existente)
explosions: [/* { x, y, w, h, color, startedAt } */],
bricks: [/* { x, y, w, h, color, alive } */],
// score se incrementa POINTS_PER_BRICK (10) por cada destrucción
```

Convenciones:

- Fuente única de animación: `EXPLOSION_FRAMES` y `EXPLOSION_DURATION` en `assets/spritesheet.js` (PNG: `assets/spritesheet-breakout.png`).
- `startedAt`: `performance.now()` al crear la explosión.
- Frame mostrado: índice según `(now - startedAt) / EXPLOSION_DURATION` sobre `EXPLOSION_FRAMES[color]`.
- Si el color no tiene frames, fallback a `EXPLOSION_FRAMES.gray`.
- No duplicar ni hardcodear rectángulos `sx/sy/sw/sh` en `src/game.js`; leerlos del mapa de frames del asset.

## Implementation plan

1. Revisar en `src/game.js` que `destroyBrick` marque `alive = false`, sume `POINTS_PER_BRICK`, empuje una entrada en `state.explosions` (con `color` del ladrillo) y llame al sonido de rotura. Manual: romper un bloque suma 10 y se oye el break.
2. Asegurar `updateExplosions` y `drawExplosions`: filtrar por `EXPLOSION_DURATION` y dibujar cada frame con `drawFrame(ctx, EXPLOSION_FRAMES[color][idx], ...)`. Manual: al romper se ve la secuencia de sprites del color del ladrillo (~150 ms), no un rectángulo ni otra animación.
3. Confirmar que la colisión bola–ladrillo llama a `destroyBrick` una vez por impacto (un ladrillo por frame) y que al no quedar vivos se dispara la victoria de SPEC 01. Manual: limpiar el muro lleva al overlay de victoria.

## Acceptance criteria

- [ ] Romper un ladrillo vivo suma exactamente 10 puntos.
- [ ] Al romper suena `assets/sounds/break-sound.mp3` (tras interacción previa del usuario si el navegador bloquea autoplay).
- [ ] Al romper se reproduce la secuencia de 4 frames de `EXPLOSION_FRAMES` del color del ladrillo (sprites del PNG, no dibujo procedural).
- [ ] La explosión usa `EXPLOSION_DURATION` (150 ms) y luego desaparece.
- [ ] El ladrillo deja de dibujarse en cuanto se destruye (solo queda la explosión del sheet mientras dura).
- [ ] No se modifican `EXPLOSION_FRAMES`, el PNG ni se añaden assets/animaciones nuevas.
- [ ] No hay dependencias nuevas; la lógica vive en `src/game.js` usando helpers/constantes de `assets/spritesheet.js`.

## Decisions

- **Sí:** formalizar el comportamiento ya contemplado en SPEC 01, no reinventar la animación. Evita divergencia con el MVP.
- **Sí:** única fuente visual = `EXPLOSION_FRAMES` + `drawFrame` + `spritesheet-breakout.png`. Los frames de destrucción ya están en los assets.
- **Sí:** `EXPLOSION_DURATION` = 150 ms del mismo archivo. Timing ya definido junto a los frames.
- **Sí:** feedback completo: animación + sonido + score. Feedback inmediato al jugador.
- **No:** partículas / fade / escala / animación CSS o canvas libre. Sustituiría los sprites existentes.
- **No:** editar coordenadas del sheet o crear frames nuevos. Fuera de alcance.
- **No:** multi-hit, power-ups o animaciones de fin de partida. Otras specs si hacen falta.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Autoplay de audio bloqueado | Reproducir el break solo tras clic/tecla previa (mismo patrón que SPEC 01). |
| Spritesheet aún no cargado | Si `spritesReady` es false, no dibujar explosión; el ladrillo igual se destruye y suma puntos. |

## What is **not** in this spec

- Ladrillos multi-golpe o indestructibles.
- Power-ups al romper.
- Cualquier animación de rotura que no sea `EXPLOSION_FRAMES` de `assets/spritesheet.js`.
- Cambios al PNG del sheet o a las coordenadas de frames.
- Cambios al overlay de victoria / game over.

Cada uno de esos, si llega, va en su propia spec.
