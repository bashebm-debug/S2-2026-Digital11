// ===================================================
// SENeye AQUAPONICS DASHBOARD
// Pedare Aquaponics
// ===================================================

const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";
let connectionOK = false;

let bubbles = [];
let fish = [];


// ===================================================
// PRELOAD
// ===================================================

function preload() {
  let endpoint = USE_OFFLINE_MOCK
    ? "sample-data.json"
    : PROXY_URL;

  aquariumData = loadJSON(
    endpoint,
    onDataLoaded,
    onError
  );
}


// ===================================================
// SETUP
// ===================================================

function setup() {

  createCanvas(1000, 680);

  // Create bubbles
  for (let i = 0; i < 40; i++) {

    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(3, 10),
      speed: random(0.3, 1.2)
    });

  }

  // Create fish
  fish.push({
    x: 100,
    y: 560,
    speed: 0.5,
    size: 1
  });

  fish.push({
    x: 700,
    y: 520,
    speed: -0.35,
    size: 0.7
  });

  // Refresh every 5 minutes
  if (!USE_OFFLINE_MOCK) {

    setInterval(() => {

      loadJSON(
        PROXY_URL,
        onDataLoaded,
        onError
      );

    }, 300000);

  }

}


// ===================================================
// DATA LOADED
// ===================================================

function onDataLoaded(data) {

  aquariumData = data;

  lastUpdated =
    new Date().toLocaleTimeString();

  connectionOK = true;

  console.log(
    "Seneye data refreshed:",
    data
  );

}


// ===================================================
// ERROR
// ===================================================

function onError(err) {

  console.error(
    "Seneye connection error:",
    err
  );

  connectionOK = false;

}


// ===================================================
// DRAW
// ===================================================

function draw() {

  drawBackground();

  drawBubbles();

  drawFish();

  drawHeader();


  if (aquariumData) {

    try {

      let sensor = aquariumData[0];

      let exps = sensor.exps;

      let temp =
        parseFloat(
          exps.temperature.curr
        );

      let ph =
        parseFloat(
          exps.ph.curr
        );

      let nh3 =
        parseFloat(
          exps.nh3.curr
        );

      let nh4 =
        parseFloat(
          exps.nh4.curr
        );

      let o2 =
        parseFloat(
          exps.o2.curr
        );

      let lux =
        parseFloat(
          exps.lux.curr
        );

      drawMainCards(
        temp,
        ph,
        nh3,
        nh4,
        o2
      );

      drawAquariumStatus(
        sensor,
        temp,
        ph,
        nh3,
        nh4,
        o2
      );

      drawSensorInfo(
        sensor,
        lux
      );

    }

    catch (error) {

      drawError();

    }

  }

  else {

    drawLoading();

  }

}


// ===================================================
// BACKGROUND
// ===================================================

function drawBackground() {

  background(5, 18, 32);

  noStroke();

  // Water glow
  fill(5, 40, 65, 150);

  ellipse(
    width * 0.2,
    height * 0.7,
    600,
    450
  );

  fill(0, 70, 100, 80);

  ellipse(
    width * 0.8,
    height * 0.3,
    700,
    500
  );

  // Bottom
  fill(120, 100, 60, 120);

  rect(
    0,
    height - 35,
    width,
    35
  );

  drawPlants();

}


// ===================================================
// HEADER
// ===================================================

function drawHeader() {

  fill(8, 27, 45, 245);

  noStroke();

  rect(
    0,
    0,
    width,
    105
  );


  // Main title
  fill(255);

  textAlign(LEFT, TOP);

  textStyle(BOLD);

  textSize(27);

  text(
    "AQUARIUM MONITOR",
    35,
    20
  );


  textStyle(NORMAL);

  fill(110, 190, 225);

  textSize(13);

  text(
    "Pedare Aquaponics • Seneye Environmental System",
    37,
    60
  );


  // Connection pill
  fill(15, 48, 60);

  rect(
    width - 205,
    25,
    170,
    45,
    23
  );


  // Status dot
  fill(
    connectionOK
      ? color(70, 230, 130)
      : color(255, 80, 80)
  );

  circle(
    width - 180,
    48,
    10
  );


  fill(220);

  textSize(11);

  text(
    connectionOK
      ? "SENSOR ONLINE"
      : "SENSOR OFFLINE",
    width - 165,
    41
  );


  fill(100, 150, 180);

  textSize(10);

  text(
    "Updated " +
    (lastUpdated || "Loading..."),
    width - 200,
    60
  );

}


// ===================================================
// MAIN CARDS
// ===================================================

function drawMainCards(
  temp,
  ph,
  nh3,
  nh4,
  o2
) {

  drawTemperature(
    35,
    135,
    temp
  );

  drawGauge(
    250,
    135,
    "pH",
    ph,
    6.0,
    9.0,
    8.0
  );

  drawGauge(
    465,
    135,
    "NH₃",
    nh3,
    0,
    0.05,
    0.02
  );

  drawGauge(
    680,
    135,
    "NH₄",
    nh4,
    0,
    25,
    10
  );

}


// ===================================================
// TEMPERATURE
// ===================================================

function drawTemperature(
  x,
  y,
  value
) {

  drawCard(
    x,
    y,
    190,
    170
  );


  fill(145, 195, 220);

  textSize(12);

  textStyle(BOLD);

  text(
    "WATER TEMP",
    x + 18,
    y + 18
  );

  textStyle(NORMAL);


  fill(80, 215, 255);

  textSize(35);

  text(
    value.toFixed(1) + "°C",
    x + 18,
    y + 55
  );


  // Bar

  let percent =
    constrain(
      (value - 15) / 15,
      0,
      1
    );


  fill(20, 50, 70);

  rect(
    x + 18,
    y + 115,
    154,
    10,
    5
  );


  fill(80, 210, 255);

  rect(
    x + 18,
    y + 115,
    154 * percent,
    10,
    5
  );


  fill(110, 160, 180);

  textSize(9);

  text(
    "15°C",
    x + 18,
    y + 135
  );

  text(
    "30°C",
    x + 148,
    y + 135
  );


  fill(80, 220, 150);

  textSize(10);

  textStyle(BOLD);

  text(
    "NORMAL",
    x + 18,
    y + 150
  );

  textStyle(NORMAL);

}


// ===================================================
// GAUGE
// ===================================================

function drawGauge(
  x,
  y,
  label,
  value,
  minValue,
  maxValue,
  safeLimit
) {

  drawCard(
    x,
    y,
    190,
    170
  );


  fill(145, 195, 220);

  textSize(12);

  textStyle(BOLD);

  text(
    label,
    x + 18,
    y + 18
  );

  textStyle(NORMAL);


  let isSafe =
    value <= safeLimit;


  fill(
    isSafe
      ? color(80, 220, 150)
      : color(255, 170, 70)
  );


  textSize(30);

  text(
    value.toFixed(
      label === "NH₄"
        ? 2
        : 3
    ),
    x + 18,
    y + 52
  );


  // Gauge

  let percent =
    constrain(
      (value - minValue) /
      (maxValue - minValue),
      0,
      1
    );


  fill(20, 50, 70);

  rect(
    x + 18,
    y + 110,
    154,
    12,
    6
  );


  fill(
    isSafe
      ? color(80, 220, 150)
      : color(255, 170, 70)
  );


  rect(
    x + 18,
    y + 110,
    154 * percent,
    12,
    6
  );


  fill(110, 160, 180);

  textSize(9);

  text(
    minValue,
    x + 18,
    y + 130
  );

  text(
    maxValue,
    x + 145,
    y + 130
  );


  fill(
    isSafe
      ? color(80, 220, 150)
      : color(255, 170, 70)
  );

  textSize(10);

  textStyle(BOLD);

  text(
    isSafe
      ? "GOOD"
      : "CHECK",
    x + 18,
    y + 148
  );

  textStyle(NORMAL);

}


// ===================================================
// AQUARIUM STATUS
// ===================================================

function drawAquariumStatus(
  sensor,
  temp,
  ph,
  nh3,
  nh4,
  o2
) {

  let x = 35;
  let y = 330;

  drawCard(
    x,
    y,
    width - 70,
    145
  );


  fill(255);

  textSize(15);

  textStyle(BOLD);

  text(
    "AQUARIUM STATUS",
    x + 20,
    y + 18
  );

  textStyle(NORMAL);


  // Temperature
  drawStatusItem(
    x + 20,
    y + 55,
    "TEMP",
    temp.toFixed(1) + "°C",
    true
  );


  // pH
  drawStatusItem(
    x + 200,
    y + 55,
    "pH",
    ph.toFixed(2),
    sensor.exps.ph.status == "0"
  );


  // NH3
  drawStatusItem(
    x + 380,
    y + 55,
    "NH₃",
    nh3.toFixed(3),
    sensor.exps.nh3.status == "0"
  );


  // NH4
  drawStatusItem(
    x + 560,
    y + 55,
    "NH₄",
    nh4.toFixed(2),
    sensor.exps.nh4.status == "0"
  );


  // O2
  drawStatusItem(
    x + 740,
    y + 55,
    "O₂",
    o2.toFixed(1),
    sensor.exps.o2.status == "0"
  );

}


// ===================================================
// STATUS ITEM
// ===================================================

function drawStatusItem(
  x,
  y,
  label,
  value,
  good
) {

  fill(15, 40, 55);

  rect(
    x,
    y,
    145,
    60,
    8
  );


  fill(110, 160, 180);

  textSize(9);

  text(
    label,
    x + 12,
    y + 10
  );


  fill(
    good
      ? color(80, 220, 150)
      : color(255, 100, 100)
  );


  textSize(18);

  textStyle(BOLD);

  text(
    value,
    x + 12,
    y + 30
  );


  textStyle(NORMAL);


  fill(
    good
      ? color(80, 220, 150)
      : color(255, 100, 100)
  );

  circle(
    x + 125,
    y + 30,
    8
  );

}


// ===================================================
// SENSOR INFO
// ===================================================

function drawSensorInfo(
  sensor,
  lux
) {

  let y = 500;


  drawCard(
    35,
    y,
    width - 70,
    110
  );


  fill(255);

  textSize(14);

  textStyle(BOLD);

  text(
    "SENSOR INFORMATION",
    55,
    y + 18
  );

  textStyle(NORMAL);


  fill(120, 170, 190);

  textSize(11);

  text(
    "Device ID: " +
    sensor.id,
    55,
    y + 50
  );

  text(
    "Description: " +
    sensor.description,
    250,
    y + 50
  );

  text(
    "Slide: " +
    sensor.status.slide_serial,
    55,
    y + 75
  );

  text(
    "Light: " +
    lux +
    " lux",
    250,
    y + 75
  );


  // Slide warning

  if (
    sensor.status.wrong_slide == 1
  ) {

    fill(255, 170, 70);

    textStyle(BOLD);

    text(
      "⚠ CHECK SLIDE",
      700,
      y + 55
    );

    textStyle(NORMAL);

  }

}


// ===================================================
// CARD
// ===================================================

function drawCard(
  x,
  y,
  w,
  h
) {

  // Shadow

  noStroke();

  fill(0, 0, 0, 70);

  rect(
    x + 5,
    y + 6,
    w,
    h,
    12
  );


  // Card

  fill(10, 35, 52, 245);

  stroke(40, 80, 105);

  strokeWeight(1);

  rect(
    x,
    y,
    w,
    h,
    12
  );

  noStroke();

}


// ===================================================
// BUBBLES
// ===================================================

function drawBubbles() {

  noStroke();

  for (let b of bubbles) {

    fill(
      130,
      220,
      255,
      70
    );

    circle(
      b.x,
      b.y,
      b.size
    );


    b.y -= b.speed;


    if (b.y < 110) {

      b.y = height;

      b.x = random(width);

    }

  }

}


// ===================================================
// FISH
// ===================================================

function drawFish() {

  for (let f of fish) {

    push();

    translate(
      f.x,
      f.y
    );

    scale(f.size);


    fill(
      255,
      160,
      80,
      150
    );


    ellipse(
      0,
      0,
      45,
      22
    );


    triangle(
      -20,
      0,
      -38,
      -15,
      -38,
      15
    );


    fill(10, 30, 45);

    circle(
      15,
      -4,
      4
    );


    pop();


    f.x += f.speed;


    if (
      f.x > width + 50
    ) {

      f.x = -50;

    }


    if (
      f.x < -50
    ) {

      f.x = width + 50;

    }

  }

}


// ===================================================
// PLANTS
// ===================================================

function drawPlants() {

  for (
    let x = 50;
    x < width;
    x += 90
  ) {

    stroke(
      40,
      150,
      100,
      130
    );

    strokeWeight(5);


    line(
      x,
      height - 35,
      x - 12,
      height - 100
    );


    line(
      x,
      height - 35,
      x + 12,
      height - 80
    );


    line(
      x,
      height - 35,
      x + 3,
      height - 115
    );

  }

  noStroke();

}


// ===================================================
// LOADING
// ===================================================

function drawLoading() {

  fill(255);

  textAlign(
    CENTER,
    CENTER
  );

  textSize(24);

  text(
    "Connecting to Seneye...",
    width / 2,
    250
  );


  fill(100, 200, 255);

  textSize(13);

  text(
    "Waiting for aquarium data",
    width / 2,
    285
  );


  textAlign(
    LEFT,
    TOP
  );

}


// ===================================================
// ERROR
// ===================================================

function drawError() {

  drawCard(
    35,
    150,
    width - 70,
    180
  );


  fill(255, 100, 100);

  textSize(22);

  textStyle(BOLD);

  text(
    "⚠ SENSOR DATA ERROR",
    60,
    185
  );


  textStyle(NORMAL);

  fill(180, 210, 225);

  textSize(13);

  text(
    "The Seneye data could not be read correctly.",
    60,
    230
  );

  text(
    "Check the proxy connection and JSON structure.",
    60,
    255
  );

}