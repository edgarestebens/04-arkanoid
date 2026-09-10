# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-09-10
> **Objective:** Entregar un Arkanoid jugable en el navegador (HTML/CSS/JS, cero dependencias) con un nivel, tres vidas, puntuación básica y overlay de victoria o game over.

## Scope

**In:**

- Pantalla única con `<canvas>` de 800×600 px.
- Pala controlada a la vez con teclado (←/→ o A/D) y ratón.
- Bola con física de rebote simple y predecible (estilo Arkanoid clásico).
- Un nivel fijo: muro de ~10 columnas × 6 filas; todos los ladrillos rompibles de un golpe.
- Tres vidas; al perder la bola se resta una vida.
- Puntuación: +10 puntos por cada bloque destruido.
- Bola pegada a la pala al inicio y tras perder una vida; se lanza con clic o Espacio.
- Dibujo con el spritesheet existente (`assets/spritesheet.js` + `assets/spritesheet-breakout.png`), incluyendo explosión corta al romper.
- Sonidos de rebote (`assets/sounds/ball-bounce.mp3`) y rotura (`assets/sounds/break-sound.mp3`).
- Overlay simple de victoria (todos los bloques destruidos) o game over (0 vidas); tecla o clic reinicia la partida.
- Archivos: `index.html`, `styles.css`, `src/game.js`; reutilizar `assets/spritesheet.js`.

**Out of scope (for future specs):**

- Power-ups.
- High-scores / persistencia (`localStorage`).
- Varios niveles o editor de niveles.
- Ladrillos indestructibles o multi-hit.
- Menú de inicio / pausa dedicados (solo el overlay de fin).
- Multiplayer, build tools o dependencias npm.
- Adaptación móvil nativa (touch puede mover la pala vía ratón si el navegador lo mapea; no es un objetivo de diseño).

## Data model

```js
const CANVAS_W = 800;
const CANVAS_H = 600;
const POINTS_PER_BRICK = 10;
const MAX_LIVES = 3;
const BRICK_COLS = 10;
const BRICK_ROWS = 6;

// Estado de partida (en memoria; no se persiste)
const state = {
  score: 0,
  lives: MAX_LIVES,
  phase: 'ready', // 'ready' | 'playing' | 'won' | 'lost'
  paddle: { x, y, w, h },
  ball: { x, y, vx, vy, r, glued: true },
  bricks: [/* { x, y, w, h, color, alive } */],
  explosions: [/* { x, y, color, startedAt } */],
};
```

Convenciones:

- Origen de coordenadas: esquina superior izquierda del canvas.
- Velocidades en píxeles por frame (o equivalentes con `dt` fijo/simple).
- Rebote en paredes laterales/superior, pala y ladrillos; si la bola baja del canvas → pierde vida.

## Implementation plan

1. Crear `index.html` con canvas 800×600, contenedor del overlay vacío, y scripts (`assets/spritesheet.js`, `src/game.js`). Crear `styles.css` centrando el canvas y estilando el overlay oculto. Manual: abrir en el navegador y ver el canvas vacío sin errores de consola.
2. En `src/game.js`, bucle `requestAnimationFrame`, limpiar canvas, cargar spritesheet vía `loadSpritesheet`. Manual: fondo/canvas estable al cargar.
3. Dibujar e input de la pala (teclado + ratón, clamp a los bordes). Manual: la pala se mueve con ambas entradas.
4. Bola pegada (`glued`) y lanzamiento con clic o Espacio; movimiento y rebote en paredes. Manual: la bola rebota de forma predecible en los bordes.
5. Colisión bola–pala con ángulo según el punto de impacto (rebote simple tipo Arkanoid). Manual: golpear en el borde desvía más que en el centro.
6. Generar muro 10×6, dibujar bloques con sprites, colisión y destrucción (+10 score, explosión corta, sonido de rotura). Manual: romper bloques suma puntos y se oye el break.
7. Vidas: si la bola cae, `lives--`; si `lives > 0` volver a `ready` (bola pegada); si `lives === 0` → `lost` y overlay. Sonido de rebote en pala/paredes. Manual: tres caídas llevan a game over.
8. Victoria al no quedar ladrillos vivos → `won` + overlay. Reinicio desde overlay (tecla o clic) resetea score, vidas, muro y fase `ready`. Manual: ganar o perder y reiniciar deja la partida jugable de nuevo.

## Acceptance criteria

- [ ] Abrir `index.html` en el navegador carga el juego sin errores en consola.
- [ ] El canvas mide exactamente 800×600 px.
- [ ] La pala se controla con teclado y ratón a la vez, sin salir del canvas.
- [ ] La bola empieza pegada; clic o Espacio la lanzan.
- [ ] Hay un muro de 10 columnas × 6 filas; cada bloque roto suma exactamente 10 puntos.
- [ ] Hay 3 vidas; al caer la bola se resta una; a 0 vidas se muestra overlay de game over.
- [ ] Al destruir todos los bloques se muestra overlay de victoria.
- [ ] Desde el overlay, tecla o clic reinicia score, vidas y nivel.
- [ ] Se usan sprites del sheet (pala, bola, bloques) y hay explosión breve al romper.
- [ ] Suenan rebote y rotura con los mp3 de `assets/sounds/`.
- [ ] No hay dependencias externas (sin npm/CDN de motores).

## Decisions

- **Sí:** un solo nivel 10×6. Suficiente para un MVP jugable.
- **Sí:** canvas 800×600 fijo. Tamaño clásico y predecible.
- **Sí:** 3 vidas y +10 por bloque. Reglas mínimas claras.
- **Sí:** teclado y ratón simultáneos. Máxima flexibilidad de control.
- **Sí:** bola pegada + lanzar con clic/Espacio. Evita pérdidas accidentales al inicio.
- **Sí:** spritesheet existente + explosión. Ya hay assets; no reinventar el dibujo.
- **Sí:** sonidos de rebote y rotura. Feedback inmediato sin complicar el alcance.
- **Sí:** overlay único de victoria/game over con reinicio. Sin menú ni pausa dedicados.
- **Sí:** física de rebote simple y predecible. Como el Arkanoid clásico, sin motores externos.
- **Sí:** `index.html` + `styles.css` + `src/game.js`. Estructura mínima, un solo archivo de lógica.
- **No:** power-ups, high-scores, varios niveles, ladrillos especiales. Otra spec si hacen falta.
- **No:** varios módulos (`paddle.js`, etc.). Overengineering para este MVP.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Autoplay de audio bloqueado por el navegador | Iniciar/reproducir sonidos tras el primer clic o tecla del usuario (lanzar bola o mover). |
| `spritesheet-breakout.png` o mp3 ausentes en disco | Verificar rutas relativas desde `index.html`; fallar con log claro en consola si falta el PNG. |

## What is **not** in this spec

- Power-ups.
- High-scores / `localStorage`.
- Múltiples niveles o editor.
- Ladrillos indestructibles o multi-golpe.
- Menú de inicio / pausa.
- Multiplayer y dependencias externas.

Cada uno de esos, si llega, va en su propia spec.
