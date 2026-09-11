'use strict';

const CANVAS_W = 800;
const CANVAS_H = 600;

const PADDLE_W = 96;
const PADDLE_H = 14;
const PADDLE_SPEED = 8;
const PADDLE_Y = CANVAS_H - 40;

const canvas = document.getElementById( 'game-canvas' );
const ctx = canvas.getContext( '2d' );

const keys = {
  left: false,
  right: false,
};

const state = {
  paddle: {
    x: ( CANVAS_W - PADDLE_W ) / 2,
    y: PADDLE_Y,
    w: PADDLE_W,
    h: PADDLE_H,
  },
};

let spritesReady = false;

function clampPaddle() {
  const p = state.paddle;
  if ( p.x < 0 ) p.x = 0;
  if ( p.x + p.w > CANVAS_W ) p.x = CANVAS_W - p.w;
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

function update() {
  updatePaddle();
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

function draw() {
  clearCanvas();
  drawPaddle();
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
  if ( e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space' ) {
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

loadSpritesheet( () => {
  spritesReady = true;
} );

requestAnimationFrame( loop );
