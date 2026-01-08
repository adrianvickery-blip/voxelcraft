import { buildChunkMesh } from "../render/ChunkGreedyMesh.js";
import { CHUNK_SIZE } from "../shared/constants.js";

export default class ChunkManager {
  constructor(world, scene) {
    this.world = world;
    this.scene = scene;
    this.meshes = new Map();
    this.viewDistance = 2;
  }

  _key(cx, cz) {
    return `${cx},${cz}`;
  }

  _addChunkMesh(cx, cz) {
    const key = this._key(cx, cz);
    const chunk = this.world.getChunk(cx, cz);
    const mesh = buildChunkMesh(chunk);
    mesh.position.set(cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE);
    this.scene.add(mesh);
    this.meshes.set(key, mesh);
  }

  update(playerX, playerZ) {
    const cx = Math.floor(playerX / CHUNK_SIZE);
    const cz = Math.floor(playerZ / CHUNK_SIZE);

    for (let x = cx - this.viewDistance; x <= cx + this.viewDistance; x++) {
      for (let z = cz - this.viewDistance; z <= cz + this.viewDistance; z++) {
        const key = this._key(x, z);
        if (!this.meshes.has(key)) {
          this._addChunkMesh(x, z);
        }
      }
    }
  }

  rebuildChunkAtWorld(x, z) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const key = this._key(cx, cz);

    const old = this.meshes.get(key);
    if (old) {
      this.scene.remove(old);
      old.geometry.dispose();
      if (old.material.map) old.material.map.dispose();
      old.material.dispose();
      this.meshes.delete(key);
    }

    this._addChunkMesh(cx, cz);
  }
}
