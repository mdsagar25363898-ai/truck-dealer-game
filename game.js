const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const moneyEl = document.getElementById("money");
const fuelEl = document.getElementById("fuel");
const truckNameEl = document.getElementById("truckName");
const locationEl = document.getElementById("location");
const messageEl = document.getElementById("message");
const actionBtn = document.getElementById("action");

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

let save = JSON.parse(localStorage.getItem("truckDealerSave") || "null");

if (!save) {
  save = {
    money: 380000,
    fuel: 100,
    truck: "Mini Truck",
    workers: 0
  };
}

const player = {
  x: 300,
  y: 300,
  speed: 3.2,
  w: 42,
  h: 70
};

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

let currentPlace = "showroom";
let nearPlace = null;

const places = {
  showroom: {
    name: "🏪 SHOWROOM",
    x: 90,
    y: 70,
    w: 300,
    h: 230
  },

  market: {
    name: "🚛 TRUCK MARKET",
    x: 620,
    y: 80,
    w: 270,
    h: 210
  },

  garage: {
    name: "🔧 GARAGE",
    x: 620,
    y: 430,
    w: 270,
    h: 180
  },

  office: {
    name: "👷 WORKER OFFICE",
    x: 80,
    y: 470,
    w: 300,
    h: 160
  }
};

function saveGame() {
  localStorage.setItem(
    "truckDealerSave",
    JSON.stringify(save)
  );
}

function updateHUD() {
  moneyEl.textContent = Math.floor(save.money);
  fuelEl.textContent = Math.floor(save.fuel);
  truckNameEl.textContent = save.truck;
}

function message(text) {
  messageEl.textContent = text;

  clearTimeout(message.timer);

  message.timer = setTimeout(() => {
    messageEl.textContent = "";
  }, 2500);
}

function rectCenter(p) {
  return {
    x: p.x + p.w / 2,
    y: p.y + p.h / 2
  };
}

function distanceToPlace(place) {
  const c = rectCenter(place);

  return Math.hypot(
    player.x - c.x,
    player.y - c.y
  );
}

function drawRoads() {
  ctx.fillStyle = "#4b8f45";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#555";
  ctx.fillRect(0, 330, W, 120);
  ctx.fillRect(450, 0, 120, H);

  ctx.strokeStyle = "#e8d36b";
  ctx.lineWidth = 5;
  ctx.setLineDash([35, 25]);

  ctx.beginPath();
  ctx.moveTo(0, 390);
  ctx.lineTo(W, 390);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(510, 0);
  ctx.lineTo(510, H);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawBuilding(place, emoji, color) {
  ctx.fillStyle = "#222";
  ctx.fillRect(
    place.x + 5,
    place.y + 7,
    place.w,
    place.h
  );

  ctx.fillStyle = color;
  ctx.fillRect(
    place.x,
    place.y,
    place.w,
    place.h
  );

  ctx.fillStyle = "#fff";
  ctx.font = "bold 23px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    emoji,
    place.x + place.w / 2,
    place.y + 55
  );

  ctx.font = "bold 18px Arial";

  let title = "";

  if (place === places.showroom)
    title = "SHOWROOM";

  if (place === places.market)
    title = "TRUCK MARKET";

  if (place === places.garage)
    title = "GARAGE";

  if (place === places.office)
    title = "WORKER OFFICE";

  ctx.fillText(
    title,
    place.x + place.w / 2,
    place.y + 90
  );

  ctx.fillStyle = "#333";
  ctx.fillRect(
    place.x + place.w / 2 - 35,
    place.y + place.h - 60,
    70,
    60
  );

  ctx.fillStyle = "#9dd7ff";
  ctx.fillRect(
    place.x + 25,
    place.y + 115,
    55,
    45
  );

  ctx.fillRect(
    place.x + place.w - 80,
    place.y + 115,
    55,
    45
  );
}

function drawTruck() {
  ctx.save();

  ctx.translate(player.x, player.y);

  ctx.fillStyle = "#111";
  ctx.fillRect(-22, -35, 44, 70);

  ctx.fillStyle = "#e53935";
  ctx.fillRect(-18, -31, 36, 38);

  ctx.fillStyle = "#ffca28";
  ctx.fillRect(-17, 7, 34, 25);

  ctx.fillStyle = "#8ed0ff";
  ctx.fillRect(-14, -25, 28, 16);

  ctx.fillStyle = "#111";

  ctx.fillRect(-25, -24, 7, 18);
  ctx.fillRect(18, -24, 7, 18);

  ctx.fillRect(-25, 15, 7, 18);
  ctx.fillRect(18, 15, 7, 18);

  ctx.restore();
}

function drawPlayerMarker() {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 47, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawMap() {
  drawRoads();

  drawBuilding(
    places.showroom,
    "🏪",
    "#1565c0"
  );

  drawBuilding(
    places.market,
    "🚛",
    "#8e24aa"
  );

  drawBuilding(
    places.garage,
    "🔧",
    "#ef6c00"
  );

  drawBuilding(
    places.office,
    "👷",
    "#00897b"
  );

  drawTruck();
  drawPlayerMarker();
}

function movePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;

  if (!dx && !dy) return;

  const len = Math.hypot(dx, dy);

  dx /= len;
  dy /= len;

  let speed = player.speed;

  if (save.fuel <= 0) {
    speed = 0;
    message("⛽ জ্বালানি শেষ!");
  }

  player.x += dx * speed;
  player.y += dy * speed;

  player.x = Math.max(25, Math.min(W - 25, player.x));
  player.y = Math.max(25, Math.min(H - 25, player.y));

  save.fuel -= 0.025;

  if (save.fuel < 0)
    save.fuel = 0;

  updateHUD();
  saveGame();
}

function detectPlace() {
  nearPlace = null;

  for (const key in places) {
    const d = distanceToPlace(places[key]);

    if (d < 150) {
      nearPlace = key;
      break;
    }
  }

  if (nearPlace) {
    locationEl.textContent =
      places[nearPlace].name;

    actionBtn.style.display = "block";

    if (nearPlace === "showroom") {
      actionBtn.textContent = "🚪 SHOWROOM থেকে বের হন";
    }

    if (nearPlace === "market") {
      actionBtn.textContent = "🛒 ট্রাক মার্কেট খুলুন";
    }

    if (nearPlace === "garage") {
      actionBtn.textContent = "🔧 গ্যারেজ খুলুন";
    }

    if (nearPlace === "office") {
      actionBtn.textContent = "👷 কর্মী নিয়োগ করুন";
    }

  } else {
    locationEl.textContent = "🛣️ রাস্তায়";
    actionBtn.style.display = "none";
  }
}

actionBtn.addEventListener("click", () => {

  if (!nearPlace) return;

  if (nearPlace === "showroom") {
    message("🚚 আপনি Showroom থেকে রাস্তায় বের হলেন!");
    player.x = 450;
    player.y = 390;
  }

  if (nearPlace === "market") {
    openMarket();
  }

  if (nearPlace === "garage") {
    openGarage();
  }

  if (nearPlace === "office") {
    hireWorker();
  }
});

function openMarket() {

  const choice = confirm(
    "🚛 TRUCK MARKET\n\n" +
    "1. Mini Truck — ৳120,000\n" +
    "2. Heavy Truck — ৳300,000\n\n" +
    "Heavy Truck কিনবেন?"
  );

  if (choice) {

    if (save.money >= 300000) {
      save.money -= 300000;
      save.truck = "Heavy Truck";

      message("🎉 Heavy Truck কেনা হয়েছে!");

      updateHUD();
      saveGame();

    } else {
      message("❌ পর্যাপ্ত টাকা নেই!");
    }

  } else {
    message("Mini Truck চালু আছে।");
  }
}

function openGarage() {

  if (save.money >= 10000) {

    const repair =
      confirm(
        "🔧 GARAGE\n\n" +
        "Truck repair করতে ৳10,000 লাগবে।\n\n" +
        "Repair করবেন?"
      );

    if (repair) {
      save.money -= 10000;
      save.fuel = 100;

      message("🔧 ট্রাক সার্ভিস ও Fuel পূর্ণ হয়েছে!");

      updateHUD();
      saveGame();
    }

  } else {
    message("❌ Repair করার জন্য টাকা নেই!");
  }
}

function hireWorker() {

  const price = 25000;

  if (save.money < price) {
    message("❌ কর্মী নিয়োগের জন্য ৳25,000 দরকার!");
    return;
  }

  if (
    confirm(
      "👷 Worker Hire\n\n" +
      "নতুন কর্মী নিয়োগ করতে ৳25,000 লাগবে।"
    )
  ) {

    save.money -= price;
    save.workers++;

    message(
      "👷 নতুন কর্মী নিয়োগ হয়েছে! মোট: " +
      save.workers
    );

    updateHUD();
    saveGame();
  }
}

function showInfo() {
  alert(
    "🚚 TRUCK DEALER\n\n" +
    "🏪 Showroom — এখান থেকেই শুরু\n" +
    "🛣️ Road — ট্রাক চালান\n" +
    "🚛 Truck Market — নতুন ট্রাক কিনুন\n" +
    "🔧 Garage — Repair করুন\n" +
    "👷 Worker Office — কর্মী নিয়োগ করুন\n\n" +
    "⛽ চলার সময় Fuel কমবে।"
  );
}

function resetGame() {

  if (!confirm("সব Game Data Reset করবেন?"))
    return;

  localStorage.removeItem("truckDealerSave");

  location.reload();
}

document.querySelectorAll(".ctrl").forEach(btn => {

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

document.addEventListener("keydown", e => {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  )
    keys.up = true;

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  )
    keys.down = true;

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  )
    keys.left = true;

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  )
    keys.right = true;
});

document.addEventListener("keyup", e => {

  if (
    e.key === "ArrowUp" ||
    e.key.toLowerCase() === "w"
  )
    keys.up = false;

  if (
    e.key === "ArrowDown" ||
    e.key.toLowerCase() === "s"
  )
    keys.down = false;

  if (
    e.key === "ArrowLeft" ||
    e.key.toLowerCase() === "a"
  )
    keys.left = false;

  if (
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "d"
  )
    keys.right = false;
});

function gameLoop() {

  movePlayer();
  detectPlace();

  ctx.clearRect(0, 0, W, H);

  drawMap();

  requestAnimationFrame(gameLoop);
}

updateHUD();
gameLoop();

message("🏪 Showroom থেকে খেলা শুরু হয়েছে!");
