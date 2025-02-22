"use strict";

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let camera, scene, renderer;
let raycaster = false;

const objects = [];

const fov = 50;
camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 100000);
camera.position.set(200, 400, 200);
camera.lookAt(new THREE.Vector3(200, 100, 200));

console.log(camera.position)


scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

function printGraph(obj) {
  console.group(' <%o> ' + obj.name, obj);
  obj.children.forEach(printGraph);
  console.groupEnd();
}

const mat = new THREE.Matrix4().makeScale(50, 50, 50);

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
      }
    });

    const bbox = new THREE.Box3().setFromObject(piece);
    const height = bbox.max.y - bbox.min.y;
    piece.position.set(li, height / 2 + 10, col);

    scene.add(piece);
    objects.push(piece);

  }, undefined, function (error) {
    console.error(error);
  });

}

// king + 10
// knight + 10
// queen + 10
// pawn + 10
// bishop + 7
// rook + 5

loadPiece(0, 0, "pawn", "white");


const geometry = new THREE.BoxGeometry(50, 25, 50);
const textureLoader = new THREE.TextureLoader();

const whiteTexture = textureLoader.load('assets/textures/caseBlanche.png');
const blackTexture = textureLoader.load('assets/textures/caseNoire.png');

const texturedMaterialWhite = new THREE.MeshBasicMaterial({ map: whiteTexture });
const texturedMaterialBlack = new THREE.MeshBasicMaterial({ map: blackTexture });

function createCase(position, isBlack) {
  const material = isBlack ? texturedMaterialBlack : texturedMaterialWhite;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  scene.add(mesh);
  return mesh;
}

const cases = [];
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    const isBlack = (i + j) % 2 !== 0;
    const position = new THREE.Vector3(i * 50, 0, j * 50);
    cases.push(createCase(position, isBlack));
  }
}

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
controls.listenToKeyEvents(window); // optional
controls.target.set(200, 0, 200);
camera.position.set(200, 550, 200);
camera.lookAt(new THREE.Vector3(200, 0, 200));

/******************************** EVENT ***************************** */

function onPointerDown(event) {
  controls.enabled = false;
  console.log(camera.position)

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cases);

  if (intersects.length > 0) {

    const intersect = intersects[0];

    console.log("------------------ intersection ------------------");
    // printGraph(intersect.object);
    const position = intersect.object.position;
    console.log('Position de la case cliquée :', position);
    // intersect.object.material.color = new THREE.Color(0xff0000);

  }
  controls.enabled = true;
}

const animation = () => {
  renderer.setAnimationLoop(animation);
  renderer.render(scene, camera);
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
