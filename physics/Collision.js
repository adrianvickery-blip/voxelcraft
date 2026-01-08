import { BLOCK } from "../shared/constants.js";

const PLAYER_HALF_X = 0.3;
const PLAYER_HALF_Z = 0.3;
const PLAYER_HEIGHT = 1.8;

export function collides(world, pos) {
  const samples = [];
  const ys = [pos.y, pos.y + PLAYER_HEIGHT * 0.5, pos.y + PLAYER_HEIGHT];

  for (const y of ys) {
    for (const sx of [-PLAYER_HALF_X, PLAYER_HALF_X]) {
      for (const sz of [-PLAYER_HALF_Z, PLAYER_HALF_Z]) {
        samples.push({
          x: Math.floor(pos.x + sx),
          y: Math.floor(y),
          z: Math.floor(pos.z + sz)
        });
      }
    }
  }

  for (const s of samples) {
    const id = world.getBlock(s.x, s.y, s.z);
    // Water should not count as a solid collision
    if (id !== BLOCK.AIR && id !== BLOCK.WATER) return true;
  }

  return false;
}
