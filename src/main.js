"use strict";

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let camera, scene, renderer;
let raycaster = false;
const fov = 45;
camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 100000);
scene = new THREE.Scene();

const fogColor = 0xf0f0f0;
const near = 50;
const far = 1000; 
scene.fog = new THREE.Fog(fogColor, near, far);
scene.background = new THREE.Color(fogColor);

const fontLoader = new FontLoader();

fontLoader.load('assets/fonts/gentilis_bold.typeface.json', function (font) {
  const textGeometry = new TextGeometry('Your turn', {
    font: font,
    size: 70,
    height: 2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1.5,
    bevelOffset: 0,
    bevelSegments: 5
  });

  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  textMesh.position.set(0, 100, 150);
  textMesh.rotation.x = Math.PI / 2 + Math.PI /6;
  textMesh.rotation.y = Math.PI;
  textMesh.rotation.z = Math.PI;

  scene.add(textMesh);
});


function printGraph(obj) {
  console.group(' <%o> ' + obj.name, obj);
  obj.children.forEach(printGraph);
  console.groupEnd();
}

const objects = [];

function loadPiece(li, col, type, isBlack) {
  const mat = new THREE.Matrix4().makeScale(50, 50, 50);
  const loader = new GLTFLoader();
  loader.load(`assets/models/${type}.glb`, function (gltf) {
    const piece = gltf.scene;
    piece.name = `${type} ${isBlack ? 'black' : 'white'}`;
    piece.traverse(function (child) {
      if (child.isMesh) {
        child.material.color = isBlack ? new THREE.Color(0x171616) : new THREE.Color(0xffffff);
        child.geometry.applyMatrix4(mat);
      }
    });

    const bbox = new THREE.Box3().setFromObject(piece);
    const height = bbox.max.y - bbox.min.y;
    piece.position.set(col, height / 2 + 10, li);

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


for (let i = 0; i < 8; i++) {
  loadPiece(50, 50 * i, "pawn", true);
  loadPiece(50 * 6, 50 * i, "pawn", false);
}



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
camera.position.set(200, 700, 500);
camera.lookAt(new THREE.Vector3(200, 0, 200));

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/audio/whiteNoise.mp3', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);

  document.addEventListener('click', function () {
    if (!sound.isPlaying) {
      sound.play();
    }
  });
});



/******************************** EVENT ***************************** */

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

    parent.position.set(0,parent.position.y,0)

  }
  controls.enabled = true;
}



/** ************************** BOUCLE ANIMATION ***************************** */

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
