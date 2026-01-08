import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);

export function pickBlock(scene, camera, maxDistance = 6) {
  mouse.set(0, 0);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, false);
  if (!hits.length) return null;
  const hit = hits[0];
  if (hit.distance > maxDistance) return null;
  const point = hit.point;
  const normal = hit.face.normal.clone();
  return { point, normal, object: hit.object };
}
