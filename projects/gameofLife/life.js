
const canvas = document.querySelector("#life-background");
const ctx = canvas.getContext("2d");

// Grid
const CELL = 10;
const GAP = 2;

let cols, rows;
let grid, nextGrid;

let lastUpdate = 0;
const SPEED = 110;

// Your portfolio colors
const COLORS = [
  "rgba(165, 231, 210, 0.8)",
  "rgba(166, 112, 210, 0.7)",
  "rgba(56, 163, 111, 0.55)"
];

// Classic Conway patterns
const SEEDS = [
  // Glider: moves diagonally
  [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2]
  ],

  // Blinker: oscillates
  [
    [0, 0],
    [0, 1],
    [0, 2]
  ],

  // Small stable block
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1]
  ],

  // Toad oscillator
  [
    [0, 1], [0, 2], [0, 3],
    [1, 0], [1, 1], [1, 2]
  ]
];

// Create canvas
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  cols = Math.ceil(window.innerWidth / CELL);
  rows = Math.ceil(window.innerHeight / CELL);

  createGrid();
  drawGrid();
}


function createGrid() {
  grid = new Uint8Array(cols * rows);
  nextGrid = new Uint8Array(cols * rows);

  // 1. Start with a noisy, irregular field
  const density = 0.24;

  for (let i = 0; i < grid.length; i++) {
    grid[i] = Math.random() < density ? 1 : 0;
  }

  // 2. Add many recognizable patterns
  const numberOfSeeds = Math.floor(
    (cols * rows) / 100
  );

  for (let i = 0; i < numberOfSeeds; i++) {
    const seed = SEEDS[
      Math.floor(Math.random() * SEEDS.length)
    ];

    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);

    const flipX = Math.random() < 0.5 ? 1 : -1;
    const flipY = Math.random() < 0.5 ? 1 : -1;

    for (const [sx, sy] of seed) {
      const px = (x + sx * flipX + cols) % cols;
      const py = (y + sy * flipY + rows) % rows;

      grid[py * cols + px] = 1;
    }
  }
}


// Count living neighbors
function countNeighbors(x, y) {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = (x + dx + cols) % cols;
      const ny = (y + dy + rows) % rows;

      count += grid[ny * cols + nx];
    }
  }

  return count;
}

// Conway rules
function updateGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = y * cols + x;
      const neighbors = countNeighbors(x, y);

      if (grid[index]) {
        nextGrid[index] =
          neighbors === 2 || neighbors === 3 ? 1 : 0;
      } else {
        nextGrid[index] =
          neighbors === 3 ? 1 : 0;
      }
    }
  }

  [grid, nextGrid] = [nextGrid, grid];
}

// Draw living cells
function drawGrid() {
  ctx.clearRect(
    0, 0,
    window.innerWidth,
    window.innerHeight
  );

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y * cols + x]) {
        ctx.fillStyle =
          COLORS[Math.floor(Math.random() * COLORS.length)];

        ctx.fillRect(
          x * CELL + GAP / 2,
          y * CELL + GAP / 2,
          CELL - GAP,
          CELL - GAP
        );
      }
    }
  }
}

// Animation
function animate(timestamp) {
  if (timestamp - lastUpdate > SPEED) {
    updateGrid();
    drawGrid();
    lastUpdate = timestamp;
  }

  requestAnimationFrame(animate);
}

// Initialize
resizeCanvas();
requestAnimationFrame(animate);

window.addEventListener("resize", resizeCanvas);
