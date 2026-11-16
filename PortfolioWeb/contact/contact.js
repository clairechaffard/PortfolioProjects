function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("visual");
  setupInteractiveText();
}

function draw() {
  updateInteractiveText();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createTree();
  createFireflies();
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
