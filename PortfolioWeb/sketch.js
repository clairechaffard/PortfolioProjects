
const palette = {
  night: [23, 18, 28],
  cream: [243, 235, 221],
  burgundy: [69, 8, 8],
  rose: [184, 75, 112],
  sage: [163, 181, 139]
};

let plants = [];
let particles = [];
let flowers = [];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("visual");

  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

  // Generate the garden
  createGarden();
}

function createGarden() {
  plants = [];
  particles = [];
  flowers = [];

  // Plants growing from the bottom of the screen
  const plantCount = Math.max(9, Math.floor(width / 75));

  for (let i = 0; i < plantCount; i++) {
    plants.push({
      x: (i / (plantCount - 1)) * width,
      height: random(height * 0.2, height * 0.62),
      bend: random(-65, 65),
      speed: random(0.5, 1.2),
      phase: random(TWO_PI),
      leafSize: random(16, 31),
      side: random() < 0.5 ? -1 : 1
    });
  }

  // Tiny floating lights
  for (let i = 0; i < 65; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.15, 0.6),
      phase: random(TWO_PI)
    });
  }
}

function draw() {
  background(...palette.night);

  // Soft atmospheric glow
  noStroke();
  for (let i = 5; i >= 0; i--) {
    fill(69, 8, 8, 3);
    ellipse(width * 0.5, height * 0.62,
      width * (0.2 + i * 0.12),
      height * (0.1 + i * 0.06));
  }

  drawParticles();

  // Draw plants from the back to the front
  for (let i = 0; i < plants.length; i++) {
    drawPlant(plants[i], i);
  }

  drawFlowers();
}

function drawPlant(plant, index) {
  const sway = sin(frameCount * 0.012 * plant.speed + plant.phase) * 15;
  const mouseInfluence = map(
    mouseX, 0, width, -10, 10, true
  );

  const topX = plant.x + plant.bend + sway + mouseInfluence;
  const topY = height - plant.height;

  // Stem
  noFill();
  stroke(...palette.sage, 150);
  strokeWeight(1.3);

  beginShape();
  vertex(plant.x, height + 10);
  bezierVertex(
    plant.x - sway * 0.2, height - plant.height * 0.3,
    topX + sway * 0.6, height - plant.height * 0.7,
    topX, topY
  );
  endShape();

  // Leaves along the stem
  const leafCount = Math.floor(plant.height / 34);

  for (let j = 1; j <= leafCount; j++) {
    const t = j / (leafCount + 1);

    const x = lerp(plant.x, topX, t);
    const y = lerp(height, topY, t);

    const wave = sin(frameCount * 0.018 + j + plant.phase) * 4;
    const side = j % 2 === 0 ? 1 : -1;

    drawLeaf(
      x + wave,
      y,
      side * plant.leafSize,
      side,
      frameCount * 0.015 + plant.phase + j * 0.4
    );
  }

  // Flower bud at the top
  if (index % 2 === 0 || plant.height > height * 0.45) {
    flowers.push({
      x: topX,
      y: topY,
      size: randomSeededSize(index),
      phase: plant.phase,
      color: index % 3 === 0 ? palette.cream : palette.rose
    });
  }
}

function drawLeaf(x, y, size, side, angle) {
  push();
  translate(x, y);
  rotate(side * 0.55 + sin(angle) * 0.12);

  noStroke();
  fill(...palette.sage, 150);

  // Organic leaf shape
  beginShape();
  vertex(0, 0);
  bezierVertex(
    size * 0.25, -size * 0.7,
    size * 0.9, -size * 0.65,
    size, 0
  );
  bezierVertex(
    size * 0.65, size * 0.15,
    size * 0.2, size * 0.1,
    0, 0
  );
  endShape(CLOSE);

  // Fine vein
  stroke(...palette.cream, 55);
  strokeWeight(0.6);
  line(0, 0, size * 0.8, -size * 0.05);

  pop();
}

function randomSeededSize(index) {
  return 4 + (index % 4) * 1.2;
}

function drawFlowers() {
  // Each flower grows from a plant tip
  for (const flower of flowers) {
    const pulse = 1 + sin(frameCount * 0.025 + flower.phase) * 0.08;
    const s = flower.size * pulse;

    push();
    translate(flower.x, flower.y);
    rotate(sin(frameCount * 0.01 + flower.phase) * 0.08);

    noStroke();

    // Five delicate petals
    for (let i = 0; i < 5; i++) {
      push();
      rotate(TWO_PI * i / 5);

      fill(...flower.color, 190);
      ellipse(0, -s, s * 0.65, s * 1.35);

      pop();
    }

    // Flower center
    fill(...palette.cream, 220);
    circle(0, 0, s * 0.5);

    pop();
  }

  // Clear the list; plant tips will be added again next frame
  flowers = [];
}

function drawParticles() {
  noStroke();

  for (const p of particles) {
    p.y -= p.speed;

    // Float back up from the bottom
    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }

    const glow = (sin(frameCount * 0.035 + p.phase) + 1) * 0.5;
    const alpha = 35 + glow * 100;

    fill(...palette.cream, alpha);
    circle(
      p.x + sin(frameCount * 0.008 + p.phase) * 5,
      p.y,
      p.size
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createGarden();
}
