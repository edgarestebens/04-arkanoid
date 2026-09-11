'use strict';

const CANVAS_W = 800;
const CANVAS_H = 600;

const PADDLE_W = 96;
const PADDLE_H = 14;
const PADDLE_SPEED = 8;
const PADDLE_Y = CANVAS_H - 40;

const BALL_R = 8;
const BALL_SPEED = 5;

const canvas = document.getElementById( 'game-canvas' );
const ctx = canvas.getContext( '2d' );

const keys = {
  left: false,
  right: false,
};

const state = {
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
};

let spritesReady = false;

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

function clearCanvas() {
  ctx.fillStyle = '#000';
  ctx.fillRect( 0, 0, CANVAS_W, CANVAS_H );
}

function updatePaddle() {
  const p = state.paddle;
  if ( keys.left ) p.x -= PADDLE_SPEED;
  if ( keys.right ) p.x += PADDLE_SPEED;
  clampPaddle();
}

function updateBall() {
  const b = state.ball;

  if ( b.glued ) {
    stickBallToPaddle();
    return;
  }

  b.x += b.vx;
  b.y += b.vy;

  // Rebote paredes laterales
  if ( b.x - b.r < 0 ) {
    b.x = b.r;
    b.vx = Math.abs( b.vx );
  } else if ( b.x + b.r > CANVAS_W ) {
    b.x = CANVAS_W - b.r;
    b.vx = -Math.abs( b.vx );
  }

  // Rebote pared superior
  if ( b.y - b.r < 0 ) {
    b.y = b.r;
    b.vy = Math.abs( b.vy );
  }
}

function update() {
  updatePaddle();
  updateBall();
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

function draw() {
  clearCanvas();
  drawPaddle();
  drawBall();
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
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const mouseX = ( e.clientX - rect.left ) * scaleX;
  state.paddle.x = mouseX - state.paddle.w / 2;
  clampPaddle();
} );

canvas.addEventListener( 'click', () => {
  launchBall();
} );

stickBallToPaddle();

loadSpritesheet( () => {
  spritesReady = true;
} );

requestAnimationFrame( loop );
