import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import Renderer from "../render/Renderer.js";
import World from "../world/World.js";
import ChunkManager from "../world/ChunkManager.js";
import Player from "./Player.js";
import GameLoop from "./GameLoop.js";
import { pickBlock } from "../interaction/Raycast.js";
import { breakBlock, placeBlock, getTargetBlocks } from "../interaction/BlockActions.js";
import { GAME_MODE, BLOCK, ITEM } from "../shared/constants.js";
import MobManager from "../entities/MobManager.js";
import HUD from "../ui/HUD.js";
import CraftingUI from "../ui/Crafting.js";
import { checkChestLoot } from "../world/Chest.js";
import InventoryUI from "../ui/Inventory.js";
import HeldItem from "../render/HeldItem.js";
import FurnaceUI from "../ui/Furnace.js";

export default class Engine {
  constructor(options = {}) {
    this.options = options;
    this.gameMode = options.gameMode || GAME_MODE.SURVIVAL;
    this.worldName = options.worldName || "New World";

    const worldConfig = options.worldConfig || {};
    const seed = options.seed || 0;

    this.renderer = new Renderer();
    this.world = new World(worldConfig, seed);
    this.chunkManager = new ChunkManager(this.world, this.renderer.scene);
    this.player = new Player(
      this.renderer.camera,
      this.renderer.domElement,
      this.world,
      this.chunkManager,
      this.gameMode
    );

    this.mobManager = new MobManager(this.renderer.scene, this.world, this.gameMode);
    this.hud = new HUD(this.player, this.gameMode);
    this.crafting = new CraftingUI(this.player, this.gameMode);
    this.inventory = new InventoryUI(this.player, this.gameMode);
    this.furnaceUI = new FurnaceUI(this.player, this.gameMode);
    this.heldItem = new HeldItem(this.renderer.camera, this.player);

    this.lastAttackTime = 0;
    this.startTime = performance.now();
    this.timeOfDay = 0;

    this._setupMouseActions();
  }

  _setupMouseActions() {
    this.renderer.domElement.addEventListener("mousedown", e => {
      if (document.pointerLockElement !== this.renderer.domElement) return;

      const hit = pickBlock(this.renderer.scene, this.renderer.camera);
      if (!hit) return;

      const { breakPos, placePos } = getTargetBlocks(hit);

      if (e.button === 0) {
        // Left-click: first try attacking a mob, then fallback to breaking a block
        const now = performance.now();
        const attackCooldown = 250; // ms
        const activeItemType = this.player.getActiveItemType();
        const isBow = activeItemType === ITEM.BOW;
        const maxAttackDistance = isBow ? 12 : 4;

        const targetMob = hit.object && hit.object.userData && hit.object.userData.mob
          ? hit.object.userData.mob
          : null;

        if (
          targetMob &&
          this.mobManager &&
          hit.object.position &&
          hit.object.position.distanceTo(this.player.position) <= maxAttackDistance &&
          now - this.lastAttackTime >= attackCooldown
        ) {
          this.lastAttackTime = now;
          const dmg = this.player.getAttackDamage
            ? this.player.getAttackDamage()
            : 1;
          this.mobManager.hitMob(targetMob, dmg, this.player);
          return;
        }

        breakBlock(this.world, this.chunkManager, breakPos, this.gameMode, this.player);
      } else if (e.button === 2) {
        const clickedId = this.world.getBlock(breakPos.x, breakPos.y, breakPos.z);
        if (clickedId === BLOCK.FURNACE && this.furnaceUI) {
          this.furnaceUI.open();
        } else {
          placeBlock(this.world, this.chunkManager, placePos, this.gameMode, this.player);
        }
      }
    });

    this.renderer.domElement.addEventListener("contextmenu", e => {
      e.preventDefault();
    });
  }

  _updateTimeOfDay() {
    const elapsed = (performance.now() - this.startTime) / 1000;
    const dayLength = 600;
    this.timeOfDay = (elapsed % dayLength) / dayLength;

    const t = this.timeOfDay;
    const sunFactor = Math.max(0, Math.sin(t * Math.PI * 2));

    const minSun = 0.1;
    const maxSun = 1.0;
    const sunIntensity = minSun + (maxSun - minSun) * sunFactor;

    const minAmbient = 0.15;
    const maxAmbient = 0.5;
    const ambientIntensity = minAmbient + (maxAmbient - minAmbient) * sunFactor;

    if (this.renderer.dirLight) this.renderer.dirLight.intensity = sunIntensity;
    if (this.renderer.ambient) this.renderer.ambient.intensity = ambientIntensity;

    const skyDay = new THREE.Color(0x87ceeb);
    const skyNight = new THREE.Color(0x02030a);
    const skyColor = skyNight.clone().lerp(skyDay, sunFactor);
    this.renderer.scene.background = skyColor;
  }

  start() {
    GameLoop(this);
  }

  update() {
    this._updateTimeOfDay();
    this.player.update(this.world);
    this.chunkManager.update(this.player.position.x, this.player.position.z);
    this.mobManager.update(this.timeOfDay, this.player, this.world);
    checkChestLoot(this.world, this.chunkManager, this.player, this.gameMode);
    if (this.hud) this.hud.update();
    if (this.heldItem) this.heldItem.update();
  }

  render() {
    this.renderer.render();
  }
}
