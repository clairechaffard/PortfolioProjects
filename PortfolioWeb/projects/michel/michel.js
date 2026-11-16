
const palette = {
  night: [23, 18, 28],
  cream: [243, 235, 221],
  burgundy: [69, 8, 8],
  rose: [210, 112, 151],
  lightRose: [239, 177, 194],
  sage: [163, 181, 139],
  bark: [100, 67, 64]
};

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("visual");

  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

  setupInteractiveText();
}

function draw() {
  background(...palette.night);
  updateInteractiveText();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


let interactiveTexts = [];
let hoveredLetters = [];

function setupInteractiveText() {
  const selectors = [
    ".titleintro",
    ".titleintro2",
    ".titleintro3"
  ];

  interactiveTexts = [];
  hoveredLetters = [];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      if (element.dataset.interactive === "true") return;
      element.dataset.interactive = "true";

      const text = element.textContent;
      element.textContent = "";

      [...text].forEach(char => {
        const span = document.createElement("span");
        span.className = "interactive-letter";
        span.textContent = char === " " ? "\u00A0" : char;

        element.appendChild(span);
        interactiveTexts.push(span);
        hoveredLetters.push(false);
      });
    });
  });
}


// Add this function inside your existing draw()
function updateInteractiveText() {
  interactiveTexts.forEach((letter, i) => {
    const rect = letter.getBoundingClientRect();

    const d = dist(
      mouseX + document.querySelector("#visual")
        .getBoundingClientRect().left,
      mouseY + document.querySelector("#visual")
        .getBoundingClientRect().top,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );

    const isHovered = d < 20;
    hoveredLetters[i] = isHovered;

    letter.classList.toggle("is-hovered", isHovered);
  });
}


const character = document.querySelector("#character");
const animation = character && character.querySelector(".character-animation");

const columns = 4;
const rows = 4;
const frameVerticalOffsets = [0.1, 1.1, 2, 3.6];

const help_marge = 579;
const help_frame = 103;
const help_x = 80;
const frames = Array.from(
  { length: columns * rows },
  (_, index) => ({
    column: index % columns,
    row: Math.floor(index / columns)
  })
);

let currentFrame = 0;
let animationInterval = null;
let movementFrame = null;
let lastMovementTime = 0;
let lastWalkFrameTime = 0;
let walkColumn = 0;
let walkRow = 0;
let movementX = 0;
let movementY = 0;
let pointerOverCharacter = false;
let characterHasFocus = false;
const movementKeys = new Set();
const movementSpeed = 220;
const walkFrameDuration = 120;
const directionRows = { w: 2, a: 3, s: 0, d: 1 };

function showFrame(frameIndex) {
  const { column, row } = frames[frameIndex];
  const frameX = help_x + column * help_frame;
  const x = frameX / (help_marge - help_frame) * 100;
  const y = row / (rows - 1) * 100 + frameVerticalOffsets[row];

  animation.style.backgroundPosition = `${x}% ${y}%`;
}

function stopSpin() {
  if (animationInterval !== null) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
}

function startSpin() {
  if (animationInterval !== null || movementKeys.size > 0) return;

  currentFrame = 0;
  showFrame(currentFrame);
  animationInterval = setInterval(() => {
    currentFrame = (currentFrame + 1) % frames.length;
    showFrame(currentFrame);
  }, 120);
}

function syncSpin() {
  if (movementKeys.size > 0) return;
  if (pointerOverCharacter || characterHasFocus) {
    startSpin();
    return;
  }

  stopSpin();
  currentFrame = 0;
  showFrame(currentFrame);
}

function getMovementVector() {
  return {
    x: Number(movementKeys.has("d")) - Number(movementKeys.has("a")),
    y: Number(movementKeys.has("s")) - Number(movementKeys.has("w"))
  };
}

function updateWalkDirection() {
  const { x, y } = getMovementVector();
  if (x === 0 && y === 0) return;

  const nextRow = Math.abs(x) > Math.abs(y)
    ? (x > 0 ? directionRows.d : directionRows.a)
    : (y > 0 ? directionRows.s : directionRows.w);

  if (nextRow !== walkRow) {
    walkRow = nextRow;
    walkColumn = 0;
    lastWalkFrameTime = 0;
    showFrame(walkRow * columns);
  }
}

function moveCharacter(timestamp) {
  if (movementKeys.size === 0) {
    stopMovement();
    return;
  }

  const elapsed = lastMovementTime === 0
    ? 0
    : Math.min((timestamp - lastMovementTime) / 1000, 0.05);
  lastMovementTime = timestamp;

  const { x, y } = getMovementVector();
  if (x !== 0 || y !== 0) {
    updateWalkDirection();
    if (lastWalkFrameTime === 0) {
      lastWalkFrameTime = timestamp;
    } else if (timestamp - lastWalkFrameTime >= walkFrameDuration) {
      walkColumn = (walkColumn + 1) % columns;
      lastWalkFrameTime = timestamp;
      showFrame(walkRow * columns + walkColumn);
    }

    const length = Math.hypot(x, y);
    const rect = character.getBoundingClientRect();
    const nextLeft = Math.min(
      Math.max(rect.left + x / length * movementSpeed * elapsed, 0),
      document.documentElement.clientWidth - rect.width
    );
    const nextTop = Math.min(
      Math.max(rect.top + y / length * movementSpeed * elapsed, 0),
      document.documentElement.clientHeight - rect.height
    );

    if (nextLeft !== rect.left || nextTop !== rect.top) {
      character.classList.add("has-moved");
    }

    movementX += nextLeft - rect.left;
    movementY += nextTop - rect.top;
    character.style.transform = `translate3d(${movementX}px, ${movementY}px, 0)`;
  }

  movementFrame = requestAnimationFrame(moveCharacter);
}

function startMovement(key) {
  movementKeys.add(key);
  character.classList.add("is-walking");
  character.classList.add("is-displaced");
  stopSpin();
  updateWalkDirection();

  if (movementFrame === null) {
    lastMovementTime = 0;
    movementFrame = requestAnimationFrame(moveCharacter);
  }
}

function stopMovement() {
  if (movementFrame !== null) {
    cancelAnimationFrame(movementFrame);
    movementFrame = null;
  }
  lastMovementTime = 0;
  character.classList.remove("is-walking");
  syncSpin();
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(directionRows, key)) return;

  event.preventDefault();
  if (!movementKeys.has(key)) startMovement(key);
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (!movementKeys.delete(key)) return;

  if (movementKeys.size === 0) {
    stopMovement();
  } else {
    updateWalkDirection();
  }
}

if (character && animation) {
  function startAnimation() {
    pointerOverCharacter = true;
    syncSpin();
  }

  function stopAnimation() {
    pointerOverCharacter = false;
    syncSpin();
  }

  character.addEventListener("mouseenter", startAnimation);
  character.addEventListener("mouseleave", stopAnimation);
  character.addEventListener("focus", () => {
    characterHasFocus = true;
    syncSpin();
  });
  character.addEventListener("blur", () => {
    characterHasFocus = false;
    syncSpin();
  });
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", () => {
    movementKeys.clear();
    pointerOverCharacter = false;
    characterHasFocus = false;
    stopMovement();
    stopSpin();
    currentFrame = 0;
    showFrame(currentFrame);
  });

  showFrame(currentFrame);
}


