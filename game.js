// ===============================
// 🚚 TRUCK DEALER GAME
// ===============================

let money = Number(localStorage.getItem("money")) || 500000;
let workers = Number(localStorage.getItem("workers")) || 0;
let ownedTrucks = JSON.parse(localStorage.getItem("ownedTrucks")) || [];

let currentTruckIndex = Number(localStorage.getItem("currentTruckIndex"));
if (isNaN(currentTruckIndex)) {
  currentTruckIndex = -1;
}

let truckX = 50;
let truckY = 10;

const trucks = [
  {
    id: 1,
    name: "Mini Truck",
    price: 120000,
    speed: 50,
    cargo: 2,
    icon: "🚚"
  },
  {
    id: 2,
    name: "City Truck",
    price: 220000,
    speed: 65,
    cargo: 4,
    icon: "🚛"
  },
  {
    id: 3,
    name: "Cargo Master",
    price: 300000,
    speed: 70,
    cargo: 6,
    icon: "🚚"
  },
  {
    id: 4,
    name: "Heavy Truck",
    price: 380000,
    speed: 75,
    cargo: 8,
    icon: "🚛"
  }
];


// ===============================
// SAVE GAME
// ===============================

function saveGame() {
  localStorage.setItem("money", money);
  localStorage.setItem("workers", workers);
  localStorage.setItem("ownedTrucks", JSON.stringify(ownedTrucks));
  localStorage.setItem("currentTruckIndex", currentTruckIndex);
}


// ===============================
// MONEY DISPLAY
// ===============================

function updateMoney() {
  const moneyElements = [
    document.getElementById("money"),
    document.getElementById("bottomMoney")
  ];

  moneyElements.forEach(el => {
    if (el) {
      el.textContent = money.toLocaleString("en-US");
    }
  });
}


// ===============================
// PAGE CHANGE
// ===============================

function showPage(pageName) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageName);

  if (page) {
    page.classList.add("active");
  }

  if (pageName === "market") {
    renderMarket();
  }

  if (pageName === "garage") {
    renderGarage();
  }

  if (pageName === "showroom") {
    renderShowroom();
  }

  if (pageName === "workers") {
    updateWorkers();
  }

  if (pageName === "drive") {
    updateDrive();
  }

  window.scrollTo(0, 0);
}


// ===============================
// MARKET
// ===============================

function renderMarket() {

  const list = document.getElementById("marketList");

  if (!list) return;

  list.innerHTML = "";

  trucks.forEach((truck, index) => {

    const alreadyOwned = ownedTrucks.some(t => t.id === truck.id);

    const card = document.createElement("div");
    card.className = "truck-card";

    card.innerHTML = `
      <div class="truck-image">${truck.icon}</div>

      <h3>${truck.name}</h3>

      <div class="price">
        ৳${truck.price.toLocaleString("en-US")}
      </div>

      <div class="stats">
        ⚡ Speed: ${truck.speed}<br>
        📦 Cargo: ${truck.cargo} ton
      </div>

      <button class="buy"
        ${alreadyOwned ? "disabled" : ""}
        onclick="buyTruck(${truck.id})">

        ${alreadyOwned ? "✅ Owned" : "💰 Buy Truck"}

      </button>
    `;

    list.appendChild(card);
  });
}


// ===============================
// BUY TRUCK
// ===============================

function buyTruck(id) {

  const truck = trucks.find(t => t.id === id);

  if (!truck) return;

  if (ownedTrucks.some(t => t.id === id)) {
    alert("এই ট্রাকটি আপনার কাছে আগে থেকেই আছে!");
    return;
  }

  if (money < truck.price) {
    alert("❌ আপনার কাছে পর্যাপ্ত টাকা নেই!");
    return;
  }

  money -= truck.price;

  ownedTrucks.push({
    ...truck,
    upgrade: 0
  });

  currentTruckIndex = ownedTrucks.length - 1;

  saveGame();
  updateMoney();
  renderMarket();
  renderGarage();
  updateDrive();

  alert(
    "🎉 অভিনন্দন!\n\n" +
    truck.name +
    " আপনি কিনেছেন।\n\n" +
    "এখন 🚚 Drive-এ গিয়ে ট্রাক চালাতে পারবেন।"
  );
}


// ===============================
// GARAGE
// ===============================

function renderGarage() {

  const garage = document.getElementById("garageList");

  if (!garage) return;

  garage.innerHTML = "";

  if (ownedTrucks.length === 0) {

    garage.innerHTML = `
      <div class="garage-card">
        <h3>🔧 Garage খালি</h3>
        <p>প্রথমে Market থেকে একটি ট্রাক কিনুন।</p>
      </div>
    `;

    return;
  }

  ownedTrucks.forEach((truck, index) => {

    const upgradeCost = 30000 + (truck.upgrade * 20000);

    const card = document.createElement("div");
    card.className = "garage-card";

    card.innerHTML = `
      <div class="truck-image">${truck.icon}</div>

      <h3>
        ${truck.name}
      </h3>

      <p>
        ⚡ Speed: ${truck.speed + truck.upgrade * 5}<br>
        📦 Cargo: ${truck.cargo + truck.upgrade} ton<br>
        🔧 Upgrade: ${truck.upgrade}/3
      </p>

      ${
        truck.upgrade < 3
        ?
        `<button class="upgrade"
          onclick="upgradeTruck(${index})">
          🔧 Upgrade ৳${upgradeCost.toLocaleString("en-US")}
        </button>`
        :
        `<button class="upgrade" disabled>
          ✅ MAX Upgrade
        </button>`
      }

      <button class="sell"
        onclick="sellTruck(${index})">
        💵 Sell ৳${Math.floor(truck.price * 0.75).toLocaleString("en-US")}
      </button>

      <button class="big-button"
        onclick="selectTruck(${index})">
        ${
          currentTruckIndex === index
          ? "✅ Selected"
          : "🚚 Select Truck"
        }
      </button>
    `;

    garage.appendChild(card);
  });
}


// ===============================
// SELECT TRUCK
// ===============================

function selectTruck(index) {

  if (!ownedTrucks[index]) return;

  currentTruckIndex = index;

  saveGame();
  renderGarage();
  updateDrive();

  alert(
    "🚚 " +
    ownedTrucks[index].name +
    " এখন আপনার Selected Truck!"
  );
}


// ===============================
// UPGRADE TRUCK
// ===============================

function upgradeTruck(index) {

  const truck = ownedTrucks[index];

  if (!truck) return;

  if (truck.upgrade >= 3) {
    alert("এই ট্রাকের Upgrade সম্পূর্ণ!");
    return;
  }

  const cost = 30000 + (truck.upgrade * 20000);

  if (money < cost) {
    alert("❌ Upgrade করার জন্য পর্যাপ্ত টাকা নেই!");
    return;
  }

  money -= cost;
  truck.upgrade++;

  saveGame();
  updateMoney();
  renderGarage();

  alert(
    "🔧 Upgrade সফল!\n\n" +
    truck.name +
    " Upgrade Level: " +
    truck.upgrade
  );
}


// ===============================
// SELL TRUCK
// ===============================

function sellTruck(index) {

  const truck = ownedTrucks[index];

  if (!truck) return;

  const sellPrice = Math.floor(truck.price * 0.75);

  const confirmSell = confirm(
    truck.name +
    " বিক্রি করবেন?\n\n" +
    "আপনি পাবেন ৳" +
    sellPrice.toLocaleString("en-US")
  );

  if (!confirmSell) return;

  money += sellPrice;

  ownedTrucks.splice(index, 1);

  if (ownedTrucks.length === 0) {
    currentTruckIndex = -1;
  } else if (index === currentTruckIndex) {
    currentTruckIndex = 0;
  } else if (index < currentTruckIndex) {
    currentTruckIndex--;
  }

  saveGame();
  updateMoney();
  renderGarage();
  renderMarket();
  updateDrive();
}


// ===============================
// SHOWROOM
// ===============================

function renderShowroom() {

  const name = document.getElementById("showroomName");
  const info = document.getElementById("showroomInfo");

  if (!name || !info) return;

  if (ownedTrucks.length === 0) {

    name.textContent = "কোনো ট্রাক নেই";

    info.textContent =
      "Market-এ গিয়ে ট্রাক কিনে Showroom-এ আনুন।";

    return;
  }

  const truck =
    ownedTrucks[currentTruckIndex] ||
    ownedTrucks[0];

  name.textContent = truck.name;

  info.innerHTML =
    `⚡ Speed: ${truck.speed + truck.upgrade * 5}<br>` +
    `📦 Cargo: ${truck.cargo + truck.upgrade} ton<br>` +
    `🔧 Upgrade: ${truck.upgrade}/3<br><br>` +
    `💰 ব্যবসার জন্য প্রস্তুত!`;
}


// ===============================
// DRIVE
// ===============================

function updateDrive() {

  const currentTruck =
    document.getElementById("currentTruck");

  const status =
    document.getElementById("driveStatus");

  if (!currentTruck) return;

  if (ownedTrucks.length === 0) {

    currentTruck.textContent =
      "কোনো ট্রাক নেই";

    if (status) {
      status.textContent =
        "Market-এ গিয়ে একটি ট্রাক কিনুন।";
    }

    return;
  }

  const truck =
    ownedTrucks[currentTruckIndex] ||
    ownedTrucks[0];

  currentTruck.textContent = truck.name;

  if (status) {
    status.textContent =
      "🛣️ রাস্তায় ট্রাক চালান";
  }
}


// ===============================
// TRUCK MOVEMENT
// ===============================

function moveTruck(direction) {

  if (ownedTrucks.length === 0) {

    alert(
      "🚚 আগে Market থেকে একটি ট্রাক কিনুন!"
    );

    showPage("market");

    return;
  }

  const truck =
    document.getElementById("playerTruck");

  if (!truck) return;

  const step = 5;

  if (direction === "left") {
    truckX -= step;
  }

  if (direction === "right") {
    truckX += step;
  }

  if (direction === "up") {
    truckY += step;
  }

  if (direction === "down") {
    truckY -= step;
  }

  // সীমার মধ্যে রাখা
  truckX = Math.max(8, Math.min(92, truckX));
  truckY = Math.max(5, Math.min(85, truckY));

  truck.style.left = truckX + "%";
  truck.style.bottom = truckY + "%";

  earnDrivingMoney();
}


// ===============================
// DRIVING MONEY
// ===============================

let lastEarnTime = 0;

function earnDrivingMoney() {

  const now = Date.now();

  if (now - lastEarnTime < 700) {
    return;
  }

  lastEarnTime = now;

  const truck =
    ownedTrucks[currentTruckIndex];

  if (!truck) return;

  const earning =
    1000 +
    truck.speed * 20 +
    truck.cargo * 300;

  money += earning;

  const driveMoney =
    document.getElementById("driveMoney");

  if (driveMoney) {
    driveMoney.textContent =
      earning.toLocaleString("en-US");
  }

  updateMoney();
  saveGame();
}


// ===============================
// GO SHOWROOM
// ===============================

function goToShowroom() {

  if (ownedTrucks.length === 0) {

    alert(
      "❌ আপনার কোনো ট্রাক নেই!\n\n" +
      "Market থেকে ট্রাক কিনুন।"
    );

    showPage("market");

    return;
  }

  alert(
    "🏢 আপনি Showroom-এ পৌঁছেছেন!\n\n" +
    "আপনার ট্রাক এখন Showroom-এ আছে।"
  );

  showPage("showroom");
}


// ===============================
// GO GARAGE
// ===============================

function goToGarage() {

  if (ownedTrucks.length === 0) {

    alert(
      "❌ Garage-এ নেওয়ার মতো কোনো ট্রাক নেই!"
    );

    showPage("market");

    return;
  }

  alert(
    "🔧 আপনি Garage-এ পৌঁছেছেন!\n\n" +
    "এখানে ট্রাক Upgrade করতে পারবেন।"
  );

  showPage("garage");
}


// ===============================
// WORKERS
// ===============================

function updateWorkers() {

  const count =
    document.getElementById("workerCount");

  if (count) {
    count.textContent = workers;
  }
}


function hireWorker() {

  const salary = 20000;

  if (money < salary) {

    alert(
      "❌ Worker Hire করার জন্য পর্যাপ্ত টাকা নেই!"
    );

    return;
  }

  money -= salary;

  workers++;

  saveGame();
  updateMoney();
  updateWorkers();

  alert(
    "👷 Worker Hire সফল!\n\n" +
    "আপনার মোট Worker: " +
    workers
  );
}


// ===============================
// WORKER PASSIVE INCOME
// ===============================

setInterval(() => {

  if (workers <= 0) return;

  const income = workers * 5000;

  money += income;

  updateMoney();
  saveGame();

}, 30000);


// ===============================
// KEYBOARD CONTROL
// ===============================

document.addEventListener("keydown", function(event) {

  if (event.key === "ArrowLeft") {
    moveTruck("left");
  }

  if (event.key === "ArrowRight") {
    moveTruck("right");
  }

  if (event.key === "ArrowUp") {
    moveTruck("up");
  }

  if (event.key === "ArrowDown") {
    moveTruck("down");
  }

});


// ===============================
// START GAME
// ===============================

function startGame() {

  updateMoney();
  renderMarket();
  renderGarage();
  renderShowroom();
  updateWorkers();
  updateDrive();

}


// Game শুরু
startGame();
