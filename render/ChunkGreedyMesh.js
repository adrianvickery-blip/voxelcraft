import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import {
  CHUNK_SIZE,
  WORLD_HEIGHT,
  BLOCK,
  BLOCK_UV,
  ATLAS_COLS,
  TILE_SIZE_U,
  TILE_SIZE_V
} from "../shared/constants.js";

const atlasTexture = new THREE.TextureLoader().load("./assets/atlas.png");
atlasTexture.magFilter = THREE.NearestFilter;
atlasTexture.minFilter = THREE.NearestFilter;

const material = new THREE.MeshLambertMaterial({
  map: atlasTexture
});

const FACES = [
  { // +X
    dir: [1, 0, 0],
    corners: [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 1]
    ],
    type: "side"
  },
  { // -X
    dir: [-1, 0, 0],
    corners: [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
      [0, 0, 0]
    ],
    type: "side"
  },
  { // +Y (top)
    dir: [0, 1, 0],
    corners: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0]
    ],
    type: "top"
  },
  { // -Y (bottom)
    dir: [0, -1, 0],
    corners: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1]
    ],
    type: "bottom"
  },
  { // +Z
    dir: [0, 0, 1],
    corners: [
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
      [0, 0, 1]
    ],
    type: "side"
  },
  { // -Z
    dir: [0, 0, -1],
    corners: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0]
    ],
    type: "side"
  }
];

function getTileIndex(blockId, faceType) {
  const info = BLOCK_UV[blockId];
  if (!info) return 0;
  if (faceType === "top" && info.top !== undefined) return info.top;
  if (faceType === "bottom" && info.bottom !== undefined) return info.bottom;
  if (faceType === "side" && info.side !== undefined) return info.side;
  if (info.all !== undefined) return info.all;
  return 0;
}

function pushFace(positions, normals, uvs, x, y, z, face, blockId) {
  const [nx, ny, nz] = face.dir;
  const corners = face.corners;

  const tileIndex = getTileIndex(blockId, face.type);
  const tileX = tileIndex % ATLAS_COLS;
  const tileY = Math.floor(tileIndex / ATLAS_COLS);

  const u0 = tileX * TILE_SIZE_U;
  const v0 = tileY * TILE_SIZE_V;
  const u1 = u0 + TILE_SIZE_U;
  const v1 = v0 + TILE_SIZE_V;

  const quad = corners.map(([cx, cy, cz]) => [
    x + cx,
    y + cy,
    z + cz
  ]);

  const order = [0, 1, 2, 0, 2, 3];
  for (const idx of order) {
    const v = quad[idx];
    positions.push(v[0], v[1], v[2]);
    normals.push(nx, ny, nz);
  }

  const faceUVs = [
    [u0, v1],
    [u1, v1],
    [u1, v0],
    [u0, v0]
  ];
  const uvOrder = [0, 1, 2, 0, 2, 3];
  for (const idx of uvOrder) {
    const uv = faceUVs[idx];
    uvs.push(uv[0], uv[1]);
  }
}

export function buildChunkMesh(chunk) {
  const positions = [];
  const normals = [];
  const uvs = [];

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const id = chunk.get(x, y, z);
        if (id === BLOCK.AIR) continue;

        for (const face of FACES) {
          const [dx, dy, dz] = face.dir;
          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;
          const neighbor = chunk.get(nx, ny, nz);
          if (neighbor === BLOCK.AIR) {
            pushFace(positions, normals, uvs, x, y, z, face, id);
          }
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute(normals, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();

  return new THREE.Mesh(geometry, material);
}
