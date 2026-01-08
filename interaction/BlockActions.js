import { BLOCK, GAME_MODE, ITEM } from "../shared/constants.js";

export function getTargetBlocks(hit) {
  const { point, normal } = hit;

  const breakPos = point
    .clone()
    .sub(normal.clone().multiplyScalar(0.01))
    .floor();

  const placePos = point
    .clone()
    .add(normal.clone().multiplyScalar(0.01))
    .floor();

  return { breakPos, placePos };
}

function isSoftBlock(blockId) {
  return (
    blockId === BLOCK.GRASS ||
    blockId === BLOCK.DIRT ||
    blockId === BLOCK.SAND ||
    blockId === BLOCK.LEAVES ||
    blockId === BLOCK.LOG ||
    blockId === BLOCK.PLANKS ||
    blockId === BLOCK.WATER ||
    blockId === BLOCK.CHEST ||
    blockId === BLOCK.GLASS ||
    blockId === BLOCK.BRICKS ||
    blockId === BLOCK.CACTUS ||
    blockId === BLOCK.FLOWER ||
    blockId === BLOCK.SNOW ||
    blockId === BLOCK.FURNACE ||
    blockId === BLOCK.CONCRETE_WHITE ||
    blockId === BLOCK.CONCRETE_RED ||
    blockId === BLOCK.CONCRETE_BLUE ||
    blockId === BLOCK.GLOWSTONE
  );
}

function toolMiningLevel(itemType) {
  switch (itemType) {
    case ITEM.WOOD_PICKAXE:
      return 1;
    case ITEM.STONE_PICKAXE:
      return 2;
    case ITEM.IRON_PICKAXE:
      return 3;
    case ITEM.DIAMOND_PICKAXE:
      return 4;
    default:
      return 0;
  }
}

function blockRequiredLevel(blockId) {
  if (isSoftBlock(blockId)) return 0;
  if (blockId === BLOCK.STONE || blockId === BLOCK.COAL_ORE) return 1;
  if (blockId === BLOCK.IRON_ORE || blockId === BLOCK.IRON_BLOCK) return 2;
  if (blockId === BLOCK.DIAMOND_ORE || blockId === BLOCK.DIAMOND_BLOCK) return 3;
  return 0;
}

function canMineBlock(blockId, gameMode, player) {
  if (gameMode === GAME_MODE.CREATIVE) return true;

  const required = blockRequiredLevel(blockId);
  if (required === 0) return true;

  if (!player || !player.getActiveItemType) return false;
  const toolType = player.getActiveItemType();
  const level = toolMiningLevel(toolType);
  return level >= required;
}

function dropItemForBlock(blockId, player) {
  if (!player) return;
  switch (blockId) {
    case BLOCK.DIRT:
      player.addItem(ITEM.DIRT, 1);
      break;
    case BLOCK.SAND:
      player.addItem(ITEM.SAND, 1);
      break;
    case BLOCK.LOG:
      player.addItem(ITEM.LOG, 1);
      break;
    case BLOCK.PLANKS:
      player.addItem(ITEM.PLANKS, 1);
      break;
    case BLOCK.STONE:
      player.addItem(ITEM.STONE, 1);
      break;
    case BLOCK.GLASS:
      player.addItem(ITEM.GLASS, 1);
      break;
    case BLOCK.BRICKS:
      player.addItem(ITEM.BRICKS, 1);
      break;
    case BLOCK.IRON_ORE:
      player.addItem(ITEM.IRON, 1);
      break;
    case BLOCK.DIAMOND_ORE:
      player.addItem(ITEM.DIAMOND, 1);
      break;
    case BLOCK.COAL_ORE:
      player.addItem(ITEM.COAL, 1);
      break;
    case BLOCK.IRON_BLOCK:
      player.addItem(ITEM.IRON, 9);
      break;
    case BLOCK.DIAMOND_BLOCK:
      player.addItem(ITEM.DIAMOND, 9);
      break;
    case BLOCK.FURNACE:
      player.addItem(ITEM.FURNACE, 1);
      break;
    case BLOCK.FLOWER:
      player.addItem(ITEM.FLOWER, 1);
      break;
    case BLOCK.CONCRETE_WHITE:
      player.addItem(ITEM.CONCRETE_WHITE, 1);
      break;
    case BLOCK.CONCRETE_RED:
      player.addItem(ITEM.CONCRETE_RED, 1);
      break;
    case BLOCK.CONCRETE_BLUE:
      player.addItem(ITEM.CONCRETE_BLUE, 1);
      break;
    case BLOCK.GLOWSTONE:
      player.addItem(ITEM.GLOWSTONE, 1);
      break;
    default:
      break;
  }
}

export function breakBlock(world, chunkManager, pos, gameMode = GAME_MODE.SURVIVAL, player = null) {
  const blockId = world.getBlock(pos.x, pos.y, pos.z);
  if (!canMineBlock(blockId, gameMode, player)) {
    console.log("This material is too hard to mine with your current tool.");
    return;
  }
  world.setBlock(pos.x, pos.y, pos.z, BLOCK.AIR);
  chunkManager.rebuildChunkAtWorld(pos.x, pos.z);

  if (gameMode === GAME_MODE.SURVIVAL) {
    dropItemForBlock(blockId, player);
  }
}

function itemToBlockId(itemType) {
  switch (itemType) {
    case ITEM.DIRT:           return BLOCK.DIRT;
    case ITEM.PLANKS:         return BLOCK.PLANKS;
    case ITEM.LOG:            return BLOCK.LOG;
    case ITEM.STONE:          return BLOCK.STONE;
    case ITEM.SAND:           return BLOCK.SAND;
    case ITEM.GLASS:          return BLOCK.GLASS;
    case ITEM.BRICKS:         return BLOCK.BRICKS;
    case ITEM.IRON_BLOCK:     return BLOCK.IRON_BLOCK;
    case ITEM.DIAMOND_BLOCK:  return BLOCK.DIAMOND_BLOCK;
    case ITEM.FURNACE:        return BLOCK.FURNACE;
    case ITEM.FLOWER:         return BLOCK.FLOWER;
    case ITEM.CONCRETE_WHITE: return BLOCK.CONCRETE_WHITE;
    case ITEM.CONCRETE_RED:   return BLOCK.CONCRETE_RED;
    case ITEM.CONCRETE_BLUE:  return BLOCK.CONCRETE_BLUE;
    case ITEM.GLOWSTONE:      return BLOCK.GLOWSTONE;
    default:                  return null;
  }
}

function isToolType(itemType) {
  return (
    itemType === ITEM.WOOD_PICKAXE ||
    itemType === ITEM.STONE_PICKAXE ||
    itemType === ITEM.IRON_PICKAXE ||
    itemType === ITEM.DIAMOND_PICKAXE
  );
}

export function placeBlock(world, chunkManager, pos, gameMode = GAME_MODE.SURVIVAL, player = null) {
  if (gameMode === GAME_MODE.CREATIVE) {
    if (player && player.getActiveItemType) {
      const itType = player.getActiveItemType();
      const blockId = itemToBlockId(itType) ?? BLOCK.DIRT;
      world.setBlock(pos.x, pos.y, pos.z, blockId);
    } else {
      world.setBlock(pos.x, pos.y, pos.z, BLOCK.DIRT);
    }
    chunkManager.rebuildChunkAtWorld(pos.x, pos.z);
    return;
  }

  if (!player || !player.getActiveItem) return;
  const item = player.getActiveItem();
  if (!item || item.count <= 0) return;
  if (isToolType(item.type)) return;

  const blockId = itemToBlockId(item.type);
  if (blockId == null) return;

  if (!player.consumeActiveItemOne()) return;

  world.setBlock(pos.x, pos.y, pos.z, blockId);
  chunkManager.rebuildChunkAtWorld(pos.x, pos.z);
}
