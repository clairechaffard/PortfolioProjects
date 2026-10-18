const palette = {
  night: [23, 18, 28],
  cream: [243, 235, 221],
  rose: [210, 112, 151],
  lightRose: [239, 177, 194],
  sage: [163, 181, 139]
};

let stars = [];
let constellations = [];
let hoveredConstellation = -1;

// Caméra contrôlée par nous (au lieu de orbitControl) :
// c'est ce qui permet de projeter EXACTEMENT comme p5 dessine.
const FOV = Math.PI / 3;
let autoRotation = 0;
let viewYaw = 0;
let viewPitch = 0;
let zoom = 1;

// Valeurs calculées une fois par frame et partagées avec la projection
let sceneYaw = 0;
let scenePitch = 0;
let eyeZ = 800;

let pressX = 0;
let pressY = 0;

const projectData = [
  {
    name: "Michel's Story",
    category: "01 — STORYTELLING",
    href: "project.html?id=michel",
    color: "rose",
    angle: 0.2,
    tilt: -0.35,
    points: [
      [-38, 0], [-18, -24], [5, -5],
      [27, -30], [47, -8], [30, 20]
    ]
  },
  {
    name: "Mario Kart",
    category: "02 — GAME DESIGN",
    href: "project.html?id=mariokart",
    color: "sage",
    angle: 2.5,
    tilt: 0.3,
    points: [
      [-35, 8], [-15, -22], [8, 0],
      [29, -25], [48, 8], [18, 28]
    ]
  },
  {
    name: "Game Of Life",
    category: "03 — CREATIVE CODING",
    href: "project.html?id=GameOfLife",
    color: "lightRose",
    angle: 4.5,
    tilt: -0.2,
    points: [
      [-38, -8], [-15, -32], [8, -4],
      [31, -26], [50, 5], [25, 30]
    ]
  }
];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  canvas.parent("sky-visual");
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  textFont("Georgia");

  createStars();
  createConstellations();
}

function createStars() {
  stars = [];

  for (let i = 0; i < 240; i++) {
    stars.push({
      x: random(-width * 0.8, width * 0.8),
      y: random(-height * 0.8, height * 0.8),
      z: random(-650, 350),
      size: random(0.8, 2),
      phase: random(TWO_PI)
    });
  }
}

function createConstellations() {
  const radius = min(width * 0.36, height * 0.48);

  constellations = projectData.map(project => ({
    ...project,
    position: [
      cos(project.angle) * radius,
      sin(project.angle * 1.3) * radius * 0.55,
      sin(project.angle) * radius
    ],
    screenPoints: []
  }));
}

/* ------------------------------------------------------------------ */
/*  Maths 3D : MÊMES rotations et MÊME ordre que dans draw()           */
/* ------------------------------------------------------------------ */

// Mêmes formules que rotateX / rotateY de p5
function rotX(p, a) {
  return [
    p[0],
    p[1] * Math.cos(a) - p[2] * Math.sin(a),
    p[1] * Math.sin(a) + p[2] * Math.cos(a)
  ];
}

function rotY(p, a) {
  return [
    p[0] * Math.cos(a) + p[2] * Math.sin(a),
    p[1],
    -p[0] * Math.sin(a) + p[2] * Math.cos(a)
  ];
}

// Transformation de la scène, équivalente à :
//   scale(zoom); rotateX(pitch); rotateY(yaw);
// => un point subit d'abord rotY, puis rotX, puis le zoom.
// Puis projection en perspective avec la caméra par défaut de p5
// (caméra en z = eyeZ qui regarde vers -z).
function toScreen(p) {
  let q = rotY(p, sceneYaw);
  q = rotX(q, scenePitch);
  q = [q[0] * zoom, q[1] * zoom, q[2] * zoom];

  const depth = eyeZ - q[2]; // distance devant la caméra
  if (depth <= 1) return null; // derrière la caméra

  const k = eyeZ / depth;
  return {
    x: width / 2 + q[0] * k,
    y: height / 2 + q[1] * k
  };
}

function projectConstellations() {
  for (const c of constellations) {
    c.screenPoints = c.points.map(pt => {
      // Dans draw(): translate(pos); rotateY(angle); rotateX(tilt);
      // => rotX d'abord, puis rotY, puis translation.
      let p = [pt[0], pt[1], 3]; // z = 3 comme pour les sphères dessinées
      p = rotX(p, c.tilt);
      p = rotY(p, c.angle);
      p = [
        p[0] + c.position[0],
        p[1] + c.position[1],
        p[2] + c.position[2]
      ];
      return toScreen(p);
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Draw                                                               */
/* ------------------------------------------------------------------ */

function draw() {
  background(...palette.night);

  // Caméra explicite : identique à celle utilisée dans toScreen()
  eyeZ = (height / 2) / Math.tan(FOV / 2);
  perspective(FOV, width / height, eyeZ / 10, eyeZ * 10);
  camera(0, 0, eyeZ, 0, 0, 0, 0, 1, 0);

  autoRotation += 0.002;
  sceneYaw = viewYaw + autoRotation;
  scenePitch = viewPitch + sin(frameCount * 0.003) * 0.12;

  drawBackgroundStars();

  // 1) on projette avec les valeurs de CETTE frame
  projectConstellations();
  hoveredConstellation = findHoveredConstellation();

  // 2) on dessine avec exactement la même transformation
  push();
  scale(zoom);
  rotateX(scenePitch);
  rotateY(sceneYaw);
  drawConstellations();
  pop();

  drawHoverLabel();

  cursor(hoveredConstellation >= 0 ? HAND : ARROW);
}

function drawBackgroundStars() {
  push();
  noStroke();

  for (const star of stars) {
    const alpha = map(
      sin(frameCount * 0.025 + star.phase),
      -1, 1, 35, 155
    );

    push();
    translate(star.x, star.y, star.z);
    fill(...palette.cream, alpha);
    sphere(star.size, 5, 4);
    pop();
  }

  pop();
}

function drawConstellations() {
  for (let i = 0; i < constellations.length; i++) {
    const c = constellations[i];
    const color = palette[c.color];
    const active = i === hoveredConstellation;

    push();

    translate(...c.position);
    rotateY(c.angle);
    rotateX(c.tilt);

    // Lignes de la constellation
    noFill();
    stroke(...color, active ? 245 : 130);
    strokeWeight(active ? 1.8 : 1);

    beginShape();
    for (const point of c.points) {
      vertex(point[0], point[1], 3);
    }
    endShape();

    // Étoiles
    for (let j = 0; j < c.points.length; j++) {
      const point = c.points[j];
      const pulse = 1 + sin(frameCount * 0.04 + j) * 0.2;

      push();
      translate(point[0], point[1], 3);
      noStroke();

      if (active) {
        fill(...color, 30);
        sphere(11 * pulse, 8, 6);
      }

      fill(...color, active ? 255 : 210);
      sphere((active ? 4.5 : 3) * pulse, 8, 6);

      pop();
    }

    // Nom du projet à côté de la première étoile
    push();
    translate(c.points[0][0] + 12, c.points[0][1] + 12, 5);

    noStroke();
    fill(...palette.cream, active ? 255 : 175);
    textAlign(LEFT, CENTER);
    textSize(active ? 15 : 12);
    text(c.name, 0, 0);

    pop();
    pop();
  }
}

/* ------------------------------------------------------------------ */
/*  Détection du survol                                                */
/* ------------------------------------------------------------------ */

// Distance entre le point (px, py) et le segment a-b
function distToSegment(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return dist(px, py, a.x, a.y);

  const t = constrain(((px - a.x) * dx + (py - a.y) * dy) / lenSq, 0, 1);
  return dist(px, py, a.x + t * dx, a.y + t * dy);
}

function findHoveredConstellation() {
  const STAR_RADIUS = 22; // zone cliquable autour d'une étoile
  const LINE_RADIUS = 12; // zone cliquable autour d'un trait

  let closest = -1;
  let closestDistance = Infinity;

  for (let i = 0; i < constellations.length; i++) {
    const pts = constellations[i].screenPoints;

    for (let j = 0; j < pts.length; j++) {
      const p = pts[j];
      if (!p) continue;

      const d = dist(mouseX, mouseY, p.x, p.y);
      if (d < STAR_RADIUS && d < closestDistance) {
        closestDistance = d;
        closest = i;
      }

      const next = pts[j + 1];
      if (next) {
        const dl = distToSegment(mouseX, mouseY, p, next);
        if (dl < LINE_RADIUS && dl < closestDistance) {
          closestDistance = dl;
          closest = i;
        }
      }
    }
  }

  return closest;
}

function drawHoverLabel() {
  if (hoveredConstellation < 0) return;

  const c = constellations[hoveredConstellation];

  // Carte d'info dessinée en coordonnées écran, par-dessus tout
  const gl = drawingContext;
  gl.disable(gl.DEPTH_TEST);

  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  const margin = 20;
  const boxWidth = min(260, width - margin * 2);
  const boxHeight = 64;

  let x = mouseX + 20;
  let y = mouseY + 20;

  if (x + boxWidth > width - margin) x = mouseX - boxWidth - 20;
  if (y + boxHeight > height - margin) y = mouseY - boxHeight - 20;

  x = constrain(x, margin, width - boxWidth - margin);
  y = constrain(y, margin, height - boxHeight - margin);

  noStroke();
  fill(23, 18, 28, 240);
  rect(x, y, boxWidth, boxHeight, 8);

  fill(...palette[c.color]);
  textAlign(LEFT, TOP);
  textSize(10);
  text(c.category, x + 13, y + 11);

  fill(...palette.cream);
  textSize(15);
  text(c.name, x + 13, y + 31);

  pop();

  gl.enable(gl.DEPTH_TEST);
}

/* ------------------------------------------------------------------ */
/*  Interactions                                                       */
/* ------------------------------------------------------------------ */

function mousePressed() {
  pressX = mouseX;
  pressY = mouseY;
}

// Glisser = tourner la vue
function mouseDragged() {
  viewYaw += (mouseX - pmouseX) * 0.005;
  viewPitch = constrain(viewPitch + (mouseY - pmouseY) * 0.005, -1.2, 1.2);
  return false;
}

// Molette = zoom
function mouseWheel(event) {
  zoom = constrain(zoom * (1 - event.delta * 0.001), 0.5, 2);
  return false;
}

function mouseReleased() {
  // Un glisser fait tourner la caméra, il ne doit pas ouvrir un projet
  if (dist(mouseX, mouseY, pressX, pressY) > 8) return;

  // La projection de cette frame est déjà à jour
  const index = findHoveredConstellation();

  if (index !== -1) {
    window.location.href = constellations[index].href;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createStars();
  createConstellations();
}