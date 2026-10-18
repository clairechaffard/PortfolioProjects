
const projects = {
  "generative-garden": {
    category: "01 / CREATIVE CODING",
    title: "Generative Garden",
    intro: "An exploration of organic forms, movement and digital growth.",
    description: "This project explores how simple rules can create organic visual systems. Shapes grow, interact and evolve through code. Replace this text with the story of your own project, your process and the questions you explored.",
    tools: "p5.js, JavaScript, generative systems",
    year: "2026"
  },

  "soft-signals": {
    category: "02 / INTERACTIVE DESIGN",
    title: "Soft Signals",
    intro: "A small experiment in visual communication and interaction.",
    description: "Describe the starting point, the problem you wanted to explore, your design decisions and the result. You can add images, sketches, prototypes and videos here later.",
    tools: "HTML, CSS, JavaScript",
    year: "2026"
  },

  "otherworld": {
    category: "03 / DIGITAL WORLDS",
    title: "Otherworld",
    intro: "A visual study of atmosphere, space and digital environments.",
    description: "Explain how the project developed, what you made yourself, what worked and what you would explore next.",
    tools: "Creative coding, visual research",
    year: "2025"
  }
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const project = projects[id];

if (project) {
  document.title = `${project.title} — Midnight Greenhouse`;

  document.getElementById("project-category").textContent =
    project.category;

  document.getElementById("project-title").textContent =
    project.title;

  document.getElementById("project-intro").textContent =
    project.intro;

  document.getElementById("project-description").textContent =
    project.description;

  document.getElementById("project-tools").textContent =
    project.tools;

  document.getElementById("project-year").textContent =
    project.year;

  document.getElementById("project-cover-label").textContent =
    project.title.toUpperCase();
} else {
  document.getElementById("project-category").textContent =
    "PROJECT NOT FOUND";

  document.getElementById("project-title").textContent =
    "A little detour";

  document.getElementById("project-intro").textContent =
    "This project doesn't exist yet. Return to the collection to explore the others.";

  document.getElementById("project-description").textContent = "";
  document.getElementById("project-tools").textContent = "";
  document.getElementById("project-year").textContent = "";
  document.getElementById("project-cover-label").textContent =
    "BACK TO THE GARDEN";
}
