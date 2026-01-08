import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { ITEM } from "../shared/constants.js";

function itemColor(type) {
  switch (type) {
    case ITEM.DIRT: return 0x7a5130;
    case ITEM.PLANKS: return 0xb58a4a;
    case ITEM.LOG: return 0x8b5a2b;
    case ITEM.STONE: return 0x888c8f;
    case ITEM.SAND: return 0xf5deb3;
    case ITEM.FOOD: return 0xff7043;
    case ITEM.IRON: return 0xcfd8dc;
    case ITEM.DIAMOND: return 0x4dd0e1;
    case ITEM.WOOD_PICKAXE: return 0xa1887f;
    case ITEM.STONE_PICKAXE: return 0x90a4ae;
    case ITEM.IRON_PICKAXE: return 0xeceff1;
    case ITEM.DIAMOND_PICKAXE: return 0x80deea;
    case ITEM.GLASS: return 0x9fcfff;
    case ITEM.BRICKS: return 0xb74c3b;
    case ITEM.IRON_BLOCK: return 0xb0bec5;
    case ITEM.DIAMOND_BLOCK: return 0x00e5ff;
    case ITEM.FLOWER: return 0xff80ab;
    case ITEM.FURNACE: return 0xb0bec5;
    case ITEM.COAL: return 0x424242;
    case ITEM.CONCRETE_WHITE: return 0xf5f5f5;
    case ITEM.CONCRETE_RED: return 0xe53935;
    case ITEM.CONCRETE_BLUE: return 0x1e88e5;
    case ITEM.GLOWSTONE: return 0xffeb3b;
    case ITEM.WOOD_SWORD: return 0x8d6e63;
    case ITEM.STONE_SWORD: return 0xb0bec5;
    case ITEM.IRON_SWORD: return 0xeceff1;
    case ITEM.DIAMOND_SWORD: return 0x80deea;
    case ITEM.BOW: return 0x6d4c41;
    case ITEM.ARROW: return 0xcfd8dc;
    default: return 0xffffff;
  }
}

export default class HeldItem {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;

    const geom = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geom, mat);

    this.mesh.position.set(0.4, -0.4, -0.7);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    this.camera.add(this.mesh);
    this.mesh.visible = false;
  }

  update() {
    const item = this.player.getActiveItem();
    if (!item || !item.type || item.count <= 0) {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;
    const col = itemColor(item.type);
    this.mesh.material.color.setHex(col);

    const t = performance.now() * 0.003;
    this.mesh.position.y = -0.4 + Math.sin(t) * 0.02;
  }
}
