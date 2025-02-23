"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createChessboard, loadAllPieces } from './chess/chessBoard.js';

/******************************** INITIALISATION SCENE ***************************** */

let camera, scene, renderer;
scene = new THREE.Scene();

/** ************** FOG ************** */
const fogColor = 0xf0f0f0;
const near = 10;
const far = 1000; 
scene.fog = new THREE.Fog(fogColor, near, far);
scene.background = new THREE.Color(fogColor);

/** ************** LIGHT ************** */
const ambientLight = new THREE.AmbientLight(0x606060, 3);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 0.75, 0.5).normalize();
scene.add(directionalLight);

/** ************** RENDERER ************** */
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.addEventListener('pointerdown', onPointerDown);

/** ************** CAMERA AND CONTROLS ************** */
const fov = 45;
camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 100000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.target.set(200, 0, 200);
camera.position.set(200, 500, 500);
camera.lookAt(new THREE.Vector3(200, 0, 200));

/** ************** SOUND ************** */
const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();

const backgroundMusic = new THREE.Audio(listener);
audioLoader.load('assets/audio/whiteNoise.mp3', function (buffer) {
  backgroundMusic.setBuffer(buffer);
  backgroundMusic.setLoop(true);
  backgroundMusic.setVolume(0.5);
  document.addEventListener('click', function () {
    if (!backgroundMusic.isPlaying) {
      backgroundMusic.play();
    }
  });
});

const clickSound = new THREE.Audio(listener);
audioLoader.load('assets/audio/monster.wav', function (buffer) {
  clickSound.setBuffer(buffer);
  clickSound.setVolume(1.0);
});

/** ************** RAYCASTER ************** */
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(1, 1);


/******************************** INITIALISATION PLATO ***************************** */

// king + 10
// knight + 10
// queen + 10
// pawn + 10
// bishop + 7
// rook + 5


const cases = createChessboard(scene);
const objects = loadAllPieces(scene);


/******************************** CLICK ***************************** */

function onPointerDown(event) {
  controls.enabled = false;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cases, true);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    console.log("------------------ CASE ------------------");
    // printGraph(intersect.object);
    const position = intersect.object.position;
    console.log('Position de la case cliquée :', position);
  }

  const intersectsO = raycaster.intersectObjects(objects);

  if (intersectsO.length > 0) {
    const intersect = intersectsO[0];
    console.log("------------------ PIECE ------------------");
    let parent = intersect.object;
    while (parent.parent && parent.parent.type !== "Scene") {
      parent = parent.parent;
    }
    const position = parent.position;
    console.log('Position de la piece cliqué :', position);
    
    intersect.object.material.color = new THREE.Color(0xff0000);
    if (!clickSound.isPlaying) {
      clickSound.play();
    }

    // parent.position.set(0,parent.position.y,0)

  }
  controls.enabled = true;
}


/** ************************** UTILS ***************************** */
const animation = () => {
  renderer.setAnimationLoop(animation);
  renderer.render(scene, camera);
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function printGraph(obj) {
  console.group(' <%o> ' + obj.name, obj);
  obj.children.forEach(printGraph);
  console.groupEnd();
}

/** ************************** BOUCLE ANIMATION ***************************** */
animation();
window.addEventListener('resize', onWindowResize, false);




