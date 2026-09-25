import React, {useEffect, useRef, useState} from 'react';
import './styles.css';

type EffectTheme = 'galaxy' | 'christmas' | 'halloween' | 'none';

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  twinkleSpeed: number;
  phase: number;
};

type Snowflake = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
  wobble: number;
  rotation: number;
  spin: number;
};

type Ember = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
};

type ChristmasLight = {
  xRatio: number;
  phase: number;
  flickerSpeed: number;
  color: string;
  size: number;
  brightness: number;
  targetBrightness: number;
  nextFlickerAt: number;
  visibility: number;
  targetVisibility: number;
  nextVisibilityAt: number;
};

type HalloweenPumpkin = {
  xRatio: number;
  yRatio: number;
  size: number;
  phase: number;
};

type HalloweenCat = {
  xRatio: number;
  yRatio: number;
  size: number;
  phase: number;
};

type HalloweenState = {
  pumpkins: HalloweenPumpkin[];
  cats: HalloweenCat[];
  nextStrikeAt: number;
  strikeUntil: number;
  strikeStartedAt: number;
  strikeXRatio: number;
  strikePoints: Array<{x: number; y: number}>;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

const STAR_COUNT = 180;
const SNOW_COUNT = 85;
const EMBER_COUNT = 42;
const LIGHT_COLORS = ['#ef3340', '#22c55e', '#ffd166', '#3b82f6'];

/* Ground-decoration geometry, in pixels from the viewport edge. */
const HALLOWEEN_PUMPKIN_INSETS = [50, 128];
const HALLOWEEN_CAT_INSET = 92;
const HALLOWEEN_CLUSTER_SPAN = 128;
const SHOOTING_STAR_CHANCE_PER_FRAME = 0.0035;
const MAX_SHOOTING_STARS = 2;

function getTheme(): EffectTheme {
  if (typeof document === 'undefined') {
    return 'none';
  }

  const theme = document.documentElement.dataset.techTheme;

  if (theme === 'galaxy') return 'galaxy';
  if (theme === 'christmas') return 'christmas';
  if (theme === 'halloween') return 'halloween';

  return 'none';
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createStars(width: number, height: number): Star[] {
  return Array.from({length: STAR_COUNT}, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: randomBetween(0.15, 1),
    size: randomBetween(0.45, 1.9),
    speed: randomBetween(0.012, 0.065),
    twinkleSpeed: randomBetween(0.0007, 0.002),
    phase: Math.random() * Math.PI * 2,
  }));
}

function createSnowflake(width: number, y: number): Snowflake {
  return {
    x: Math.random() * width,
    y,
    radius: randomBetween(0.8, 3.0),
    speed: randomBetween(28, 108),
    drift: randomBetween(-14, 14),
    phase: Math.random() * Math.PI * 2,
    opacity: randomBetween(0.32, 0.88),
    wobble: randomBetween(0.45, 1.7),
    rotation: Math.random() * Math.PI * 2,
    spin: randomBetween(-0.9, 0.9),
  };
}

function createSnow(width: number, height: number): Snowflake[] {
  const count = Math.max(
    SNOW_COUNT,
    Math.min(150, Math.round((width * height) / 15000)),
  );

  return Array.from({length: count}, () =>
    createSnowflake(width, randomBetween(-height * 0.2, height)),
  );
}

function recycleSnowflake(flake: Snowflake, width: number) {
  Object.assign(flake, createSnowflake(width, randomBetween(-90, -12)));
}

function createEmbers(width: number, height: number): Ember[] {
  return Array.from({length: EMBER_COUNT}, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: randomBetween(0.8, 2.5),
    speed: randomBetween(0.16, 0.55),
    drift: randomBetween(-0.12, 0.12),
    phase: Math.random() * Math.PI * 2,
    opacity: randomBetween(0.18, 0.65),
  }));
}

function createLights(width: number, time: number): ChristmasLight[] {
  /* One bulb roughly every 92px at every width, so a phone string reads
     with the same spacing and bulb size as the desktop one. */
  const count = Math.max(5, Math.floor(width / 92));

  return Array.from({length: count}, (_, index) => ({
    xRatio: (index + 0.5) / count,
    phase: Math.random() * Math.PI * 2,
    flickerSpeed: randomBetween(3.2, 5.8),
    color: LIGHT_COLORS[index % LIGHT_COLORS.length],
    size: randomBetween(4.2, 5.8),
    brightness: randomBetween(0.45, 0.9),
    targetBrightness: randomBetween(0.45, 0.95),
    nextFlickerAt: time + randomBetween(1400, 4200),
    visibility: randomBetween(0.72, 1),
    targetVisibility: randomBetween(0.72, 1),
    nextVisibilityAt: time + randomBetween(2400, 6800),
  }));
}

function randomEdgeRatio(): number {
  return Math.random() < 0.5
    ? randomBetween(0.04, 0.20)
    : randomBetween(0.80, 0.96);
}

function createHalloweenState(width = 1024): HalloweenState {
  /* Each corner cluster is two pumpkins with a cat between them, placed at
     fixed pixel insets from the viewport edge instead of at a fraction of
     the width. Ratio slots collapsed the cluster on phones — the cat landed
     on its own pumpkin and hid it — so phone and desktop now draw the same
     cluster at the same size. Only a viewport too narrow to hold it scales
     the whole cluster down together. */
  const scale = Math.min(1, (width * 0.3) / HALLOWEEN_CLUSTER_SPAN);
  const edgePair = (inset: number) => [inset * scale, width - inset * scale];

  return {
    pumpkins: HALLOWEEN_PUMPKIN_INSETS.flatMap(
      (inset) => edgePair(inset),
    ).map((x, index) => ({
      xRatio: x / width,
      yRatio: 0.99 + (index % 2) * 0.005,
      size: randomBetween(19, 32) * scale,
      phase: Math.random() * Math.PI * 2,
    })),
    cats: edgePair(HALLOWEEN_CAT_INSET).map((x) => ({
      xRatio: x / width,
      yRatio: 0.995,
      size: randomBetween(24, 35) * scale,
      phase: Math.random() * Math.PI * 2,
    })),
    nextStrikeAt: randomBetween(1800, 5200),
    strikeUntil: 0,
    strikeStartedAt: 0,
    strikeXRatio: randomEdgeRatio(),
    strikePoints: [],
  };
}

function drawPumpkin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  phase: number,
) {
  const pulse = 0.82 + Math.sin(time * 0.002 + phase) * 0.10;
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = 12 * pulse;
  ctx.shadowColor = '#ff7518';
  ctx.fillStyle = '#d95b12';
  ctx.beginPath();
  ctx.ellipse(-size * 0.30, 0, size * 0.36, size * 0.48, 0, 0, Math.PI * 2);
  ctx.ellipse(0, 0, size * 0.40, size * 0.52, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.30, 0, size * 0.36, size * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#4d3210';
  ctx.fillRect(-size * 0.08, -size * 0.58, size * 0.16, size * 0.20);

  ctx.fillStyle = '#140d12';
  ctx.beginPath();
  ctx.moveTo(-size * 0.27, -size * 0.08);
  ctx.lineTo(-size * 0.07, -size * 0.22);
  ctx.lineTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.24, 0.02);
  ctx.closePath();
  ctx.moveTo(size * 0.27, -size * 0.08);
  ctx.lineTo(size * 0.07, -size * 0.22);
  ctx.lineTo(size * 0.04, 0);
  ctx.lineTo(size * 0.24, 0.02);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.16);
  ctx.quadraticCurveTo(0, size * 0.38, size * 0.25, size * 0.16);
  ctx.quadraticCurveTo(0, size * 0.54, -size * 0.25, size * 0.16);
  ctx.fill();
  ctx.restore();
}

function drawBlackCat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  phase: number,
) {
  const tail = Math.sin(time * 0.0012 + phase) * size * 0.16;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#09070b';
  ctx.strokeStyle = '#24152d';
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.shadowBlur = 7;
  ctx.shadowColor = 'rgba(255, 117, 24, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.20, size * 0.30, size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(0, -size * 0.20, size * 0.27, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.36);
  ctx.lineTo(-size * 0.28, -size * 0.70);
  ctx.lineTo(-size * 0.03, -size * 0.50);
  ctx.closePath();
  ctx.moveTo(size * 0.22, -size * 0.36);
  ctx.lineTo(size * 0.28, -size * 0.70);
  ctx.lineTo(size * 0.03, -size * 0.50);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.24, size * 0.36);
  ctx.bezierCurveTo(size * 0.70, size * 0.20, size * 0.70 + tail, -size * 0.08, size * 0.46 + tail, -size * 0.20);
  ctx.stroke();
  ctx.fillStyle = '#ffb52e';
  ctx.beginPath();
  ctx.arc(-size * 0.09, -size * 0.22, size * 0.035, 0, Math.PI * 2);
  ctx.arc(size * 0.09, -size * 0.22, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHalloweenLightning(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: HalloweenState,
  time: number,
) {
  if (time >= state.nextStrikeAt) {
    state.strikeStartedAt = time;
    state.strikeUntil = time + randomBetween(120, 220);
    state.nextStrikeAt = time + randomBetween(3200, 8200);
    state.strikeXRatio = randomEdgeRatio();

    const points: Array<{x: number; y: number}> = [
      {x: width * state.strikeXRatio, y: 0},
    ];
    let y = height * 0.04;
    let currentX = points[0].x;
    while (y < height * 0.58) {
      currentX += randomBetween(-28, 28);
      y += randomBetween(38, 72);
      points.push({x: currentX, y});
    }
    state.strikePoints = points;
  }

  if (time < state.strikeUntil && state.strikePoints.length > 1) {
    const duration = Math.max(120, state.strikeUntil - state.strikeStartedAt);
    const elapsed = Math.max(0, time - state.strikeStartedAt);
    const progress = Math.min(1, elapsed / duration);
    const alpha = Math.max(0, Math.sin(progress * Math.PI) * 0.72);
    ctx.fillStyle = `rgba(225,235,255,${alpha * 0.10})`;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(220,235,255,0.9)';
    ctx.strokeStyle = `rgba(235,242,255,${alpha})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(state.strikePoints[0].x, state.strikePoints[0].y);
    for (let i = 1; i < state.strikePoints.length; i += 1) {
      ctx.lineTo(state.strikePoints[i].x, state.strikePoints[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function spawnShootingStar(width: number, height: number): ShootingStar {
  const startX = randomBetween(width * 0.1, width * 0.75);
  const angle = randomBetween(Math.PI * 0.15, Math.PI * 0.3);
  const speed = randomBetween(9, 15);

  return {
    x: startX,
    y: randomBetween(-20, height * 0.35),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: randomBetween(28, 46),
    size: randomBetween(1.6, 2.6),
  };
}

function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  shootingStars: ShootingStar[],
  width: number,
  height: number,
  time: number,
) {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.y += star.speed * (0.45 + star.z);
    star.x += Math.sin(time * 0.00008 + star.phase) * 0.01 * star.z;

    if (star.y > height + 4) {
      star.y = -4;
      star.x = Math.random() * width;
    }

    if (star.x < -4) star.x = width + 4;
    if (star.x > width + 4) star.x = -4;

    const twinkle =
      0.78 +
      Math.sin(time * star.twinkleSpeed + star.phase) * 0.16;

    const alpha = Math.max(
      0.10,
      Math.min(0.95, twinkle * (0.32 + star.z * 0.58)),
    );

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.arc(
      star.x,
      star.y,
      star.size * (0.65 + star.z * 0.75),
      0,
      Math.PI * 2,
    );
    ctx.fill();

    if (star.size > 1.45 && star.z > 0.72) {
      const glowRadius = star.size * 4.5;
      const glow = ctx.createRadialGradient(
        star.x,
        star.y,
        0,
        star.x,
        star.y,
        glowRadius,
      );

      glow.addColorStop(0, `rgba(145,170,255,${alpha * 0.24})`);
      glow.addColorStop(1, 'rgba(145,170,255,0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* Occasional shooting star for a bit of extra life. */
  if (
    shootingStars.length < MAX_SHOOTING_STARS &&
    Math.random() < SHOOTING_STAR_CHANCE_PER_FRAME
  ) {
    shootingStars.push(spawnShootingStar(width, height));
  }

  for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
    const streak = shootingStars[i];

    streak.x += streak.vx;
    streak.y += streak.vy;
    streak.life += 1;

    const progress = streak.life / streak.maxLife;
    const fadeIn = Math.min(1, progress * 6);
    const fadeOut = Math.min(1, (1 - progress) * 3);
    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

    if (
      progress >= 1 ||
      streak.x > width + 60 ||
      streak.y > height + 60
    ) {
      shootingStars.splice(i, 1);
      continue;
    }

    const tailLength = 70;
    const tailX = streak.x - streak.vx * (tailLength / 12);
    const tailY = streak.y - streak.vy * (tailLength / 12);

    const trail = ctx.createLinearGradient(
      streak.x,
      streak.y,
      tailX,
      tailY,
    );

    trail.addColorStop(0, `rgba(255,255,255,${alpha})`);
    trail.addColorStop(0.4, `rgba(180,200,255,${alpha * 0.5})`);
    trail.addColorStop(1, 'rgba(180,200,255,0)');

    ctx.beginPath();
    ctx.strokeStyle = trail;
    ctx.lineWidth = streak.size;
    ctx.lineCap = 'round';
    ctx.moveTo(streak.x, streak.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.arc(streak.x, streak.y, streak.size * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
}

/*
 * The wire's sag is a pure function of x so the drawn curve and every
 * light's socket position are always computed from the exact same
 * formula. Previously the wire was a hand-tuned bezier while each
 * light used an unrelated sine wave, so the bulbs visibly floated
 * above/below the wire instead of hanging from it.
 */
function wireSagAt(xRatio: number, time: number): number {
  return (
    Math.sin(xRatio * Math.PI * 2.1 + 0.4) * 6 +
    Math.sin(xRatio * Math.PI * 4.6 + 1.7) * 2.5 +
    /* A very slow, gentle overall sway so the garland feels alive. */
    Math.sin(time * 0.00025 + xRatio * Math.PI) * 1.5
  );
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }

  const corner = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + corner, y);
  ctx.lineTo(x + width - corner, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + corner);
  ctx.lineTo(x + width, y + height - corner);
  ctx.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
  ctx.lineTo(x + corner, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - corner);
  ctx.lineTo(x, y + corner);
  ctx.quadraticCurveTo(x, y, x + corner, y);
}

function drawSnowflake(ctx: CanvasRenderingContext2D, flake: Snowflake) {
  if (flake.radius < 2.05) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${flake.opacity})`;
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const armLength = flake.radius * 1.85;
  ctx.save();
  ctx.translate(flake.x, flake.y);
  ctx.rotate(flake.rotation);
  ctx.strokeStyle = `rgba(244,250,255,${flake.opacity})`;
  ctx.lineWidth = Math.max(0.5, flake.radius * 0.26);
  ctx.lineCap = 'round';

  for (let arm = 0; arm < 6; arm += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(armLength, 0);
    ctx.moveTo(armLength * 0.55, 0);
    ctx.lineTo(armLength * 0.32, -armLength * 0.2);
    ctx.moveTo(armLength * 0.55, 0);
    ctx.lineTo(armLength * 0.32, armLength * 0.2);
    ctx.stroke();
    ctx.rotate(Math.PI / 3);
  }

  ctx.restore();
}

function drawChristmas(
  ctx: CanvasRenderingContext2D,
  garlandCtx: CanvasRenderingContext2D | null,
  snow: Snowflake[],
  lights: ChristmasLight[],
  width: number,
  height: number,
  time: number,
  deltaSeconds: number,
  wireBaseY: number,
) {
  ctx.clearRect(0, 0, width, height);

  /* Snow: two visually different depth groups are mixed into one
     particle field to avoid a repeating CSS texture. */
  for (const flake of snow) {
    const sway =
      Math.sin(time * 0.001 * flake.wobble + flake.phase) * 15;

    flake.y += flake.speed * deltaSeconds;
    flake.x += (flake.drift + sway) * deltaSeconds;
    flake.rotation += flake.spin * deltaSeconds;

    if (flake.y > height + 8) {
      recycleSnowflake(flake, width);
    }

    if (flake.x < -8) flake.x = width + 8;
    if (flake.x > width + 8) flake.x = -8;

    drawSnowflake(ctx, flake);
  }

  /* Keep lights above the navbar surface while snow remains behind content. */
  if (garlandCtx) {
    garlandCtx.clearRect(0, 0, width, height);
    garlandCtx.save();
    ctx = garlandCtx;
  }

  /* Christmas string: a gently sagging wire hung just below the
     navbar, drawn by sampling the shared sag function so it always
     matches where the bulbs are placed. */
  ctx.beginPath();

  const steps = Math.max(24, Math.floor(width / 24));

  for (let i = 0; i <= steps; i += 1) {
    const xRatio = i / steps;
    const x = width * xRatio;
    const y = wireBaseY + wireSagAt(xRatio, time);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle = 'rgba(16, 44, 24, 0.98)';
  ctx.lineWidth = 3;
  ctx.stroke();

  /* Pine garland: simple hand-drawn branches, berries and bows. */
  const garlandStep = Math.max(54, width / 16);
  for (let x = -garlandStep; x <= width + garlandStep; x += garlandStep) {
    const ratio = Math.max(0, Math.min(1, x / width));
    const y = wireBaseY + wireSagAt(ratio, time) + 5;

    ctx.strokeStyle = 'rgba(22, 82, 39, 0.95)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 7);
    ctx.lineTo(x + 3, y - 1);
    ctx.lineTo(x + 19, y + 8);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(35, 111, 54, 0.88)';
    ctx.lineWidth = 1.5;
    for (let branch = -1; branch <= 1; branch += 1) {
      ctx.beginPath();
      ctx.moveTo(x + branch * 7, y + 4);
      ctx.lineTo(x + branch * 7 - 9, y - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + branch * 7, y + 4);
      ctx.lineTo(x + branch * 7 + 9, y - 5);
      ctx.stroke();
    }

    if (Math.floor((x + garlandStep) / garlandStep) % 4 === 0) {
      ctx.fillStyle = '#c91f36';
      ctx.beginPath();
      ctx.arc(x - 3, y + 8, 3.1, 0, Math.PI * 2);
      ctx.arc(x + 3, y + 8, 3.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f3c969';
      ctx.fillRect(x - 1.2, y + 5, 2.4, 6);
    }
  }

  for (const light of lights) {
    const x = width * light.xRatio;
    const socketY = wireBaseY + wireSagAt(light.xRatio, time) + 2;
    const bulbLength = light.size * 3.05;
    const bulbTop = socketY + light.size * 0.75;
    const bulbBottom = socketY + bulbLength;
    const bulbY = (bulbTop + bulbBottom) / 2;

    /* Each bulb has an independent, slower rhythm so the string feels
       pleasantly irregular instead of strobing as one unit. */
    if (time >= light.nextFlickerAt) {
      light.targetBrightness = randomBetween(0.30, 1);
      light.nextFlickerAt = time + randomBetween(1400, 4800);
    }

    /* Occasionally let an individual bulb fade almost away, then return at
       a different time, like a real incandescent string. */
    if (time >= light.nextVisibilityAt) {
      light.targetVisibility = Math.random() < 0.35
        ? randomBetween(0.08, 0.28)
        : randomBetween(0.72, 1);
      light.nextVisibilityAt = time + randomBetween(2600, 7600);
    }

    const blend = 1 - Math.exp(-light.flickerSpeed * deltaSeconds);
    const visibilityBlend = 1 - Math.exp(-1.35 * deltaSeconds);
    light.brightness += (light.targetBrightness - light.brightness) * blend;
    light.visibility +=
      (light.targetVisibility - light.visibility) * visibilityBlend;

    const brightness = Math.max(0.12, Math.min(1, light.brightness));
    const visibility = Math.max(0.08, Math.min(1, light.visibility));
    ctx.save();
    ctx.globalAlpha = visibility;

    /* Warm glow */
    const glowRadius = light.size * (5.5 + brightness * 2.5);

    const glow = ctx.createRadialGradient(
      x,
      bulbY,
      0,
      x,
      bulbY,
      glowRadius,
    );

    glow.addColorStop(
      0,
      `${light.color}${Math.floor(55 + brightness * 90)
        .toString(16)
        .padStart(2, '0')}`,
    );

    glow.addColorStop(
      0.5,
      `${light.color}${Math.floor(38 * visibility).toString(16).padStart(2, '0')}`,
    );
    glow.addColorStop(1, `${light.color}00`);

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, bulbY, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    /* Ribbed, dark-green socket above the opaque C7-style bulb. */
    ctx.fillStyle = '#152019';
    ctx.beginPath();
    drawRoundedRect(
      ctx,
      x - light.size * 0.62,
      socketY - 1,
      light.size * 1.24,
      light.size * 1.15,
      light.size * 0.2,
    );
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 238, 220, 0.28)';
    ctx.lineWidth = 0.65;
    for (let ridge = 0; ridge < 2; ridge += 1) {
      const ridgeY = socketY + light.size * (0.25 + ridge * 0.34);
      ctx.beginPath();
      ctx.moveTo(x - light.size * 0.48, ridgeY);
      ctx.lineTo(x + light.size * 0.48, ridgeY);
      ctx.stroke();
    }

    /* Full opaque C7/candle profile: narrow neck, rounded shoulders, soft tip. */
    const bulbWidth = light.size * 0.94;
    const bulbNeck = light.size * 0.42;
    const bodyGradient = ctx.createLinearGradient(
      x - bulbWidth,
      bulbY,
      x + bulbWidth,
      bulbY,
    );
    bodyGradient.addColorStop(0, `${light.color}b0`);
    bodyGradient.addColorStop(0.45, light.color);
    bodyGradient.addColorStop(1, `${light.color}cc`);

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(x - bulbNeck, bulbTop);
    ctx.bezierCurveTo(
      x - bulbWidth,
      bulbTop + bulbLength * 0.16,
      x - bulbWidth,
      bulbBottom - bulbLength * 0.28,
      x - bulbWidth * 0.34,
      bulbBottom - bulbLength * 0.06,
    );
    ctx.quadraticCurveTo(x, bulbBottom, x + bulbWidth * 0.34, bulbBottom - bulbLength * 0.06);
    ctx.bezierCurveTo(
      x + bulbWidth,
      bulbBottom - bulbLength * 0.28,
      x + bulbWidth,
      bulbTop + bulbLength * 0.16,
      x + bulbNeck,
      bulbTop,
    );
    ctx.closePath();
    ctx.fill();

    /* Glass highlight gives the opaque bulb an incandescent finish. */
    ctx.strokeStyle = `rgba(255,255,255,${0.20 + brightness * 0.32})`;
    ctx.lineWidth = Math.max(0.7, light.size * 0.18);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - bulbWidth * 0.34, bulbTop + bulbLength * 0.25);
    ctx.bezierCurveTo(
      x - bulbWidth * 0.50,
      bulbTop + bulbLength * 0.42,
      x - bulbWidth * 0.30,
      bulbTop + bulbLength * 0.61,
      x - bulbWidth * 0.14,
      bulbTop + bulbLength * 0.68,
    );
    ctx.stroke();
    ctx.restore();
  }

  if (garlandCtx) {
    garlandCtx.restore();
  }
}

function drawHalloween(
  ctx: CanvasRenderingContext2D,
  embers: Ember[],
  state: HalloweenState,
  width: number,
  height: number,
  time: number,
) {
  ctx.clearRect(0, 0, width, height);

  const fog = ctx.createRadialGradient(
    width * 0.5,
    height * 0.78,
    0,
    width * 0.5,
    height * 0.78,
    Math.max(width, height) * 0.72,
  );

  fog.addColorStop(0, 'rgba(120, 35, 150, 0.055)');
  fog.addColorStop(0.55, 'rgba(255, 90, 20, 0.02)');
  fog.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, width, height);

  for (const ember of embers) {
    ember.y -= ember.speed;
    ember.x +=
      ember.drift +
      Math.sin(time * 0.0011 + ember.phase) * 0.12;

    if (ember.y < -12) {
      ember.y = height + 12;
      ember.x = Math.random() * width;
    }

    const pulse =
      0.72 +
      Math.sin(time * 0.0016 + ember.phase) * 0.22;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,104,35,${Math.max(
      0.06,
      ember.opacity * pulse,
    )})`;
    ctx.arc(
      ember.x,
      ember.y,
      ember.size,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  /* Ground decorations: pumpkins and black cats stay subtle and out of the way. */
  for (const pumpkin of state.pumpkins) {
    drawPumpkin(
      ctx,
      width * pumpkin.xRatio,
      height * pumpkin.yRatio,
      pumpkin.size,
      time,
      pumpkin.phase,
    );
  }

  for (const cat of state.cats) {
    drawBlackCat(
      ctx,
      width * cat.xRatio,
      height * cat.yRatio,
      cat.size,
      time,
      cat.phase,
    );
  }

  drawHalloweenLightning(ctx, width, height, state, time);
}

export default function ThemeEffects(): React.ReactElement | null {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const garlandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [theme, setTheme] = useState<EffectTheme>(() => getTheme());

  useEffect(() => {
    const updateTheme = () => {
      const nextTheme = getTheme();
      setTheme(nextTheme);

      /* Only take over from the CSS fallback layers when we're
         actually going to animate on canvas. If the person prefers
         reduced motion, the canvas never draws (see below), so we
         must leave the CSS layers alone or the theme loses its
         snow/stars/lights entirely instead of falling back to a
         static version of them. */
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      document.documentElement.classList.toggle(
        'ctt-theme-effects-active',
        nextTheme !== 'none' && !prefersReducedMotion,
      );
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-tech-theme'],
    });

    return () => {
      observer.disconnect();

      document.documentElement.classList.remove(
        'ctt-theme-effects-active',
      );
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || theme === 'none') {
      return;
    }

    const ctx = canvas.getContext('2d');
    const garlandCanvas = garlandCanvasRef.current;
    const garlandCtx = theme === 'christmas'
      ? garlandCanvas?.getContext('2d') ?? null
      : null;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    /* Re-assert the marker when the canvas effect is (re)mounted. */
    document.documentElement.classList.toggle(
      'ctt-theme-effects-active',
      !prefersReducedMotion,
    );

    if (!ctx || (theme === 'christmas' && !garlandCtx)) {
      return;
    }

    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let snow: Snowflake[] = [];
    let embers: Ember[] = [];
    let halloweenState: HalloweenState = createHalloweenState();
    let lights: ChristmasLight[] = [];
    /* Where the garland hangs from, in viewport pixels: just under the
       navbar, identically on desktop, tablet and phone. */
    let wireBaseY = 60;

    const measureWireBaseY = () => {
      const navbar = document.querySelector<HTMLElement>('.navbar');
      const rect = navbar?.getBoundingClientRect();
      const bottom = rect?.bottom;

      /* Follow the navbar's actual viewport position. Do not assume it
         starts at viewport Y=0: Docusaurus/custom layouts can offset it,
         and it hides/shows on scroll. */
      wireBaseY = !rect || !bottom || bottom <= 0 ? 60 : bottom + 2;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      /* Measure before sizing the garland canvas so its CSS and
         backing-store dimensions always agree with the current navbar. */
      if (theme === 'christmas') {
        measureWireBaseY();
      }

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (garlandCanvas && garlandCtx) {
        garlandCanvas.width = Math.floor(width * dpr);
        garlandCanvas.height = Math.floor(height * dpr);
        garlandCanvas.style.width = `${width}px`;
        garlandCanvas.style.height = `${height}px`;
        garlandCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      if (theme === 'galaxy') {
        stars = createStars(width, height);
      }

      if (theme === 'christmas') {
        snow = createSnow(width, height);
        lights = createLights(width, performance.now());
      }

      if (theme === 'halloween') {
        embers = createEmbers(width, height);
        halloweenState = createHalloweenState(width);
      }
    };

    const stop = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    let previousFrameTime: number | null = null;

    const frame = (time: number) => {
      if (document.hidden) {
        animationFrameRef.current =
          requestAnimationFrame(frame);
        return;
      }

      const deltaSeconds = previousFrameTime === null
        ? 1 / 60
        : Math.min(0.05, Math.max(0, (time - previousFrameTime) / 1000));
      previousFrameTime = time;

      if (theme === 'galaxy') {
        drawGalaxy(ctx, stars, shootingStars, width, height, time);
      } else if (theme === 'christmas') {
        drawChristmas(
          ctx,
          garlandCtx,
          snow,
          lights,
          width,
          height,
          time,
          deltaSeconds,
          wireBaseY,
        );
      } else if (theme === 'halloween') {
        drawHalloween(
          ctx,
          embers,
          halloweenState,
          width,
          height,
          time,
        );
      }

      animationFrameRef.current =
        requestAnimationFrame(frame);
    };

    resize();

    window.addEventListener('resize', resize);

    /* Docusaurus navbars can hide/show on scroll, which changes
       where the garland should hang without firing a resize event. */
    const handleScroll =
      theme === 'christmas'
        ? () => measureWireBaseY()
        : null;

    if (handleScroll) {
      window.addEventListener('scroll', handleScroll, {passive: true});
    }

    animationFrameRef.current =
      requestAnimationFrame(frame);

    return () => {
      stop();
      window.removeEventListener('resize', resize);

      if (handleScroll) {
        window.removeEventListener('scroll', handleScroll);
      }

      ctx.clearRect(0, 0, width, height);
      garlandCtx?.clearRect(0, 0, width, height);
    };
  }, [theme]);

  if (theme === 'none') {
    return null;
  }

  return (
    <>
      <div className="ctt-theme-effects-layer" aria-hidden="true">
        <canvas ref={canvasRef} className="ctt-theme-effects" />
      </div>
      {theme === 'christmas' && (
        <div className="ctt-theme-garland-layer" aria-hidden="true">
          <canvas ref={garlandCanvasRef} className="ctt-theme-garland" />
        </div>
      )}
    </>
  );
}
