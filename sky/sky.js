const palette = {
  night: [23, 18, 28],
  cream: [243, 235, 221],
  rose: [210, 112, 151],
  lightRose: [239, 177, 194],
  sage: [163, 181, 139], 
  blue: [34, 101, 187],
  red: [182, 47, 59], 
  diamond: [153, 255, 255], 
  yellow: [255, 254, 149],
};

let stars = [];
let constellations = [];
let hoveredConstellation = -1;
let projectPreview;
let lastPreviewedConstellation = -1;
let previewImage;

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
    image: "../projects/michel/whois.png",
    description: "A 2D RPG in Java with interconnected rooms, items, and enemies.",
    color: "rose",
    angle: 0.2,
    tilt: -0.35,
    points: [
      [0,50], [-70, -10], [-70, -40], [-50, -60], [-20, -60], [0,-50], 
      [20, -60], [50, -60], [70, -40], [70, -10], [0,50]

    ]
  },
  {
    name: "Javions",
    href: "../projects/javions/javions.html",
    image: "../projects/javions/image-1.png",
    description: "A flight-tracking system that receives and decodes live ADS-B signals.",
    color: "diamond",
    angle: 1.1,
    tilt: 0.3,
    points: [
      [-45,-35], [45,-5], [25,5], [-45,-35], 
      [-25,35], [-15, 25], [5,35],[25,5], [5,35], [5,15], [-45,-35], [5,15], [-15,25]  
    ]


    /*points: [[-35, -25], [-15, -10], [5, -15], [20, 0], [10, 20], [25, 30], [40, 15],[20, 0] ]*/

  },
  {
    name: "Roi",
    href: "../projects/roi/roi.html",
    image: "../projects/roi/image.png",
    description: "A memory-challenging card game for two to four players.",
    color: "yellow",
    angle: 2.0,
    tilt: -0.2,
    points: [
      [0,-40], [20,10], [40, -20], [40, 20], [30,25], [40, 30], [40,20], [40,30], [-40, 30], 
      [-30, 25], [-40, 20], [-40,30], [-40,20], [40,20], [-40,20], [-40, -20], [-20, 10], 
      [0, -40]
    ]


  }, 
  {
    name: "Game of Life",
    href: "../projects/gameofLife/life.html",
    image:"../projects/gameofLife/image.png",
    description: "A RISC-V assembly implementation of Conway's Game of Life.",
    color: "cream",
    angle: 2.9,
    tilt: 0.22,
    
points: [
  [0, -40], [-20, -20], [0, -40], [20, -20], [0, -40], [0, -20], [20, -20], [0, -20], [-20, -20], 
  [-40,0], [-20,0], [-20, -20], [-20, 0], [0, 0], [0, -20], [0, 0], [20, 0], [20, -20], [20,0], [40,0], [20, -20], [40,0], 
  [20,20], [20,0], [20,20], [0,20], [0,0], [0,20], [-20, 20], [-20,0], [-20,20], [-40,0], [-20,20], 
  [0,40], [20,20], [0,40], [0,20]
]

/*

  [0, -40],
  [-20, -20], [-40,0], [-20,-20], [0, -20], [20, -20], [0, -40], [20, -20],
  [-40, 0], [-20, 0], [0, 0], [20, 0], [40, 0],
  [-20, 20], [0, 20], [20, 20],
  [0, 40]
*/

  }, 
  {
    name: "CompGraph Kart",
    href: "../projects/mario/mario.html",
    image: "../projects/mario/image.png",
    description: "An animated 3D Mario Kart scene.",
    color: "red",
    angle: 3.8,
    tilt: -0.35,
    points: [
      [0,2.5], [-10, -2.5], [-20, 22.5], [-30, 12.5], [-15, -22.5], [0, -7.5],
      [10, -22.5], [30, 12.5], [20, 22.5], [10, -2.5], [0, 2.5]
  
  ]

  }, 
  {
    name: "Gatherly",
    href: "../projects/gatherly/mario.html",
    image: "../projects/gatherly/image-3.png",
    description: "A web app developed as a bachelor's project.",
    color: "sage",
    angle: 4.7,
    tilt: 0.27,
    points: [[20,-40], [0,-40], [-20,-40], 
      [-40, -20], [-10, -20], [-20,-40], [-10,-20], [0,-40], [10, -20], [-10,-20], [10,-20], [20,-40], [40, -20], [10, -20],
      [0,30], [-10,-20], [0,30], [-40, -20], [0,30], [40, -20]]
  }, 

  {
    name: "Remember",
    href: "../projects/remember/remember.html",
    image: "../projects/remember/image.png",
    description: "A video game developed in Unity.",
    color: "blue",
    angle: 5.6,
    tilt: -0.18,
    points: [ [40, -40], [-40,-40], [0,0], [-40,40], [40,40], [0,0], [40,-40], 
    [20,-20], [-20, -20], [15, -15], [-15, -15], [10, -10], [-10, -10], [5, -5], [-5,-5], [0,0], 
    [0,30], [10, 40], [0,30], [-10,40]
     ]
  }, 

];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  canvas.parent("sky-visual");
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  projectPreview = document.getElementById("project-preview");
  previewImage = projectPreview.querySelector(".preview-image");

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
  const radius = min(width, height) * 0.38;
  const total = projectData.length;

  // Golden angle: creates a balanced distribution on a sphere
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  constellations = projectData.map((project, index) => {
    // Distribute points vertically across the sphere
    const y = 1 - (2 * (index + 0.5)) / total;

    // Distance from the vertical axis
    const horizontalRadius = Math.sqrt(1 - y * y);

    // Rotate each point around the vertical axis
    const phi = index * goldenAngle;

    return {
      ...project,

      position: [
        Math.cos(phi) * horizontalRadius * radius,
        y * radius,
        Math.sin(phi) * horizontalRadius * radius
      ],

      screenPoints: []
    };
  });
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

  autoRotation += 0.002;
  sceneYaw = viewYaw + autoRotation;
  //scenePitch = viewPitch + sin(frameCount * 0.003) * 0.12;
  scenePitch = viewPitch + sin(frameCount * 0.002) * 0.08;

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

    projectPreview.querySelector(".preview-title").textContent =
      project.name;

    projectPreview.querySelector(".preview-description").textContent =
      project.description;

    previewImage.src = project.image;
    previewImage.alt = `${project.name} preview`;

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