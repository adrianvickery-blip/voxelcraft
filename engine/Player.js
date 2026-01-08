import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { collides } from "../physics/Collision.js";
import { GAME_MODE, BLOCK, ITEM } from "../shared/constants.js";

function isTool(type) {
  return (
    type === ITEM.WOOD_PICKAXE ||
    type === ITEM.STONE_PICKAXE ||
    type === ITEM.IRON_PICKAXE ||
    type === ITEM.DIAMOND_PICKAXE ||
    type === ITEM.WOOD_SWORD ||
    type === ITEM.STONE_SWORD ||
    type === ITEM.IRON_SWORD ||
    type === ITEM.DIAMOND_SWORD ||
    type === ITEM.BOW
  );
}

function maxStackFor(type) {
  return isTool(type) ? 1 : 64;
}

export default class Player {
  constructor(camera, domElement, world, chunkManager, gameMode) {
    this.camera = camera;
    this.domElement = domElement;
    this.world = world;
    this.chunkManager = chunkManager;
    this.gameMode = gameMode || GAME_MODE.SURVIVAL;

    this.position = new THREE.Vector3(8, 30, 8);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.yaw = 0;
    this.pitch = 0;
    this.speed = 0.08;
    this.flySpeed = 0.14;
    this.sensitivity = 0.002;
    this.onGround = false;

    this.creativeFlying = true;
    this._lastSpacePress = 0;

    // basic stats
    this.maxHealth = 20;
    this.health = 20;
    this.maxHunger = 20;
    this.hunger = 20;

    // cactus damage timer
    this._lastCactusDamageTime = 0;

    // hotbar / inventory (9 slots total -> inventory limit)
    this.hotbarSize = 9;
    this.hotbar = new Array(this.hotbarSize).fill(null);
    this.selectedSlot = 0;

    // starting items in survival
    if (this.gameMode === GAME_MODE.SURVIVAL) {
      this.hotbar[0] = { type: ITEM.WOOD_PICKAXE, count: 1 };
      this.hotbar[1] = { type: ITEM.FOOD, count: 3 };
      this.hotbar[2] = { type: ITEM.DIRT, count: 16 };
    } else {
      // creative starts empty; inventory menu can give everything
    }

    this.keys = {};
    this.pointerLocked = false;

    this.camera.position.copy(this.position);

    this._setupControls();
  }

  _setupControls() {
    window.addEventListener("keydown", e => {
      this.keys[e.code] = true;

      if (e.code.startsWith("Digit")) {
        const idx = parseInt(e.code.slice(5), 10) - 1;
        if (!Number.isNaN(idx) && idx >= 0 && idx < this.hotbarSize) {
          this.selectedSlot = idx;
        }
      }

      if (e.code === "KeyE") {
        this.tryEatFood();
      }

      if (this.gameMode === GAME_MODE.CREATIVE && e.code === "Space") {
        const now = performance.now();
        if (now - this._lastSpacePress < 300) {
          this.creativeFlying = !this.creativeFlying;
        }
        this._lastSpacePress = now;
      }
    });

    window.addEventListener("keyup", e => {
      this.keys[e.code] = false;
    });

    this.domElement.addEventListener("click", () => {
      if (!this.pointerLocked && this.domElement.requestPointerLock) {
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener("mousemove", e => {
      if (!this.pointerLocked) return;
      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      const maxPitch = Math.PI / 2 - 0.01;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    });
  }

  getActiveItem() {
    return this.hotbar[this.selectedSlot] || null;
  }

  getActiveItemType() {
    const item = this.getActiveItem();
    return item ? item.type : ITEM.NONE;
  }

  getItemCount(type) {
    let total = 0;
    for (const it of this.hotbar) {
      if (it && it.type === type) total += it.count;
    }
    return total;
  }

  removeItems(type, count) {
    let remaining = count;
    for (let i = 0; i < this.hotbarSize; i++) {
      const it = this.hotbar[i];
      if (!it || it.type !== type) continue;
      const take = Math.min(remaining, it.count);
      it.count -= take;
      remaining -= take;
      if (it.count <= 0) this.hotbar[i] = null;
      if (remaining <= 0) break;
    }
    return remaining <= 0;
  }

  addItem(type, count = 1) {
    if (count <= 0) return false;
    const maxStack = maxStackFor(type);

    if (isTool(type)) {
      // tools are not stackable; one per slot
      for (let n = 0; n < count; n++) {
        let placed = false;
        for (let i = 0; i < this.hotbarSize; i++) {
          const it = this.hotbar[i];
          if (!it || it.count <= 0) {
            this.hotbar[i] = { type, count: 1 };
            placed = true;
            break;
          }
        }
        if (!placed) return false;
      }
      return true;
    }

    // try stacking on existing slots
    let remaining = count;
    for (let i = 0; i < this.hotbarSize; i++) {
      const it = this.hotbar[i];
      if (it && it.type === type && it.count < maxStack) {
        const space = maxStack - it.count;
        const add = Math.min(space, remaining);
        it.count += add;
        remaining -= add;
        if (remaining <= 0) return true;
      }
    }

    // use empty slots
    for (let i = 0; i < this.hotbarSize; i++) {
      const it = this.hotbar[i];
      if (!it || it.count <= 0) {
        const add = Math.min(maxStack, remaining);
        this.hotbar[i] = { type, count: add };
        remaining -= add;
        if (remaining <= 0) return true;
      }
    }

    return remaining <= 0;
  }

  consumeActiveItemOne() {
    const item = this.getActiveItem();
    if (!item || item.count <= 0) return false;
    item.count -= 1;
    if (item.count <= 0) {
      this.hotbar[this.selectedSlot] = null;
    }
    return true;
  }

  tryEatFood() {
    if (this.gameMode !== GAME_MODE.SURVIVAL) return;
    const item = this.getActiveItem();
    if (!item || item.type !== ITEM.FOOD || item.count <= 0) return;
    if (this.hunger >= this.maxHunger && this.health >= this.maxHealth) return;

    if (!this.consumeActiveItemOne()) return;
    this.hunger = Math.min(this.maxHunger, this.hunger + 6);
    this.health = Math.min(this.maxHealth, this.health + 4);
  }


getAttackDamage() {
  const item = this.getActiveItem();
  if (!item || !item.type) return 1;
  switch (item.type) {
    case ITEM.WOOD_SWORD:
      return 4;
    case ITEM.STONE_SWORD:
      return 5;
    case ITEM.IRON_SWORD:
      return 6;
    case ITEM.DIAMOND_SWORD:
      return 7;
    case ITEM.BOW: {
      // Bow does higher damage but consumes arrows if available
      const arrows = this.getItemCount(ITEM.ARROW);
      if (arrows > 0) {
        // Consume one arrow for a strong ranged hit
        this.removeItems(ITEM.ARROW, 1);
        return 6;
      }
      return 2;
    }
    case ITEM.WOOD_PICKAXE:
      return 2;
    case ITEM.STONE_PICKAXE:
      return 3;
    case ITEM.IRON_PICKAXE:
      return 4;
    case ITEM.DIAMOND_PICKAXE:
      return 5;
    default:
      return 1;
  }
}

  applyDamage(amount, reason = "damage") {
    if (this.gameMode === GAME_MODE.CREATIVE) return;
    this.health -= amount;
    console.log(`Took ${amount} damage (${reason}). Health now ${this.health}.`);
    if (this.health <= 0) {
      this.health = 0;
      console.log("You died!");
      this._respawn();
    }
  }

  _respawn() {
    this.position.set(8, 30, 8);
    this.velocity.set(0, 0, 0);
    this.health = this.maxHealth;
    this.hunger = Math.max(this.maxHunger * 0.5, this.hunger);
  }

  getForwardVector() {
    const forward = new THREE.Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    );
    return forward.normalize();
  }

  getRightVector() {
    const right = new THREE.Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );
    return right.normalize();
  }

  _isInWater(world) {
    const sample = this.position.clone();
    sample.y += 1.0;
    const id = world.getBlock(
      Math.floor(sample.x),
      Math.floor(sample.y),
      Math.floor(sample.z)
    );
    return id === BLOCK.WATER;
  }

  _applyCreative(world) {
    if (!this.creativeFlying) {
      // walk like survival but ignore damage (handled in applyDamage)
      this._applySurvival(world);
      return;
    }

    const forward = this.getForwardVector();
    const right = this.getRightVector();

    let move = new THREE.Vector3();

    if (this.keys["KeyW"]) move.add(forward);
    if (this.keys["KeyS"]) move.sub(forward);
    if (this.keys["KeyA"]) move.sub(right);
    if (this.keys["KeyD"]) move.add(right);

    if (this.keys["Space"]) move.y += 1;
    if (this.keys["ShiftLeft"] || this.keys["ShiftRight"]) move.y -= 1;

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(this.flySpeed);
    }

    this.position.add(move);
  }

  _applySurvival(world) {
    const forward = this.getForwardVector();
    const right = this.getRightVector();

    let move = new THREE.Vector3();

    if (this.keys["KeyW"]) move.add(forward);
    if (this.keys["KeyS"]) move.sub(forward);
    if (this.keys["KeyA"]) move.sub(right);
    if (this.keys["KeyD"]) move.add(right);

    const inWater = this._isInWater(world);

    let moveSpeed = this.speed;
    let gravity = 0.01;
    let maxFall = 0.3;

    if (inWater) {
      moveSpeed *= 0.4;
      gravity = 0.003;
      maxFall = 0.05;
    }

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(moveSpeed);
    }

    this.velocity.x = move.x;
    this.velocity.z = move.z;

    if (!inWater && this.keys["Space"] && this.onGround) {
      this.velocity.y = 0.18;
      this.onGround = false;
    }

    if (inWater && this.keys["Space"]) {
      this.velocity.y += 0.02;
    }

    this.velocity.y -= gravity;
    if (this.velocity.y < -maxFall) this.velocity.y = -maxFall;

    const nextPos = this.position.clone();

    nextPos.x += this.velocity.x;
    if (!collides(world, nextPos)) {
      this.position.x = nextPos.x;
    } else {
      this.velocity.x = 0;
      nextPos.x = this.position.x;
    }

    nextPos.y += this.velocity.y;
    const vyBefore = this.velocity.y;
    if (!collides(world, nextPos)) {
      this.position.y = nextPos.y;
      this.onGround = false;
    } else {
      if (vyBefore < 0) {
        this.onGround = true;
        const impactSpeed = Math.abs(vyBefore);
        if (impactSpeed > 0.22) {
          const dmg = Math.floor((impactSpeed - 0.22) * 40);
          if (dmg > 0) this.applyDamage(dmg, "fall damage");
        }
      }
      this.velocity.y = 0;
      nextPos.y = this.position.y;
    }

    nextPos.z += this.velocity.z;
    if (!collides(world, nextPos)) {
      this.position.z = nextPos.z;
    } else {
      this.velocity.z = 0;
      nextPos.z = this.position.z;
    }
  }

  _applyCactusDamage(world) {
    const now = performance.now();
    const interval = 400; // ms between damage ticks
    if (now - this._lastCactusDamageTime < interval) return;

    const base = this.position.clone();
    const px = Math.floor(base.x);
    const py = Math.floor(base.y);
    const pz = Math.floor(base.z);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        for (let dy = 0; dy <= 1; dy++) {
          const id = world.getBlock(px + dx, py + dy, pz + dz);
          if (id === BLOCK.CACTUS) {
            this._lastCactusDamageTime = now;
            this.applyDamage(1, "cactus");
            return;
          }
        }
      }
    }
  }

  update(world) {
    if (this.gameMode === GAME_MODE.CREATIVE) {
      this._applyCreative(world);
    } else {
      this._applySurvival(world);
    }

    this.camera.position.copy(this.position).add(new THREE.Vector3(0, 1.6, 0));

    const dir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    const lookTarget = this.camera.position.clone().add(dir);
    this.camera.lookAt(lookTarget);

    this._applyCactusDamage(world);
  }
}
