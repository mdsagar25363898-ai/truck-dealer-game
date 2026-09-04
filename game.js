const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const moneyEl = document.getElementById("money");
const fuelEl = document.getElementById("fuel");
const placeEl = document.getElementById("place");
const infoEl = document.getElementById("info");
const actionBtn = document.getElementById("actionBtn");
const modeEl = document.getElementById("mode");

let W = 0;
let H = 0;

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;
}

window.addEventListener("resize", resize);
resize();

/* =========================
   GAME DATA
========================= */

let data = JSON.parse(
  localStorage.getItem("truckDealerGame")
);

if (!data) {
  data = {
    money: 380000,
    fuel: 100
  };
}

/* =========================
   WORLD
========================= */

const world = {
  width: 2400,
  height: 1600
};

const showroom = {
  x: 250,
  y: 180,
  w: 500,
  h: 330
};

const market = {
  x: 1750,
  y: 180,
  w: 420,
  h: 280
};

const garage = {
  x: 1750,
  y: 1080,
  w: 420,
  h: 260
};

const office = {
  x: 250,
  y: 1080,
  w: 420,
  h: 260
};

/* =========================
   PLAYER
========================= */

const player = {
  x: 500,
  y: 350,

  width: 26,
  height: 26,

  speed: 3.4,

  color: "#1976d2"
};

/* =========================
   TRUCK
========================= */

const truck = {
  x: 500,
  y: 440,

  width: 55,
  height: 95,

  speed: 6,

  color: "#e53935",

  angle: 0
};

let driving = false;

/* =========================
   CAMERA
========================= */

const camera = {
  x: 0,
  y: 0
};

/* =========================
   CONTROLS
========================= */

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

document.querySelectorAll(".control").forEach(button => {

  const key = button.dataset.key;

  button.addEventListener("touchstart", e => {
    e.preventDefault();
    keys[key] = true;
  });

  button.addEventListener("touchend", e => {
    e.preventDefault();
    keys[key] = false;
  });

  button.addEventListener("touchcancel", () => {
    keys[key] = false;
  });

  button.addEventListener("mousedown", () => {
    keys[key] = true;
  });

  button.addEventListener("mouseup", () => {
    keys[key] = false;
  });

  button.addEventListener("mouseleave", () => {
    keys[key] = false;
  });
});

/* Keyboard */

document.addEventListener("keydown", e => {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) {
    keys.up = true;
  }

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  ) {
    keys.down = true;
  }

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  ) {
    keys.left = true;
  }

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  ) {
    keys.right = true;
  }
});

document.addEventListener("keyup", e => {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  ) {
    keys.up = false;
  }

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  ) {
    keys.down = false;
  }

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  ) {
    keys.left = false;
  }

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  ) {
    keys.right = false;
  }
});

/* =========================
   SAVE
========================= */

function saveGame() {

  localStorage.setItem(
    "truckDealerGame",
    JSON.stringify(data)
  );
}

function updateHUD() {

  moneyEl.textContent =
    Math.floor(data.money);

  fuelEl.textContent =
    Math.floor(data.fuel);

  placeEl.textContent =
    getPlaceName();
}

/* =========================
   PLACE DETECTION
========================= */

function distance(a, b) {

  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2)
  );
}

function getCurrentObject() {

  const object = driving ? truck : player;

  return object;
}

function getPlaceName() {

  const o = getCurrentObject();

  if (
    o.x > showroom.x &&
    o.x < showroom.x + showroom.w &&
    o.y > showroom.y &&
    o.y < showroom.y + showroom.h
  ) {
    return "🏪 Showroom";
  }

  if (
    o.x > market.x &&
    o.x < market.x + market.w &&
    o.y > market.y &&
    o.y < market.y + market.h
  ) {
    return "🚛 Truck Market";
  }

  if (
    o.x > garage.x &&
    o.x < garage.x + garage.w &&
    o.y > garage.y &&
    o.y < garage.y + garage.h
  ) {
    return "🔧 Garage";
  }

  if (
    o.x > office.x &&
    o.x < office.x + office.w &&
    o.y > office.y &&
    o.y < office.y + office.h
  ) {
    return "👷 Worker Office";
  }

  return "🛣️ Road";
}

/* =========================
   PLAYER MOVEMENT
========================= */

function movePlayer() {

  if (driving) return;

  let dx = 0;
  let dy = 0;

  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;

  if (dx === 0 && dy === 0)
    return;

  const length =
    Math.sqrt(dx * dx + dy * dy);

  dx /= length;
  dy /= length;

  player.x += dx * player.speed;
  player.y += dy * player.speed;

  keepInsideWorld(player);
}

/* =========================
   TRUCK MOVEMENT
========================= */

function moveTruck() {

  if (!driving) return;

  if (data.fuel <= 0) {

    infoEl.textContent =
      "⛽ Fuel শেষ! Garage-এ যান।";

    return;
  }

  let moving = false;

  if (keys.up) {

    truck.x += Math.sin(truck.angle) * truck.speed;
    truck.y -= Math.cos(truck.angle) * truck.speed;

    moving = true;
  }

  if (keys.down) {

    truck.x -= Math.sin(truck.angle) * truck.speed * .6;
    truck.y += Math.cos(truck.angle) * truck.speed * .6;

    moving = true;
  }

  if (keys.left) {

    truck.angle -= 0.055;
  }

  if (keys.right) {

    truck.angle += 0.055;
  }

  if (moving) {

    data.fuel -= 0.035;

    if (data.fuel < 0)
      data.fuel = 0;

    saveGame();
  }

  keepInsideWorld(truck);
}

/* =========================
   WORLD LIMIT
========================= */

function keepInsideWorld(object) {

  object.x =
    Math.max(
      30,
      Math.min(
        world.width - 30,
        object.x
      )
    );

  object.y =
    Math.max(
      30,
      Math.min(
        world.height - 30,
        object.y
      )
    );
}

/* =========================
   ENTER / EXIT TRUCK
========================= */

function checkTruckInteraction() {

  if (driving) {

    actionBtn.style.display = "block";
    actionBtn.textContent =
      "🚶 ট্রাক থেকে নামুন";

    return;
  }

  const d =
    distance(player, truck);

  if (d < 110) {

    actionBtn.style.display = "block";

    actionBtn.textContent =
      "🚚 ট্রাকে উঠুন";

  } else {

    actionBtn.style.display = "none";
  }
}

actionBtn.addEventListener("click", () => {

  if (driving) {

    driving = false;

    player.x =
      truck.x + 55;

    player.y =
      truck.y;

    modeEl.textContent =
      "🚶 WALK";

    infoEl.textContent =
      "🚶 আপনি ট্রাক থেকে নেমেছেন।";

    actionBtn.style.display =
      "block";

    actionBtn.textContent =
      "🚚 ট্রাকে উঠুন";

    return;
  }

  const d =
    distance(player, truck);

  if (d < 110) {

    driving = true;

    modeEl.textContent =
      "🚚 DRIVING";

    infoEl.textContent =
      "🚚 ট্রাক চালান! রাস্তার দিকে যান।";

    actionBtn.textContent =
      "🚶 ট্রাক থেকে নামুন";
  }
});

/* =========================
   DRAW WORLD
========================= */

function drawWorld() {

  ctx.fillStyle = "#4f963f";

  ctx.fillRect(
    0,
    0,
    world.width,
    world.height
  );

  drawRoads();

  drawBuilding(
    showroom,
    "#1976d2",
    "🏪 SHOWROOM"
  );

  drawBuilding(
    market,
    "#8e24aa",
    "🚛 TRUCK MARKET"
  );

  drawBuilding(
    garage,
    "#ef6c00",
    "🔧 GARAGE"
  );

  drawBuilding(
    office,
    "#00897b",
    "👷 WORKER OFFICE"
  );

  drawTruck();

  if (!driving) {
    drawPlayer();
  }
}

/* =========================
   ROADS
========================= */

function drawRoads() {

  ctx.fillStyle = "#555";

  /* horizontal main road */

  ctx.fillRect(
    0,
    720,
    world.width,
    170
  );

  /* vertical main road */

  ctx.fillRect(
    1120,
    0,
    180,
    world.height
  );

  /* horizontal second road */

  ctx.fillRect(
    0,
    970,
    world.width,
    100
  );

  /* road lines */

  ctx.strokeStyle = "#f6d75a";
  ctx.lineWidth = 6;

  ctx.setLineDash([
    45,
    35
  ]);

  ctx.beginPath();

  ctx.moveTo(
    0,
    805
  );

  ctx.lineTo(
    world.width,
    805
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(
    1210,
    0
  );

  ctx.lineTo(
    1210,
    world.height
  );

  ctx.stroke();

  ctx.setLineDash([]);
}

/* =========================
   BUILDINGS
========================= */

function drawBuilding(
  b,
  color,
  title
) {

  ctx.fillStyle = "#222";

  ctx.fillRect(
    b.x + 10,
    b.y + 12,
    b.w,
    b.h
  );

  ctx.fillStyle = color;

  ctx.fillRect(
    b.x,
    b.y,
    b.w,
    b.h
  );

  /* roof */

  ctx.fillStyle = "#333";

  ctx.fillRect(
    b.x - 10,
    b.y - 18,
    b.w + 20,
    18
  );

  /* title */

  ctx.fillStyle = "white";

  ctx.font =
    "bold 26px Arial";

  ctx.textAlign = "center";

  ctx.fillText(
    title,
    b.x + b.w / 2,
    b.y + 50
  );

  /* windows */

  ctx.fillStyle =
    "#9ddcff";

  ctx.fillRect(
    b.x + 35,
    b.y + 90,
    75,
    55
  );

  ctx.fillRect(
    b.x + b.w - 110,
    b.y + 90,
    75,
    55
  );

  /* door */

  ctx.fillStyle =
    "#333";

  ctx.fillRect(
    b.x + b.w / 2 - 40,
    b.y + b.h - 90,
    80,
    90
  );
}

/* =========================
   PLAYER
========================= */

function drawPlayer() {

  ctx.save();

  ctx.translate(
    player.x,
    player.y
  );

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    12,
    17,
    8,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  /* body */

  ctx.fillStyle =
    player.color;

  ctx.fillRect(
    -11,
    -10,
    22,
    25
  );

  /* head */

  ctx.fillStyle =
    "#ffd1a3";

  ctx.beginPath();

  ctx.arc(
    0,
    -17,
    9,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.restore();
}

/* =========================
   TRUCK
========================= */

function drawTruck() {

  ctx.save();

  ctx.translate(
    truck.x,
    truck.y
  );

  ctx.rotate(
    truck.angle
  );

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.35)";

  ctx.fillRect(
    -25,
    -43,
    50,
    92
  );

  /* truck body */

  ctx.fillStyle =
    "#e53935";

  ctx.fillRect(
    -23,
    -45,
    46,
    90
  );

  /* cargo */

  ctx.fillStyle =
    "#fbc02d";

  ctx.fillRect(
    -19,
    -5,
    38,
    45
  );

  /* cabin */

  ctx.fillStyle =
    "#d32f2f";

  ctx.fillRect(
    -22,
    -45,
    44,
    38
  );

  /* windshield */

  ctx.fillStyle =
    "#8fd4ff";

  ctx.fillRect(
    -16,
    -38,
    32,
    17
  );

  /* wheels */

  ctx.fillStyle =
    "#111";

  ctx.fillRect(
    -29,
    -30,
    8,
    20
  );

  ctx.fillRect(
    21,
    -30,
    8,
    20
  );

  ctx.fillRect(
    -29,
    20,
    8,
    20
  );

  ctx.fillRect(
    21,
    20,
    8,
    20
  );

  ctx.restore();
}

/* =========================
   CAMERA
========================= */

function updateCamera() {

  const object =
    getCurrentObject();

  camera.x =
    object.x - W / 2;

  camera.y =
    object.y - H / 2;

  camera.x =
    Math.max(
      0,
      Math.min(
        world.width - W,
        camera.x
      )
    );

  camera.y =
    Math.max(
      0,
      Math.min(
        world.height - H,
        camera.y
      )
    );
}

/* =========================
   DRAW
========================= */

function render() {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );

  updateCamera();

  ctx.save();

  ctx.translate(
    -camera.x,
    -camera.y
  );

  drawWorld();

  ctx.restore();
}

/* =========================
   GAME LOOP
========================= */

function gameLoop() {

  movePlayer();

  moveTruck();

  checkTruckInteraction();

  updateHUD();

  render();

  requestAnimationFrame(
    gameLoop
  );
}

/* =========================
   START
========================= */

updateHUD();

infoEl.textContent =
  "🏪 Showroom-এ শুরু হয়েছে — ট্রাকের কাছে যান।";

gameLoop();
