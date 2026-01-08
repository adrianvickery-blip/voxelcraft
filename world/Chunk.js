import { CHUNK_SIZE, WORLD_HEIGHT, BLOCK } from "../shared/constants.js";
import SimplexNoise from "https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js";

export default class Chunk {
  constructor(cx, cz, config, seed) {
    this.cx = cx;
    this.cz = cz;
    this.config = config || { baseHeight: 8, terrainAmplitude: 6 };
    this.seed = seed || 0;
    this.blocks = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);

    if (!Chunk._heightNoise || Chunk._noiseSeed !== this.seed) {
      Chunk._noiseSeed = this.seed;
      Chunk._heightNoise = new SimplexNoise(this.seed || 0);
      Chunk._biomeNoise = new SimplexNoise((this.seed || 0) + 1337);
    }

    this.generate();
  }

  index(x, y, z) {
    return x + CHUNK_SIZE * (z + CHUNK_SIZE * y);
  }

  get(x, y, z) {
    if (
      x < 0 || x >= CHUNK_SIZE ||
      z < 0 || z >= CHUNK_SIZE ||
      y < 0 || y >= WORLD_HEIGHT
    ) {
      return BLOCK.AIR;
    }
    return this.blocks[this.index(x, y, z)];
  }

  set(x, y, z, id) {
    if (
      x < 0 || x >= CHUNK_SIZE ||
      z < 0 || z >= CHUNK_SIZE ||
      y < 0 || y >= WORLD_HEIGHT
    ) {
      return;
    }
    this.blocks[this.index(x, y, z)] = id;
  }

  _randomForCoord(x, z, salt = 0) {
    let h = this.seed ^ (x * 374761393) ^ (z * 668265263) ^ (salt * 374761);
    h = (h ^ (h >> 13)) * 1274126177;
    h = (h ^ (h >> 16)) >>> 0;
    return h / 0xffffffff;
  }

  _maybePlaceTree(localX, groundY, localZ) {
    const worldX = this.cx * CHUNK_SIZE + localX;
    const worldZ = this.cz * CHUNK_SIZE + localZ;
    const r = this._randomForCoord(worldX, worldZ, 42);
    if (r > 0.12) return;

    const height = 3 + Math.floor(this._randomForCoord(worldX, worldZ, 99) * 2);
    for (let i = 1; i <= height; i++) {
      this.set(localX, groundY + i, localZ, BLOCK.LOG);
    }
    const topY = groundY + height;

    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          if (Math.abs(x) + Math.abs(y) + Math.abs(z) > 4) continue;
          const lx = localX + x;
          const ly = topY + y;
          const lz = localZ + z;
          if (ly <= groundY + 1) continue;
          if (this.get(lx, ly, lz) === BLOCK.AIR) {
            this.set(lx, ly, lz, BLOCK.LEAVES);
          }
        }
      }
    }
  }

  _maybePlaceVillage() {
    const villageChance = 0.02;
    const r = this._randomForCoord(this.cx, this.cz, 777);
    if (r > villageChance) return;

    const baseX = Math.floor(CHUNK_SIZE / 2) - 2;
    const baseZ = Math.floor(CHUNK_SIZE / 2) - 2;

    let groundY = 0;
    for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
      const id = this.get(baseX + 2, y, baseZ + 2);
      if (id !== BLOCK.AIR && id !== BLOCK.WATER) {
        groundY = y;
        break;
      }
    }

    const floorY = groundY + 1;

    // floor
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        this.set(baseX + x, floorY, baseZ + z, BLOCK.PLANKS);
      }
    }

    // walls
    for (let y = 1; y <= 3; y++) {
      for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 5; z++) {
          const isEdge = x === 0 || x === 4 || z === 0 || z === 4;
          if (!isEdge) continue;
          if (z === 2 && x === 0 && y <= 2) continue; // door
          this.set(baseX + x, floorY + y, baseZ + z, BLOCK.PLANKS);
        }
      }
    }

    // roof
    for (let x = -1; x <= 5; x++) {
      for (let z = -1; z <= 5; z++) {
        this.set(baseX + x, floorY + 4, baseZ + z, BLOCK.PLANKS);
      }
    }

    // supports (planks so logs only from trees)
    this.set(baseX, floorY + 1, baseZ, BLOCK.PLANKS);
    this.set(baseX + 4, floorY + 1, baseZ, BLOCK.PLANKS);
    this.set(baseX, floorY + 1, baseZ + 4, BLOCK.PLANKS);
    this.set(baseX + 4, floorY + 1, baseZ + 4, BLOCK.PLANKS);

    // chest inside hut (loot)
    const chestX = baseX + 2;
    const chestZ = baseZ + 3;
    this.set(chestX, floorY + 1, chestZ, BLOCK.CHEST);
  }

  _decorateColumn(localX, localZ, groundY, biome, worldX, worldZ, seaLevel) {
    const topId = this.get(localX, groundY, localZ);
    const r = this._randomForCoord(worldX, worldZ, 999);

    // Desert cacti
    if (biome === "desert" && topId === BLOCK.SAND && groundY >= seaLevel - 1) {
      if (r < 0.04) {
        const height = 2 + Math.floor(this._randomForCoord(worldX, worldZ, 321) * 2);
        for (let i = 1; i <= height; i++) {
          const y = groundY + i;
          if (y >= WORLD_HEIGHT) break;
          if (this.get(localX, y, localZ) === BLOCK.AIR) {
            this.set(localX, y, localZ, BLOCK.CACTUS);
          }
        }
      }
    }

    // Plains flowers
    if (biome === "plains" && topId === BLOCK.GRASS) {
      if (r < 0.08) {
        const y = groundY + 1;
        if (y < WORLD_HEIGHT && this.get(localX, y, localZ) === BLOCK.AIR) {
          this.set(localX, y, localZ, BLOCK.FLOWER);
        }
      }
    }

    // Snow caps on high mountains
    if (biome === "mountains" && groundY > seaLevel + 6) {
      if (topId === BLOCK.STONE || topId === BLOCK.DIRT || topId === BLOCK.GRASS) {
        this.set(localX, groundY, localZ, BLOCK.SNOW);
      }
    }
  }

  generate() {
    const baseHeight = this.config.baseHeight ?? 8;
    const amp = this.config.terrainAmplitude ?? 6;
    const seaLevel = 8;

    const heightFreq = 0.03;
    const biomeFreq = 0.01;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = this.cx * CHUNK_SIZE + x;
        const worldZ = this.cz * CHUNK_SIZE + z;

        const n = Chunk._heightNoise.noise2D(worldX * heightFreq, worldZ * heightFreq);
        const h = Math.max(
          2,
          Math.min(
            WORLD_HEIGHT - 5,
            Math.floor(baseHeight + n * amp)
          )
        );

        const bVal = Chunk._biomeNoise.noise2D(worldX * biomeFreq, worldZ * biomeFreq);
        let biome = "plains";
        if (h <= seaLevel - 2) {
          biome = "ocean";
        } else if (bVal < -0.3) {
          biome = "desert";
        } else if (bVal > 0.4 && bVal <= 0.75) {
          biome = "forest";
        } else if (bVal > 0.75) {
          biome = "mountains";
        }

        for (let y = 0; y <= h; y++) {
          let block = BLOCK.STONE;

          if (biome === "ocean") {
            if (y === h) block = BLOCK.SAND;
            else if (y > h - 3) block = BLOCK.SAND;
            else block = BLOCK.STONE;
          } else if (biome === "desert") {
            if (y === h) block = BLOCK.SAND;
            else if (y > h - 4) block = BLOCK.SAND;
            else block = BLOCK.STONE;
          } else if (biome === "plains" || biome === "forest") {
            if (y === h) block = BLOCK.GRASS;
            else if (y > h - 3) block = BLOCK.DIRT;
            else block = BLOCK.STONE;
          } else if (biome === "mountains") {
            if (y >= h - 1) block = BLOCK.STONE;
            else if (y > h - 4) block = BLOCK.DIRT;
            else block = BLOCK.STONE;
          }

          // Ore generation inside stone areas
          if (block === BLOCK.STONE) {
            const oreRand = this._randomForCoord(worldX + y * 31, worldZ, 555);
            // Coal: relatively common, any depth where stone exists
            if (oreRand < 0.08) {
              block = BLOCK.COAL_ORE;
            } else if (y < 24 && oreRand < 0.08 + 0.04) {
              block = BLOCK.IRON_ORE;
            } else if (y <= 10 && oreRand < 0.08 + 0.04 + 0.005) {
              block = BLOCK.DIAMOND_ORE;
            }
          }

          this.set(x, y, z, block);
        }

        // fill water up to sea level for ocean / low areas
        for (let y = h + 1; y <= seaLevel; y++) {
          if (y >= 0 && y < WORLD_HEIGHT) {
            if (biome === "ocean" || y <= seaLevel) {
              this.set(x, y, z, BLOCK.WATER);
            }
          }
        }

        if (biome === "forest" && h > seaLevel + 1) {
          this._maybePlaceTree(x, h, z);
        }

        this._decorateColumn(x, z, h, biome, worldX, worldZ, seaLevel);
      }
    }

    this._maybePlaceVillage();
  }
}
