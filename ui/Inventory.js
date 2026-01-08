import { ITEM, GAME_MODE } from "../shared/constants.js";

const ALL_ITEMS = [
  ITEM.DIRT,
  ITEM.PLANKS,
  ITEM.LOG,
  ITEM.STONE,
  ITEM.SAND,
  ITEM.STICK,
  ITEM.FOOD,
  ITEM.IRON,
  ITEM.DIAMOND,
  ITEM.GLASS,
  ITEM.BRICKS,
  ITEM.IRON_BLOCK,
  ITEM.DIAMOND_BLOCK,
  ITEM.FLOWER,
  ITEM.FURNACE,
  ITEM.COAL,
  ITEM.CONCRETE_WHITE,
  ITEM.CONCRETE_RED,
  ITEM.CONCRETE_BLUE,
  ITEM.GLOWSTONE,
  ITEM.WOOD_SWORD,
  ITEM.STONE_SWORD,
  ITEM.IRON_SWORD,
  ITEM.DIAMOND_SWORD,
  ITEM.BOW,
  ITEM.ARROW,
  ITEM.WOOD_PICKAXE,
  ITEM.STONE_PICKAXE,
  ITEM.IRON_PICKAXE,
  ITEM.DIAMOND_PICKAXE,
];

function itemName(type) {
  switch (type) {
    case ITEM.DIRT: return "Dirt";
    case ITEM.PLANKS: return "Planks";
    case ITEM.LOG: return "Log";
    case ITEM.STONE: return "Stone";
    case ITEM.SAND: return "Sand";
    case ITEM.STICK: return "Stick";
    case ITEM.FOOD: return "Food";
    case ITEM.IRON: return "Iron";
    case ITEM.DIAMOND: return "Diamond";
    case ITEM.GLASS: return "Glass";
    case ITEM.BRICKS: return "Bricks";
    case ITEM.IRON_BLOCK: return "Iron Block";
    case ITEM.DIAMOND_BLOCK: return "Diamond Block";
    case ITEM.FLOWER: return "Flower";
    case ITEM.FURNACE: return "Furnace";
    case ITEM.COAL: return "Coal";
    case ITEM.CONCRETE_WHITE: return "Concrete (White)";
    case ITEM.CONCRETE_RED: return "Concrete (Red)";
    case ITEM.CONCRETE_BLUE: return "Concrete (Blue)";
    case ITEM.GLOWSTONE: return "Glowstone";
    case ITEM.WOOD_SWORD: return "Wood Sword";
    case ITEM.STONE_SWORD: return "Stone Sword";
    case ITEM.IRON_SWORD: return "Iron Sword";
    case ITEM.DIAMOND_SWORD: return "Diamond Sword";
    case ITEM.BOW: return "Bow";
    case ITEM.ARROW: return "Arrow";
    case ITEM.WOOD_PICKAXE: return "Wood Pickaxe";
    case ITEM.STONE_PICKAXE: return "Stone Pickaxe";
    case ITEM.IRON_PICKAXE: return "Iron Pickaxe";
    case ITEM.DIAMOND_PICKAXE: return "Diamond Pickaxe";
    default: return "Item";
  }
}

export default class InventoryUI {
  constructor(player, gameMode) {
    this.player = player;
    this.gameMode = gameMode;
    this.opened = false;

    this.root = document.createElement("div");
    this.root.id = "inventory-root";
    this.root.style.position = "absolute";
    this.root.style.inset = "0";
    this.root.style.display = "none";
    this.root.style.alignItems = "center";
    this.root.style.justifyContent = "center";
    this.root.style.background = "rgba(0,0,0,0.55)";
    this.root.style.pointerEvents = "auto";
    this.root.style.fontFamily =
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.root.style.color = "#fff";
    document.body.appendChild(this.root);

    const panel = document.createElement("div");
    panel.style.minWidth = "360px";
    panel.style.background = "rgba(20,20,30,0.96)";
    panel.style.borderRadius = "12px";
    panel.style.padding = "16px 18px";
    panel.style.boxShadow = "0 16px 40px rgba(0,0,0,0.8)";
    panel.style.border = "1px solid rgba(255,255,255,0.1)";
    this.root.appendChild(panel);

    const title = document.createElement("div");
    title.textContent = "Inventory";
    title.style.fontSize = "16px";
    title.style.fontWeight = "600";
    title.style.marginBottom = "8px";
    title.style.textAlign = "center";
    panel.appendChild(title);

    const hint = document.createElement("div");
    hint.textContent =
      "Press I to close · Survival: shows what you have · Creative: click items to get stacks";
    hint.style.fontSize = "11px";
    hint.style.opacity = "0.8";
    hint.style.marginBottom = "10px";
    hint.style.textAlign = "center";
    panel.appendChild(hint);

    const hotbarLabel = document.createElement("div");
    hotbarLabel.textContent = "Hotbar";
    hotbarLabel.style.fontSize = "12px";
    hotbarLabel.style.marginBottom = "4px";
    panel.appendChild(hotbarLabel);

    const hotbarRow = document.createElement("div");
    hotbarRow.style.display = "flex";
    hotbarRow.style.gap = "4px";
    hotbarRow.style.marginBottom = "10px";
    panel.appendChild(hotbarRow);

    this.hotbarSlots = [];
    for (let i = 0; i < this.player.hotbarSize; i++) {
      const cell = document.createElement("div");
      cell.style.flex = "1";
      cell.style.minWidth = "0";
      cell.style.height = "32px";
      cell.style.borderRadius = "6px";
      cell.style.border = "1px solid rgba(255,255,255,0.4)";
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.justifyContent = "center";
      cell.style.fontSize = "11px";
      hotbarRow.appendChild(cell);
      this.hotbarSlots.push(cell);
    }

    if (this.gameMode === GAME_MODE.CREATIVE) {
      const allLabel = document.createElement("div");
      allLabel.textContent = "All Items (Creative)";
      allLabel.style.fontSize = "12px";
      allLabel.style.marginBottom = "4px";
      panel.appendChild(allLabel);

      const allGrid = document.createElement("div");
      allGrid.style.display = "grid";
      allGrid.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
      allGrid.style.gap = "6px";
      panel.appendChild(allGrid);

      for (const type of ALL_ITEMS) {
        const btn = document.createElement("button");
        btn.textContent = itemName(type);
        btn.style.fontSize = "11px";
        btn.style.padding = "4px 6px";
        btn.style.borderRadius = "8px";
        btn.style.border = "1px solid rgba(255,255,255,0.2)";
        btn.style.background = "rgba(255,255,255,0.08)";
        btn.style.color = "#fff";
        btn.style.cursor = "pointer";
        btn.addEventListener("click", () => {
          if (this.player && this.player.addItem) {
            const isTool =
              type === ITEM.WOOD_PICKAXE ||
              type === ITEM.STONE_PICKAXE ||
              type === ITEM.IRON_PICKAXE ||
              type === ITEM.DIAMOND_PICKAXE;
            const count = isTool ? 1 : 64;
            this.player.addItem(type, count);
            this.refresh();
          }
        });
        allGrid.appendChild(btn);
      }
    }

    window.addEventListener("keydown", e => {
      if (e.code === "KeyI") {
        this.toggle();
      }
    });
  }

  toggle() {
    this.opened = !this.opened;
    this.root.style.display = this.opened ? "flex" : "none";
    if (this.opened) this.refresh();
  }

  refresh() {
    for (let i = 0; i < this.player.hotbarSize; i++) {
      const cell = this.hotbarSlots[i];
      const it = this.player.hotbar[i];
      if (it && it.count > 0) {
        cell.textContent =
          itemName(it.type) + (it.count > 1 ? ` x${it.count}` : "");
        cell.style.opacity = "1";
      } else {
        cell.textContent = "(empty)";
        cell.style.opacity = "0.6";
      }
    }
  }
}
