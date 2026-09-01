// ===================================================
// SENEYE AQUAPONICS DASHBOARD
// Pedare Aquaponics
// Year 11 Digital Technologies
// ===================================================


// ===================================================
// CONFIGURATION
// ===================================================

const PROXY_URL =
  "https://seneye-proxy.ezankov.workers.dev/";

const USE_OFFLINE_MOCK = false;

// Refresh live data every 30 seconds
const REFRESH_MS = 30000;

// Maximum points shown on trend graphs
const MAX_HISTORY = 30;


// ===================================================
// GLOBAL VARIABLES
// ===================================================

let aquariumData = null;

let lastUpdated = "";

let connectionOK = false;

let dataError = false;


// Animated background
let bubbles = [];
let fish = [];


// Trend graph history
let tempHistory = [];
let phHistory = [];
let nh3History = [];


// ===================================================
// PRELOAD
// ===================================================

function preload() {

  let endpoint =
    USE_OFFLINE_MOCK
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

  createCanvas(
    1000,
    880
  );


  // -----------------------------------------------
  // Create bubbles
  // -----------------------------------------------

  for (let i = 0; i < 40; i++) {

    bubbles.push({

      x: random(width),

      y: random(height),

      size: random(3, 10),

      speed: random(0.3, 1.2)

    });
  }


  // -----------------------------------------------
  // Create fish
  // -----------------------------------------------

  fish.push({

    x: 100,

    y: 620,

    speed: 0.5,

    size: 1

  });


  fish.push({

    x: 700,

    y: 580,

    speed: -0.35,

    size: 0.7

  });


  // -----------------------------------------------
  // Refresh live API
  // -----------------------------------------------

  if (!USE_OFFLINE_MOCK) {

    setInterval(

      fetchAquariumData,

      REFRESH_MS

    );
  }
}


// ===================================================
// FETCH DATA
// ===================================================

function fetchAquariumData() {

  loadJSON(

    PROXY_URL,

    onDataLoaded,

    onError

  );
}


// ===================================================
// DATA LOADED SUCCESSFULLY
// ===================================================

function onDataLoaded(data) {

  aquariumData = data;

  connectionOK = true;

  dataError = false;


  lastUpdated =
    new Date()
      .toLocaleTimeString();


  // -----------------------------------------------
  // Add readings to trend history
  // -----------------------------------------------

  try {

    let exps =
      data[0].exps;


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


    addHistory(
      tempHistory,
      temp
    );


    addHistory(
      phHistory,
      ph
    );


    addHistory(
      nh3History,
      nh3
    );

  }

  catch (error) {

    console.error(
      "History update error:",
      error
    );
  }


  console.log(
    "Seneye data refreshed:",
    data
  );
}


// ===================================================
// ERROR HANDLING
// ===================================================

function onError(error) {

  console.error(
    "Seneye connection error:",
    error
  );


  connectionOK = false;

  dataError = true;
}


// ===================================================
// MAIN DRAW LOOP
// ===================================================

function draw() {

  drawBackground();

  drawBubbles();

  drawFish();

  drawHeader();


  // -----------------------------------------------
  // DATA AVAILABLE
  // -----------------------------------------------

  if (aquariumData) {

    try {

      let sensor =
        aquariumData[0];


      let exps =
        sensor.exps;


      // -------------------------------------------
      // Core readings
      // -------------------------------------------

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


      // -------------------------------------------
      // Additional readings
      // -------------------------------------------

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


      // -------------------------------------------
      // Calculate statuses
      // -------------------------------------------

      let tempStatus =
        getStatus(
          temp,
          22,
          26,
          20,
          28
        );


      let phStatus =
        getStatus(
          ph,
          6.8,
          7.8,
          6.5,
          8.2
        );


      let nh3Status =
        getAmmoniaStatus(
          nh3
        );


      // -------------------------------------------
      // Warning banner
      // -------------------------------------------

      drawGlobalWarning(
        tempStatus,
        phStatus,
        nh3Status
      );


      // -------------------------------------------
      // Main cards
      // -------------------------------------------

      drawMainCards(
        temp,
        ph,
        nh3,
        nh4,
        tempStatus,
        phStatus,
        nh3Status
      );


      // -------------------------------------------
      // Aquarium status
      // -------------------------------------------

      drawAquariumStatus(

        sensor,

        temp,

        ph,

        nh3,

        nh4,

        o2,

        tempStatus,

        phStatus,

        nh3Status

      );


      // -------------------------------------------
      // Sensor information
      // -------------------------------------------

      drawSensorInfo(
        sensor,
        lux
      );


      // -------------------------------------------
      // Trend graphs
      // -------------------------------------------

      drawTrendGraphs();

    }

    catch (error) {

      console.error(
        "Dashboard error:",
        error
      );


      drawError();
    }

  }


  // -----------------------------------------------
  // NO DATA YET
  // -----------------------------------------------

  else {

    drawLoading();
  }
}


// ===================================================
// STATUS CALCULATION
// ===================================================

function getStatus(

  value,

  safeMin,

  safeMax,

  warningMin,

  warningMax

) {

  // -----------------------------------------------
  // DANGER
  // -----------------------------------------------

  if (

    value < warningMin ||

    value > warningMax

  ) {

    return "danger";
  }


  // -----------------------------------------------
  // CAUTION
  // -----------------------------------------------

  if (

    value < safeMin ||

    value > safeMax

  ) {

    return "caution";
  }


  // -----------------------------------------------
  // SAFE
  // -----------------------------------------------

  return "safe";
}


// ===================================================
// AMMONIA STATUS
// ===================================================

function getAmmoniaStatus(
  value
) {

  // Above warning threshold
  if (value > 0.05) {

    return "danger";
  }


  // Above target range
  if (value > 0.02) {

    return "caution";
  }


  return "safe";
}


// ===================================================
// STATUS COLOUR
// ===================================================

function getStatusColour(
  status
) {

  if (status === "danger") {

    return color(
      255,
      75,
      75
    );
  }


  if (status === "caution") {

    return color(
      255,
      180,
      60
    );
  }


  return color(
    80,
    220,
    150
  );
}


// ===================================================
// STATUS TEXT
// ===================================================

function getStatusText(
  status
) {

  if (status === "danger") {

    return "⚠ DANGER";
  }


  if (status === "caution") {

    return "⚠ CAUTION";
  }


  return "✓ SAFE";
}


// ===================================================
// BACKGROUND
// ===================================================

function drawBackground() {

  background(
    5,
    18,
    32
  );


  noStroke();


  // Water glow

  fill(
    5,
    40,
    65,
    150
  );


  ellipse(
    width * 0.2,
    height * 0.7,
    600,
    450
  );


  fill(
    0,
    70,
    100,
    80
  );


  ellipse(
    width * 0.8,
    height * 0.3,
    700,
    500
  );


  // Sand

  fill(
    120,
    100,
    60,
    120
  );


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

  fill(
    8,
    27,
    45,
    245
  );


  noStroke();


  rect(
    0,
    0,
    width,
    105
  );


  // -----------------------------------------------
  // Title
  // -----------------------------------------------

  fill(255);

  textAlign(
    LEFT,
    TOP
  );

  textStyle(BOLD);

  textSize(27);


  text(
    "AQUARIUM MONITOR",
    35,
    20
  );


  textStyle(NORMAL);


  fill(
    110,
    190,
    225
  );


  textSize(13);


  text(
    "Pedare Aquaponics • Seneye Environmental System",
    37,
    60
  );


  // -----------------------------------------------
  // Connection indicator
  // -----------------------------------------------

  fill(
    15,
    48,
    60
  );


  rect(
    width - 205,
    25,
    170,
    48,
    23
  );


  fill(

    connectionOK

      ? color(
          70,
          230,
          130
        )

      : color(
          255,
          80,
          80
        )

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

    39

  );


  fill(
    100,
    150,
    180
  );


  textSize(9);


  text(

    "Updated " +
    (
      lastUpdated ||
      "Loading..."
    ),

    width - 200,

    59

  );
}


// ===================================================
// GLOBAL WARNING SYSTEM
// ===================================================

function drawGlobalWarning(

  tempStatus,

  phStatus,

  nh3Status

) {

  let dangerMessages = [];

  let cautionMessages = [];


  // -----------------------------------------------
  // Temperature
  // -----------------------------------------------

  if (
    tempStatus === "danger"
  ) {

    dangerMessages.push(
      "Temperature outside warning limit"
    );
  }


  else if (
    tempStatus === "caution"
  ) {

    cautionMessages.push(
      "Temperature outside target range"
    );
  }


  // -----------------------------------------------
  // pH
  // -----------------------------------------------

  if (
    phStatus === "danger"
  ) {

    dangerMessages.push(
      "pH outside warning limit"
    );
  }


  else if (
    phStatus === "caution"
  ) {

    cautionMessages.push(
      "pH outside target range"
    );
  }


  // -----------------------------------------------
  // Ammonia
  // -----------------------------------------------

  if (
    nh3Status === "danger"
  ) {

    dangerMessages.push(
      "NH₃ above warning limit"
    );
  }


  else if (
    nh3Status === "caution"
  ) {

    cautionMessages.push(
      "NH₃ above target range"
    );
  }


  // ===============================================
  // DANGER BANNER
  // ===============================================

  if (
    dangerMessages.length > 0
  ) {

    fill(
      110,
      20,
      25,
      245
    );


    stroke(
      255,
      70,
      70
    );


    strokeWeight(2);


    rect(
      35,
      112,
      width - 70,
      55,
      10
    );


    noStroke();


    fill(
      255,
      80,
      80
    );


    textSize(23);

    textStyle(BOLD);


    text(
      "⚠",
      55,
      123
    );


    fill(255);

    textSize(13);


    text(
      "AQUARIUM DANGER",
      90,
      121
    );


    fill(
      255,
      190,
      190
    );


    textSize(11);


    text(
      dangerMessages.join(
        "  •  "
      ),
      90,
      143
    );


    textStyle(NORMAL);

    return;
  }


  // ===============================================
  // CAUTION BANNER
  // ===============================================

  if (
    cautionMessages.length > 0
  ) {

    fill(
      90,
      65,
      15,
      245
    );


    stroke(
      255,
      180,
      60
    );


    strokeWeight(2);


    rect(
      35,
      112,
      width - 70,
      55,
      10
    );


    noStroke();


    fill(
      255,
      190,
      70
    );


    textSize(23);

    textStyle(BOLD);


    text(
      "⚠",
      55,
      123
    );


    fill(255);

    textSize(13);


    text(
      "AQUARIUM CAUTION",
      90,
      121
    );


    fill(
      255,
      225,
      170
    );


    textSize(11);


    text(
      cautionMessages.join(
        "  •  "
      ),
      90,
      143
    );


    textStyle(NORMAL);

    return;
  }


  // ===============================================
  // EVERYTHING SAFE
  // ===============================================

  fill(
    10,
    70,
    50,
    235
  );


  stroke(
    70,
    230,
    150
  );


  strokeWeight(1);


  rect(
    35,
    112,
    width - 70,
    45,
    10
  );


  noStroke();


  fill(
    80,
    240,
    160
  );


  textSize(21);

  textStyle(BOLD);


  text(
    "✓",
    55,
    121
  );


  fill(
    220,
    255,
    235
  );


  textSize(12);


  text(
    "AQUARIUM CONDITIONS WITHIN TARGET RANGE",
    90,
    125
  );


  textStyle(NORMAL);
}


// ===================================================
// MAIN CARDS
// ===================================================

function drawMainCards(

  temp,

  ph,

  nh3,

  nh4,

  tempStatus,

  phStatus,

  nh3Status

) {

  // Temperature

  drawMetricCard(

    35,

    185,

    "WATER TEMP",

    temp,

    "°C",

    15,

    30,

    tempStatus,

    1

  );


  // pH

  drawMetricCard(

    250,

    185,

    "pH",

    ph,

    "",

    6,

    9,

    phStatus,

    2

  );


  // NH3

  drawMetricCard(

    465,

    185,

    "NH₃",

    nh3,

    "",

    0,

    0.05,

    nh3Status,

    3

  );


  // NH4 supplementary metric

  drawSupplementaryGauge(

    680,

    185,

    "NH₄",

    nh4,

    0,

    25

  );
}


// ===================================================
// REUSABLE CORE METRIC CARD
// ===================================================

function drawMetricCard(

  x,

  y,

  label,

  value,

  unit,

  minValue,

  maxValue,

  status,

  decimals

) {

  drawCard(
    x,
    y,
    190,
    170
  );


  let statusColour =
    getStatusColour(
      status
    );


  // -----------------------------------------------
  // Label
  // -----------------------------------------------

  fill(
    145,
    195,
    220
  );


  textSize(12);

  textStyle(BOLD);


  text(
    label,
    x + 18,
    y + 18
  );


  textStyle(NORMAL);


  // -----------------------------------------------
  // Value
  // -----------------------------------------------

  fill(
    statusColour
  );


  textSize(
    label === "WATER TEMP"
      ? 32
      : 30
  );


  let shownValue =
    value.toFixed(
      decimals
    );


  text(
    shownValue +
    unit,
    x + 18,
    y + 52
  );


  // -----------------------------------------------
  // Gauge
  // -----------------------------------------------

  drawGaugeBar(

    x + 18,

    y + 108,

    154,

    value,

    minValue,

    maxValue,

    statusColour

  );


  // -----------------------------------------------
  // Scale
  // -----------------------------------------------

  fill(
    110,
    160,
    180
  );


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


  // -----------------------------------------------
  // Status txt
  // -----------------------------------------------

  fill(
    statusColour
  );


  textSize(10);

  textStyle(BOLD);


  text(
    getStatusText(
      status
    ),
    x + 18,
    y + 148
  );


  textStyle(NORMAL);
}


// ===================================================
// SUPPLEMENTARY GAUGE
// ===================================================

function drawSupplementaryGauge(

  x,

  y,

  label,

  value,

  minValue,

  maxValue

) {

  drawCard(
    x,
    y,
    190,
    170
  );


  fill(
    145,
    195,
    220
  );


  textSize(12);

  textStyle(BOLD);


  text(
    label,
    x + 18,
    y + 18
  );


  textStyle(NORMAL);


  fill(
    80,
    220,
    150
  );


  textSize(30);


  text(
    value.toFixed(2),
    x + 18,
    y + 52
  );


  drawGaugeBar(

    x + 18,

    y + 108,

    154,

    value,

    minValue,

    maxValue,

    color(
      80,
      210,
      255
    )

  );


  fill(
    110,
    160,
    180
  );


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
    110,
    170,
    200
  );


  textSize(9);


  text(
    "SUPPLEMENTARY SENSOR",
    x + 18,
    y + 148
  );
}


// ===================================================
// GAUGE BAR
// ===================================================

function drawGaugeBar(

  x,

  y,

  barWidth,

  value,

  minValue,

  maxValue,

  barColour

) {

  let percentage =
    constrain(

      (
        value -
        minValue
      ) /

      (
        maxValue -
        minValue
      ),

      0,

      1

    );


  // Background

  fill(
    20,
    50,
    70
  );


  rect(
    x,
    y,
    barWidth,
    12,
    6
  );


  // Current value

  fill(
    barColour
  );


  rect(
    x,
    y,
    barWidth *
    percentage,
    12,
    6
  );
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

  o2,

  tempStatus,

  phStatus,

  nh3Status

) {

  let x = 35;

  let y = 375;


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


  drawStatusItem(

    x + 20,

    y + 55,

    "TEMP",

    temp.toFixed(1) +
    "°C",

    tempStatus

  );


  drawStatusItem(

    x + 200,

    y + 55,

    "pH",

    ph.toFixed(2),

    phStatus

  );


  drawStatusItem(

    x + 380,

    y + 55,

    "NH₃",

    nh3.toFixed(3),

    nh3Status

  );


  // -----------------------------------------------
  // Supplementary API status
  // -----------------------------------------------

  let nh4Status =
    sensor.exps.nh4.status == "0"
      ? "safe"
      : "danger";


  let o2Status =
    sensor.exps.o2.status == "0"
      ? "safe"
      : "danger";


  drawStatusItem(

    x + 560,

    y + 55,

    "NH₄",

    nh4.toFixed(2),

    nh4Status

  );


  drawStatusItem(

    x + 740,

    y + 55,

    "O₂",

    o2.toFixed(1),

    o2Status

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

  status

) {

  fill(
    15,
    40,
    55
  );


  rect(
    x,
    y,
    145,
    60,
    8
  );


  fill(
    110,
    160,
    180
  );


  textSize(9);


  text(
    label,
    x + 12,
    y + 10
  );


  let statusColour =
    getStatusColour(
      status
    );


  fill(
    statusColour
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
    statusColour
  );


  circle(
    x + 125,
    y + 30,
    8
  );
}


// ===================================================
// SENSOR INFORMATION
// ===================================================

function drawSensorInfo(

  sensor,

  lux

) {

  let y = 535;


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


  fill(
    120,
    170,
    190
  );


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


  // -----------------------------------------------
  // Seneye slide warning
  // -----------------------------------------------

  if (
    sensor.status.wrong_slide == 1
  ) {

    fill(
      255,
      170,
      70
    );


    textStyle(BOLD);


    text(
      "⚠ CHECK SENSOR SLIDE",
      700,
      y + 55
    );


    textStyle(NORMAL);
  }
}


// ===================================================
// TREND HISTORY
// ===================================================

function addHistory(

  history,

  value

) {

  history.push(
    value
  );


  if (
    history.length >
    MAX_HISTORY
  ) {

    history.shift();
  }
}


// ===================================================
// TREND GRAPHS
// ===================================================

function drawTrendGraphs() {

  drawTrendGraph(

    tempHistory,

    35,

    660,

    285,

    165,

    15,

    30,

    "TEMPERATURE TREND",

    "°C"

  );


  drawTrendGraph(

    phHistory,

    357,

    660,

    285,

    165,

    6,

    9,

    "pH TREND",

    ""

  );


  drawTrendGraph(

    nh3History,

    679,

    660,

    285,

    165,

    0,

    0.06,

    "NH₃ TREND",

    ""

  );
}


// ===================================================
// REUSABLE TREND GRAPH
// ===================================================

function drawTrendGraph(

  history,

  x,

  y,

  w,

  h,

  minValue,

  maxValue,

  label,

  unit

) {

  drawCard(
    x,
    y,
    w,
    h
  );


  // Title

  fill(
    145,
    195,
    220
  );


  textSize(11);

  textStyle(BOLD);


  text(
    label,
    x + 15,
    y + 12
  );


  textStyle(NORMAL);


  // -----------------------------------------------
  // Not enough readings yet
  // -----------------------------------------------

  if (
    history.length < 2
  ) {

    fill(
      100,
      150,
      170
    );


    textSize(11);


    text(
      "Collecting readings...",
      x + 15,
      y + 65
    );


    return;
  }


  // -----------------------------------------------
  // Grid
  // -----------------------------------------------

  stroke(
    40,
    70,
    90
  );


  strokeWeight(1);


  for (
    let i = 0;
    i <= 3;
    i++
  ) {

    let gy =
      map(
        i,
        0,
        3,
        y + 35,
        y + h - 25
      );


    line(
      x + 15,
      gy,
      x + w - 15,
      gy
    );
  }


  // -----------------------------------------------
  // Trend line
  // -----------------------------------------------

  noFill();


  stroke(
    80,
    210,
    255
  );


  strokeWeight(2);


  beginShape();


  for (

    let i = 0;

    i <
    history.length;

    i++

  ) {

    let px =
      map(

        i,

        0,

        max(
          history.length - 1,
          1
        ),

        x + 15,

        x + w - 15

      );


    let py =
      map(

        history[i],

        minValue,

        maxValue,

        y + h - 25,

        y + 35

      );


    py =
      constrain(

        py,

        y + 35,

        y + h - 25

      );


    vertex(
      px,
      py
    );
  }


  endShape();


  noStroke();


  // -----------------------------------------------
  // Latest value
  // -----------------------------------------------

  let latest =
    history[
      history.length - 1
    ];


  fill(
    80,
    220,
    150
  );


  textSize(11);

  textStyle(BOLD);


  text(

    "Latest: " +
    latest.toFixed(2) +
    unit,

    x + 15,

    y + h - 19

  );


  textStyle(NORMAL);
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


  fill(
    0,
    0,
    0,
    70
  );


  rect(
    x + 5,
    y + 6,
    w,
    h,
    12
  );


  // Card

  fill(
    10,
    35,
    52,
    245
  );


  stroke(
    40,
    80,
    105
  );


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


  for (
    let bubble of bubbles
  ) {

    fill(
      130,
      220,
      255,
      70
    );


    circle(
      bubble.x,
      bubble.y,
      bubble.size
    );


    bubble.y -=
      bubble.speed;


    if (
      bubble.y < 105
    ) {

      bubble.y =
        height;


      bubble.x =
        random(width);
    }
  }
}


// ===================================================
// FISH
// ===================================================

function drawFish() {

  for (
    let f of fish
  ) {

    push();


    translate(
      f.x,
      f.y
    );


    // Flip fish based on direction

    scale(

      f.speed < 0
        ? -f.size
        : f.size,

      f.size

    );


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


    fill(
      10,
      30,
      45
    );


    circle(
      15,
      -4,
      4
    );


    pop();


    f.x +=
      f.speed;


    if (
      f.x >
      width + 50
    ) {

      f.x = -50;
    }


    if (
      f.x <
      -50
    ) {

      f.x =
        width + 50;
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
// LOADING SCREEN
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


  fill(
    100,
    200,
    255
  );


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
// ERROR SCREEN
// ===================================================

function drawError() {

  drawCard(
    35,
    185,
    width - 70,
    180
  );


  fill(
    255,
    100,
    100
  );


  textSize(22);

  textStyle(BOLD);


  text(
    "⚠ SENSOR DATA ERROR",
    60,
    220
  );


  textStyle(NORMAL);


  fill(
    180,
    210,
    225
  );


  textSize(13);


  text(
    "The Seneye data could not be read correctly.",
    60,
    265
  );


  text(
    "Check the proxy connection and JSON structure.",
    60,
    290
  );
}