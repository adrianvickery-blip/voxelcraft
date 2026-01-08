import { ITEM, GAME_MODE } from "../shared/constants.js";

function itemLabel(item) {
  if (!item || !item.type || item.count <= 0) return "";
  switch (item.type) {
    case ITEM.DIRT:
      return "Dirt";
    case ITEM.PLANKS:
      return "Planks";
    case ITEM.WOOD_PICKAXE:
      return "Wood Pickaxe";
    case ITEM.FOOD:
      return "Food";
    case ITEM.LOG:
      return "Log";
    case ITEM.STICK:
      return "Stick";
    case ITEM.STONE:
      return "Stone";
    case ITEM.IRON:
      return "Iron";
    case ITEM.DIAMOND:
      return "Diamond";
    case ITEM.STONE_PICKAXE:
      return "Stone Pick";
    case ITEM.IRON_PICKAXE:
      return "Iron Pick";
    case ITEM.DIAMOND_PICKAXE:
      return "Diamond Pick";
    case ITEM.SAND:
      return "Sand";
    case ITEM.GLASS:
      return "Glass";
    case ITEM.BRICKS:
      return "Bricks";
    case ITEM.IRON_BLOCK:
      return "Iron Block";
    case ITEM.DIAMOND_BLOCK:
      return "Diamond Block";
    case ITEM.FLOWER:
      return "Flower";
    case ITEM.FURNACE:
      return "Furnace";
    case ITEM.COAL:
      return "Coal";
    case ITEM.CONCRETE_WHITE:
      return "Concrete (White)";
    case ITEM.CONCRETE_RED:
      return "Concrete (Red)";
    case ITEM.CONCRETE_BLUE:
      return "Concrete (Blue)";
    case ITEM.GLOWSTONE:
      return "Glowstone";
    case ITEM.WOOD_SWORD:
      return "Wood Sword";
    case ITEM.STONE_SWORD:
      return "Stone Sword";
    case ITEM.IRON_SWORD:
      return "Iron Sword";
    case ITEM.DIAMOND_SWORD:
      return "Diamond Sword";
    case ITEM.BOW:
      return "Bow";
    case ITEM.ARROW:
      return "Arrow";
    default:
      return "Item";
  }
}

function itemColor(type) {
  switch (type) {
    case ITEM.DIRT:
      return "#7a5130";
    case ITEM.PLANKS:
      return "#b58a4a";
    case ITEM.LOG:
      return "#8b5a2b";
    case ITEM.STONE:
      return "#888c8f";
    case ITEM.STICK:
      return "#a07040";
    case ITEM.IRON:
      return "#cfd8dc";
    case ITEM.DIAMOND:
      return "#4dd0e1";
    case ITEM.FOOD:
      return "#ff7043";
    case ITEM.WOOD_PICKAXE:
      return "#a1887f";
    case ITEM.STONE_PICKAXE:
      return "#90a4ae";
    case ITEM.IRON_PICKAXE:
      return "#eceff1";
    case ITEM.DIAMOND_PICKAXE:
      return "#80deea";
    case ITEM.SAND:
      return "#f5deb3";
    case ITEM.GLASS:
      return "#9fcfff";
    case ITEM.BRICKS:
      return "#b74c3b";
    case ITEM.IRON_BLOCK:
      return "#b0bec5";
    case ITEM.DIAMOND_BLOCK:
      return "#00e5ff";
    case ITEM.FLOWER:
      return "#ff80ab";
    case ITEM.FURNACE:
      return "#b0bec5";
    case ITEM.COAL:
      return "#424242";
    case ITEM.CONCRETE_WHITE:
      return "#f5f5f5";
    case ITEM.CONCRETE_RED:
      return "#e53935";
    case ITEM.CONCRETE_BLUE:
      return "#1e88e5";
    case ITEM.GLOWSTONE:
      return "#ffeb3b";
    case ITEM.WOOD_SWORD:
      return "#8d6e63";
    case ITEM.STONE_SWORD:
      return "#b0bec5";
    case ITEM.IRON_SWORD:
      return "#eceff1";
    case ITEM.DIAMOND_SWORD:
      return "#80deea";
    case ITEM.BOW:
      return "#6d4c41";
    case ITEM.ARROW:
      return "#cfd8dc";
    default:
      return "transparent";
  }
}

export default class HUD {
  constructor(player, gameMode) {
    this.player = player;
    this.gameMode = gameMode;
    this.root = document.createElement("div");
    this.root.id = "hud-root";
    this.root.style.position = "absolute";
    this.root.style.inset = "0";
    this.root.style.pointerEvents = "none";
    this.root.style.fontFamily =
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.root.style.color = "#fff";
    document.body.appendChild(this.root);

    this.stats = document.createElement("div");
    this.stats.style.position = "absolute";
    this.stats.style.left = "12px";
    this.stats.style.top = "10px";
    this.stats.style.fontSize = "12px";
    this.stats.style.padding = "6px 10px";
    this.stats.style.borderRadius = "999px";
    this.stats.style.background = "rgba(0,0,0,0.45)";
    this.root.appendChild(this.stats);

    this.hotbar = document.createElement("div");
    this.hotbar.style.position = "absolute";
    this.hotbar.style.bottom = "10px";
    this.hotbar.style.left = "50%";
    this.hotbar.style.transform = "translateX(-50%)";
    this.hotbar.style.display = "flex";
    this.hotbar.style.gap = "4px";
    this.root.appendChild(this.hotbar);

    this.slotEls = [];
    for (let i = 0; i < this.player.hotbarSize; i++) {
      const slot = document.createElement("div");
      slot.style.width = "40px";
      slot.style.height = "40px";
      slot.style.borderRadius = "6px";
      slot.style.border = "1px solid rgba(255,255,255,0.5)";
      slot.style.background = "rgba(0,0,0,0.45)";
      slot.style.display = "flex";
      slot.style.flexDirection = "column";
      slot.style.alignItems = "center";
      slot.style.justifyContent = "center";
      slot.style.fontSize = "9px";
      slot.style.pointerEvents = "none";

      const icon = document.createElement("div");
      icon.style.width = "18px";
      icon.style.height = "18px";
      icon.style.borderRadius = "3px";
      icon.style.marginBottom = "2px";
      icon.style.background = "transparent";

      const countEl = document.createElement("div");
      countEl.style.fontSize = "10px";
      countEl.style.opacity = "0.9";

      slot.appendChild(icon);
      slot.appendChild(countEl);

      this.hotbar.appendChild(slot);
      this.slotEls.push({ slot, icon, countEl });
    }

    this.update();
  }

  update() {
    if (this.gameMode === GAME_MODE.CREATIVE) {
      this.stats.style.display = "none";
    } else {
      this.stats.style.display = "block";
      const h = Math.round(this.player.health);
      const hh = Math.round(this.player.maxHealth);
      const hu = Math.round(this.player.hunger);
      const huMax = Math.round(this.player.maxHunger);
      this.stats.textContent = `HP ${h}/${hh}  |  Hunger ${hu}/${huMax}`;
    }

    for (let i = 0; i < this.player.hotbarSize; i++) {
      const slotData = this.player.hotbar[i];
      const els = this.slotEls[i];
      const isSelected = i === this.player.selectedSlot;
      els.slot.style.borderColor = isSelected
        ? "rgba(255,255,255,0.95)"
        : "rgba(255,255,255,0.5)";

      if (slotData && slotData.count > 0) {
        els.icon.style.background = itemColor(slotData.type);
        els.icon.style.opacity = "1";
        els.countEl.textContent =
          slotData.count > 1 ? String(slotData.count) : "";
        els.slot.style.opacity = "1";
      } else {
        els.icon.style.background = "transparent";
        els.countEl.textContent = "";
        els.slot.style.opacity = "0.35";
      }
    }
  }
}
