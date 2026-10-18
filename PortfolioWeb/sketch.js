
const palette = {
  night: [23, 18, 28],
  cream: [243, 235, 221],
  burgundy: [69, 8, 8],
  rose: [184, 75, 112],
  sage: [163, 181, 139]
};

function setup() {
  const canvas = createCanvas(
    windowWidth,
    windowHeight,
    WEBGL
  );

  canvas.parent("visual");
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
}

function draw() {
  background(...palette.night);
  orbitControl();

  // Gentle lighting
  ambientLight(95);
  pointLight(243, 210, 220, -200, -100, 300);

  // The central object
  push();
  rotateY(frameCount * 0.003);
  noStroke();
  ambientMaterial(...palette.burgundy);
  sphere(30, 32, 24);
  pop();

  // Three handmade orbital paths
  drawOrbit(155, 0.6, 0.2, palette.rose, 0.004);
  drawOrbit(205, 1.0, 1.0, palette.sage, -0.003);
  drawOrbit(250, 1.3, 0.4, palette.cream, 0.002);

  // A subtle inner halo
  push();
  noFill();
  stroke(...palette.rose, 100);
  strokeWeight(0.6);
  sphere(43, 24, 16);
  pop();
}

function drawOrbit(radius, tiltX, tiltY, color, speed) {
  push();

  // Slowly rotate each orbital plane
  rotateX(tiltX);
  rotateY(tiltY);
  rotateZ(frameCount * speed);

  // Draw the orbit
  noFill();
  stroke(...color, 145);
  strokeWeight(0.7);
  torus(radius, 0.7, 120, 6);

  // Add a project-like object on the orbit
  const angle = frameCount * speed * 2 + radius;

  const x = radius * cos(angle);
  const y = radius * sin(angle);

  push();
  translate(x, y, 0);
  noStroke();
  ambientMaterial(...color);
  sphere(5, 16, 12);
  pop();

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
