
const palette = {
  night: [23, 18, 28],
  cream: [243, 235, 221],
  burgundy: [69, 8, 8],
  rose: [210, 112, 151],
  lightRose: [239, 177, 194],
  sage: [163, 181, 139],
  bark: [100, 67, 64]
};

let branches = [];
let blossoms = [];
let petals = [];
let fireflies = [];

let treeX;
let treeY;
let treeScale = 1.2;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("visual");

  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

  createTree();
  createFireflies();
}

function createTree() {
  branches = [];
  blossoms = [];

  treeX = width * 0.2;
  treeY = height * 1.2 ;

  // Start with the trunk and grow recursively
  growBranch(
    treeX, treeY,
    -HALF_PI,
    height * 0.25,
    0,
    9
  );

  // Flowers grow along the branches
  for (const branch of branches) {
    if (branch.depth >= 3) {
      const count = Math.floor(branch.len / 7);

      for (let i = 0; i < count; i++) {
        const t = random(0.15, 1);
        const x = branch.x + cos(branch.angle) * branch.len * t;
        const y = branch.y + sin(branch.angle) * branch.len * t;

        blossoms.push({
          x,
          y,
          size: random(5, 8),
          phase: random(TWO_PI),
          shade: random()
        });
      }
    }
  }
}

function growBranch(x, y, angle, len, depth, maxDepth) {
  if (depth > maxDepth || len < 5) return;

  const endX = x + cos(angle) * len;
  const endY = y + sin(angle) * len;

  branches.push({
    x, y,
    endX, endY,
    angle,
    len,
    depth,
    phase: random(TWO_PI)
  });

  // Natural forked branches
  if (depth < maxDepth) {
    const spread = random(0.25, 0.65);
    const nextLen = len * random(0.68, 0.79);

    growBranch(
      endX, endY,
      angle - spread,
      nextLen,
      depth + 1,
      maxDepth
    );

    growBranch(
      endX, endY,
      angle + spread * random(0.8, 1.5),
      nextLen * random(0.75, 1.05),
      depth + 1,
      maxDepth
    );

    // Extra side branch for a fuller canopy
    if (random() > 0.35) {
      growBranch(
        endX, endY,
        angle + random(-0.35, 0.35),
        nextLen * 0.72,
        depth + 1,
        maxDepth
      );
    }
  }
}

function createFireflies() {
  fireflies = [];

  for (let i = 0; i < 35; i++) {
    fireflies.push({
      x: random(width),
      y: random(height),
      size: random(1, 2.5),
      phase: random(TWO_PI),
      speed: random(0.2, 0.7)
    });
  }
}

function draw() {
  background(...palette.night);

  drawMoonGlow();
  drawFireflies();

  // A little movement, like a breeze
  const breeze = sin(frameCount * 0.008) * 0.025;

  push();
  translate(treeX, treeY);
  scale(treeScale);
  translate(-treeX, -treeY);

  // Draw branches from thick trunk to delicate twigs
  for (const b of branches) {
    const sway = sin(frameCount * 0.012 + b.phase) *
      b.depth * 0.6;

    const x1 = b.x;
    const y1 = b.y;
    const x2 = b.endX + sway;
    const y2 = b.endY + breeze * b.depth * 15;

    stroke(
      palette.bark[0],
      palette.bark[1],
      palette.bark[2],
      220
    );
    strokeWeight(map(b.depth, 0, 9, 9, 0.7));
    line(x1, y1, x2, y2);
    
  }

  // Blossoms attached to the branches
  for (const flower of blossoms) {
    drawBlossom(flower);
  }

  pop();

  // Petals flying around the tree
  updatePetals();
}

function drawMoonGlow() {
  noStroke();

  for (let i = 8; i >= 0; i--) {
    fill(210, 112, 151, 3);
    circle(
      width * 0.5,
      height * 0.43,
      (i + 1) * Math.min(width, height) * 0.12
    );
  }
}

function drawBlossom(flower) {
  const sway = sin(frameCount * 0.015 + flower.phase) * 2;
  const pulse = 1 + sin(frameCount * 0.025 + flower.phase) * 0.06;

  push();
  translate(flower.x + sway, flower.y);
  rotate(sin(frameCount * 0.01 + flower.phase) * 0.12);
  scale(pulse);

  noStroke();

  const pink = flower.shade > 0.5
    ? palette.rose
    : palette.lightRose;

  // Five rounded petals
  for (let i = 0; i < 5; i++) {
    push();
    rotate(TWO_PI * i / 5);

    fill(...pink, 220);
    ellipse(0, -flower.size * 0.65,
      flower.size * 0.65,
      flower.size * 1.15);

    pop();
  }

  fill(...palette.cream, 230);
  circle(0, 0, flower.size * 0.35);

  pop();
}

function updatePetals() {
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];

    p.x += p.vx;
    p.y += p.vy;

    p.vx *= 0.99;
    p.vy += 0.012;

    p.rotation += p.spin;
    p.life -= 1;

    // Gentle floating motion
    p.x += sin(frameCount * 0.04 + p.phase) * 0.5;

    push();
    translate(p.x, p.y);
    rotate(p.rotation);

    noStroke();
    fill(...p.color, map(p.life, 0, 100, 0, 220, true));
    ellipse(0, 0, p.size * 0.7, p.size * 1.4);

    pop();

    if (p.life <= 0 || p.y > height + 30) {
      petals.splice(i, 1);
    }
  }
}

function mouseMoved() {
  // Centre de la couronne du cerisier
  const canopyX = treeX;
  const canopyY = treeY - height * 0.25 * treeScale;

  // Rayon d'interaction autour de l'arbre
  const radius = Math.min(width, height) * 0.68 * treeScale;

  const distance = dist(
    mouseX,
    mouseY,
    canopyX,
    canopyY
  );

  if (distance < radius) {
    for (let i = 0; i < 3; i++) {
      releasePetal(mouseX, mouseY);
    }
  }

  return false;
}

function mouseDragged() {
  // Dragging creates a stronger gust of petals
  for (let i = 0; i < 5; i++) {
    releasePetal(mouseX, mouseY, 1.8);
  }

  return false;
}

function releasePetal(x, y, force = 1) {
  if (petals.length > 250) return;

  const angle = random(-PI, PI);

  petals.push({
    x: x + random(-12, 12),
    y: y + random(-12, 12),
    vx: cos(angle) * random(0.8, 3) * force,
    vy: random(-2.5, 0.5) * force,
    size: random(5, 10),
    rotation: random(TWO_PI),
    spin: random(-0.08, 0.08),
    life: random(70, 150),
    phase: random(TWO_PI),
    color: random() > 0.5
      ? palette.rose
      : palette.lightRose
  });
}

function drawFireflies() {
  noStroke();

  for (const f of fireflies) {
    const alpha = map(
      sin(frameCount * 0.025 + f.phase),
      -1, 1, 25, 150
    );

    fill(...palette.cream, alpha);
    circle(
      f.x + sin(frameCount * 0.006 + f.phase) * 8,
      f.y + cos(frameCount * 0.008 + f.phase) * 5,
      f.size
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createTree();
  createFireflies();
}
