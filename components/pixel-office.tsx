"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

/* ═══════════════════════════════════════════════════════════════════════
   GEM HQ — 3D Minecraft-Style Office
   Three.js voxel scene with 7 pixel-art agents and idle animations
   ═══════════════════════════════════════════════════════════════════════ */

interface Agent3D {
  id: string;
  name: string;
  role: string;
  color: string;
  position: [number, number, number];
}

// Agents en cercle rayon 10 autour du QG
const R = 10;
const AGENTS_3D: Agent3D[] = [
  { id: "george", name: "George", role: "CEO",      color: "#6366f1", position: [Math.cos(0)*R,           0, Math.sin(0)*R] },
  { id: "rex",    name: "Rex",    role: "Factory",   color: "#f97316", position: [Math.cos(Math.PI*2/7)*R, 0, Math.sin(Math.PI*2/7)*R] },
  { id: "leo",    name: "Leo",    role: "Content",   color: "#22c55e", position: [Math.cos(Math.PI*4/7)*R, 0, Math.sin(Math.PI*4/7)*R] },
  { id: "iris",   name: "Iris",   role: "Analyst",   color: "#ec4899", position: [Math.cos(Math.PI*6/7)*R, 0, Math.sin(Math.PI*6/7)*R] },
  { id: "atlas",  name: "Atlas",  role: "Library",   color: "#8b5cf6", position: [Math.cos(Math.PI*8/7)*R, 0, Math.sin(Math.PI*8/7)*R] },
  { id: "scout",  name: "Scout",  role: "Trend",     color: "#06b6d4", position: [Math.cos(Math.PI*10/7)*R,0, Math.sin(Math.PI*10/7)*R] },
  { id: "hugo",   name: "Hugo",   role: "Leads",     color: "#ef4444", position: [Math.cos(Math.PI*12/7)*R,0, Math.sin(Math.PI*12/7)*R] },
];

// Bulles de dialogue par agent et par statut
const AGENT_BUBBLES: Record<string, string[]> = {
  george: ["📋 Briefing en cours...", "🧠 Analyse la situation", "📡 Coordination des agents", "✅ Tout sous contrôle"],
  rex:    ["⚙️ Building...", "🔧 Debugging...", "🚀 Deploy en cours!", "💻 Code en review"],
  leo:    ["✍️ Script en cours...", "🪝 Hook validé CGOVE", "📱 Brief du jour prêt", "💡 Nouvelle idée content"],
  iris:   ["📊 Analyse les stats...", "🔍 Pattern détecté!", "📈 Score: 24/30", "⚠️ Flop à investiguer"],
  atlas:  ["📚 Import Word en cours", "🗂️ Base de connaissance OK", "💾 Mémoire distillée", "📖 Frameworks extraits"],
  scout:  ["👀 Veille Instagram...", "🔥 Trend détecté!", "📊 Concurrent analysé", "💡 Format viral trouvé"],
  hugo:   ["🤝 Lead qualifié", "📧 Outreach en prépa", "🎯 Joaillier ciblé", "💼 Pipeline B2B actif"],
};

// ─── Minecraft-style block colors ────────────────────────────────────
const COLORS = {
  grassTop: 0x5d8a2e,
  grassSide: 0x8b6914,
  dirt: 0x6b4423,
  stone: 0x808080,
  stoneDark: 0x606060,
  plank: 0xb8860b,
  plankLight: 0xc8960b,
  glass: 0x88ccff,
  roof: 0x8b0000,
  skin: 0xffcba4,
  skinDark: 0xe0a87c,
};

// ─── Create a Minecraft-style grass block ────────────────────────────
function createGrassBlock(size = 1): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const materials = [
    new THREE.MeshLambertMaterial({ color: COLORS.grassSide }), // right
    new THREE.MeshLambertMaterial({ color: COLORS.grassSide }), // left
    new THREE.MeshLambertMaterial({ color: COLORS.grassTop }), // top
    new THREE.MeshLambertMaterial({ color: COLORS.dirt }), // bottom
    new THREE.MeshLambertMaterial({ color: COLORS.grassSide }), // front
    new THREE.MeshLambertMaterial({ color: COLORS.grassSide }), // back
  ];
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ─── Create the ground plane with Minecraft blocks ───────────────────
function createGround(scene: THREE.Scene): void {
  const gridSize = 30; // Expanded from 14 to 30 for ~60x60 map
  const pathMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 }); // Dirt path
  const dirtMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });

  for (let x = -gridSize; x <= gridSize; x++) {
    for (let z = -gridSize; z <= gridSize; z++) {
      // Create dirt path from building to front (z = -4 to z = 6, x = -1 to 1)
      const isPath = (Math.abs(x) <= 1 && z >= -4 && z <= 8) ||
                     (Math.abs(z - 2) <= 1 && x >= -6 && x <= 6);

      if (isPath) {
        const materials = [
          dirtMat, dirtMat,
          pathMat, // top
          dirtMat,
          dirtMat, dirtMat,
        ];
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const block = new THREE.Mesh(geo, materials);
        block.position.set(x, -0.5, z);
        block.receiveShadow = true;
        scene.add(block);
      } else {
        const block = createGrassBlock(1);
        block.position.set(x, -0.5, z);
        scene.add(block);
      }
    }
  }
}

// ─── Create the office building ──────────────────────────────────────
function createBuilding(scene: THREE.Scene): void {
  const stoneGeo = new THREE.BoxGeometry(1, 1, 1);
  const stoneMat = new THREE.MeshLambertMaterial({ color: COLORS.stone });
  const stoneDarkMat = new THREE.MeshLambertMaterial({ color: COLORS.stoneDark });
  const plankMat = new THREE.MeshLambertMaterial({ color: COLORS.plank });
  const glassMat = new THREE.MeshLambertMaterial({
    color: COLORS.glass,
    transparent: true,
    opacity: 0.4,
  });
  const roofMat = new THREE.MeshLambertMaterial({ color: COLORS.roof });

  // Floor of the building
  for (let x = -5; x <= 5; x++) {
    for (let z = -6; z <= -4; z++) {
      const floor = new THREE.Mesh(stoneGeo, plankMat);
      floor.position.set(x, 0, z);
      floor.receiveShadow = true;
      scene.add(floor);
    }
  }

  // Back wall (z = -6)
  for (let x = -5; x <= 5; x++) {
    for (let y = 1; y <= 4; y++) {
      const mat = (x + y) % 3 === 0 ? stoneDarkMat : stoneMat;
      const block = new THREE.Mesh(stoneGeo, mat);
      block.position.set(x, y, -6);
      block.castShadow = true;
      scene.add(block);
    }
  }

  // Side walls
  for (let z = -6; z <= -4; z++) {
    for (let y = 1; y <= 4; y++) {
      // Left wall
      const leftBlock = new THREE.Mesh(stoneGeo, stoneMat);
      leftBlock.position.set(-5, y, z);
      leftBlock.castShadow = true;
      scene.add(leftBlock);

      // Right wall
      const rightBlock = new THREE.Mesh(stoneGeo, stoneMat);
      rightBlock.position.set(5, y, z);
      rightBlock.castShadow = true;
      scene.add(rightBlock);
    }
  }

  // Windows in back wall
  const windowPositions = [-3, -1, 1, 3];
  for (const wx of windowPositions) {
    for (let wy = 2; wy <= 3; wy++) {
      const win = new THREE.Mesh(stoneGeo, glassMat);
      win.position.set(wx, wy, -5.9);
      scene.add(win);
    }
  }

  // Roof
  for (let x = -6; x <= 6; x++) {
    for (let z = -7; z <= -3; z++) {
      const roofBlock = new THREE.Mesh(stoneGeo, roofMat);
      roofBlock.position.set(x, 5, z);
      roofBlock.castShadow = true;
      scene.add(roofBlock);
    }
  }

  // Desk blocks inside
  const deskMat = new THREE.MeshLambertMaterial({ color: COLORS.plankLight });
  for (let x = -3; x <= 3; x++) {
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 0.9),
      deskMat
    );
    desk.position.set(x, 0.8, -5);
    desk.castShadow = true;
    scene.add(desk);
  }

  // Front pillars
  for (let y = 1; y <= 4; y++) {
    const pL = new THREE.Mesh(stoneGeo, stoneDarkMat);
    pL.position.set(-5, y, -4);
    pL.castShadow = true;
    scene.add(pL);

    const pR = new THREE.Mesh(stoneGeo, stoneDarkMat);
    pR.position.set(5, y, -4);
    pR.castShadow = true;
    scene.add(pR);
  }

}

// ─── Torches & Fireplace ─────────────────────────────────────────────
interface TorchData {
  flames: THREE.Mesh[];
  lights: THREE.PointLight[];
  fireplaceFlame: THREE.Mesh;
  fireplaceLight: THREE.PointLight;
}

function createTorchesAndFireplace(scene: THREE.Scene): TorchData {
  const torchGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15);
  const torchMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
  const flameGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);

  const flames: THREE.Mesh[] = [];
  const lights: THREE.PointLight[] = [];

  // Existing 4 wall torches
  const torchPositions = [
    [-5.5, 3, -4], [5.5, 3, -4],
    [-5.5, 3, -6], [5.5, 3, -6],
  ];

  for (const [tx, ty, tz] of torchPositions) {
    const torch = new THREE.Mesh(torchGeo, torchMat);
    torch.position.set(tx, ty, tz);
    scene.add(torch);

    const flame = new THREE.Mesh(flameGeo, flameMat.clone());
    flame.position.set(tx, ty + 0.4, tz);
    scene.add(flame);
    flames.push(flame);

    const torchLight = new THREE.PointLight(0xff6600, 1.8, 14);
    torchLight.position.set(tx, ty + 0.5, tz);
    scene.add(torchLight);
    lights.push(torchLight);

    // 2nd smaller flame per torch
    const flame2Geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const flame2 = new THREE.Mesh(flame2Geo, flameMat.clone());
    flame2.position.set(tx + 0.05, ty + 0.45, tz + 0.05);
    scene.add(flame2);
    flames.push(flame2);
  }

  // ═══ CENTRAL FIREPLACE ═══
  // Stone base (ring of stone blocks)
  const stoneGeo = new THREE.BoxGeometry(0.5, 0.3, 0.5);
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x606060 });
  const fireplaceStones = [
    [-0.5, 0, 1.5], [0.5, 0, 1.5], [0, 0, 1], [0, 0, 2],
    [-0.5, 0, 1], [0.5, 0, 1], [-0.5, 0, 2], [0.5, 0, 2],
  ];
  for (const [sx, sy, sz] of fireplaceStones) {
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(sx, sy + 0.15, sz);
    stone.castShadow = true;
    scene.add(stone);
  }

  // Log blocks inside
  const logGeo = new THREE.BoxGeometry(0.3, 0.2, 0.8);
  const logMat = new THREE.MeshLambertMaterial({ color: 0x5c3317 });
  const log1 = new THREE.Mesh(logGeo, logMat);
  log1.position.set(-0.1, 0.35, 1.5);
  log1.rotation.y = 0.3;
  scene.add(log1);
  const log2 = new THREE.Mesh(logGeo, logMat);
  log2.position.set(0.1, 0.35, 1.5);
  log2.rotation.y = -0.3;
  scene.add(log2);

  // Fire flame blocks (multiple small cubes for the fire)
  const fireFlameMat = new THREE.MeshBasicMaterial({
    color: 0xff4400,
    transparent: true,
    opacity: 0.9,
  });
  const fireFlameGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
  const fireplaceFlame = new THREE.Mesh(fireFlameGeo, fireFlameMat);
  fireplaceFlame.position.set(0, 0.6, 1.5);
  scene.add(fireplaceFlame);

  // Extra flame particles
  const smallFlameGeo = new THREE.BoxGeometry(0.2, 0.3, 0.2);
  const smallFlameMat1 = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.7 });
  const sf1 = new THREE.Mesh(smallFlameGeo, smallFlameMat1);
  sf1.position.set(-0.15, 0.8, 1.4);
  scene.add(sf1);
  flames.push(sf1);
  const smallFlameMat2 = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.7 });
  const sf2 = new THREE.Mesh(smallFlameGeo, smallFlameMat2);
  sf2.position.set(0.15, 0.8, 1.6);
  scene.add(sf2);
  flames.push(sf2);

  // 2 additional flame meshes around the main flame
  const extraFlameGeo = new THREE.BoxGeometry(0.25, 0.35, 0.25);
  const extraFlameMat1 = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 });
  const ef1 = new THREE.Mesh(extraFlameGeo, extraFlameMat1);
  ef1.position.set(-0.2, 0.55, 1.35);
  scene.add(ef1);
  flames.push(ef1);
  const extraFlameMat2 = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.75 });
  const ef2 = new THREE.Mesh(extraFlameGeo, extraFlameMat2);
  ef2.position.set(0.2, 0.5, 1.65);
  scene.add(ef2);
  flames.push(ef2);

  // Fireplace PointLight (big warm light)
  const fireplaceLight = new THREE.PointLight(0xff6622, 3.5, 22);
  fireplaceLight.position.set(0, 1.2, 1.5);
  fireplaceLight.castShadow = true;
  scene.add(fireplaceLight);

  // 2nd PointLight near the fireplace
  const fireplaceLight2 = new THREE.PointLight(0xff8800, 2.0, 15);
  fireplaceLight2.position.set(0, 0.8, 1.5);
  scene.add(fireplaceLight2);

  return { flames, lights, fireplaceFlame, fireplaceLight };
}

// ─── Create trees ────────────────────────────────────────────────────
function createTree(scene: THREE.Scene, x: number, z: number): void {
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3317 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
  const blockGeo = new THREE.BoxGeometry(1, 1, 1);

  // Trunk
  for (let y = 0; y < 4; y++) {
    const trunk = new THREE.Mesh(blockGeo, trunkMat);
    trunk.position.set(x, y + 0.5, z);
    trunk.castShadow = true;
    scene.add(trunk);
  }

  // Leaves (cube canopy)
  for (let lx = -1; lx <= 1; lx++) {
    for (let lz = -1; lz <= 1; lz++) {
      for (let ly = 0; ly <= 1; ly++) {
        if (lx === 0 && lz === 0 && ly === 0) continue;
        const leaf = new THREE.Mesh(blockGeo, leafMat);
        leaf.position.set(x + lx, 4.5 + ly, z + lz);
        leaf.castShadow = true;
        scene.add(leaf);
      }
    }
  }
  // Top leaf
  const topLeaf = new THREE.Mesh(blockGeo, leafMat);
  topLeaf.position.set(x, 6.5, z);
  topLeaf.castShadow = true;
  scene.add(topLeaf);
}

// ─── Create a tall jungle tree ──────────────────────────────────────
function createJungleTree(scene: THREE.Scene, x: number, z: number): void {
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x1a6b1a });
  const darkLeafMat = new THREE.MeshLambertMaterial({ color: 0x0d5c0d });
  const blockGeo = new THREE.BoxGeometry(1, 1, 1);

  // Taller trunk (5-7 blocks)
  const trunkHeight = 5 + Math.floor(Math.random() * 3);
  for (let y = 0; y < trunkHeight; y++) {
    const trunk = new THREE.Mesh(blockGeo, trunkMat);
    trunk.position.set(x, y + 0.5, z);
    trunk.castShadow = true;
    scene.add(trunk);
  }

  // Wider canopy (3x3x2 with some random gaps)
  for (let lx = -2; lx <= 2; lx++) {
    for (let lz = -2; lz <= 2; lz++) {
      for (let ly = 0; ly <= 2; ly++) {
        if (lx === 0 && lz === 0 && ly === 0) continue;
        // Random gaps for organic look
        if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && Math.random() > 0.4) continue;
        const mat = Math.random() > 0.5 ? leafMat : darkLeafMat;
        const leaf = new THREE.Mesh(blockGeo, mat);
        leaf.position.set(x + lx, trunkHeight + 0.5 + ly, z + lz);
        leaf.castShadow = true;
        scene.add(leaf);
      }
    }
  }
  // Top leaves
  const top1 = new THREE.Mesh(blockGeo, leafMat);
  top1.position.set(x, trunkHeight + 3.5, z);
  top1.castShadow = true;
  scene.add(top1);
}

// ─── Create jungle bush ─────────────────────────────────────────────
function createBush(scene: THREE.Scene, x: number, z: number): void {
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2d8b2d });
  const blockGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);

  for (let bx = -0.5; bx <= 0.5; bx += 1) {
    for (let bz = -0.5; bz <= 0.5; bz += 1) {
      const bush = new THREE.Mesh(blockGeo, leafMat);
      bush.position.set(x + bx, 0.35, z + bz);
      bush.castShadow = true;
      scene.add(bush);
    }
  }
}

// ─── Create a Mine at edges ──────────────────────────────────────────
interface MineData {
  diamonds: THREE.Mesh[];
}

function createMine(scene: THREE.Scene, x: number, z: number): MineData {
  const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x505050 });
  const blockGeo = new THREE.BoxGeometry(1, 1, 1);
  const diamonds: THREE.Mesh[] = [];

  // Build the mine entrance structure (3x3 opening facing center of map)
  // Determine which direction the mine faces based on position
  const facingX = x !== 0;
  const dirX = x > 0 ? -1 : 1;
  const dirZ = z > 0 ? -1 : 1;

  // Stone frame around the 3x3 opening
  for (let a = -2; a <= 2; a++) {
    for (let y = 0; y <= 4; y++) {
      // Only build the frame (border), not the inner 3x3 opening
      const isOpening = Math.abs(a) <= 1 && y >= 0 && y <= 2;
      if (isOpening) continue;

      const mat = (a + y) % 2 === 0 ? darkStoneMat : stoneMat;
      const block = new THREE.Mesh(blockGeo, mat);
      if (facingX) {
        block.position.set(x, y + 0.5, z + a);
      } else {
        block.position.set(x + a, y + 0.5, z);
      }
      block.castShadow = true;
      scene.add(block);
    }
  }

  // Tunnel depth (3 blocks deep)
  for (let d = 1; d <= 3; d++) {
    for (let a = -2; a <= 2; a++) {
      for (let y = 0; y <= 4; y++) {
        const isOpening = Math.abs(a) <= 1 && y >= 0 && y <= 2;
        if (isOpening) continue;

        const mat = (a + y + d) % 2 === 0 ? darkStoneMat : stoneMat;
        const block = new THREE.Mesh(blockGeo, mat);
        if (facingX) {
          block.position.set(x + d * (-dirX), y + 0.5, z + a);
        } else {
          block.position.set(x + a, y + 0.5, z + d * (-dirZ));
        }
        block.castShadow = true;
        scene.add(block);
      }
    }
    // Ceiling for tunnel
    for (let a = -1; a <= 1; a++) {
      const ceilBlock = new THREE.Mesh(blockGeo, darkStoneMat);
      if (facingX) {
        ceilBlock.position.set(x + d * (-dirX), 3.5, z + a);
      } else {
        ceilBlock.position.set(x + a, 3.5, z + d * (-dirZ));
      }
      scene.add(ceilBlock);
    }
  }

  // 6 diamonds per mine
  const diamondMat = new THREE.MeshLambertMaterial({
    color: 0x00bfff,
    transparent: true,
    opacity: 0.8,
  });

  const diamondOffsets: [number, number, number][] = [
    [-1.5, 1.5, 0.5], [1.5, 1.5, 0.5], [0, 2.5, -0.5],
    [-1, 0.5, 1], [1, 0.5, 1], [0, 3.5, 0],
  ];

  for (const [dx, dy, dz] of diamondOffsets) {
    const diamondGeo = new THREE.IcosahedronGeometry(0.15);
    const diamond = new THREE.Mesh(diamondGeo, diamondMat.clone());
    if (facingX) {
      diamond.position.set(x + dz * dirX, dy, z + dx);
    } else {
      diamond.position.set(x + dx, dy, z + dz * dirZ);
    }
    diamond.castShadow = true;
    scene.add(diamond);
    diamonds.push(diamond);
  }

  return { diamonds };
}

// ─── Create Miner NPC ────────────────────────────────────────────────
interface MinerData {
  group: THREE.Group;
  rightArm: THREE.Mesh;
  offset: number;
}

function createMiner(scene: THREE.Scene, position: [number, number, number]): MinerData {
  const group = new THREE.Group();
  const offset = Math.random() * Math.PI * 2;

  // Miner body colors
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x6b5b3a }); // brown clothing
  const legMat = new THREE.MeshLambertMaterial({ color: 0x555555 }); // gray pants
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 }); // skin
  const helmetMat = new THREE.MeshLambertMaterial({ color: 0xccaa00 }); // yellow helmet

  // Head
  const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);

  // Helmet
  const helmetGeo = new THREE.BoxGeometry(0.55, 0.2, 0.55);
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.y = 1.85;
  helmet.castShadow = true;
  group.add(helmet);

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.5, 0.65, 0.35);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.95;
  body.castShadow = true;
  group.add(body);

  // Left arm
  const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.25);
  const leftArmGeo = armGeo.clone();
  leftArmGeo.translate(0, -0.3, 0);
  const leftArm = new THREE.Mesh(leftArmGeo, bodyMat);
  leftArm.position.set(-0.34, 1.25, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  // Right arm (animated for mining)
  const rightArmGeo = armGeo.clone();
  rightArmGeo.translate(0, -0.3, 0);
  const rightArm = new THREE.Mesh(rightArmGeo, bodyMat);
  rightArm.position.set(0.34, 1.25, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // Pickaxe in right hand
  const pickGeo = new THREE.BoxGeometry(0.06, 0.45, 0.06);
  const pickMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const pick = new THREE.Mesh(pickGeo, pickMat);
  pick.position.set(0.34, 0.7, 0.2);
  pick.castShadow = true;
  group.add(pick);

  // Legs
  const legGeoShape = new THREE.BoxGeometry(0.2, 0.55, 0.25);
  const leftLegGeo = legGeoShape.clone();
  leftLegGeo.translate(0, -0.275, 0);
  const leftLeg = new THREE.Mesh(leftLegGeo, legMat);
  leftLeg.position.set(-0.12, 0.6, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLegGeo = legGeoShape.clone();
  rightLegGeo.translate(0, -0.275, 0);
  const rightLeg = new THREE.Mesh(rightLegGeo, legMat);
  rightLeg.position.set(0.12, 0.6, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  group.position.set(position[0], position[1], position[2]);
  scene.add(group);

  return { group, rightArm, offset };
}

// ─── Create Waterfall ────────────────────────────────────────────────
interface WaterfallData {
  blocks: THREE.Mesh[];
  baseY: number;
  height: number;
}

function createWaterfall(scene: THREE.Scene, x: number, z: number): WaterfallData {
  const waterMat = new THREE.MeshLambertMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.7,
  });

  const blocks: THREE.Mesh[] = [];
  const height = 10;

  // Stack of water blocks
  for (let i = 0; i < height; i++) {
    const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const block = new THREE.Mesh(geo, waterMat.clone());
    block.position.set(x, i * 0.8 + 0.4, z);
    block.castShadow = false;
    scene.add(block);
    blocks.push(block);
  }

  // Some rocks at the base
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
  const rockPositions: [number, number, number][] = [
    [x - 0.6, 0.2, z + 0.5],
    [x + 0.6, 0.15, z + 0.3],
    [x, 0.1, z + 0.7],
    [x - 0.3, 0.15, z - 0.5],
    [x + 0.4, 0.2, z - 0.4],
  ];
  for (const [rx, ry, rz] of rockPositions) {
    const rockGeo = new THREE.BoxGeometry(
      0.4 + Math.random() * 0.3,
      0.3 + Math.random() * 0.2,
      0.4 + Math.random() * 0.3
    );
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(rx, ry, rz);
    rock.castShadow = true;
    scene.add(rock);
  }

  // Water pool at base
  const poolMat = new THREE.MeshLambertMaterial({
    color: 0x3377ee,
    transparent: true,
    opacity: 0.5,
  });
  for (let px = -1; px <= 1; px++) {
    for (let pz = -1; pz <= 1; pz++) {
      const poolGeo = new THREE.BoxGeometry(1, 0.2, 1);
      const pool = new THREE.Mesh(poolGeo, poolMat);
      pool.position.set(x + px, 0.1, z + pz);
      scene.add(pool);
    }
  }

  return { blocks, baseY: 0.4, height };
}

// ─── Create Pig ──────────────────────────────────────────────────────
interface AnimalData {
  group: THREE.Group;
  offset: number;
  baseX: number;
  baseZ: number;
}

function createPig(scene: THREE.Scene, x: number, z: number): AnimalData {
  const group = new THREE.Group();
  const pinkMat = new THREE.MeshLambertMaterial({ color: 0xffaaaa });
  const darkPinkMat = new THREE.MeshLambertMaterial({ color: 0xee8888 });
  const offset = Math.random() * Math.PI * 2;

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.7, 0.5, 1.0);
  const body = new THREE.Mesh(bodyGeo, pinkMat);
  body.position.y = 0.45;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.45, 0.4, 0.4);
  const head = new THREE.Mesh(headGeo, pinkMat);
  head.position.set(0, 0.55, 0.6);
  head.castShadow = true;
  group.add(head);

  // Snout
  const snoutGeo = new THREE.BoxGeometry(0.2, 0.15, 0.1);
  const snout = new THREE.Mesh(snoutGeo, darkPinkMat);
  snout.position.set(0, 0.48, 0.82);
  group.add(snout);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.05);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12, 0.62, 0.81);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12, 0.62, 0.81);
  group.add(rightEye);

  // 4 legs
  const legGeo = new THREE.BoxGeometry(0.15, 0.25, 0.15);
  const legPositions: [number, number, number][] = [
    [-0.22, 0.12, -0.35],
    [0.22, 0.12, -0.35],
    [-0.22, 0.12, 0.35],
    [0.22, 0.12, 0.35],
  ];
  for (const [lx, ly, lz] of legPositions) {
    const leg = new THREE.Mesh(legGeo, pinkMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    group.add(leg);
  }

  group.position.set(x, 0, z);
  scene.add(group);

  return { group, offset, baseX: x, baseZ: z };
}

// ─── Create Cow ──────────────────────────────────────────────────────
function createCow(scene: THREE.Scene, x: number, z: number): AnimalData {
  const group = new THREE.Group();
  const brownMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  const offset = Math.random() * Math.PI * 2;

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 1.2);
  const body = new THREE.Mesh(bodyGeo, brownMat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // White patches on body
  const patchGeo1 = new THREE.BoxGeometry(0.3, 0.25, 0.42);
  const patch1 = new THREE.Mesh(patchGeo1, whiteMat);
  patch1.position.set(-0.28, 0.6, 0.1);
  group.add(patch1);
  const patchGeo2 = new THREE.BoxGeometry(0.25, 0.2, 0.35);
  const patch2 = new THREE.Mesh(patchGeo2, whiteMat);
  patch2.position.set(0.3, 0.5, -0.3);
  group.add(patch2);

  // Head
  const headGeo = new THREE.BoxGeometry(0.5, 0.45, 0.45);
  const head = new THREE.Mesh(headGeo, brownMat);
  head.position.set(0, 0.65, 0.75);
  head.castShadow = true;
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.05);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.14, 0.72, 0.98);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.14, 0.72, 0.98);
  group.add(rightEye);

  // Horns
  const hornGeo = new THREE.BoxGeometry(0.06, 0.15, 0.06);
  const hornMat = new THREE.MeshLambertMaterial({ color: 0xccccaa });
  const leftHorn = new THREE.Mesh(hornGeo, hornMat);
  leftHorn.position.set(-0.2, 0.95, 0.75);
  group.add(leftHorn);
  const rightHorn = new THREE.Mesh(hornGeo, hornMat);
  rightHorn.position.set(0.2, 0.95, 0.75);
  group.add(rightHorn);

  // 4 legs
  const legGeo = new THREE.BoxGeometry(0.18, 0.35, 0.18);
  const legPositions: [number, number, number][] = [
    [-0.25, 0.17, -0.4],
    [0.25, 0.17, -0.4],
    [-0.25, 0.17, 0.4],
    [0.25, 0.17, 0.4],
  ];
  for (const [lx, ly, lz] of legPositions) {
    const leg = new THREE.Mesh(legGeo, brownMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    group.add(leg);
  }

  group.position.set(x, 0, z);
  scene.add(group);

  return { group, offset, baseX: x, baseZ: z };
}

// ─── Create Chicken ──────────────────────────────────────────────────
function createChicken(scene: THREE.Scene, x: number, z: number): AnimalData {
  const group = new THREE.Group();
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const orangeMat = new THREE.MeshLambertMaterial({ color: 0xff8800 });
  const redMat = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
  const offset = Math.random() * Math.PI * 2;

  // Body (small)
  const bodyGeo = new THREE.BoxGeometry(0.35, 0.3, 0.45);
  const body = new THREE.Mesh(bodyGeo, whiteMat);
  body.position.y = 0.35;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
  const head = new THREE.Mesh(headGeo, whiteMat);
  head.position.set(0, 0.55, 0.3);
  head.castShadow = true;
  group.add(head);

  // Beak
  const beakGeo = new THREE.BoxGeometry(0.1, 0.06, 0.1);
  const beak = new THREE.Mesh(beakGeo, orangeMat);
  beak.position.set(0, 0.5, 0.47);
  group.add(beak);

  // Comb (red on top)
  const combGeo = new THREE.BoxGeometry(0.08, 0.1, 0.12);
  const comb = new THREE.Mesh(combGeo, redMat);
  comb.position.set(0, 0.72, 0.3);
  group.add(comb);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.04, 0.04, 0.03);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.08, 0.58, 0.43);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.08, 0.58, 0.43);
  group.add(rightEye);

  // 2 legs (thin orange sticks)
  const legGeo = new THREE.BoxGeometry(0.05, 0.2, 0.05);
  const leftLeg = new THREE.Mesh(legGeo, orangeMat);
  leftLeg.position.set(-0.08, 0.1, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, orangeMat);
  rightLeg.position.set(0.08, 0.1, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Tail feathers
  const tailGeo = new THREE.BoxGeometry(0.15, 0.2, 0.1);
  const tail = new THREE.Mesh(tailGeo, whiteMat);
  tail.position.set(0, 0.45, -0.25);
  tail.rotation.x = -0.3;
  group.add(tail);

  group.position.set(x, 0, z);
  scene.add(group);

  return { group, offset, baseX: x, baseZ: z };
}

// ─── Create Birds (flying) ──────────────────────────────────────────
interface BirdData {
  mesh: THREE.Mesh;
  phase: number;
}

function createBirds(scene: THREE.Scene): BirdData[] {
  const birds: BirdData[] = [];
  const birdMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

  for (let i = 0; i < 8; i++) {
    const birdGeo = new THREE.BoxGeometry(0.2, 0.1, 0.2);
    const bird = new THREE.Mesh(birdGeo, birdMat);
    const phase = (i / 8) * Math.PI * 2;
    // Set initial position in elliptical pattern
    bird.position.set(
      10 * Math.cos(phase),
      15,
      8 * Math.sin(phase)
    );
    bird.castShadow = false;
    scene.add(bird);
    birds.push({ mesh: bird, phase });
  }

  return birds;
}

// ─── Create Clouds ──────────────────────────────────────────────────
interface CloudData {
  group: THREE.Group;
  speed: number;
}

function createClouds(scene: THREE.Scene): CloudData[] {
  const clouds: CloudData[] = [];
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
  });

  const cloudConfigs: { x: number; y: number; z: number; blocks: [number, number, number, number, number, number][]; speed: number }[] = [
    {
      x: -15, y: 18, z: -10, speed: 0.3,
      blocks: [
        [0, 0, 0, 3, 1, 2], [2, 0, 0.5, 2, 1, 2], [-1.5, 0, -0.3, 2, 1, 1.5],
        [1, 0.5, 0, 2, 0.7, 1.5], [-0.5, 0.3, 0.3, 2.5, 0.6, 1.5],
      ],
    },
    {
      x: 10, y: 20, z: -5, speed: 0.2,
      blocks: [
        [0, 0, 0, 2.5, 1, 2], [2, 0, 0.3, 2, 1, 1.5], [-1, 0, 0, 2, 1, 2],
        [0.5, 0.4, 0, 2, 0.7, 1.5], [1.5, 0, -0.5, 1.5, 0.8, 1.5], [-0.5, 0.3, 0.5, 1.5, 0.6, 1],
      ],
    },
    {
      x: -5, y: 22, z: 15, speed: 0.25,
      blocks: [
        [0, 0, 0, 3, 1, 2], [2.5, 0, 0, 2, 1, 1.5], [-1.5, 0, 0.3, 2, 1, 1.5],
        [0.5, 0.5, 0, 2, 0.6, 1.5],
      ],
    },
    {
      x: 20, y: 19, z: 8, speed: 0.35,
      blocks: [
        [0, 0, 0, 2, 1, 2], [1.5, 0, 0, 2, 1, 1.5], [-1, 0, 0.2, 2.5, 1, 2],
        [0.3, 0.4, 0, 2, 0.7, 1.5], [1, 0.3, -0.3, 1.5, 0.6, 1],
      ],
    },
    {
      x: -20, y: 21, z: 0, speed: 0.15,
      blocks: [
        [0, 0, 0, 3, 1, 2.5], [2.5, 0, 0.5, 2, 1, 2], [-2, 0, -0.3, 2, 1, 2],
        [0, 0.5, 0, 2.5, 0.7, 2], [1.5, 0.3, 0.3, 2, 0.6, 1.5], [-1, 0.4, 0, 2, 0.5, 1.5],
      ],
    },
  ];

  for (const config of cloudConfigs) {
    const group = new THREE.Group();
    for (const [bx, by, bz, w, h, d] of config.blocks) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const block = new THREE.Mesh(geo, cloudMat);
      block.position.set(bx, by, bz);
      group.add(block);
    }
    group.position.set(config.x, config.y, config.z);
    scene.add(group);
    clouds.push({ group, speed: config.speed });
  }

  return clouds;
}

// ─── Create a Minecraft-style agent character ────────────────────────
interface AgentParts {
  group: THREE.Group;
  head: THREE.Mesh;
  body: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  // New parts
  hat: THREE.Mesh; // Role-specific hat/helmet
  item: THREE.Mesh | null; // Held item (different per role)
  label: CSS2DObject;
  offset: number;
  roleId: string; // For role-specific animations
}

function createAgent(
  agent: Agent3D,
  labelRenderer: CSS2DRenderer
): AgentParts {
  const group = new THREE.Group();
  const agentColor = new THREE.Color(agent.color);
  const agentMat = new THREE.MeshLambertMaterial({ color: agentColor });
  const skinMat = new THREE.MeshLambertMaterial({ color: COLORS.skin });
  const darkMat = new THREE.MeshLambertMaterial({
    color: agentColor.clone().multiplyScalar(0.6),
  });

  // ═══ HEAD (classic Minecraft 8x8x8 pixel = 0.6 cube) ═══
  const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  // Face: front = skin, top = agent color (hair), rest = skin
  const head = new THREE.Mesh(headGeo, [
    skinMat, skinMat, agentMat, skinMat, skinMat, skinMat,
  ]);
  head.position.y = 1.8;
  head.castShadow = true;
  group.add(head);

  // Eyes (Minecraft-style 2-pixel wide black squares)
  const eyeGeo = new THREE.BoxGeometry(0.1, 0.06, 0.05);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.13, 1.83, 0.31);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.13, 1.83, 0.31);
  group.add(rightEye);

  // Mouth (tiny line)
  const mouthGeo = new THREE.BoxGeometry(0.12, 0.03, 0.05);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x4a3728 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 1.72, 0.31);
  group.add(mouth);

  // ═══ ROLE-SPECIFIC HAT ═══
  let hat: THREE.Mesh;
  const hatMat = new THREE.MeshLambertMaterial({ color: agentColor.clone().multiplyScalar(1.2) });

  switch (agent.role) {
    case "CEO": {
      // Crown
      const crownGeo = new THREE.BoxGeometry(0.65, 0.2, 0.65);
      hat = new THREE.Mesh(crownGeo, new THREE.MeshLambertMaterial({ color: 0xffd700 }));
      hat.position.y = 2.2;
      // Crown tips
      const tipGeo = new THREE.BoxGeometry(0.12, 0.15, 0.12);
      const tipMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
      const tips: [number, number, number][] = [[-0.2, 2.35, -0.2], [0.2, 2.35, -0.2], [-0.2, 2.35, 0.2], [0.2, 2.35, 0.2], [0, 2.38, 0]];
      for (const [tx, ty, tz] of tips) {
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(tx, ty, tz);
        group.add(tip);
      }
      break;
    }
    case "Factory": {
      // Hard hat
      const hardHatGeo = new THREE.BoxGeometry(0.7, 0.25, 0.7);
      hat = new THREE.Mesh(hardHatGeo, new THREE.MeshLambertMaterial({ color: 0xffaa00 }));
      hat.position.y = 2.18;
      break;
    }
    case "Content": {
      // Beret
      const beretGeo = new THREE.BoxGeometry(0.65, 0.15, 0.65);
      hat = new THREE.Mesh(beretGeo, new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
      hat.position.y = 2.15;
      break;
    }
    case "SEO": {
      // Headband with magnifying glass
      const bandGeo = new THREE.BoxGeometry(0.62, 0.1, 0.62);
      hat = new THREE.Mesh(bandGeo, new THREE.MeshLambertMaterial({ color: 0xec4899 }));
      hat.position.y = 2.15;
      break;
    }
    case "Data": {
      // Wizard hat
      const wizGeo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
      hat = new THREE.Mesh(wizGeo, new THREE.MeshLambertMaterial({ color: 0x8b5cf6 }));
      hat.position.y = 2.3;
      const wizTip = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.3, 0.25),
        new THREE.MeshLambertMaterial({ color: 0x8b5cf6 })
      );
      wizTip.position.y = 2.65;
      group.add(wizTip);
      break;
    }
    case "Research": {
      // Explorer hat
      const explorerGeo = new THREE.BoxGeometry(0.75, 0.12, 0.75);
      hat = new THREE.Mesh(explorerGeo, new THREE.MeshLambertMaterial({ color: 0x8b6914 }));
      hat.position.y = 2.14;
      const topHat = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.2, 0.45),
        new THREE.MeshLambertMaterial({ color: 0x8b6914 })
      );
      topHat.position.y = 2.28;
      group.add(topHat);
      break;
    }
    case "QA": {
      // Shield helmet (red visor)
      const helmetGeo = new THREE.BoxGeometry(0.65, 0.25, 0.65);
      hat = new THREE.Mesh(helmetGeo, new THREE.MeshLambertMaterial({ color: 0xcc0000 }));
      hat.position.y = 2.18;
      break;
    }
    default: {
      const defaultGeo = new THREE.BoxGeometry(0.65, 0.15, 0.65);
      hat = new THREE.Mesh(defaultGeo, hatMat);
      hat.position.y = 2.15;
    }
  }
  hat.castShadow = true;
  group.add(hat);

  // ═══ BODY (Minecraft torso: 0.6 x 0.8 x 0.4) ═══
  const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
  const body = new THREE.Mesh(bodyGeo, agentMat);
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  // Belt detail
  const beltGeo = new THREE.BoxGeometry(0.62, 0.08, 0.42);
  const beltMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = 0.75;
  group.add(belt);

  // ═══ ARMS (0.2 x 0.7 x 0.3) — pivot from shoulder ═══
  const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.3);
  // Shift arm geometry so it rotates from the top (shoulder)
  armGeo.translate(0, -0.35, 0);

  const leftArm = new THREE.Mesh(armGeo.clone(), darkMat);
  leftArm.position.set(-0.4, 1.45, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo.clone(), darkMat);
  rightArm.position.set(0.4, 1.45, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // ═══ HELD ITEM (role-specific) ═══
  let item: THREE.Mesh | null = null;
  switch (agent.role) {
    case "CEO": {
      // Scepter
      const scepterGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
      item = new THREE.Mesh(scepterGeo, new THREE.MeshLambertMaterial({ color: 0xffd700 }));
      item.position.set(0.4, 0.9, 0.3);
      break;
    }
    case "Factory": {
      // Wrench
      const wrenchGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
      item = new THREE.Mesh(wrenchGeo, new THREE.MeshLambertMaterial({ color: 0xaaaaaa }));
      item.position.set(0.4, 0.9, 0.3);
      break;
    }
    case "Data": {
      // Wand
      const wandGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06);
      item = new THREE.Mesh(wandGeo, new THREE.MeshLambertMaterial({ color: 0xcc88ff }));
      item.position.set(0.4, 0.9, 0.3);
      break;
    }
    case "Research": {
      // Compass
      const compassGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05);
      item = new THREE.Mesh(compassGeo, new THREE.MeshLambertMaterial({ color: 0xdddddd }));
      item.position.set(0.4, 0.9, 0.3);
      break;
    }
    default:
      item = null;
  }
  if (item) {
    item.castShadow = true;
    group.add(item);
  }

  // ═══ LEGS (0.25 x 0.7 x 0.3) — pivot from hip ═══
  const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.3);
  legGeo.translate(0, -0.35, 0);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x333355 });

  const leftLeg = new THREE.Mesh(legGeo.clone(), legMat);
  leftLeg.position.set(-0.15, 0.7, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo.clone(), legMat);
  rightLeg.position.set(0.15, 0.7, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // ═══ SHOES (small cubes at feet) ═══
  const shoeGeo = new THREE.BoxGeometry(0.27, 0.12, 0.35);
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(-0.15, 0.06, 0.02);
  group.add(leftShoe);
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0.15, 0.06, 0.02);
  group.add(rightShoe);

  // Position
  group.position.set(agent.position[0], agent.position[1], agent.position[2]);

  // ═══ NAME LABEL ═══
  const labelDiv = document.createElement("div");
  labelDiv.className = "agent-label";
  labelDiv.textContent = agent.name; // Juste le prénom, pas le rôle
  labelDiv.style.cssText = `
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.8);
    padding: 1px 6px;
    border-radius: 3px;
    border: 1px solid ${agent.color};
    white-space: nowrap;
    pointer-events: none;
    text-shadow: 0 0 4px ${agent.color};
  `;
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, 2.8, 0);
  group.add(label);

  // ═══ BULLE DE DIALOGUE ═══
  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "agent-bubble";
  bubbleDiv.style.cssText = `
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 9px;
    background: rgba(0,0,0,0.85);
    padding: 3px 8px;
    border-radius: 8px;
    border: 1px solid ${agent.color}88;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s;
    max-width: 160px;
  `;
  const bubble = new CSS2DObject(bubbleDiv);
  bubble.position.set(0, 3.6, 0);
  group.add(bubble);
  // Stocker la ref bubble sur le div pour l'animer
  (labelDiv as unknown as Record<string, unknown>)["bubble"] = bubble;
  (labelDiv as unknown as Record<string, unknown>)["agentId"] = agent.id;

  const offset = Math.random() * Math.PI * 2;

  return { group, head, body, leftArm, rightArm, leftLeg, rightLeg, hat, item, label, offset, roleId: agent.role };
}

// ─── Animate an agent with idle animations ───────────────────────────
function animateAgent(parts: AgentParts, time: number): void {
  const t = time + parts.offset;

  // Breathing: subtle Y scale oscillation on body
  parts.body.scale.y = 1 + Math.sin(t * 1.5) * 0.02;
  parts.body.position.y = 1.1 + Math.sin(t * 1.5) * 0.01;

  // Head follows body breathing
  parts.head.position.y = 1.8 + Math.sin(t * 1.5) * 0.01;

  // Head look around (role-specific speed)
  const lookSpeed = parts.roleId === "Research" ? 0.8 : 0.5;
  parts.head.rotation.y = Math.sin(t * lookSpeed) * 0.3;
  parts.head.rotation.x = Math.sin(t * 0.3) * 0.05;

  // Gentle body sway
  parts.group.rotation.y = Math.sin(t * 0.25) * 0.05;

  // Arm swing from shoulder pivot
  parts.leftArm.rotation.x = Math.sin(t * 0.8) * 0.2;
  parts.rightArm.rotation.x = Math.sin(t * 0.8 + Math.PI) * 0.2;
  parts.leftArm.rotation.z = -0.05 + Math.sin(t * 0.6) * 0.03;
  parts.rightArm.rotation.z = 0.05 - Math.sin(t * 0.6) * 0.03;

  // Leg subtle shift from hip pivot
  parts.leftLeg.rotation.x = Math.sin(t * 0.7) * 0.06;
  parts.rightLeg.rotation.x = Math.sin(t * 0.7 + Math.PI) * 0.06;

  // Hat bob
  if (parts.hat) {
    parts.hat.position.y = (parts.hat.position.y > 2.15 ? parts.hat.position.y : 2.15) + Math.sin(t * 1.5) * 0.01;
  }

  // Role-specific animations
  switch (parts.roleId) {
    case "CEO":
      // Regal head movement, slower
      parts.head.rotation.y = Math.sin(t * 0.3) * 0.2;
      break;
    case "Factory":
      // Working arm movement (like hammering)
      parts.rightArm.rotation.x = Math.sin(t * 2) * 0.3;
      break;
    case "Content":
      // Creative hand gestures
      parts.leftArm.rotation.z = -0.1 + Math.sin(t * 1.2) * 0.1;
      parts.rightArm.rotation.z = 0.1 - Math.sin(t * 1.2 + 1) * 0.1;
      break;
    case "Data":
      // Mystical wand wave
      parts.rightArm.rotation.x = Math.sin(t * 1.5) * 0.25;
      parts.rightArm.rotation.z = 0.1 + Math.sin(t * 0.8) * 0.1;
      break;
    case "Research":
      // Looking around actively
      parts.head.rotation.y = Math.sin(t * 1.2) * 0.4;
      parts.head.rotation.x = Math.sin(t * 0.8) * 0.1;
      break;
    case "QA":
      // Alert stance, checking
      parts.head.rotation.x = Math.sin(t * 0.5) * 0.08;
      parts.rightArm.rotation.x = -0.3 + Math.sin(t * 0.4) * 0.05;
      break;
  }
}

// ─── Day/Night cycle helpers (Colombo, Sri Lanka — UTC+5:30) ────────
function getColomboHour(): number {
  const now = new Date();
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  return (utcH + 5 + (utcM + 30) / 60) % 24;
}

function getDayNightFactor(hour: number): number {
  // 0 = full night, 1 = full day
  // Dawn: 5-7, Dusk: 17-19
  if (hour >= 7 && hour <= 17) return 1;
  if (hour >= 19 || hour <= 5) return 0;
  if (hour > 5 && hour < 7) return (hour - 5) / 2;
  return 1 - (hour - 17) / 2;
}

function updateSkyBackground(
  canvas2d: HTMLCanvasElement,
  bgTexture: THREE.CanvasTexture,
  dayFactor: number
): void {
  const ctx = canvas2d.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);

  if (dayFactor >= 0.9) {
    // Full day — blue sky
    gradient.addColorStop(0, "#4682B4");
    gradient.addColorStop(0.4, "#5a9fd4");
    gradient.addColorStop(0.7, "#87CEEB");
    gradient.addColorStop(1, "#b0e0e6");
  } else if (dayFactor <= 0.1) {
    // Full night — dark sky
    gradient.addColorStop(0, "#0a0a1a");
    gradient.addColorStop(0.4, "#111133");
    gradient.addColorStop(0.7, "#1a1a3e");
    gradient.addColorStop(1, "#0d1117");
  } else {
    // Dawn / Dusk — interpolate through orange/pink tones
    const t = dayFactor;
    // Blend between night top and day top
    const r0 = Math.round(THREE.MathUtils.lerp(10, 70, t));
    const g0 = Math.round(THREE.MathUtils.lerp(10, 130, t));
    const b0 = Math.round(THREE.MathUtils.lerp(26, 180, t));

    const r1 = Math.round(THREE.MathUtils.lerp(13, 176, t));
    const g1 = Math.round(THREE.MathUtils.lerp(17, 224, t));
    const b1 = Math.round(THREE.MathUtils.lerp(23, 230, t));

    // Add warm dawn/dusk mid-tones
    const warmR = Math.round(180 * Math.sin(t * Math.PI));
    const warmG = Math.round(100 * Math.sin(t * Math.PI));
    const warmB = Math.round(60 * Math.sin(t * Math.PI));

    gradient.addColorStop(0, `rgb(${r0},${g0},${b0})`);
    gradient.addColorStop(0.3, `rgb(${Math.min(255, r0 + warmR)},${Math.min(255, g0 + warmG)},${Math.min(255, b0 + warmB)})`);
    gradient.addColorStop(0.6, `rgb(${Math.min(255, r1 + warmR)},${Math.min(255, g1 + warmG)},${Math.min(255, b1 + warmB)})`);
    gradient.addColorStop(1, `rgb(${r1},${g1},${b1})`);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);
  bgTexture.needsUpdate = true;
}

// ─── Main component ─────────────────────────────────────────────────
// Desk positions for active agents (7 agents, 7 desks at z=-5)
const DESK_POSITIONS: Record<string, THREE.Vector3> = {
  george: new THREE.Vector3(0, 0, -5),
  rex: new THREE.Vector3(-3, 0, -5),
  leo: new THREE.Vector3(-2, 0, -5),
  iris: new THREE.Vector3(-1, 0, -5),
  atlas: new THREE.Vector3(1, 0, -5),
  scout: new THREE.Vector3(2, 0, -5),
  hugo: new THREE.Vector3(3, 0, -5),
};

export function PixelOffice() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [showNames, setShowNames] = useState(true);
  const labelsVisibleRef = useRef(true);
  const agentPartsRef = useRef<AgentParts[]>([]);
  const activeAgentsRef = useRef<Record<string, string>>({});

  const resetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  const toggleNames = useCallback(() => {
    setShowNames((prev) => {
      const next = !prev;
      labelsVisibleRef.current = next;
      for (const parts of agentPartsRef.current) {
        parts.label.visible = next;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─── Scene setup ─────────────────────────────────────────
    const scene = new THREE.Scene();

    // Dynamic sky gradient background (Colombo day/night)
    const canvas2d = document.createElement("canvas");
    canvas2d.width = 2;
    canvas2d.height = 256;
    const bgTexture = new THREE.CanvasTexture(canvas2d);
    const initHour = getColomboHour();
    const initDayFactor = getDayNightFactor(initHour);
    updateSkyBackground(canvas2d, bgTexture, initDayFactor);
    scene.background = bgTexture;

    // Fog — FogExp2 with density 0.04
    scene.fog = new THREE.FogExp2(0x0d1117, 0.04);

    // ─── Camera ──────────────────────────────────────────────
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 200);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 1, -2);

    // ─── WebGL Renderer ──────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(1); // Forcer 1 pour perf optimale
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    container.appendChild(renderer.domElement);

    // ─── CSS2D Renderer (for labels) ─────────────────────────
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0";
    labelRenderer.domElement.style.left = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    container.appendChild(labelRenderer.domElement);

    // ─── Controls ────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.5, -2);
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.saveState();
    controlsRef.current = controls;

    // ─── Lighting (dynamic day/night) ───────────────────────
    // Color references for lerping
    const nightAmbientColor = new THREE.Color(0x334466);
    const dayAmbientColor = new THREE.Color(0xffffff);
    const moonColor = new THREE.Color(0x8888cc);
    const sunColor = new THREE.Color(0xffffcc);

    // Ambient light — intensity and color interpolated per frame
    const ambientLight = new THREE.AmbientLight(
      nightAmbientColor.clone().lerp(dayAmbientColor, initDayFactor),
      THREE.MathUtils.lerp(0.3, 0.8, initDayFactor)
    );
    scene.add(ambientLight);

    // Main directional light (sun by day, moon by night)
    const mainLight = new THREE.DirectionalLight(
      moonColor.clone().lerp(sunColor, initDayFactor),
      THREE.MathUtils.lerp(0.5, 1.2, initDayFactor)
    );
    mainLight.position.set(10, 15, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 80;
    mainLight.shadow.camera.left = -40;
    mainLight.shadow.camera.right = 40;
    mainLight.shadow.camera.top = 40;
    mainLight.shadow.camera.bottom = -40;
    scene.add(mainLight);

    // Warm fill light from the building
    const fillLight = new THREE.PointLight(0xffaa44, 0.5, 20);
    fillLight.position.set(0, 3, -5);
    scene.add(fillLight);

    // Tone mapping exposure adapts to day/night
    renderer.toneMappingExposure = THREE.MathUtils.lerp(0.8, 1.2, initDayFactor);

    // ─── Ground ──────────────────────────────────────────────
    createGround(scene);

    // ─── Building ────────────────────────────────────────────
    createBuilding(scene);

    // ─── Torches & Fireplace ──────────────────────────────────
    const torchData = createTorchesAndFireplace(scene);

    // ─── Jungle Trees ─────────────────────────────────────────
    const normalTreePositions = [
      [-9, -8], [9, -8], [-8, 5], [8, 5],
      [-10, -2], [10, -2], [-7, 8], [7, 8],
      [-11, 3], [11, -4], [-6, -10], [6, 10],
      // Additional trees for expanded map
      [-18, -15], [18, -15], [-20, 10], [20, 10],
      [-15, 18], [15, 18], [-22, -5], [22, -5],
      [-16, -20], [16, 20], [-25, 0], [25, 12],
      [-12, 22], [12, -22], [-20, -20], [20, -20],
    ];
    for (const [tx, tz] of normalTreePositions) {
      createTree(scene, tx, tz);
    }

    const jungleTreePositions = [
      [-12, 6], [12, 7], [-11, -7], [11, 9],
      [-13, 0], [13, 1], [-9, 10], [9, -10],
      [-12, -10], [12, -8], [-10, 8], [10, 6],
      [-7, -11], [8, 11],
      // Additional jungle trees for expanded map
      [-18, 14], [18, 14], [-22, -12], [22, -12],
      [-25, 8], [25, 8], [-14, -18], [14, -18],
      [-20, 18], [20, -18], [-28, 0], [28, 0],
      [-16, 24], [16, -24], [-24, -18], [24, 18],
      [-26, 12], [26, -12], [-22, 22], [22, -22],
    ];
    for (const [tx, tz] of jungleTreePositions) {
      createJungleTree(scene, tx, tz);
    }

    // Bushes scattered around
    const bushPositions = [
      [-4, 4], [4, 4], [-6, 2], [6, 2],
      [-3, 7], [3, 7], [-8, 0], [8, 0],
      [-5, 9], [5, -7], [-2, 5], [2, 6],
      // Additional bushes for expanded map
      [-15, 12], [15, 12], [-18, -8], [18, -8],
      [-12, 16], [12, -16], [-20, 5], [20, -5],
      [-8, 20], [8, -20], [-24, 3], [24, -3],
    ];
    for (const [bx, bz] of bushPositions) {
      createBush(scene, bx, bz);
    }

    // ─── Mines at 4 edges ─────────────────────────────────────
    const minePositions: [number, number][] = [
      [18, -18], [-18, -18], // Mines visibles en avant (face caméra)
      [18, 18], [-18, 18],   // Mines en arrière
    ];
    const allDiamonds: THREE.Mesh[] = [];
    for (const [mx, mz] of minePositions) {
      const mineData = createMine(scene, mx, mz);
      allDiamonds.push(...mineData.diamonds);
    }

    // ─── Miner NPCs (6-8 near mines) ─────────────────────────
    const minerPositions: [number, number, number][] = [
      [16, 0, -16], [19, 0, -19], // Mine avant droite
      [-16, 0, -16], [-19, 0, -19], // Mine avant gauche
      [16, 0, 16], [19, 0, 19], // Mine arrière droite
      [-16, 0, 16], [-19, 0, 19], // Mine arrière gauche
    ];
    const miners: MinerData[] = [];
    for (const pos of minerPositions) {
      miners.push(createMiner(scene, pos));
    }

    // ─── Waterfall on one edge ───────────────────────────────
    const waterfallData = createWaterfall(scene, 22, -8); // Cascade visible côté droit face caméra

    // ─── Animals ─────────────────────────────────────────────
    const animals: AnimalData[] = [];

    // Pigs (3)
    animals.push(createPig(scene, 8, 12));
    animals.push(createPig(scene, -10, 15));
    animals.push(createPig(scene, 5, -14));

    // Cows (3)
    animals.push(createCow(scene, -12, -14));
    animals.push(createCow(scene, 14, 8));
    animals.push(createCow(scene, -6, 18));

    // Chickens (3)
    animals.push(createChicken(scene, 10, -10));
    animals.push(createChicken(scene, -8, 12));
    animals.push(createChicken(scene, 3, 16));

    // ─── Birds (2 max) ───────────────────────────────────────
    const birds = createBirds(scene).slice(0, 2); // Max 2 oiseaux

    // ─── Gemmes au sol (diamants + rubis scintillants) ────────
    const gemPositions = [
      [6, -8], [-7, 5], [10, 3], [-5, -10], [3, 12],
      [-9, 8], [8, -5], [-3, 9], [11, -11], [-11, 6],
    ];
    const gemColors = [0x00bfff, 0xff1493, 0x7cfc00, 0xff6600, 0xffd700];
    const gems: THREE.Mesh[] = [];
    for (let i = 0; i < gemPositions.length; i++) {
      const [gx, gz] = gemPositions[i]!;
      const geo = new THREE.OctahedronGeometry(0.2);
      const mat = new THREE.MeshStandardMaterial({
        color: gemColors[i % gemColors.length],
        emissive: gemColors[i % gemColors.length],
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.1,
      });
      const gem = new THREE.Mesh(geo, mat);
      gem.position.set(gx, 0.3, gz!);
      scene.add(gem);
      gems.push(gem);
    }

    // ─── Lianes (cylindres verts qui pendent des arbres) ─────
    const lianePositions = [[-14, -12], [16, 10], [-8, 16], [12, -15], [-16, 8]];
    for (const [lx, lz] of lianePositions) {
      const geo = new THREE.CylinderGeometry(0.05, 0.05, 3);
      const mat = new THREE.MeshStandardMaterial({ color: 0x2d6a1f });
      const liane = new THREE.Mesh(geo, mat);
      liane.position.set(lx, 2.5, lz);
      scene.add(liane);
      // Feuille en bas
      const leafGeo = new THREE.SphereGeometry(0.3, 4, 4);
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.position.set(lx, 0.8, lz);
      scene.add(leaf);
    }

    // ─── Clouds (5 clusters) ─────────────────────────────────
    const clouds = createClouds(scene);

    // ─── Stars (tiny cubes in the sky — fade with day/night) ─
    const starGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const stars: THREE.Mesh[] = [];
    for (let i = 0; i < 80; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1 - initDayFactor,
      });
      const star = new THREE.Mesh(starGeo, mat);
      star.position.set(
        (Math.random() - 0.5) * 80,
        15 + Math.random() * 20,
        (Math.random() - 0.5) * 80
      );
      scene.add(star);
      stars.push(star);
    }

    // ─── Agents ──────────────────────────────────────────────
    const agentParts: AgentParts[] = [];

    for (const agentData of AGENTS_3D) {
      const parts = createAgent(agentData, labelRenderer);
      scene.add(parts.group);
      agentParts.push(parts);
    }

    agentPartsRef.current = agentParts;

    // Sync label visibility with current state
    for (const parts of agentParts) {
      parts.label.visible = labelsVisibleRef.current;
    }

    // ─── Fetch active agents every 10s ──────────────────────
    const fetchActiveAgents = () => {
      fetch("/api/office")
        .then(r => r.json())
        .then(d => { activeAgentsRef.current = d.activeAgents ?? {}; })
        .catch(() => {});
    };
    fetchActiveAgents();
    const agentFetchInterval = setInterval(fetchActiveAgents, 10000);

    // ─── Animation loop ──────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();

    // Color references for fog day/night
    const nightFogColor = new THREE.Color(0x0d1117);
    const dayFogColor = new THREE.Color(0x1a3a1a);

    function animate() {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Animate agents + bulles de dialogue + active agent walk
      for (let i = 0; i < agentParts.length; i++) {
        const parts = agentParts[i]!;
        animateAgent(parts, elapsed);

        const agentId = AGENTS_3D[i]?.id ?? "george";
        const activeTask = activeAgentsRef.current[agentId];

        // Target position: desk if active, original circle position if idle
        const originalPos = new THREE.Vector3(...AGENTS_3D[i]!.position);
        const targetPos = activeTask ? (DESK_POSITIONS[agentId] ?? originalPos) : originalPos;

        // Smooth lerp
        parts.group.position.lerp(targetPos, 0.03);

        // Bulle de dialogue — show task if active, else rotate idle bubbles
        const bubbleObj = parts.group.children.find(
          (c) => c instanceof CSS2DObject && (c as CSS2DObject).element.className === "agent-bubble"
        ) as CSS2DObject | undefined;
        if (bubbleObj) {
          const el = bubbleObj.element as HTMLElement;
          if (activeTask) {
            el.textContent = "\uD83D\uDCBC " + activeTask.substring(0, 28) + (activeTask.length > 28 ? "..." : "");
            el.style.opacity = "1";
            el.style.borderColor = AGENTS_3D[i]!.color;
          } else {
            // Rotating idle bubbles
            const bubbles = AGENT_BUBBLES[agentId] ?? [];
            if (bubbles.length > 0) {
              const bubbleIndex = Math.floor((elapsed + i * 1.5) / 4) % bubbles.length;
              const showBubble = Math.sin((elapsed + i * 1.5) * (Math.PI / 4)) > 0.7;
              el.textContent = bubbles[bubbleIndex] ?? "";
              el.style.opacity = showBubble ? "1" : "0";
            }
          }
        }
      }

      // ─── Animate gemmes au sol ──────────────────────────────
      for (const gem of gems) {
        gem.rotation.y = elapsed * 1.5;
        gem.position.y = 0.3 + Math.sin(elapsed * 2 + gem.position.x) * 0.1;
        const mat = gem.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.4 + 0.4 * Math.sin(elapsed * 3 + gem.position.z);
      }

      // ─── Animate diamonds (rotation + opacity oscillation) ─
      for (const diamond of allDiamonds) {
        diamond.rotation.y = elapsed * 2;
        const mat = diamond.material as THREE.MeshLambertMaterial;
        mat.opacity = 0.5 + 0.5 * Math.sin(elapsed * 3 + diamond.position.x);
      }

      // ─── Animate miners (arm swinging) ─────────────────────
      for (const miner of miners) {
        const t = elapsed + miner.offset;
        // Mining swing animation on right arm (X axis rotation)
        miner.rightArm.rotation.x = Math.sin(t * 3) * 0.6;
      }

      // ─── Animate waterfall blocks ──────────────────────────
      for (let i = 0; i < waterfallData.blocks.length; i++) {
        const block = waterfallData.blocks[i];
        const baseYPos = waterfallData.baseY + i * 0.8;
        // Each block slowly descends and loops back to top
        const cyclePeriod = 3.0; // seconds for full cycle
        const phaseOffset = i / waterfallData.blocks.length;
        const t = ((elapsed / cyclePeriod + phaseOffset) % 1);
        // Descend from top position to base, then loop
        block.position.y = baseYPos - t * 0.5;
        // Slight opacity variation for flowing effect
        const mat = block.material as THREE.MeshLambertMaterial;
        mat.opacity = 0.5 + 0.2 * Math.sin(elapsed * 4 + i);
      }

      // ─── Animate animals (random walk) ─────────────────────
      for (const animal of animals) {
        const t = elapsed + animal.offset;
        animal.group.position.x = animal.baseX + Math.sin(t * 0.3) * 2;
        animal.group.position.z = animal.baseZ + Math.sin(t * 0.25 + 1.5) * 2;
        // Face direction of movement
        animal.group.rotation.y = Math.atan2(
          Math.cos(t * 0.3) * 0.3,
          Math.cos(t * 0.25 + 1.5) * 0.25
        );
      }

      // ─── Animate birds (elliptical flight) ─────────────────
      for (const bird of birds) {
        const t = elapsed * 0.5 + bird.phase;
        bird.mesh.position.x = 10 * Math.cos(t);
        bird.mesh.position.y = 15 + Math.sin(t * 2) * 0.5;
        bird.mesh.position.z = 8 * Math.sin(t);
        // Face the direction of flight
        bird.mesh.rotation.y = -t + Math.PI / 2;
      }

      // ─── Animate clouds (drift on X axis) ─────────────────
      for (const cloud of clouds) {
        cloud.group.position.x += cloud.speed * 0.016; // ~60fps delta approximation
        // Wrap around when too far
        if (cloud.group.position.x > 40) {
          cloud.group.position.x = -40;
        }
      }

      // ─── Day/Night cycle (Colombo time) ──────────────────
      const hour = getColomboHour();
      const dayFactor = getDayNightFactor(hour);

      // Update ambient light
      ambientLight.intensity = THREE.MathUtils.lerp(0.3, 0.8, dayFactor);
      ambientLight.color.copy(
        nightAmbientColor.clone().lerp(dayAmbientColor, dayFactor)
      );

      // Update main directional light (sun/moon)
      mainLight.intensity = THREE.MathUtils.lerp(0.5, 1.2, dayFactor);
      mainLight.color.copy(
        moonColor.clone().lerp(sunColor, dayFactor)
      );

      // Update sky background
      updateSkyBackground(canvas2d, bgTexture, dayFactor);

      // Stars fade out during the day
      for (const star of stars) {
        (star.material as THREE.MeshBasicMaterial).opacity = 1 - dayFactor;
      }

      // Update fog color (keep FogExp2 with density 0.04)
      const fogColor = nightFogColor.clone().lerp(dayFogColor, dayFactor);
      scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.04);

      // Tone mapping adapts
      renderer.toneMappingExposure = THREE.MathUtils.lerp(0.8, 1.2, dayFactor);

      // Torch flickering
      for (let i = 0; i < torchData.flames.length; i++) {
        const flame = torchData.flames[i];
        const flicker = 0.9 + Math.random() * 0.2;
        flame.scale.y = flicker;
        flame.scale.x = 0.85 + Math.random() * 0.3;
      }
      for (const light of torchData.lights) {
        light.intensity = 1.4 + Math.random() * 0.8;
      }

      // Fireplace flickering
      torchData.fireplaceFlame.scale.y = 0.8 + Math.random() * 0.4;
      torchData.fireplaceFlame.scale.x = 0.9 + Math.random() * 0.2;
      torchData.fireplaceLight.intensity = 3.0 + Math.random() * 1.2;
      const fireColorShift = Math.random();
      torchData.fireplaceLight.color.setHex(
        fireColorShift > 0.5 ? 0xff6622 : 0xff4411
      );

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }

    animate();

    // ─── Resize handler ──────────────────────────────────────
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    }

    window.addEventListener("resize", onResize);

    // ─── Cleanup ─────────────────────────────────────────────
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      clearInterval(agentFetchInterval);

      controls.dispose();

      // Dispose torch and fireplace lights
      for (const light of torchData.lights) {
        light.dispose();
      }
      torchData.fireplaceLight.dispose();

      // Dispose all geometries and materials in the scene
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            for (const mat of obj.material) mat.dispose();
          } else {
            obj.material.dispose();
          }
        }
      });

      bgTexture.dispose();
      renderer.dispose();

      // Remove DOM elements
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (container.contains(labelRenderer.domElement)) {
        container.removeChild(labelRenderer.domElement);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* 3D Canvas container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg border border-border overflow-hidden bg-[#0d1117]"
        style={{ height: "520px" }}
      />

      {/* Controls bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={resetCamera}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-accent transition-colors"
          >
            Reset Camera
          </button>
          <button
            onClick={toggleNames}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-accent transition-colors"
          >
            {showNames ? "Hide Names" : "Show Names"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Drag to rotate / Scroll to zoom / Right-click to pan
        </p>
      </div>

      {/* Agent legend */}
      <div className="grid grid-cols-7 gap-2">
        {AGENTS_3D.map((agent) => (
          <div
            key={agent.id}
            className="flex flex-col items-center gap-1 rounded-md border border-border bg-card/50 p-2"
          >
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: agent.color }}
            />
            <span className="text-xs font-medium">{agent.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {agent.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
