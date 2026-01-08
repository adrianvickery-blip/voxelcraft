import { ITEM, GAME_MODE } from "../shared/constants.js";

export default class FurnaceUI {
  constructor(player, gameMode) {
    this.player = player;
    this.gameMode = gameMode;
    this.opened = false;

    this.root = document.createElement("div");
    this.root.id = "furnace-root";
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
    panel.style.minWidth = "320px";
    panel.style.background = "rgba(20,20,30,0.96)";
    panel.style.borderRadius = "12px";
    panel.style.padding = "16px 18px";
    panel.style.boxShadow = "0 16px 40px rgba(0,0,0,0.8)";
    panel.style.border = "1px solid rgba(255,255,255,0.1)";
    this.root.appendChild(panel);

    const title = document.createElement("div");
    title.textContent = "Furnace";
    title.style.fontSize = "16px";
    title.style.fontWeight = "600";
    title.style.marginBottom = "8px";
    title.style.textAlign = "center";
    panel.appendChild(title);

    const hint = document.createElement("div");
    hint.textContent =
      "Uses fuel (Logs or Planks) from your hotbar · Press F to close";
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

    const makeRow = (labelText, onClick) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";
      row.style.fontSize = "13px";

      const label = document.createElement("div");
      label.textContent = labelText;
      row.appendChild(label);

      const btn = document.createElement("button");
      btn.textContent = "Smelt";
      btn.style.fontSize = "12px";
      btn.style.padding = "4px 10px";
      btn.style.borderRadius = "999px";
      btn.style.border = "none";
      btn.style.background = "linear-gradient(135deg,#ffb74d,#ff9800)";
      btn.style.color = "#111";
      btn.style.cursor = "pointer";
      btn.addEventListener("click", onClick);
      row.appendChild(btn);

      list.appendChild(row);
    };

    makeRow("1x Sand + 1x Fuel → 1x Glass", () => this.smeltSandToGlass());
    makeRow("4x Stone + 1x Fuel → 4x Bricks", () => this.smeltStoneToBricks());

    window.addEventListener("keydown", e => {
      if (e.code === "KeyF") {
        if (this.opened) {
          this.close();
        }
      }
    });
  }

  _hasFuel() {
    const logs = this.player.getItemCount(ITEM.LOG);
    const planks = this.player.getItemCount(ITEM.PLANKS);
    return logs + planks > 0;
  }

  _consumeOneFuel() {
    const logs = this.player.getItemCount(ITEM.LOG);
    if (logs > 0) {
      this.player.removeItems(ITEM.LOG, 1);
      return true;
    }
    const planks = this.player.getItemCount(ITEM.PLANKS);
    if (planks > 0) {
      this.player.removeItems(ITEM.PLANKS, 1);
      return true;
    }
    return false;
  }

  smeltSandToGlass() {
    if (this.gameMode !== GAME_MODE.SURVIVAL) return;
    if (!this.player) return;
    if (this.player.getItemCount(ITEM.SAND) < 1) {
      console.log("Not enough sand.");
      return;
    }
    if (!this._hasFuel()) {
      console.log("No fuel (logs or planks) available.");
      return;
    }
    this.player.removeItems(ITEM.SAND, 1);
    this._consumeOneFuel();
    this.player.addItem(ITEM.GLASS, 1);
    console.log("Smelted sand into glass in furnace.");
  }

  smeltStoneToBricks() {
    if (this.gameMode !== GAME_MODE.SURVIVAL) return;
    if (!this.player) return;
    if (this.player.getItemCount(ITEM.STONE) < 4) {
      console.log("Not enough stone.");
      return;
    }
    if (!this._hasFuel()) {
      console.log("No fuel (logs or planks) available.");
      return;
    }
    this.player.removeItems(ITEM.STONE, 4);
    this._consumeOneFuel();
    this.player.addItem(ITEM.BRICKS, 4);
    console.log("Smelted stone into bricks in furnace.");
  }

  open() {
    this.opened = true;
    this.root.style.display = "flex";
  }

  close() {
    this.opened = false;
    this.root.style.display = "none";
  }
}
