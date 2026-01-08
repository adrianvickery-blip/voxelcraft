import { BLOCK, ITEM, GAME_MODE } from "../shared/constants.js";

export function checkChestLoot(world, chunkManager, player, gameMode) {
  if (gameMode !== GAME_MODE.SURVIVAL) return;
  const px = Math.floor(player.position.x);
  const py = Math.floor(player.position.y);
  const pz = Math.floor(player.position.z);

  const radius = 2;
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -1; dy <= 2; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const x = px + dx;
        const y = py + dy;
        const z = pz + dz;
        const id = world.getBlock(x, y, z);
        if (id === BLOCK.CHEST) {
          // loot this chest once, then remove
          world.setBlock(x, y, z, BLOCK.AIR);
          chunkManager.rebuildChunkAtWorld(x, z);

          if (player.addItem) {
            player.addItem(ITEM.PLANKS, 8);
            player.addItem(ITEM.LOG, 4);
            player.addItem(ITEM.FOOD, 3);
            player.addItem(ITEM.STICK, 4);
          }

          console.log("Looted a village chest!");
          return;
        }
      }
    }
  }
}
