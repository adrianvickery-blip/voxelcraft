import { ITEM, GAME_MODE } from "../shared/constants.js";

export default class CraftingUI {
  constructor(player, gameMode) {
    this.player = player;
    this.gameMode = gameMode;
    this.opened = false;

    this.root = document.createElement("div");
    this.root.id = "crafting-root";
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
    title.textContent = "Crafting / Smelting";
    title.style.fontSize = "16px";
    title.style.fontWeight = "600";
    title.style.marginBottom = "10px";
    title.style.textAlign = "center";
    panel.appendChild(title);

    const hint = document.createElement("div");
    hint.textContent = "Press C to close · Uses items from your hotbar";
    hint.style.fontSize = "11px";
    hint.style.opacity = "0.8";
    hint.style.marginBottom = "10px";
    hint.style.textAlign = "center";
    panel.appendChild(hint);

    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "8px";
    panel.appendChild(list);

    const recipes = [
      {
        id: "LOG_TO_PLANKS",
        label: "1x Log → 4x Planks",
        cost: [{ type: ITEM.LOG, count: 1 }],
        gain: [{ type: ITEM.PLANKS, count: 4 }],
      },
      {
        id: "PLANKS_TO_STICKS",
        label: "2x Planks → 4x Sticks",
        cost: [{ type: ITEM.PLANKS, count: 2 }],
        gain: [{ type: ITEM.STICK, count: 4 }],
      },
      {
        id: "PICKAXE_WOOD",
        label: "3x Planks + 2x Sticks → 1x Wood Pickaxe",
        cost: [
          { type: ITEM.PLANKS, count: 3 },
          { type: ITEM.STICK, count: 2 },
        ],
        gain: [{ type: ITEM.WOOD_PICKAXE, count: 1 }],
      },
      {
        id: "PICKAXE_STONE",
        label: "3x Stone + 2x Sticks → 1x Stone Pickaxe",
        cost: [
          { type: ITEM.STONE, count: 3 },
          { type: ITEM.STICK, count: 2 },
        ],
        gain: [{ type: ITEM.STONE_PICKAXE, count: 1 }],
      },
      {
        id: "PICKAXE_IRON",
        label: "3x Iron + 2x Sticks → 1x Iron Pickaxe",
        cost: [
          { type: ITEM.IRON, count: 3 },
          { type: ITEM.STICK, count: 2 },
        ],
        gain: [{ type: ITEM.IRON_PICKAXE, count: 1 }],
      },
      {
        id: "PICKAXE_DIAMOND",
        label: "3x Diamond + 2x Sticks → 1x Diamond Pickaxe",
        cost: [
          { type: ITEM.DIAMOND, count: 3 },
          { type: ITEM.STICK, count: 2 },
        ],
        gain: [{ type: ITEM.DIAMOND_PICKAXE, count: 1 }],
      },
      // "Smelting"-style recipes
      {
        id: "SMELT_SAND_GLASS",
        label: "1x Sand → 1x Glass",
        cost: [{ type: ITEM.SAND, count: 1 }],
        gain: [{ type: ITEM.GLASS, count: 1 }],
      },
      {
        id: "STONE_TO_BRICKS",
        label: "4x Stone → 4x Bricks",
        cost: [{ type: ITEM.STONE, count: 4 }],
        gain: [{ type: ITEM.BRICKS, count: 4 }],
      },
      // Storage block recipes
      {
        id: "IRON_BLOCK",
        label: "9x Iron → 1x Iron Block",
        cost: [{ type: ITEM.IRON, count: 9 }],
        gain: [{ type: ITEM.IRON_BLOCK, count: 1 }],
      },
      {
        id: "IRON_BLOCK_UNPACK",
        label: "1x Iron Block → 9x Iron",
        cost: [{ type: ITEM.IRON_BLOCK, count: 1 }],
        gain: [{ type: ITEM.IRON, count: 9 }],
      },
      {
        id: "DIAMOND_BLOCK",
        label: "9x Diamond → 1x Diamond Block",
        cost: [{ type: ITEM.DIAMOND, count: 9 }],
        gain: [{ type: ITEM.DIAMOND_BLOCK, count: 1 }],
      },
      {
        id: "DIAMOND_BLOCK_UNPACK",
        label: "1x Diamond Block → 9x Diamond",
        cost: [{ type: ITEM.DIAMOND_BLOCK, count: 1 }],
        gain: [{ type: ITEM.DIAMOND, count: 9 }],
      },
      // Furnace crafting recipe
      {
        id: "FURNACE",
        label: "8x Stone → 1x Furnace",
        cost: [{ type: ITEM.STONE, count: 8 }],
        gain: [{ type: ITEM.FURNACE, count: 1 }],
      },
    ];

    this.recipes = recipes;

    for (const recipe of recipes) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";
      row.style.fontSize = "13px";

      const label = document.createElement("div");
      label.textContent = recipe.label;
      row.appendChild(label);

      const btn = document.createElement("button");
      btn.textContent = "Craft";
      btn.style.fontSize = "12px";
      btn.style.padding = "4px 10px";
      btn.style.borderRadius = "999px";
      btn.style.border = "none";
      btn.style.background = "linear-gradient(135deg,#8bc34a,#cddc39)";
      btn.style.color = "#111";
      btn.style.cursor = "pointer";
      btn.addEventListener("click", () => this.tryCraft(recipe));
      row.appendChild(btn);

      list.appendChild(row);
    }

    window.addEventListener("keydown", e => {
      if (e.code === "KeyC") {
        this.toggle();
      }
    });
  }

  toggle() {
    this.opened = !this.opened;
    this.root.style.display = this.opened ? "flex" : "none";
  }

  tryCraft(recipe) {
    if (this.gameMode !== GAME_MODE.SURVIVAL) return;
    if (!this.player || !this.player.getItemCount || !this.player.removeItems) return;

    for (const c of recipe.cost) {
      const have = this.player.getItemCount(c.type);
      if (have < c.count) {
        console.log("Not enough resources to craft:", recipe.label);
        return;
      }
    }

    for (const c of recipe.cost) {
      this.player.removeItems(c.type, c.count);
    }

    for (const g of recipe.gain) {
      this.player.addItem(g.type, g.count);
    }

    console.log("Crafted:", recipe.label);
  }
}
