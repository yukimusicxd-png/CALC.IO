import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import '../styles/ScreensaverModal.css';

const SYMBOLS = ['+', '-', '×', '÷', '=', '√', 'π', '∫', '0', '1', '2', '3', '5', '8', 'x', 'y', 'a', 'b'];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const createSymbolBody = (symbol, x, y) => {
  const width = Math.max(40, symbol.length * 24);
  const height = 44;
  const body = Matter.Bodies.rectangle(x, y, width, height, {
    restitution: 0.9,
    frictionAir: 0.02,
    friction: 0,
    frictionStatic: 0,
    slop: 0.5,
    density: 0.0005,
    label: 'symbol',
  });

  body.symbol = symbol;
  body.customWidth = width;
  body.customHeight = height;
  Matter.Body.setAngularVelocity(body, randomBetween(-0.08, 0.08));
  Matter.Body.setVelocity(body, { x: randomBetween(-2.2, 2.2), y: randomBetween(-2.2, 2.2) });
  body.isWall = false;
  return body;
};

const createWall = (x, y, width, height) =>
  Matter.Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    restitution: 0.9,
    friction: 0,
    frictionStatic: 0,
    render: { visible: false },
    isWall: true,
  });

const orderSymbolText = (a, b) => {
  if (a.position.x === b.position.x) {
    return a.position.y <= b.position.y ? `${a.symbol}${b.symbol}` : `${b.symbol}${a.symbol}`;
  }
  return a.position.x < b.position.x ? `${a.symbol}${b.symbol}` : `${b.symbol}${a.symbol}`;
};

const isEvaluableExpression = (text) => {
  const expr = text.replace(/[×]/g, '*').replace(/[÷]/g, '/').replace(/π/g, `(${Math.PI})`);
  return /^[0-9*+\-/().\s]*$/.test(expr);
};

const evaluateEquation = (text) => {
  const trimmed = text.trim();
  if (!trimmed.endsWith('=')) return null;
  const expression = trimmed.slice(0, -1).trim();
  if (!expression || !isEvaluableExpression(expression)) return null;

  try {
    const normalized = expression
      .replace(/[×]/g, '*')
      .replace(/[÷]/g, '/')
      .replace(/π/g, `(${Math.PI})`);

    const result = Function(`"use strict"; return (${normalized})`)();
    if (typeof result === 'number' && Number.isFinite(result)) {
      return Number(Math.round(result * 1000000) / 1000000).toString();
    }
    return null;
  } catch {
    return null;
  }
};

const combineSymbolBodies = (world, a, b) => {
  if (!a.symbol || !b.symbol) return null;
  const newText = orderSymbolText(a, b);
  if (newText.length > 16) return null;

  const answer = evaluateEquation(newText);
  const combinedText = answer ? `${newText}${answer}` : newText;

  const pos = {
    x: (a.position.x + b.position.x) / 2,
    y: (a.position.y + b.position.y) / 2,
  };
  const velocity = {
    x: (a.velocity.x + b.velocity.x) / 2,
    y: (a.velocity.y + b.velocity.y) / 2,
  };
  const angularVelocity = (a.angularVelocity + b.angularVelocity) / 2;

  Matter.World.remove(world, a);
  Matter.World.remove(world, b);

  const combined = createSymbolBody(combinedText, pos.x, pos.y);
  Matter.Body.setVelocity(combined, velocity);
  Matter.Body.setAngularVelocity(combined, angularVelocity);
  combined.isCompound = true;

  Matter.World.add(world, combined);
  return combined;
};

export default function ScreensaverModal({ onClose }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const worldRef = useRef(null);
  const bodiesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0;
    engine.world.gravity.x = 0;
    engine.enableSleeping = false;
    engineRef.current = engine;
    worldRef.current = engine.world;

    const context = canvas.getContext('2d');
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resizeCanvas();

    const bounds = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const walls = [
      createWall(bounds.width / 2, -32, bounds.width + 64, 64),
      createWall(bounds.width / 2, bounds.height + 32, bounds.width + 64, 64),
      createWall(-32, bounds.height / 2, 64, bounds.height + 64),
      createWall(bounds.width + 32, bounds.height / 2, 64, bounds.height + 64),
    ];
    Matter.World.add(worldRef.current, walls);

    const bodies = SYMBOLS.map((symbol) =>
      createSymbolBody(
        symbol,
        randomBetween(80, bounds.width - 80),
        randomBetween(80, bounds.height - 80)
      )
    );

    Matter.World.add(worldRef.current, bodies);
    bodiesRef.current = bodies;

    // create a minimal render wrapper so mouse can attach to the same canvas
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: bounds.width,
        height: bounds.height,
        wireframes: false,
        background: 'transparent',
      },
    });

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Matter.World.add(worldRef.current, mouseConstraint);
    render.mouse = mouse;

    const combineCooldown = new Set();

    Matter.Events.on(engine, 'collisionActive', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        if (bodyA.isWall || bodyB.isWall) return;
        if (!bodyA.symbol || !bodyB.symbol) return;

        const relativeVelocity = Matter.Vector.magnitude(
          Matter.Vector.sub(bodyA.velocity, bodyB.velocity)
        );
        if (relativeVelocity > 2.3) return;

        const key = `${Math.min(bodyA.id, bodyB.id)}-${Math.max(bodyA.id, bodyB.id)}`;
        if (combineCooldown.has(key)) return;

        combineCooldown.add(key);
        window.setTimeout(() => combineCooldown.delete(key), 300);

        const combined = combineSymbolBodies(worldRef.current, bodyA, bodyB);
        if (combined) {
          bodiesRef.current = bodiesRef.current.filter(
            (body) => body.id !== bodyA.id && body.id !== bodyB.id
          );
          bodiesRef.current.push(combined);
        }
      });
    });

    // Keep bodies drifting and perform screen wrapping before each update
    Matter.Events.on(engine, 'beforeUpdate', () => {
      const minSpeed = 0.24;
      const wrapMargin = 48;
      bodiesRef.current.forEach((body) => {
        if (!body || body.isWall) return;
        // enforce tiny air friction for subtle motion
        body.frictionAir = 0.001;

        // ensure minimum drift so objects never stop
        const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
        if (speed < minSpeed) {
          const push = 0.6;
          Matter.Body.setVelocity(body, {
            x: body.velocity.x + (Math.random() - 0.5) * push,
            y: body.velocity.y + (Math.random() - 0.5) * push,
          });
        }

        // screen wrapping
        if (body.position.x < -wrapMargin) {
          Matter.Body.setPosition(body, { x: bounds.width + wrapMargin, y: body.position.y });
        } else if (body.position.x > bounds.width + wrapMargin) {
          Matter.Body.setPosition(body, { x: -wrapMargin, y: body.position.y });
        }
        if (body.position.y < -wrapMargin) {
          Matter.Body.setPosition(body, { x: body.position.x, y: bounds.height + wrapMargin });
        } else if (body.position.y > bounds.height + wrapMargin) {
          Matter.Body.setPosition(body, { x: body.position.x, y: -wrapMargin });
        }
      });
    });

    const draw = () => {
      context.clearRect(0, 0, bounds.width, bounds.height);

      bodiesRef.current.forEach((body) => {
        if (body.isWall) return;
        const { x, y } = body.position;

        const size = Math.max(18, 28 - Math.min(body.symbol.length - 1, 8) * 2);
        context.save();
        context.translate(x, y);
        context.rotate(body.angle);

        // crisp white text, no bounding box
        context.fillStyle = '#FFFFFF';
        context.font = `bold ${size}px 'Courier New', monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'rgba(255,255,255,0.08)';
        context.shadowBlur = 6;
        context.fillText(body.symbol, 0, 0);
        context.restore();
      });
    };

    let lastTime = performance.now();
    const step = (time) => {
      const delta = Math.min(34, time - lastTime);
      Matter.Engine.update(engine, delta);
      draw();
      lastTime = time;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    const handleResize = () => {
      bounds.width = window.innerWidth;
      bounds.height = window.innerHeight;
      resizeCanvas();
      Matter.World.remove(worldRef.current, walls);
      walls.forEach((wall) => {
        wall.position.x = wall.position.x < 0 ? -32 : wall.position.x > bounds.width ? bounds.width + 32 : bounds.width / 2;
        wall.position.y = wall.position.y < 0 ? -32 : wall.position.y > bounds.height ? bounds.height + 32 : bounds.height / 2;
      });
      walls[0] = createWall(bounds.width / 2, -32, bounds.width + 64, 64);
      walls[1] = createWall(bounds.width / 2, bounds.height + 32, bounds.width + 64, 64);
      walls[2] = createWall(-32, bounds.height / 2, 64, bounds.height + 64);
      walls[3] = createWall(bounds.width + 32, bounds.height / 2, 64, bounds.height + 64);
      Matter.World.add(worldRef.current, walls);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      Matter.World.clear(worldRef.current, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div className="screensaver-modal" role="dialog" aria-label="Screensaver">
      <canvas ref={canvasRef} className="screensaver-canvas" />
      <button type="button" className="screensaver-close-btn" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
