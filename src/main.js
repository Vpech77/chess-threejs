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

const hitSound = new THREE.Audio(listener);
audioLoader.load('assets/audio/hit.mp3', function (buffer) {
  hitSound.setBuffer(buffer);
  hitSound.setVolume(1.0);
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


let selectedPiece;
let originColor;

function animateJump(object) {
  gsap.to(object.position, {
    y: object.position.y + 10,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: "power1.inOut"
  });
}

function onPointerDown(event) {
  controls.enabled = false;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // CLICK SUR UNE PIECE

  const intersectsO = raycaster.intersectObjects(objects);

  if (intersectsO.length > 0) {
    console.log("------------------ PIECE ------------------");
    const intersect = intersectsO[0];
    let parent = intersect.object;

    while (parent.parent && parent.parent.type !== "Scene") {
      parent = parent.parent;
    }
    const position = parent.position;
    console.log('Position de la piece cliqué :', position);

    if ( selectedPiece && selectedPiece.position !== parent.position ) {
      console.log("------------- MIAM PIECE -----------------");
      
      if (objects.includes(parent)) {
        const index = objects.indexOf(parent);
        if (index > -1) {
          objects.splice(index, 1);
          scene.remove(parent);
        }
      }
      if (!hitSound.isPlaying) {
        hitSound.play();
      }
      selectedPiece.position.set(position.x, selectedPiece.position.y, position.z);
      selectedPiece.traverse(child => {
        if (child.isMesh) {
          child.material.color.set(originColor);
        }
      });
      selectedPiece = null;
    }
    else {
      originColor = intersect.object.material.color.getHex();;
      intersect.object.material.color.set(0x2edc12);  
      selectedPiece = parent;
      if (!clickSound.isPlaying) {
        clickSound.play();
      }
      animateJump(selectedPiece);
    }
    return;
  }

  // CLICK SUR UNE CASE

  const intersects = raycaster.intersectObjects(cases);
  if (intersects.length > 0 && selectedPiece) {
    const intersect = intersects[0];
    const position = intersect.object.position;
    console.log("------------------ CASE ------------------");
    console.log('Position de la case cliqué :', position);

    selectedPiece.position.set(position.x, selectedPiece.position.y, position.z);
    selectedPiece.traverse(child => {
      if (child.isMesh) {
        child.material.color.set(originColor);
      }
    });
    selectedPiece = null;
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




