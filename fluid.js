/*
 if (set == -1) {
    viscocity = 0;
    smoothingradius = 65;
    gravity = 0;
    multiplier = 60;
    nearmultiplier = 30;
    targetdensity = 1;
    mouseforce = 0.5;
    mouseinfluence = 300;
    step = 2;
    resistance = 0.995;
    bounce = -0.7;
    fillin = 0.3;
  } else {
    viscocity = 0.5;
    smoothingradius = 57;
    gravity = 4;
    multiplier = 350;
    nearmultiplier = 175;
    targetdensity = 6;
    mouseforce = 1.4;
    mouseinfluence = 270;
    step = 2;
    resistance = 0.99;
    bounce = -0.1;
    fillin = 0.6;
  }
*/
let windowscale = 0.5;
let rendermode = 1;
let fontloaded = false;
let play = -1;
let controlls = -1;
let controlled = 0;
let back = 1;
let backtype = -1;
let grid = [];
let done = 0;
let resolution;

let points = [];
let pointdensities = [];
let neardensities = [];
let forces = [];
let viscocity;
let smoothingradius;
let gravity;
let multiplier;
let nearmultiplier;
let targetdensity;
let mouseforce;
let mouseinfluence;
let step;
let resistance;
let bounce;
let fillin;
let font = "";
1;
let smoothingconstant;
let nearconstant;
2;
let derivitiveconstant;
let gridx;
let gridy;
let rfactor;
let vfactor;

let set = 1;
let values = [];
const steps = 1;
const minx = 20;
const miny = 40;
let gridh;
let gridw;
let centerx;
let centery;
let amount = 30;

const setupscreen = function () {
  gridh = 800 * windowscale;
  gridw = 1800 * windowscale;
  centerx = minx + gridw / 2;
  centery = miny + gridh / 2;
};

const constants = () => {
  smoothingconstant = (3.141 * smoothingradius ** 4) / 6;
  nearconstant = (3.141 * smoothingradius ** 6) / 15;
  2;
  derivitiveconstant = (smoothingradius ** 4 * 3.141) / 12;
  gridx = Math.ceil(gridw / smoothingradius / 2) + 2;
  gridy = Math.ceil(gridh / smoothingradius / 2) + 2;
  rfactor = resistance ** (1 / steps);
  vfactor = viscocity ** (1 / steps);
};

const setupmode = function () {
  windowscale = Math.min(screen.width / 1800, (screen.height - 250) / 800);
  console.log(windowscale);
  setupscreen();
  if (set == -1) {
    viscocity = 0.1;
    smoothingradius = 65 * windowscale;
    gravity = 0;
    multiplier = 60 * windowscale ** 2;
    nearmultiplier = 30 * windowscale ** 2;
    targetdensity = 1;
    mouseforce = 0.5 * windowscale;
    mouseinfluence = 300;
    step = 1;
    resistance = 1;
    bounce = -0.7;
    fillin = 0.5;
  } else {
    viscocity = 0.4;
    smoothingradius = 57 * windowscale;
    gravity = 4 / windowscale;
    multiplier = 350 * windowscale ** 2;
    nearmultiplier = 175 * windowscale ** 2;
    targetdensity = 6;
    mouseforce = 1.4 * windowscale;
    mouseinfluence = 270 * windowscale;
    step = 1;
    resistance = 1;
    bounce = -0.1;
    fillin=0.5

  }
  resolution = 21;
  values = [
    [resolution, 50, "resolution"],
    [smoothingradius, 10 * windowscale, "smoothing radius"],
    [multiplier, 5 * windowscale ** 2, "far multiplier"],
    [nearmultiplier, 4 * windowscale ** 2, "near multiplier"],
    [gravity, 400 * windowscale ** 2, "gravity"],
    [viscocity, 1000, "viscocity"],
    [resistance, 1000, "resistance"],
    [targetdensity, 100, "target density"],
    [bounce, -1000, "bounce"],
    [Math.round((amount - 1) ** 2), 1, "partciles"],
    ,
  ];
  //values[3][0] = 0;
  //values[5][0] = 0;
  //viscocity = 0;
  //nearmultiplier = 0;
  constants();
};
setupscreen();
setupmode();

const setupdata = function () {
  const addpoint = function (x, y, mass) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1.0);
    this.vy = random(-1, 1.0);
    this.ovx = 0;
    this.ovy = 0;
    this.mass = mass;
  };

  points = [];
  for (let i = 0; i < amount; i++) {
    for (let j = 0; j < amount; j++) {
      points.push(
        new addpoint(
          (i * gridw * fillin) / (amount - 1) +
            minx +
            (gridw * (1 - fillin)) / 2,
          (j * gridh * fillin) / (amount - 1) +
            miny +
            (gridh * (1 - fillin)) / 2,
          random(2500, 3500) * windowscale ** 2
        )
      );
      pointdensities.push(0);
      neardensities.push(0);
    }
  }
  console.log(points);
};

const smoothingfunction = function (radius, d) {
  if (d > radius) return 0;
  return (radius - d) ** 2 / smoothingconstant;
};

const externalForces = function () {
  points.forEach((data) => {
    let [ox, oy] = [mouseX - data.x, mouseY - data.y];
    let [fx, fy] = [0, 0];
    if (ox * ox + oy * oy < mouseinfluence ** 2 && mouseIsPressed) {
      let dis = (ox * ox + oy * oy) ** 0.5;
      force = 1 - dis / mouseinfluence;
      fx = ((ox / dis) * mouseforce * force) / steps;
      fy = ((oy / dis) * mouseforce * force) / steps;
    }

    data.vy = (data.vy + (gravity * data.mass) / 60000 / steps) * rfactor + fy;
    data.vx = data.vx * rfactor + fx;
  });
};

const updatepostitons = function () {
  points.forEach((data) => {
    data.x += data.vx / steps;
    data.y += data.vy / steps;
    data.ovx = data.vx;
    data.ovy = data.vy;
  });
};

const collide = function (x, y, w, h) {
  points.forEach((data) => {
    padding = (data.mass * 2) / 500;
    if (Math.abs(data.y - y) > h / 2 - padding) {
      data.y = (h / 2 - padding) * Math.sign(data.y - y) + y;
      data.vy = data.vy * bounce;

      data.maxy = Math.sign(data.y - y);
    }
    if (Math.abs(data.x - x) > w / 2 - padding) {
      data.x = (w / 2 - padding) * Math.sign(data.x - x) + x;
      data.vx = data.vx * bounce;
      data.maxx = Math.sign(data.y - y);
    }
  });
};

const getgriddensities = function (data1, index) {
  let [density, near] = [0, 0];
  if (index < 0 || index > gridx * gridy - 1) return [0, 0];

  grid[index].forEach((point, i) => {
    distance =
      ((points[point].x - data1.x) ** 2 + (points[point].y - data1.y) ** 2) **
      0.5;
    if (distance < smoothingradius) {
      density +=
        ((smoothingradius - distance) ** 2 / smoothingconstant) *
        points[point].mass;
      near +=
        ((smoothingradius - distance) ** 4 / nearconstant) * points[point].mass;
    }
  });
  return [density, near];
};

const calculatedensities = function () {
  /*
  points.forEach((point, i) => {
    pointdensities[i] = newgetdensity(point.x, point.y);
  });
  */
  grid.forEach((data, i) => {
    data.forEach((point) => {
      let [density, near] = [0, 0];
      for (let j = -1; j < 2; j++) {
        for (let k = -1; k < 2; k++) {
          let [a, b] = getgriddensities(points[point], i + j + gridx * k);
          density += a;
          near += b;
        }
      }
      pointdensities[point] = density;
      neardensities[point] = near;
    });
  });
};

const newgetdensity = function (x, y) {
  let cd = 0;
  points.forEach((point) => {
    distance = ((point.x - x) ** 2 + (point.y - y) ** 2) ** 0.5;
    if (distance < smoothingradius) {
      cd +=
        ((smoothingradius - distance) ** 2 / smoothingconstant) * point.mass;
    }
  });
  return cd;
};

const getdensity = function (point) {
  let i =
    floor((point.x - minx) / (smoothingradius * 2)) +
    1 +
    (floor((point.y - miny) / (smoothingradius * 2)) + 1) * gridx;
  let [density, near] = [0, 0];
  for (let j = -1; j < 2; j++) {
    for (let k = -1; k < 2; k++) {
      [density, near] = getgriddensities(point, i + j + gridx * k).map(
        (num, index) => num + [density, near][index]
      );
    }
  }
  return [density, near];
};

const setupgrid = function () {
  grid = Array.from({ length: gridx * gridy }, () => {
    return [];
  });
  points.forEach((data, i) => {
    const id =
      floor((data.x - minx) / (smoothingradius * 2)) +
      1 +
      (floor((data.y - miny) / (smoothingradius * 2)) + 1) * gridx;

    grid[id]?.push(i);
  });
};

const applyforce = function (point1, point2, i1, i2) {
  distance = ((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2) ** 0.5;
  if (distance < smoothingradius) {
    if (distance > 0) {
      var [vx, vy] = [
        (point1.x - point2.x) / distance,
        (point1.y - point2.y) / distance,
      ];
    } else {
      let vx = random(-1.0, 1.0);
      let vy = random(-1.0, 1.0);
    }
    distance = max(distance, 0.1);
    let sharedpressure =
      ((pointdensities[i1] + pointdensities[i2]) / 2 - targetdensity) *
      multiplier;

    let nearsharedpressure = (neardensities[i1] + neardensities[i2]) / 2;

    let nearforce =
      ((((smoothingradius - distance) ** 3 * 4) / nearconstant) *
        nearsharedpressure) /
      2;

    let force =
      ((smoothingradius - distance) / smoothingconstant) * 2 * sharedpressure +
      max(nearforce, 0) * nearmultiplier;

    let r1 = point2.mass / pointdensities[i2] / pointdensities[i1];
    let r2 = point1.mass / pointdensities[i1] / pointdensities[i2];

    let influence = (smoothingradius - distance) ** 2 / smoothingconstant;
    //if (influence * viscocity > 0.05) influence = 0.05 / viscocity;

    let viscocityForcex =
      (point1.ovx - point2.ovx) * influence * viscocity * vfactor;
    let viscocityForcey =
      (point1.ovy - point2.ovy) * influence * viscocity * vfactor;

    return [
      ((vx * force - viscocityForcex) * r1) / steps,
      ((vy * force - viscocityForcey) * r1) / steps,
      ((-vx * force + viscocityForcex) * r2) / steps,
      ((-vy * force + viscocityForcey) * r2) / steps,
    ];
  }
  return 0;
};

const gridforce = function (bound) {
  bound.forEach((id, i) => {
    for (let i2 = i + 1; i2 < bound.length; i2++) {
      let n = bound[i2];
      let returned = applyforce(points[id], points[n], id, n);

      if (returned != 0) {
        let [vx1, vy1, vx2, vy2] = returned;
        points[id].vx += vx1;
        points[id].vy += vy1;
        points[n].vx += vx2;
        points[n].vy += vy2;
      }
    }
  });
};

const neighbourforce = function (i, i2) {
  if (i2 < 0 || i2 > gridx * gridy - 1) return;
  i.forEach((id1) => {
    grid[i2].forEach((id2) => {
      let returned = applyforce(points[id1], points[id2], id1, id2);
      if (returned != 0) {
        let [vx1, vy1, vx2, vy2] = returned;
        points[id1].vx += vx1;
        points[id1].vy += vy1;
        points[id2].vx += vx2;
        points[id2].vy += vy2;
      }
    });
  });
};

const applyforces = function () {
  /*
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      let returned = applyforce(points[i], points[j], i, j);
      if (returned != 0) {
        let [vx1, vy1, vx2, vy2] = returned;
        points[i].vx += vx1;
        points[i].vy += vy1;
        points[j].vx += vx2;
        points[j].vy += vy2;
      }
    }
  }
  */
  grid.forEach((bound, i) => {
    if (bound.length > 0) {
      gridforce(bound);
      neighbourforce(bound, i + 1);
      neighbourforce(bound, i + 1 + gridx);
      neighbourforce(bound, i + gridx);
      neighbourforce(bound, i - gridx + 1);
    }
  });
};

const resolvepressures = function () {
  points.forEach((data) => {
    data.x += data.vx * step;
    data.y += data.vy * step;
    data.ovx = data.vx;
    data.ovy = data.vy;
  });

  setupgrid();
  calculatedensities();
  applyforces();

  points.forEach((data) => {
    data.x -= data.vx * step;
    data.y -= data.vy * step;
  });
};

const physicsframe = function () {
  externalForces();
  resolvepressures();
  updatepostitons();
  collide(minx + gridw / 2, miny + gridh / 2, gridw, gridh);
};

const display = () => {
  if (fontloaded) {
    let x = 20;
    noStroke();
    textFont(font);
    values.forEach((data, i) => {
      if (i == controlled && controlls == 1) {
        fill(0, 255, 0);
      } else {
        fill(255, 255, 255);
      }
      text(`${data[2]}: ${round(data[0] * 1000) / 1000}`, x, 20);

      x +=
        font.textBounds(`${data[2]}: ${round(data[0] * 1000) / 1000}`, 0, 0).w +
        30;
    });

    /*
    density = getdensity({ x: mouseX, y: mouseY })[(backtype + 1) / 2];
    fill(0, 0, 0);
    quad(960, 100, 1600, 100, 1600, 300, 960, 300);
    fill(250, 250, 250);
    text(`density: ${density}`, 960, 200);
    */
  }
};

const backgroundDraw = function () {
  if (controlls == 1) {
    background(20, 20, 20);
  } else {
    background(0, 0, 0);
  }
  fill(0, 0, 0);
  stroke(30, 30, 30);
  strokeWeight(10);
  quad(
    minx,
    miny,
    minx + gridw,
    miny,
    minx + gridw,
    miny + gridh,
    minx,
    miny + gridh
  );
};

const render = function (t) {
  if (t == 1) {
    points.forEach((data, i) => {
      strokeWeight(3);
      stroke(50, 50, 50);
      /*
      line(
        data.x,
        data.y,
        data.x + (data.vx - data.ovx) * 20,
        data.y + (data.vy - data.ovy) * 20
      );
      */
    });
    points.forEach((data, i) => {
      strokeWeight(data.mass / 500);
      stroke(0, 0, 0);
      point(data.x, data.y);
    });
    return;
  }

  if (rendermode == 1) {
    points.forEach((data, i) => {
      let c = (200 * (pointdensities[i] - targetdensity)) / targetdensity;
      strokeWeight(data.mass / 500 / windowscale);
      //strokeWeight(5);
      let r = min(c + 0, 250);
      let b = max(250 - c, 0);
      let scale = 250 / (r ** 2 + b ** 2) ** 0.5;
      stroke(r * scale, 0, b * scale);
      point(data.x, data.y);
    });
  } else {
    points.forEach((data, i) => {
      c = ((data.vx ** 2 + data.vy ** 2) ** 0.5 * 50) / windowscale;
      strokeWeight(data.mass / 500 / windowscale);
      if (c < 250) {
        stroke(c, c, 250 - c);
      } else {
        stroke(250, 500 - c, 0);
      }
      point(data.x, data.y);
    });
  }
};

const visualise = function () {
  backgroundDraw();
  display();
  console.log(resolution);
  strokeWeight(((floor(resolution) * 2) ** 2 / 2) ** 0.5);
  for (let x = minx + resolution; x < minx + gridw; x += floor(resolution)) {
    for (let y = miny + resolution; y < miny + gridh; y += floor(resolution)) {
      density = getdensity({ x: x, y: y })[(backtype + 1) / 2];
      let c = (150 * (density - targetdensity)) / targetdensity;
      if (Math.abs(c) < 5) {
        stroke(250, 250, 250);
      } else if (c < 0) {
        stroke(250 + c, 250 + c, 250);
      } else if (c > 0) {
        stroke(250, 250 - c, 250 - c);
      }

      point(x, y);
    }
  }
  done = 1;
  render("1");
};

document.addEventListener("keydown", (e) => {
  console.log(e.key);
  if (e.key == "t") {
    rendermode *= -1;
  } else if (e.key == "m") {
    mouseforce *= -1;
  } else if (e.key == "r") {
    setupmode();
    setupdata();
    collide(minx + gridw / 2, miny + gridh / 2, gridw, gridh);
    setupgrid();
  } else if (e.key == "p") {
    play *= -1;
  } else if (e.key == "c") {
    controlls *= -1;
  } else if (e.key == "n") {
    physicsframe();
    done = 0;
    draw();
  } else if (isFinite(e.key)) {
    controlled = e.key;
  } else if (e.key == "s") {
    set *= -1;
    setupmode();
    setupdata();
    collide(minx + gridw / 2, miny + gridh / 2, gridw, gridh);
    setupgrid();
    display();
  } else if (e.key == "b") {
    back *= -1;
    done = 0;
  } else if ((e.key = "v")) {
    backtype *= -1;
    done = 0;
  }
});

function loadedfont(font) {
  fontloaded = true;
  console.log("loaded");
}

function setup() {
  colorMode(RGB);
  angleMode(DEGREES);
  font = loadFont(`\\akira_expanded\\font.otf`, loadedfont);
  fill(0, 0, 0);
  createCanvas(4000, 3000);

  setupscreen();
  setupmode();

  setupdata();
  collide(minx + gridw / 2, miny + gridh / 2, gridw, gridh);
  setupgrid();
  console.log(points);
}

function draw() {
  if (controlls == 1) {
    values[controlled][0] = mouseX / values[controlled][1];
    resolution = values[0][0];
    smoothingradius = values[1][0];
    multiplier = values[2][0];
    nearmultiplier = values[3][0];
    gravity = values[4][0];
    viscocity = values[5][0];
    resistance = values[6][0];
    targetdensity = values[7][0];
    bounce = values[8][0];
    amount = round(values[9][0]) ** 0.5 + 1;
    constants();
    setupgrid();
  }
  //console.log(smoothingradius);
  if (back == 1) {
    clear();
    backgroundDraw();
    if (play == 1) {
      for (let i = 0; i < steps; i++) {
        physicsframe();
      }
    }
    render(0);

    display();
  } else {
    if (done == 0) {
      clear();
      visualise();
    } else {
      fill(0, 0, 0);
      noStroke();
      quad(0, 0, 2600, 0, 2600, 30, 0, 30);
      fill(0, 0, 0);

      fill(0, 0, 0);
      stroke(30, 30, 30);
      strokeWeight(10);
      noFill();
      quad(
        minx,
        miny,
        minx + gridw,
        miny,
        minx + gridw,
        miny + gridh,
        minx,
        miny + gridh
      );

      display();
    }
  }
}
