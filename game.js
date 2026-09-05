const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const moneyEl = document.getElementById("money");
const fuelEl = document.getElementById("fuel");
const placeEl = document.getElementById("place");
const infoEl = document.getElementById("info");
const actionBtn = document.getElementById("actionBtn");
const modeEl = document.getElementById("mode");

let W = 0, H = 0;

function resize() {
  W = innerWidth;
  H = innerHeight;
  canvas.width = W;
  canvas.height = H;
}

addEventListener("resize", resize);
resize();

/* =========================
   SAVE
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
  width: 3000,
  height: 2000
};

/* =========================
   BUILDINGS
========================= */

const showroom = {
  x: 300,
  y: 180,
  w: 520,
  h: 330
};

const market = {
  x: 2150,
  y: 180,
  w: 500,
  h: 300
};

const garage = {
  x: 2150,
  y: 1500,
  w: 500,
  h: 280
};

const office = {
  x: 300,
  y: 1500,
  w: 500,
  h: 280
};

/* =========================
   PLAYER
========================= */

const player = {
  x: 560,
  y: 350,
  width: 26,
  height: 26,
  speed: 3.5,
  color: "#1976d2"
};

/* =========================
   TRUCK
========================= */

const truck = {
  x: 560,
  y: 470,
  width: 58,
  height: 100,
  speed: 6,
  angle: 0,
  color: "#e53935"
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

document.querySelectorAll(".control").forEach(btn => {

  const key = btn.dataset.key;

  const start = e => {
    e.preventDefault();
    keys[key] = true;
  };

  const stop = e => {
    e.preventDefault();
    keys[key] = false;
  };

  btn.addEventListener("touchstart", start, {
    passive: false
  });

  btn.addEventListener("touchend", stop, {
    passive: false
  });

  btn.addEventListener("touchcancel", stop, {
    passive: false
  });

  btn.addEventListener("mousedown", start);
  btn.addEventListener("mouseup", stop);
  btn.addEventListener("mouseleave", stop);
});

/* Keyboard */

addEventListener("keydown", e => {

  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w")
    keys.up = true;

  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s")
    keys.down = true;

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a")
    keys.left = true;

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d")
    keys.right = true;
});

addEventListener("keyup", e => {

  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w")
    keys.up = false;

  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s")
    keys.down = false;

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a")
    keys.left = false;

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d")
    keys.right = false;
});

/* =========================
   HOUSES / SHOPS / TREES
========================= */

const houses = [];

function addHouse(x, y, w, h, color) {
  houses.push({
    type: "house",
    x, y, w, h, color
  });
}

const houseColors = [
  "#d98b73",
  "#e0b36c",
  "#86a9c9",
  "#b985a8",
  "#8dbb82",
  "#c9c1a0"
];

/*
   রাস্তার দুই পাশে বাড়ি
*/

for (let x = 50; x < world.width; x += 260) {

  if (x < 950 || x > 1350) {
    addHouse(
      x,
      545,
      180,
      130,
      houseColors[(x / 260) % houseColors.length | 0]
    );
  }

  if (x < 950 || x > 1350) {
    addHouse(
      x + 70,
      910,
      170,
      125,
      houseColors[((x / 260) + 2) % houseColors.length | 0]
    );
  }
}

/* পাশের রাস্তার বাড়ি */

for (let y = 40; y < world.height; y += 250) {

  if (y < 650 || y > 1100) {

    addHouse(
      870,
      y,
      170,
      125,
      houseColors[(y / 250) % houseColors.length | 0]
    );

    addHouse(
      1320,
      y + 70,
      180,
      130,
      houseColors[((y / 250) + 3) % houseColors.length | 0]
    );
  }
}

/* =========================
   SHOPS
========================= */

const shops = [
  {
    x: 60,
    y: 735,
    w: 150,
    h: 100,
    name: "GROCERY",
    color: "#c62828"
  },
  {
    x: 300,
    y: 735,
    w: 150,
    h: 100,
    name: "CAFE",
    color: "#6d4c41"
  },
  {
    x: 1580,
    y: 735,
    w: 170,
    h: 100,
    name: "PARTS",
    color: "#546e7a"
  },
  {
    x: 1820,
    y: 735,
    w: 170,
    h: 100,
    name: "FOOD",
    color: "#ad1457"
  }
];

/* =========================
   TREES
========================= */

const trees = [];

for (let x = 30; x < world.width; x += 125) {

  if (x % 250 < 125) {

    trees.push({
      x,
      y: 620,
      size: 28
    });

    trees.push({
      x: x + 45,
      y: 1060,
      size: 25
    });
  }
}

for (let y = 40; y < world.height; y += 120) {

  trees.push({
    x: 1040,
    y,
    size: 27
  });

  trees.push({
    x: 1390,
    y: y + 45,
    size: 25
  });
}

/* =========================
   COLLISION OBJECTS
========================= */

function getCollisionObjects() {

  return [
    showroom,
    market,
    garage,
    office,

    ...houses,

    ...shops
  ];
}

function rectCollision(a, b) {

  return (
    a.x - a.width / 2 < b.x + b.w &&
    a.x + a.width / 2 > b.x &&
    a.y - a.height / 2 < b.y + b.h &&
    a.y + a.height / 2 > b.y
  );
}

function canMove(object, nx, ny) {

  const test = {
    x: nx,
    y: ny,
    width: object.width,
    height: object.height
  };

  for (const b of getCollisionObjects()) {

    if (rectCollision(test, b)) {
      return false;
    }
  }

  return true;
}

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
   PLACE
========================= */

function getPlaceName() {

  const o = driving ? truck : player;

  if (
    o.x > showroom.x &&
    o.x < showroom.x + showroom.w &&
    o.y > showroom.y &&
    o.y < showroom.y + showroom.h
  )
    return "🏪 Showroom";

  if (
    o.x > market.x &&
    o.x < market.x + market.w &&
    o.y > market.y &&
    o.y < market.y + market.h
  )
    return "🚛 Truck Market";

  if (
    o.x > garage.x &&
    o.x < garage.x + garage.w &&
    o.y > garage.y &&
    o.y < garage.y + garage.h
  )
    return "🔧 Garage";

  if (
    o.x > office.x &&
    o.x < office.x + office.w &&
    o.y > office.y &&
    o.y < office.y + office.h
  )
    return "👷 Worker Office";

  return "🛣️ Road";
}

/* =========================
   PLAYER MOVEMENT
========================= */

function movePlayer() {

  if (driving) return;

  let dx = 0;
  let dy = 0;

  if (keys.up) dy--;
  if (keys.down) dy++;
  if (keys.left) dx--;
  if (keys.right) dx++;

  if (!dx && !dy) return;

  const length =
    Math.sqrt(dx * dx + dy * dy);

  dx /= length;
  dy /= length;

  const nx =
    player.x + dx * player.speed;

  const ny =
    player.y + dy * player.speed;

  if (canMove(player, nx, player.y))
    player.x = nx;

  if (canMove(player, player.x, ny))
    player.y = ny;

  keepWorld(player);
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

  if (keys.left)
    truck.angle -= 0.055;

  if (keys.right)
    truck.angle += 0.055;

  let amount = 0;

  if (keys.up)
    amount = truck.speed;

  if (keys.down)
    amount = -truck.speed * .55;

  if (amount !== 0) {

    const nx =
      truck.x +
      Math.sin(truck.angle) * amount;

    const ny =
      truck.y -
      Math.cos(truck.angle) * amount;

    if (canMove(truck, nx, ny)) {

      truck.x = nx;
      truck.y = ny;

      data.fuel -= 0.025;

      if (data.fuel < 0)
        data.fuel = 0;

      saveGame();
    }
  }

  keepWorld(truck);
}

/* =========================
   WORLD LIMIT
========================= */

function keepWorld(o) {

  o.x = Math.max(
    30,
    Math.min(world.width - 30, o.x)
  );

  o.y = Math.max(
    30,
    Math.min(world.height - 30, o.y)
  );
}

/* =========================
   TRUCK ENTER / EXIT
========================= */

function truckDistance() {

  return Math.hypot(
    player.x - truck.x,
    player.y - truck.y
  );
}

function checkTruckInteraction() {

  if (driving) {

    actionBtn.style.display = "block";
    actionBtn.textContent =
      "🚶 ট্রাক থেকে নামুন";

    return;
  }

  if (truckDistance() < 120) {

    actionBtn.style.display =
      "block";

    actionBtn.textContent =
      "🚚 ট্রাকে উঠুন";

  } else {

    actionBtn.style.display =
      "none";
  }
}

actionBtn.addEventListener("click", () => {

  if (driving) {

    driving = false;

    player.x =
      truck.x + 70;

    player.y =
      truck.y;

    modeEl.textContent =
      "🚶 WALK";

    infoEl.textContent =
      "🚶 আপনি ট্রাক থেকে নেমেছেন।";

    return;
  }

  if (truckDistance() < 120) {

    driving = true;

    modeEl.textContent =
      "🚚 DRIVING";

    infoEl.textContent =
      "🚚 ট্রাক চালান।";

  }
});

/* =========================
   ROAD
========================= */

function drawRoads() {

  /*
     MAIN ROAD
  */

  ctx.fillStyle = "#4e4e4e";

  ctx.fillRect(
    0,
    700,
    world.width,
    190
  );

  /*
     SIDE ROAD
  */

  ctx.fillRect(
    1130,
    0,
    190,
    world.height
  );

  /*
     LOWER ROAD
  */

  ctx.fillRect(
    0,
    970,
    world.width,
    105
  );

  /*
     FOOTPATH
  */

  ctx.fillStyle = "#bdbdbd";

  ctx.fillRect(
    0,
    680,
    world.width,
    20
  );

  ctx.fillRect(
    0,
    890,
    world.width,
    20
  );

  ctx.fillRect(
    1110,
    0,
    20,
    world.height
  );

  ctx.fillRect(
    1320,
    0,
    20,
    world.height
  );

  /*
     ROAD LINES
  */

  ctx.strokeStyle =
    "#f4d35e";

  ctx.lineWidth = 6;

  ctx.setLineDash([
    50,
    35
  ]);

  ctx.beginPath();

  ctx.moveTo(
    0,
    795
  );

  ctx.lineTo(
    world.width,
    795
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(
    1225,
    0
  );

  ctx.lineTo(
    1225,
    world.height
  );

  ctx.stroke();

  ctx.setLineDash([]);
}

/* =========================
   HOUSE DRAW
========================= */

function drawHouse(h) {

  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.25)";

  ctx.fillRect(
    h.x + 8,
    h.y + 10,
    h.w,
    h.h
  );

  /* building */

  ctx.fillStyle =
    h.color;

  ctx.fillRect(
    h.x,
    h.y,
    h.w,
    h.h
  );

  /* roof */

  ctx.fillStyle =
    "#633c32";

  ctx.beginPath();

  ctx.moveTo(
    h.x - 10,
    h.y
  );

  ctx.lineTo(
    h.x + h.w / 2,
    h.y - 55
  );

  ctx.lineTo(
    h.x + h.w + 10,
    h.y
  );

  ctx.closePath();

  ctx.fill();

  /* windows */

  ctx.fillStyle =
    "#aee1ff";

  ctx.fillRect(
    h.x + 25,
    h.y + 35,
    38,
    35
  );

  ctx.fillRect(
    h.x + h.w - 63,
    h.y + 35,
    38,
    35
  );

  /* door */

  ctx.fillStyle =
    "#593b2b";

  ctx.fillRect(
    h.x + h.w / 2 - 18,
    h.y + h.h - 55,
    36,
    55
  );
}

/* =========================
   SHOP DRAW
========================= */

function drawShop(s) {

  ctx.fillStyle =
    "rgba(0,0,0,.25)";

  ctx.fillRect(
    s.x + 7,
    s.y + 8,
    s.w,
    s.h
  );

  ctx.fillStyle =
    s.color;

  ctx.fillRect(
    s.x,
    s.y,
    s.w,
    s.h
  );

  ctx.fillStyle =
    "#fff";

  ctx.font =
    "bold 17px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    s.name,
    s.x + s.w / 2,
    s.y + 30
  );

  ctx.fillStyle =
    "#9bd8ff";

  ctx.fillRect(
    s.x + 20,
    s.y + 45,
    s.w - 40,
    32
  );
}

/* =========================
   TREE DRAW
========================= */

function drawTree(t) {

  ctx.fillStyle =
    "#68452c";

  ctx.fillRect(
    t.x - 5,
    t.y,
    10,
    t.size
  );

  ctx.fillStyle =
    "#287a35";

  ctx.beginPath();

  ctx.arc(
    t.x,
    t.y - 8,
    t.size,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.fillStyle =
    "#3f9644";

  ctx.beginPath();

  ctx.arc(
    t.x - 13,
    t.y,
    t.size * .65,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.arc(
    t.x + 13,
    t.y,
    t.size * .65,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

/* =========================
   BUILDING DRAW
========================= */

function drawBuilding(b, color, title) {

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

  ctx.fillRect(
    b.x + 12,
    b.y + 12,
    b.w,
    b.h
  );

  ctx.fillStyle =
    color;

  ctx.fillRect(
    b.x,
    b.y,
    b.w,
    b.h
  );

  ctx.fillStyle =
    "#333";

  ctx.fillRect(
    b.x - 8,
    b.y - 20,
    b.w + 16,
    20
  );

  ctx.fillStyle =
    "#fff";

  ctx.font =
    "bold 26px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    title,
    b.x + b.w / 2,
    b.y + 50
  );

  ctx.fillStyle =
    "#9bdcff";

  ctx.fillRect(
    b.x + 35,
    b.y + 90,
    80,
    55
  );

  ctx.fillRect(
    b.x + b.w - 115,
    b.y + 90,
    80,
    55
  );

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
   PLAYER DRAW
========================= */

function drawPlayer() {

  ctx.save();

  ctx.translate(
    player.x,
    player.y
  );

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

  ctx.fillStyle =
    player.color;

  ctx.fillRect(
    -11,
    -8,
    22,
    24
  );

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
   TRUCK DRAW
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
    -27,
    -47,
    54,
    98
  );

  /* cargo */

  ctx.fillStyle =
    "#f5b82e";

  ctx.fillRect(
    -22,
    -2,
    44,
    47
  );

  /* cabin */

  ctx.fillStyle =
    "#e53935";

  ctx.fillRect(
    -24,
    -48,
    48,
    48
  );

  /* windshield */

  ctx.fillStyle =
    "#8ed5ff";

  ctx.fillRect(
    -17,
    -40,
    34,
    20
  );

  /* wheels */

  ctx.fillStyle =
    "#111";

  ctx.fillRect(
    -31,
    -32,
    9,
    22
  );

  ctx.fillRect(
    22,
    -32,
    9,
    22
  );

  ctx.fillRect(
    -31,
    20,
    9,
    22
  );

  ctx.fillRect(
    22,
    20,
    9,
    22
  );

  ctx.restore();
}

/* =========================
   WORLD DRAW
========================= */

function drawWorld() {

  ctx.fillStyle =
    "#5c9b48";

  ctx.fillRect(
    0,
    0,
    world.width,
    world.height
  );

  drawRoads();

  /* houses */

  for (const h of houses)
    drawHouse(h);

  /* shops */

  for (const s of shops)
    drawShop(s);

  /* trees */

  for (const t of trees)
    drawTree(t);

  /* main buildings */

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

  if (!driving)
    drawPlayer();
}

/* =========================
   CAMERA
========================= */

function updateCamera() {

  const o =
    driving ? truck : player;

  camera.x =
    o.x - W / 2;

  camera.y =
    o.y - H / 2;

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
   RENDER
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

function loop() {

  movePlayer();

  moveTruck();

  checkTruckInteraction();

  updateHUD();

  render();

  requestAnimationFrame(loop);
}

/* =========================
   START
========================= */

updateHUD();

infoEl.textContent =
  "🏪 Showroom থেকে শুরু করুন। 🚚 ট্রাকের কাছে যান।";

loop();
