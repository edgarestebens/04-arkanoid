# Arkanoid

Juego de Arkanoid en el navegador con HTML, CSS y JavaScript. Sin dependencias externas.

## Cómo jugar

Abre `index.html` en el navegador (doble clic o servir la carpeta con cualquier servidor estático).

| Control | Acción |
| ------- | ------ |
| ← / → o A / D | Mover la pala |
| Ratón | Mover la pala |
| Espacio o clic | Lanzar la bola (cuando está pegada) |
| Esc o P | Pausar / reanudar |
| Tecla o clic (en overlay) | Reiniciar tras victoria o game over |
| N o botón «Siguiente nivel» | Saltar al siguiente nivel (solo en pausa) |

## Qué incluye

- Canvas fijo de 800×600 px
- Pala con teclado y ratón a la vez
- Bola con rebote estilo Arkanoid clásico (ángulo según el punto de impacto en la pala)
- 5 niveles; la velocidad de la bola aumenta en cada uno
- Muro de 10×6 ladrillos por nivel (todos se rompen de un golpe)
- 3 vidas; al caer la bola se resta una y vuelve pegada a la pala
- Puntuación: +10 por cada ladrillo destruido
- HUD en pantalla: puntuación, vidas y nivel
- Sprites del sheet (`assets/spritesheet-breakout.png`) y explosión breve al romper
- Sonidos de rebote y rotura (`assets/sounds/`)
- Overlay de pausa, victoria y game over

## Estructura

```
index.html          # Página del juego
styles.css          # Layout del canvas y overlays
src/game.js         # Lógica, física e input
assets/
  spritesheet.js
  spritesheet-breakout.png
  sounds/
    ball-bounce.mp3
    break-sound.mp3
specs/
  01-mvp-jugable.md # Spec del MVP (implementado)
```

## Fuera de alcance (por ahora)

Power-ups, high-scores / `localStorage`, editor de niveles, ladrillos multi-golpe o indestructibles, menú de inicio dedicado, multiplayer y controles táctiles nativos.
