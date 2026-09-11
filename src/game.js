'use strict';

const CANVAS_W = 800;
const CANVAS_H = 600;

const PADDLE_W = 96;
const PADDLE_H = 14;
const PADDLE_SPEED = 8;
const PADDLE_Y = CANVAS_H - 40;

const BALL_R = 8;
const BALL_SPEED = 5;

const POINTS_PER_BRICK = 10;
const MAX_LIVES = 3;
const BRICK_COLS = 10;
const BRICK_ROWS = 6;
const BRICK_GAP = 4;
const BRICK_TOP = 60;
const BRICK_SIDE = 40;
const BRICK_W = ( CANVAS_W - BRICK_SIDE * 2 - BRICK_GAP * ( BRICK_COLS - 1 ) ) / BRICK_COLS;
const BRICK_H = BRICK_W / 2;

const ROW_COLORS = [ 'red', 'hotpink', 'yellow', 'green', 'cyan', 'magenta' ];

const canvas = document.getElementById( 'game-canvas' );
const ctx = canvas.getContext( '2d' );
const overlayEl = document.getElementById( 'overlay' );

const sfxBreak = new Audio( 'assets/sounds/break-sound.mp3' );
const sfxBounce = new Audio( 'assets/sounds/ball-bounce.mp3' );

const keys = {
  left: false,
  right: false,
};

const state = {
  score: 0,
  lives: MAX_LIVES,
  phase: 'ready', // 'ready' | 'playing' | 'won' | 'lost'
  paddle: {
    x: ( CANVAS_W - PADDLE_W ) / 2,
    y: PADDLE_Y,
    w: PADDLE_W,
    h: PADDLE_H,
  },
  ball: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: BALL_R,
    glued: true,
  },
  bricks: [],
  explosions: [],
};

let spritesReady = false;

function playSound( base ) {
  try {
    const s = base.cloneNode();
    s.volume = 0.7;
    s.play().catch( () => {} );
  } catch ( e ) {
    // Autoplays bloqueados: se ignora hasta interacción previa
  }
}

function playBreakSound() {
  playSound( sfxBreak );
}

function playBounceSound() {
  playSound( sfxBounce );
}

function showOverlay( title, subtitle ) {
  overlayEl.innerHTML =
    '<div class="overlay-content">' +
    '<h1>' + title + '</h1>' +
    '<p>' + subtitle + '</p>' +
    '</div>';
  overlayEl.hidden = false;
}

function hideOverlay() {
  overlayEl.hidden = true;
  overlayEl.innerHTML = '';
}

function loseLife() {
  state.lives -= 1;
  if ( state.lives > 0 ) {
    state.phase = 'ready';
    stickBallToPaddle();
    return;
  }
  state.phase = 'lost';
  state.ball.glued = true;
  state.ball.vx = 0;
  state.ball.vy = 0;
  showOverlay( 'Game Over', 'Puntuación: ' + state.score );
}

function createBricks() {
  const bricks = [];
  for ( let row = 0; row < BRICK_ROWS; row++ ) {
    const color = ROW_COLORS[ row % ROW_COLORS.length ];
    for ( let col = 0; col < BRICK_COLS; col++ ) {
      bricks.push( {
        x: BRICK_SIDE + col * ( BRICK_W + BRICK_GAP ),
        y: BRICK_TOP + row * ( BRICK_H + BRICK_GAP ),
        w: BRICK_W,
        h: BRICK_H,
        color,
        alive: true,
      } );
    }
  }
  return bricks;
}

function clampPaddle() {
  const p = state.paddle;
  if ( p.x < 0 ) p.x = 0;
  if ( p.x + p.w > CANVAS_W ) p.x = CANVAS_W - p.w;
}

function stickBallToPaddle() {
  const p = state.paddle;
  const b = state.ball;
  b.x = p.x + p.w / 2;
  b.y = p.y - b.r;
  b.vx = 0;
  b.vy = 0;
  b.glued = true;
}

function launchBall() {
  const b = state.ball;
  if ( !b.glued || state.phase === 'won' || state.phase === 'lost' ) return;
  b.glued = false;
  b.vx = BALL_SPEED * ( Math.random() < 0.5 ? -1 : 1 ) * 0.6;
  b.vy = -BALL_SPEED;
  state.phase = 'playing';
}

function destroyBrick( brick ) {
  brick.alive = false;
  state.score += POINTS_PER_BRICK;
  state.explosions.push( {
    x: brick.x,
    y: brick.y,
    w: brick.w,
    h: brick.h,
    color: brick.color,
    startedAt: performance.now(),
  } );
  playBreakSound();
}

function clearCanvas() {
  ctx.fillStyle = '#000';
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );
}

function updatePaddle() {
  if ( state.phase === 'lost' || state.phase === 'won' ) return;
  const p = state.paddle;
  if ( keys.left ) p.x -= PADDLE_SPEED;
  if ( keys.right ) p.x += PADDLE_SPEED;
  clampPaddle();
}

function collideBallPaddle() {
  const b = state.ball;
  const p = state.paddle;

  if ( b.vy <= 0 ) return;

  const closestX = Math.max( p.x, Math.min( b.x, p.x + p.w ) );
  const closestY = Math.max( p.y, Math.min( b.y, p.y + p.h ) );
  const dx = b.x - closestX;
  const dy = b.y - closestY;

  if ( dx * dx + dy * dy > b.r * b.r ) return;

  const hit = ( b.x - p.x ) / p.w;
  const offset = Math.max( -1, Math.min( 1, ( hit - 0.5 ) * 2 ) );
  const maxAngle = Math.PI / 3;
  const angle = offset * maxAngle;
  const speed = BALL_SPEED;

  b.vx = speed * Math.sin( angle );
  b.vy = -speed * Math.cos( angle );
  b.y = p.y - b.r;
  playBounceSound();
}

function collideBallBricks() {
  const b = state.ball;

  for ( let i = 0; i < state.bricks.length; i++ ) {
    const brick = state.bricks[ i ];
    if ( !brick.alive ) continue;

    const closestX = Math.max( brick.x, Math.min( b.x, brick.x + brick.w ) );
    const closestY = Math.max( brick.y, Math.min( b.y, brick.y + brick.h ) );
    const dx = b.x - closestX;
    const dy = b.y - closestY;

    if ( dx * dx + dy * dy > b.r * b.r ) continue;

    // Eje de rebote según solapamiento
    const overlapLeft = ( b.x + b.r ) - brick.x;
    const overlapRight = ( brick.x + brick.w ) - ( b.x - b.r );
    const overlapTop = ( b.y + b.r ) - brick.y;
    const overlapBottom = ( brick.y + brick.h ) - ( b.y - b.r );
    const minOverlapX = Math.min( overlapLeft, overlapRight );
    const minOverlapY = Math.min( overlapTop, overlapBottom );

    if ( minOverlapX < minOverlapY ) {
      b.vx = -b.vx;
      if ( overlapLeft < overlapRight ) b.x = brick.x - b.r;
      else b.x = brick.x + brick.w + b.r;
    } else {
      b.vy = -b.vy;
      if ( overlapTop < overlapBottom ) b.y = brick.y - b.r;
      else b.y = brick.y + brick.h + b.r;
    }

    destroyBrick( brick );
    break; // un ladrillo por frame
  }
}

function updateBall() {
  const b = state.ball;

  if ( state.phase === 'lost' || state.phase === 'won' ) return;

  if ( b.glued ) {
    stickBallToPaddle();
    return;
  }

  b.x += b.vx;
  b.y += b.vy;

  if ( b.x - b.r < 0 ) {
    b.x = b.r;
    b.vx = Math.abs( b.vx );
    playBounceSound();
  } else if ( b.x + b.r > CANVAS_W ) {
    b.x = CANVAS_W - b.r;
    b.vx = -Math.abs( b.vx );
    playBounceSound();
  }

  if ( b.y - b.r < 0 ) {
    b.y = b.r;
    b.vy = Math.abs( b.vy );
    playBounceSound();
  }

  if ( b.y - b.r > CANVAS_H ) {
    loseLife();
    return;
  }

  collideBallPaddle();
  collideBallBricks();
}

function updateExplosions() {
  const now = performance.now();
  state.explosions = state.explosions.filter(
    ( e ) => now - e.startedAt < EXPLOSION_DURATION
  );
}

function update() {
  updatePaddle();
  updateBall();
  updateExplosions();
}

function drawPaddle() {
  const p = state.paddle;
  if ( spritesReady ) {
    drawSprite( ctx, 'paddle', p.x, p.y, p.w, p.h );
  } else {
    ctx.fillStyle = '#ccc';
    ctx.fillRect( p.x, p.y, p.w, p.h );
  }
}

function drawBall() {
  const b = state.ball;
  const size = b.r * 2;
  if ( spritesReady ) {
    drawSprite( ctx, 'ball', b.x - b.r, b.y - b.r, size, size );
  } else {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc( b.x, b.y, b.r, 0, Math.PI * 2 );
    ctx.fill();
  }
}

function drawBricks() {
  for ( let i = 0; i < state.bricks.length; i++ ) {
    const brick = state.bricks[ i ];
    if ( !brick.alive ) continue;
    if ( spritesReady ) {
      drawSprite( ctx, 'block_' + brick.color, brick.x, brick.y, brick.w, brick.h );
    } else {
      ctx.fillStyle = '#888';
      ctx.fillRect( brick.x, brick.y, brick.w, brick.h );
    }
  }
}

function drawExplosions() {
  if ( !spritesReady ) return;
  const now = performance.now();
  for ( let i = 0; i < state.explosions.length; i++ ) {
    const e = state.explosions[ i ];
    const frames = EXPLOSION_FRAMES[ e.color ] || EXPLOSION_FRAMES.gray;
    const t = ( now - e.startedAt ) / EXPLOSION_DURATION;
    const idx = Math.min( frames.length - 1, Math.floor( t * frames.length ) );
    drawFrame( ctx, frames[ idx ], e.x, e.y, e.w, e.h );
  }
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText( 'Score: ' + state.score, 16, 28 );
  ctx.textAlign = 'right';
  ctx.fillText( 'Lives: ' + state.lives, CANVAS_W - 16, 28 );
}

function draw() {
  clearCanvas();
  drawBricks();
  drawExplosions();
  drawPaddle();
  drawBall();
  drawHud();
}

function loop() {
  update();
  draw();
  requestAnimationFrame( loop );
}

function setKey( code, isDown ) {
  if ( code === 'ArrowLeft' || code === 'KeyA' ) keys.left = isDown;
  if ( code === 'ArrowRight' || code === 'KeyD' ) keys.right = isDown;
}

window.addEventListener( 'keydown', ( e ) => {
  setKey( e.code, true );
  if ( e.code === 'Space' ) {
    e.preventDefault();
    launchBall();
  }
  if ( e.code === 'ArrowLeft' || e.code === 'ArrowRight' ) {
    e.preventDefault();
  }
} );

window.addEventListener( 'keyup', ( e ) => {
  setKey( e.code, false );
} );

canvas.addEventListener( 'mousemove', ( e ) => {
  if ( state.phase === 'lost' || state.phase === 'won' ) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const mouseX = ( e.clientX - rect.left ) * scaleX;
  state.paddle.x = mouseX - state.paddle.w / 2;
  clampPaddle();
} );

canvas.addEventListener( 'click', () => {
  launchBall();
} );

state.bricks = createBricks();
stickBallToPaddle();

loadSpritesheet( () => {
  spritesReady = true;
} );

requestAnimationFrame( loop );
