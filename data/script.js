// https://threejs.org/docs/#api/en/geometries/ShapeGeometry
const heartShape = new THREE.Shape();
heartShape.moveTo(5, 5);
heartShape.bezierCurveTo(5, 5, 4, 0, 0, 0);
heartShape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
heartShape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
heartShape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
heartShape.bezierCurveTo(16, 7, 16, 0, 10, 0);
heartShape.bezierCurveTo(7, 0, 5, 5, 5, 5);

var started = false, paused = false;
var elapsedTime = -1;
var width = 0, height = 0;
const loader = new THREE.TextureLoader();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0047ab);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({antialias: true});
const clock = new THREE.Clock({autostart: false});

const heartGeometry = new THREE.ShapeGeometry(heartShape);
heartGeometry.scale(0.075, 0.075, 0.075);
heartGeometry.rotateZ(Math.PI);
const heartMaterial = new THREE.MeshBasicMaterial({color: 0xE31B23});
const heartMesh1 = new THREE.Mesh(heartGeometry, heartMaterial);
heartMesh1.position.set(-1.5, 0, 0);
const heartMesh2 = heartMesh1.clone();
heartMesh2.position.set(2.2, 1, 0);

const habbiMesh = new THREE.Sprite(new THREE.SpriteMaterial({map: loader.load("data/habbi.png"), color: 0xFFFFFF}));
habbiMesh.position.set(-1.2, 0.8, 0);
habbiMesh.material.rotation = 1.57 / -2;

const loveMesh = new THREE.Sprite(new THREE.SpriteMaterial({map: loader.load("data/love.png"), color: 0xFFFFFF}));
loveMesh.position.set(2, -1, 0);
loveMesh.material.rotation = habbiMesh.material.rotation + 0.24/2;

scene.add(heartMesh1);
scene.add(heartMesh2);
scene.add(habbiMesh);
scene.add(loveMesh);

var hearts = [];
const smallHeartGeometry = new THREE.ShapeGeometry(heartShape);
smallHeartGeometry.scale(0.0075, 0.0075, 0.0075);
smallHeartGeometry.rotateZ(Math.PI);
const smallHeartMesh = new THREE.Mesh(smallHeartGeometry, heartMaterial);

document.addEventListener('DOMContentLoaded', function () {
  screen.orientation.lock("landscape").catch(err => undefined);
  document.getElementsByTagName("h1")[1].style.transitionDelay = "3300ms";
  var audio = document.getElementById("mine");
  audio.volume = 0.2;
  audio.play().then(val => start()).catch(err => {
    var h1 = document.getElementsByTagName("h1")[0], h2 = document.getElementsByTagName("h2")[0], h3 = document.getElementsByTagName("h3")[0], h4 = document.getElementsByTagName("h4")[0], climax = document.getElementsByTagName("h1")[1];
    var temp = document.createElement("h1");
    temp.innerHTML = "CLICK TO START";
    temp.style = "width: 100%; text-align: center;";
    document.getElementById("content").appendChild(temp);
    h1.style.display = h2.style.display = h3.style.display = h4.style.display = climax.style.display = renderer.domElement.style.display = "none";
    var func = function () {
      temp.parentElement.removeChild(temp);
      h1.style.display = h2.style.display = h3.style.display = h4.style.display = climax.style.display = renderer.domElement.style.display = null;
      start();
      audio.play();
      document.removeEventListener('click', func);
    };
    document.addEventListener('click', func);
  });
  document.body.appendChild(renderer.domElement);
  setup();
});

window.addEventListener('resize', function() {
  setup();
});

document.addEventListener('visibilitychange', function(ev) {
  if (document.visibilityState == "visible") {
    if (started) {
      clock.start();
      clock.elapsedTime = elapsedTime; // To make sure it continues where it left off.
      paused = false;
    }
  } else {
    paused = true;
    elapsedTime = clock.getElapsedTime();
    clock.stop();
  }
});

function start() {
  AOS.init({once: true});
  if (!started) setInterval(rotateEmojis, 15);
  started = true;
  clock.start();
}

function setup() {
  renderer.width = renderer.domElement.width = window.innerWidth;
  renderer.height = renderer.domElement.height = window.innerHeight;
  camera.aspect = renderer.width / renderer.height;
  camera.fov = 2 * Math.atan(3 / (2 * camera.position.z)) * (180 / Math.PI);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  width = calcWidth(-2);
  height = calcHeight(-2);
}
setup();

function calcWidth(zPos) {
  // tan(α) = opposite/adjacent
  // α = fov / 2 [center is (0, 0), so two halves] * (π/180) [degrees to radians]
  // opposite = distance from center (0, 0) to bottom of screen [what we're calculating]
  // adjacent = distance from camera (0, 0, 5) to center at zPos (0, 0, zPos)
  // Multiplied by camera aspect to get width from height.
  // Multiplied by two because (0, 0) is the center.
  return Math.tan(camera.fov/2 * (Math.PI / 180)) * (camera.position.z - zPos) * camera.aspect * 2;
}

function calcHeight(zPos) {
  // Dividing by aspect to get the height back.
  // Should always equal 4.2 at zPos = -2.
  return calcWidth(zPos) / camera.aspect;
}

function invert(i, x) {
  i %= 2*x;
  return i < x ? i : x - (i - x);
}

var rotateCount = 0;

function rotateEmojis() {
  if (!paused) {
    const t = clock.getElapsedTime();

    // Heart face rotation
    var tm = rotateCount % 133; // 133 * 15 = 1995 (about two seconds)
    if (tm < lastupdate1) direction1 = !direction1;
    lastupdate1 = tm;
    habbiMesh.material.rotation += (direction1 ? -1 : 1) * (tm / 133 * Math.PI * 0.5) * (1 - tm/133) * 0.05;

    // Heart eyes face rotation
    tm = (rotateCount+33) % 133;
    if (tm < lastupdate2) direction2 = !direction2;
    lastupdate2 = tm;
    loveMesh.material.rotation += (direction2 ? -1 : 1) * (tm / 133 * Math.PI * 0.5) * (1 - tm/133) * 0.05;
    
    rotateCount++;
  }
}

const update = (t, premulti) => (x, y, z) => {
  const waveX1 = 0.75 * Math.sin(x * 2 + t * 3 + y);
  const waveX2 = 0.25 * Math.sin(x * 3 + t * 2 + y);
  const waveY1 = 0.1 * Math.sin(y * 5 + t * 0.5 + x);
  const multi = premulti || (x + 2.5) / 5*intensity;
  return (waveX1 + waveX2 + waveY1) * multi;
};

var lastupdate1 = -1, lastupdate2 = -1;
var direction1 = false, direction2 = false;
var lastSH = -1;

function animate() {
  if (started && !paused) {
    const t = clock.getElapsedTime();

    // Hearts wave
    var pos = heartGeometry.attributes.position;
    var up = update(t, 0.2);
    for (var i = 0; i < pos.array.length; i += 3)
      pos.array[i+2] = up(pos.array[i], pos.array[i+1], pos.array[i+2]);
    pos.needsUpdate = true;

    // Small background hearts creation
    if (t - lastSH >= 20/width*0.1) {
      lastSH = t;
      var sh = new THREE.Mesh(smallHeartGeometry.clone(), heartMaterial.clone());
      sh.material.color.add(new THREE.Color((Math.random()-0.5) / 5, (Math.random()-0.5) / 5, (Math.random()-0.5) / 2));
      sh.position.set((Math.random()-0.5) * width, height/-2, -2);
      hearts.push([sh, (Math.random()+1) * 0.5, t]);
      scene.add(sh);
    }

    // Small background hearts updating
    let heartsToDelete = [];
    hearts.forEach(heartData => {
      var heart = heartData[0];
      var speed = heartData[1];
      var creationTime = heartData[2];
      if (heart.position.y >= height/2 + 0.075*1.9) heartsToDelete.push(heartData);
      else {
        heart.position.y += 0.01 * speed;
        var max = 0;
        const midY = (0.075*-1.9) / 2; // The highest vertice in the heart seems to be at -0.1425 which 'coincidentally' is -1.9 multiplied by the scale (0.075). Negative because it's rotated 180°, 1.9 because that's a tenth of the highest y-value used when defining the shape.
        var ti = invert((t-creationTime)%0.5, 0.25);
        let pos = heart.geometry.attributes.position;
        for (var i = 0; i < pos.array.length; i += 3)
          pos.array[i+2] = Math.sin(ti - 0.125) * (pos.array[i+1] - midY) * 4 * speed;
        pos.needsUpdate = true;
        var x = (ti - 0.125) * 0.5 * (speed*0.5 + 0.5);
        heart.position.x += (x ** 2) * (x < 0 ? -1 : 1);
      }
    });
    
    // Small background hearts removal
    heartsToDelete.forEach(pair => {
      hearts.splice(hearts.indexOf(pair), 1);
      pair[0].geometry.dispose();
      pair[0].material.dispose();
      scene.remove(pair[0]);
    });
  }
  
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();