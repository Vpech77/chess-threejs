"use strict";

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



let camera, scene, renderer;
let raycaster = false;


const SIZE_CASE = 50;
const MARGE = SIZE_CASE / 2;

const objects = [];

camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 800, 1300);
camera.lookAt(0, 0, 0);

scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);


function printGraph(obj) {
  console.group(' <%o> ' + obj.name, obj);
  obj.children.forEach(printGraph);
  console.groupEnd();
}

const mat = new THREE.Matrix4().makeScale(50, 50, 50);
console.log(mat);


function loadPiece(li, col, type, color) {
  const loader = new GLTFLoader();
  loader.load(`assets/models/${type}.glb`, function (gltf) {
    const piece = gltf.scene;

    printGraph(piece);
    piece.name = `${type}`;

    piece.traverse(function (child) {
      if (child.isMesh) {
        child.material.color = color === 'white' ? new THREE.Color(0xffffff) : new THREE.Color(0x171616);
        child.geometry.applyMatrix4(mat);

        const helper = new THREE.Box3Helper(child.geometry.boundingBox);
        scene.add(helper);

      }
    });


    piece.position.setX(li);
    piece.position.setY(0);
    piece.position.setZ(col);


    scene.add(piece);
    objects.push(piece);


  }, undefined, function (error) {
    console.error(error);
  });

}

// for (let li = 0; li < 8; li++) {
//   for (let col = 0; col < 8; col++) {
//     if (col === 1) {
//       loadPiece(li * SIZE_CASE + MARGE, MARGE, "pawn", "black");
//     }
//     if (col === 6) {
//       loadPiece(li * SIZE_CASE + MARGE, col * SIZE_CASE + MARGE, "pawn", "white");
//     }

//   }
// }

loadPiece(0 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "rook", "white");
// loadPiece(1 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "knight", "white");
// loadPiece(2 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "bishop", "white");
// loadPiece(3 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "queen", "white");
// loadPiece(4 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "king", "white");
// loadPiece(5 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "bishop", "white");
// loadPiece(6 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "knight", "white");
// loadPiece(7 * SIZE_CASE + MARGE, 7 * SIZE_CASE + MARGE, "rook", "white");

// loadPiece(0 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "rook", "black");
// loadPiece(1 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "knight", "black");
// loadPiece(2 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "bishop", "black");
// loadPiece(3 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "queen", "black");
// loadPiece(4 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "king", "black");
// loadPiece(5 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "bishop", "black");
// loadPiece(6 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "knight", "black");
// loadPiece(7 * SIZE_CASE + MARGE, -1 * SIZE_CASE + MARGE, "rook", "black");


// grid

const gridHelper = new THREE.GridHelper(1000, 20);
scene.add(gridHelper);

// raycaster

raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(1, 1);

// lights

const ambientLight = new THREE.AmbientLight(0x606060, 3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 0.75, 0.5).normalize();
scene.add(directionalLight);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

document.addEventListener('pointerdown', onPointerDown);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.listenToKeyEvents(window); // optional



/******************************** EVENT ***************************** */

function onPointerDown(event) {
  controls.enabled = false;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objects, true);

  console.log(mouse.x, mouse.y);

  console.table(objects);

  if (intersects.length > 0) {

    const intersect = intersects[0];

    console.log("------------------ intersection ------------------");
    printGraph(intersect.object);
    intersect.object.material.color = new THREE.Color(0xff0000);

  }

  controls.enabled = true;

}


const animation = () => {

  renderer.setAnimationLoop(animation); // requestAnimationFrame() replacement, compatible with XR 

  renderer.render(scene, camera);
};




animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}
