// Global constants - no module system
const CHUNK_SIZE = 16;
const WORLD_HEIGHT = 64;

// Blocks
const BLOCK = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  PLANKS: 5,
  LEAVES: 6,
  LOG: 7,
  WATER: 8,
  CHEST: 9,
  IRON_ORE: 10,
  DIAMOND_ORE: 11,
  GLASS: 12,
  BRICKS: 13,
  IRON_BLOCK: 14,
  DIAMOND_BLOCK: 15,
  CACTUS: 16,
  FLOWER: 17,
  SNOW: 18,
  FURNACE: 19,
  COAL_ORE: 20,
  CONCRETE_WHITE: 21,
  CONCRETE_RED: 22,
  CONCRETE_BLUE: 23,
  GLOWSTONE: 24,
  WOOD_SWORD: 25,
  STONE_SWORD: 26,
  IRON_SWORD: 27,
  DIAMOND_SWORD: 28,
  BOW: 29,
  ARROW: 30,
};

const ATLAS_COLS = 4;
const ATLAS_ROWS = 4;
const TILE_SIZE_U = 1 / ATLAS_COLS;
const TILE_SIZE_V = 1 / ATLAS_ROWS;

// Atlas tile indices (0..15) are independent of block IDs
const BLOCK_UV = {
  [BLOCK.GRASS]:         { top: 0, side: 1, bottom: 2 },
  [BLOCK.DIRT]:          { all: 2 },
  [BLOCK.STONE]:         { all: 3 },
  [BLOCK.SAND]:          { all: 4 },
  [BLOCK.PLANKS]:        { all: 5 },
  [BLOCK.LEAVES]:        { all: 6 },
  [BLOCK.LOG]:           { side: 7, top: 8, bottom: 8 },
  [BLOCK.WATER]:         { all: 9 },
  [BLOCK.CHEST]:         { all: 5 },
  [BLOCK.IRON_ORE]:      { all: 10 },
  [BLOCK.DIAMOND_ORE]:   { all: 11 },
  [BLOCK.GLASS]:         { all: 12 },
  [BLOCK.BRICKS]:        { all: 13 },
  [BLOCK.IRON_BLOCK]:    { all: 10 },
  [BLOCK.DIAMOND_BLOCK]: { all: 11 },
  [BLOCK.CACTUS]:        { all: 6 },
  [BLOCK.FLOWER]:        { all: 0 },
  [BLOCK.SNOW]:          { all: 4 },
  [BLOCK.FURNACE]:       { all: 3 },
  [BLOCK.COAL_ORE]:      { all: 3 },
  [BLOCK.CONCRETE_WHITE]:{ all: 2 },
  [BLOCK.CONCRETE_RED]:  { all: 13 },
  [BLOCK.CONCRETE_BLUE]: { all: 12 },
  [BLOCK.GLOWSTONE]:     { all: 4 },
};

const GAME_MODE = {
  SURVIVAL: "survival",
  CREATIVE: "creative",
};

// Item types for hotbar/inventory
const ITEM = {
  NONE: 0,
  DIRT: 1,
  PLANKS: 2,
  WOOD_PICKAXE: 3,
  FOOD: 4,
  LOG: 5,
  STICK: 6,
  STONE: 7,
  IRON: 8,
  DIAMOND: 9,
  STONE_PICKAXE: 10,
  IRON_PICKAXE: 11,
  DIAMOND_PICKAXE: 12,
  SAND: 13,
  GLASS: 14,
  BRICKS: 15,
  IRON_BLOCK: 16,
  DIAMOND_BLOCK: 17,
  FLOWER: 18,
  FURNACE: 19,
  COAL: 20,
  CONCRETE_WHITE: 21,
  CONCRETE_RED: 22,
  CONCRETE_BLUE: 23,
  GLOWSTONE: 24,
  WOOD_SWORD: 25,
  STONE_SWORD: 26,
  IRON_SWORD: 27,
  DIAMOND_SWORD: 28,
  BOW: 29,
  ARROW: 30,
};

const DEFAULT_WORLD_CONFIG = {
  baseHeight: 8,
  terrainAmplitude: 6,
};
