
const projects = {
  "MichelStory": {
    title: "Michel's Story",
    intro: "A 2D RPG game in Java with interconnected rooms filled with items and enemies.",
    description: "Goal of the game: Navigate through the dungeon, collect useful items, defeat creatures, and ultimately find the key that unlocks access to the final boss.",
    tools: "Java, object-oriented design, inheritance-based actors  ",
    year: "2022"
  },

  "Javions": {
    title: "Javions",
    intro: "Flight tracking system designed to receive and decode live ADS-B signals emitted by aircraft. ",
    description: "Designed the user interface and implemented interactive feature. Applied core OOP principles and design patterns to structure the reception, decoding, and visualization pipelines. Learned and implemented low-level radio workflow: Signal sampling, ADS-B message extraction and Data decoding and visualization.",
    tools: "Java, JavaFx, Object-Oriented Development",
    year: "2023"
  },

  "Roi": {
    title: "Roi",
    intro: " 2-4 player cards game, challenges the players’ memory",
    description: "Collaborated through regular meetings to design the game concept and define its rules. Implementation of the backend, User interface design and testing of this multiplayers game.",
    tools: "Scala",
    year: "2023"
  }
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const project = projects[id];

if (project) {
  document.title = `${project.title} — Midnight Greenhouse`;

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

  document.getElementById("project-title").textContent =
    "Error 44";

  document.getElementById("project-intro").textContent =
    "This project doesn't exist yet. Return to the collection to explore the others.";

  document.getElementById("project-description").textContent = "";
  document.getElementById("project-tools").textContent = "";
  document.getElementById("project-year").textContent = "";
  document.getElementById("project-cover-label").textContent =
    "BACK TO THE GARDEN";
}
