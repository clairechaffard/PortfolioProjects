
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
