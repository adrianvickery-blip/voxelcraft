import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { GAME_MODE, ITEM } from "../shared/constants.js";

class Mob {
  constructor(type, hostile, position, color) {
    this.type = type;
    this.hostile = hostile;
    this.position = position.clone();
    this.velocity = new THREE.Vector3();
    this.mesh = null;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.color = color;
    this.health = hostile ? 20 : 10;
  }

  attachToScene(scene) {
    const geom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const mat = new THREE.MeshStandardMaterial({ color: this.color });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(this.position);
    scene.add(mesh);
    this.mesh = mesh;
    this.mesh.userData.mob = this;
  }

  removeFromScene(scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      if (this.mesh.userData) {
        delete this.mesh.userData.mob;
      }
      this.mesh = null;
    }
  }

  updateMesh() {
    if (this.mesh) {
      this.mesh.position.copy(this.position);
    }
  }
}

export default class MobManager {
  constructor(scene, world, gameMode) {
    this.scene = scene;
    this.world = world;
    this.gameMode = gameMode || GAME_MODE.SURVIVAL;

    this.hostileMobs = [];
    this.passiveMobs = [];

    this._spawnInitialMobs();
  }

hitMob(mob, damage, player) {
  if (!mob || typeof damage !== "number" || damage <= 0) return;
  mob.health -= damage;
  if (mob.health > 0) return;

  // Remove from scene and internal arrays
  mob.removeFromScene(this.scene);

  const list = mob.hostile ? this.hostileMobs : this.passiveMobs;
  const idx = list.indexOf(mob);
  if (idx !== -1) {
    list.splice(idx, 1);
  }

  // Simple drops: docile mobs drop food, hostile mobs sometimes drop food
  if (player && player.addItem) {
    if (!mob.hostile) {
      player.addItem(ITEM.FOOD, 2);
      console.log("You harvested meat from a", mob.type);
    } else {
      player.addItem(ITEM.FOOD, 1);
      console.log("You defeated a hostile mob.");
    }
  }
}


  _spawnInitialMobs() {
    for (let i = 0; i < 6; i++) {
      const x = (Math.random() - 0.5) * 40 + 8;
      const z = (Math.random() - 0.5) * 40 + 8;
      const y = 50;
      const type = Math.random() < 0.5 ? "pig" : "cow";
      const color = type === "pig" ? 0xffa0a0 : 0xffffff;
      const mob = new Mob(type, false, new THREE.Vector3(x, y, z), color);
      mob.attachToScene(this.scene);
      this.passiveMobs.push(mob);
    }

    for (let i = 0; i < 8; i++) {
      const x = (Math.random() - 0.5) * 80 + 8;
      const z = (Math.random() - 0.5) * 80 + 8;
      const y = 50;
      const type = "hostile";
      const color = 0x3366ff;
      const mob = new Mob(type, true, new THREE.Vector3(x, y, z), color);
      mob.attachToScene(this.scene);
      this.hostileMobs.push(mob);
    }
  }

  _updatePassive(mob, world) {
    mob.wanderAngle += (Math.random() - 0.5) * 0.2;
    const speed = 0.02;
    mob.position.x += Math.cos(mob.wanderAngle) * speed;
    mob.position.z += Math.sin(mob.wanderAngle) * speed;

    mob.position.y -= 0.05;
    if (mob.position.y < 0) mob.position.y = 0;
    mob.updateMesh();
  }

  _updateHostile(mob, player, isNight, world, gameMode) {
    if (!isNight || gameMode === GAME_MODE.CREATIVE) {
      this._updatePassive(mob, world);
      return;
    }

    const dir = new THREE.Vector3().subVectors(player.position, mob.position);
    const dist = dir.length();
    if (dist > 0.001) dir.divideScalar(dist);

    const speed = 0.045;
    mob.position.addScaledVector(dir, speed);

    mob.position.y -= 0.05;
    if (mob.position.y < 0) mob.position.y = 0;

    mob.updateMesh();

    if (dist < 1.2 && player.applyDamage) {
      player.applyDamage(4, "hostile mob");
    }
  }

  update(timeOfDay, player, world) {
    const angle = timeOfDay * Math.PI * 2;
    const isNight = Math.sin(angle) < 0;

    for (let i = this.passiveMobs.length - 1; i >= 0; i--) {
      const mob = this.passiveMobs[i];
      this._updatePassive(mob, world);

      if (this.gameMode === GAME_MODE.SURVIVAL) {
        const dist = mob.position.distanceTo(player.position);
        if (dist < 1.0) {
          mob.removeFromScene(this.scene);
          this.passiveMobs.splice(i, 1);
          if (player.addItem) {
            player.addItem(ITEM.FOOD, 1);
            console.log("Collected food from a", mob.type);
          }
        }
      }
    }

    for (const m of this.hostileMobs) {
      this._updateHostile(m, player, isNight, world, this.gameMode);
    }
  }
}
