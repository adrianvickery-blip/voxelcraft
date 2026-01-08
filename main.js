import Engine from "./engine/Engine.js";
import { GAME_MODE, DEFAULT_WORLD_CONFIG } from "./shared/constants.js";

let engine = null;

function $(id) {
  return document.getElementById(id);
}

const nameInput = $("world-name");
const seedInput = $("seed");
const modeSelect = $("mode");
const baseHeightRange = $("base-height");
const ampRange = $("amplitude");
const baseHeightValue = $("base-height-value");
const ampValue = $("amplitude-value");
const createBtn = $("create-world");
const menu = $("world-menu");

function setPills() {
  if (baseHeightValue) baseHeightValue.textContent = String(baseHeightRange.value);
  if (ampValue) ampValue.textContent = String(ampRange.value);
}

function initDefaults() {
  if (!baseHeightRange || !ampRange) return;
  baseHeightRange.value = String(DEFAULT_WORLD_CONFIG.baseHeight ?? 8);
  ampRange.value = String(DEFAULT_WORLD_CONFIG.terrainAmplitude ?? 6);
  setPills();
}

initDefaults();

baseHeightRange?.addEventListener("input", setPills);
ampRange?.addEventListener("input", setPills);

createBtn?.addEventListener("click", () => {
  const worldName = (nameInput?.value || "").trim() || "New World";

  // Seed: allow blank = random, allow any text = hashed int
  const seedStr = (seedInput?.value || "").trim();
  let seed = 0;
  if (!seedStr) {
    seed = Math.floor(Math.random() * 1_000_000_000);
  } else {
    const asInt = parseInt(seedStr, 10);
    if (Number.isFinite(asInt)) {
      seed = asInt;
    } else {
      // simple string hash -> int seed
      let h = 2166136261;
      for (let i = 0; i < seedStr.length; i++) {
        h ^= seedStr.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      seed = h >>> 0;
    }
  }

  const modeValue = modeSelect?.value === GAME_MODE.CREATIVE ? GAME_MODE.CREATIVE : GAME_MODE.SURVIVAL;

  const baseHeight = parseInt(baseHeightRange?.value ?? DEFAULT_WORLD_CONFIG.baseHeight, 10);
  const terrainAmplitude = parseInt(ampRange?.value ?? DEFAULT_WORLD_CONFIG.terrainAmplitude, 10);

  // If an engine already exists (user clicked create twice), reload cleanly.
  // (Simplest reliable approach for now.)
  if (engine) {
    window.location.reload();
    return;
  }

  const options = {
    worldName,
    seed,
    gameMode: modeValue,
    worldConfig: {
      baseHeight,
      terrainAmplitude,
    },
  };

  engine = new Engine(options);
  engine.start();

  if (menu) menu.style.display = "none";
});
