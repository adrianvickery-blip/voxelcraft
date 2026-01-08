import Chunk from "./Chunk.js";
import { CHUNK_SIZE, DEFAULT_WORLD_CONFIG } from "../shared/constants.js";

export default class World {
  constructor(config = {}, seed = 0) {
    this.config = { ...DEFAULT_WORLD_CONFIG, ...(config || {}) };
    this.seed = Number.isFinite(seed) ? seed : parseInt(seed, 10) || 0;
    this.chunks = new Map();
  }

  _key(cx, cz) {
    return `${cx},${cz}`;
  }

  getChunk(cx, cz) {
    const key = this._key(cx, cz);
    if (!this.chunks.has(key)) {
      this.chunks.set(key, new Chunk(cx, cz, this.config, this.seed));
    }
    return this.chunks.get(key);
  }

  getBlock(x, y, z) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const lx = x - cx * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    const chunk = this.getChunk(cx, cz);
    return chunk.get(lx, y, lz);
  }

  setBlock(x, y, z, id) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const lx = x - cx * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    const chunk = this.getChunk(cx, cz);
    chunk.set(lx, y, lz, id);
  }
}
