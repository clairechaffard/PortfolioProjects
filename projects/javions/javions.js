const firstPlane = document.querySelector(".plane-flyby");
const planes = [];

if (firstPlane && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  planes.push(firstPlane);
  for (let index = 1; index < 3; index++) {
    const additionalPlane = firstPlane.cloneNode(true);
    firstPlane.after(additionalPlane);
    planes.push(additionalPlane);
  }

  const edges = ["left", "right", "top", "bottom"];

  function getEdgePoint(edge, width, height, margin) {
    if (edge === "left") return { x: -margin, y: Math.random() * height };
    if (edge === "right") return { x: width + margin, y: Math.random() * height };
    if (edge === "top") return { x: Math.random() * width, y: -margin };
    return { x: Math.random() * width, y: height + margin };
  }

  function scheduleFlight(plane, delay) {
    window.setTimeout(() => startFlight(plane), delay);
  }

  function startFlight(plane) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const size = plane.offsetWidth;
    const margin = size * 2;
    const startEdgeIndex = Math.floor(Math.random() * edges.length);
    const endEdges = edges.filter((_, index) => index !== startEdgeIndex);
    const start = getEdgePoint(edges[startEdgeIndex], width, height, margin);
    const end = getEdgePoint(
      endEdges[Math.floor(Math.random() * endEdges.length)],
      width,
      height,
      margin
    );
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI + 45;
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Math.max(7000, distance / 0.16) + Math.random() * 2000;
    const transformAt = point =>
      `translate3d(${point.x - size / 2}px, ${point.y - size / 2}px, 0) rotate(${angle}deg)`;

    plane.style.visibility = "visible";
    const flight = plane.animate(
      [
        { transform: transformAt(start) },
        { transform: transformAt(end) }
      ],
      { duration, easing: "linear" }
    );

    flight.onfinish = () => {
      plane.style.visibility = "hidden";
      flight.cancel();
      scheduleFlight(plane, 2500 + Math.random() * 4000);
    };
  }

  planes.forEach((plane, index) => {
    scheduleFlight(plane, 800 + index * 1400 + Math.random() * 900);
  });
}