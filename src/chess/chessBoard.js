import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createCase(position, isBlack) {
  const geometry = new THREE.BoxGeometry(50, 25, 50);
  const textureLoader = new THREE.TextureLoader();

  const whiteTexture = textureLoader.load('assets/textures/caseBlanche.png');
  const blackTexture = textureLoader.load('assets/textures/caseNoire.png');

  const texturedMaterialWhite = new THREE.MeshBasicMaterial({ map: whiteTexture });
  const texturedMaterialBlack = new THREE.MeshBasicMaterial({ map: blackTexture });

  const material = isBlack ? texturedMaterialBlack : texturedMaterialWhite;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  return mesh;
}

export function createChessboard(scene) {
  const cases = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const isBlack = (i + j) % 2 !== 0;
      const position = new THREE.Vector3(i * 50, 0, j * 50);
      const mesh = createCase(position, isBlack);
      scene.add(mesh);
      cases.push(mesh);
    }
  }
  return cases;
}


export function loadPiece(scene, objects, li, col, type, isBlack) {
    const mat = new THREE.Matrix4().makeScale(50, 50, 50);
    const loader = new GLTFLoader();
    loader.load(`assets/models/${type}.glb`, function (gltf) {
      const piece = gltf.scene;
      piece.name = `${type}`;
  
      piece.traverse(function (child) {
        if (child.isMesh) {
          child.material.color = isBlack ? new THREE.Color(0x171616) : new THREE.Color(0xffffff);
          child.geometry.applyMatrix4(mat);
          child.name = `${type}-mesh`;
        }
      });
  
      const bbox = new THREE.Box3().setFromObject(piece);
      const height = bbox.max.y - bbox.min.y;
      piece.position.set(col, height / 2 + 10, li);

      if (type === 'knight') {
        if (isBlack) {
            piece.rotation.y = Math.PI/2; 
        }
        else {
            piece.rotation.y = -Math.PI/2; 
        }
      }

      scene.add(piece);
      objects.push(piece);
  
    }, undefined, function (error) {
      console.error(error);
    });
}
  
export function loadAllPieces(scene) {
    const objects = []
    for (let i = 0; i < 8; i++) {
        loadPiece(scene, objects, 50, 50 * i, "pawn", true);
        loadPiece(scene, objects, 50 * 6, 50 * i, "pawn", false);
    }
    const liBlack = 0;
    const liWhite = 7 * 50;
    loadPiece(scene, objects, liBlack, 0, "rook", true);
    loadPiece(scene, objects, liBlack, 7 * 50, "rook", true);
    loadPiece(scene, objects, liWhite, 0, "rook", false);
    loadPiece(scene, objects, liWhite, 7 * 50, "rook", false);

    loadPiece(scene, objects, liBlack, 1 * 50, "knight", true);
    loadPiece(scene, objects, liBlack, 6 * 50, "knight", true);
    loadPiece(scene, objects, liWhite, 1 * 50, "knight", false);
    loadPiece(scene, objects, liWhite, 6 * 50, "knight", false);

    loadPiece(scene, objects, liBlack, 2 * 50, "bishop", true);
    loadPiece(scene, objects, liWhite, 2 * 50, "bishop", false);
    loadPiece(scene, objects, liBlack, 5 * 50, "bishop", true);
    loadPiece(scene, objects, liWhite, 5 * 50, "bishop", false);

    loadPiece(scene, objects, liBlack, 3 * 50, "queen", true);
    loadPiece(scene, objects, liWhite, 3 * 50, "queen", false);
    loadPiece(scene, objects, liBlack, 4 * 50, "king", true);
    loadPiece(scene, objects, liWhite, 4 * 50, "king", false);

    return objects;
}
