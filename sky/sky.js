const palette = {
  night: [23, 18, 28],
  cream: [243, 235, 221],
  rose: [210, 112, 151],
  lightRose: [239, 177, 194],
  sage: [163, 181, 139], 
};

let stars = [];
let constellations = [];
let hoveredConstellation = -1;
let projectPreview;
let lastPreviewedConstellation = -1;

const FOV = Math.PI / 3;
let autoRotation = 0;
let viewYaw = 0;
let viewPitch = 0;
let zoom = 1;

let sceneYaw = 0;
let scenePitch = 0;
let eyeZ = 800;

let pressX = 0;
let pressY = 0;

const projectData = [
  {
    name: "Michel's Story",
    href: "../projects/michel/michel.html",
    description: "A 2D RPG in Java with interconnected rooms, items, and enemies.",
    color: "rose",
    angle: 0.2,
    tilt: -0.35,
    points: [
      [-38, 0], [-18, -24], [5, -5],
      [27, -30], [47, -8], [30, 20]
    ]
  },
  {
    name: "Javions",
    href: "../projects/javions/javions.html",
    description: "A flight-tracking system that receives and decodes live ADS-B signals.",
    color: "sage",
    angle: 1.1,
    tilt: 0.3,
    points: [
      [-35, 8], [-15, -22], [8, 0],
      [29, -25], [48, 8], [18, 28]
    ]
  },
  {
    name: "Roi",
    href: "../projects/roi/roi.html",
    description: "A memory-challenging card game for two to four players.",
    color: "lightRose",
    angle: 2.0,
    tilt: -0.2,
    points: [
      [-38, -8], [-15, -32], [8, -4],
      [31, -26], [50, 5], [25, 30]
    ]
  }, 
  {
    name: "Game of Life",
    href: "../projects/gameofLife/life.html",
    description: "A RISC-V assembly implementation of Conway's Game of Life.",
    color: "cream",
    angle: 2.9,
    tilt: 0.22,
    points: [
      [-42, -12], [-24, -30], [-7, -10],
      [10, -30], [31, -13], [43, 9],
      [18, 29], [-13, 22], [-42, -12]
    ]
  }, 
  {
    name: "CompGraph Kart",
    href: "../projects/mario/mario.html",
    description: "An animated 3D Mario Kart scene.",
    color: "rose",
    angle: 3.8,
    tilt: -0.35,
    points: [
      [-42, 12], [-25, -23], [-2, 1],
      [20, -29], [43, -1], [20, 25], [-8, 8]
    ]
  }, 
  {
    name: "Gatherly",
    href: "../projects/gatherly/mario.html",
    description: "A web app developed as a bachelor's project.",
    color: "sage",
    angle: 4.7,
    tilt: 0.27,
    points: [
      [-40, 4], [-28, -24], [-6, -7],
      [17, -31], [40, -8], [31, 19], [4, 29]
    ]
  }, 
  {
    name: "Remember",
    href: "../projects/remember/mario.html",
    description: "A video game developed in Unity.",
    color: "lightRose",
    angle: 5.6,
    tilt: -0.18,
    points: [
      [-43, -5], [-28, -29], [-7, -9],
      [14, -31], [39, -10], [34, 17], [9, 29]
    ]
  }, 

];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  canvas.parent("sky-visual");
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  projectPreview = document.getElementById("project-preview");

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
  const radius = min(width * 0.32, height * 0.36);

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

function toScreen(p) {
  let q = rotY(p, sceneYaw);
  q = rotX(q, scenePitch);
  q = [q[0] * zoom, q[1] * zoom, q[2] * zoom];

  const depth = eyeZ - q[2]; 
  if (depth <= 1) return null; 

  const k = eyeZ / depth;
  return {
    x: width / 2 + q[0] * k,
    y: height / 2 + q[1] * k
  };
}

function projectConstellations() {
  for (const c of constellations) {
    c.screenPoints = c.points.map(pt => {

      let p = [pt[0], pt[1], 3]; 
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


function draw() {
  background(...palette.night);

  eyeZ = (height / 2) / Math.tan(FOV / 2);
  perspective(FOV, width / height, eyeZ / 10, eyeZ * 10);
  camera(0, 0, eyeZ, 0, 0, 0, 0, 1, 0);

  //autoRotation += 0.002;
  sceneYaw = viewYaw + autoRotation;
  scenePitch = viewPitch + sin(frameCount * 0.003) * 0.12;

  drawBackgroundStars();

  projectConstellations();
  hoveredConstellation = findHoveredConstellation();

  updateProjectPreview();

  push();
  scale(zoom);
  rotateX(scenePitch);
  rotateY(sceneYaw);
  drawConstellations();
  pop();

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

    noFill();
    stroke(...color, active ? 245 : 130);
    strokeWeight(active ? 1.8 : 1);

    beginShape();
    for (const point of c.points) {
      vertex(point[0], point[1], 3);
    }
    endShape();

    for (let j = 0; j < c.points.length; j++) {
      const point = c.points[j];
      //const pulse = 1 + sin(frameCount * 0.04 + j) * 0.2;
      const pulse = 1;

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

    pop();
  }
}

function distToSegment(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return dist(px, py, a.x, a.y);

  const t = constrain(((px - a.x) * dx + (py - a.y) * dy) / lenSq, 0, 1);
  return dist(px, py, a.x + t * dx, a.y + t * dy);
}

function findHoveredConstellation() {
  const STAR_RADIUS = width < 600 ? 34 : 24;
  const LINE_RADIUS = width < 600 ? 20 : 14;
  

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

function updateProjectPreview() {
  projectPreview.hidden = hoveredConstellation < 0;
  if (hoveredConstellation < 0) {
    lastPreviewedConstellation = -1;
    return;
  }

  const project = constellations[hoveredConstellation];
  if (hoveredConstellation !== lastPreviewedConstellation) {
    projectPreview.querySelector(".preview-title").textContent = project.name;
    projectPreview.querySelector(".preview-description").textContent =
      project.description;
    lastPreviewedConstellation = hoveredConstellation;
  }

  const margin = 20;
  const gap = 20;
  const bounds = projectPreview.getBoundingClientRect();
  let x = mouseX + gap;
  let y = mouseY + gap;

  if (x + bounds.width > width - margin) x = mouseX - bounds.width - gap;
  if (y + bounds.height > height - margin) y = mouseY - bounds.height - gap;

  projectPreview.style.left = `${constrain(x, margin, width - bounds.width - margin)}px`;
  projectPreview.style.top = `${constrain(y, margin, height - bounds.height - margin)}px`;
}


function mousePressed() {
  pressX = mouseX;
  pressY = mouseY;
}

function mouseDragged() {
  viewYaw += (mouseX - pmouseX) * 0.005;
  viewPitch = constrain(viewPitch + (mouseY - pmouseY) * 0.005, -1.2, 1.2);
  return false;
}

function mouseWheel(event) {
  zoom = constrain(zoom * (1 - event.delta * 0.001), 0.5, 2);
  return false;
}

function mouseReleased() {
  if (dist(mouseX, mouseY, pressX, pressY) > 8) return;

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