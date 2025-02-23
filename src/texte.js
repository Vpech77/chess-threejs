import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

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