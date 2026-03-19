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

const AGENTS_3D: Agent3D[] = [
  { id: "george", name: "George", role: "CEO", color: "#6366f1", position: [0, 0, 0] },
  { id: "rex", name: "Rex", role: "Factory", color: "#10b981", position: [3, 0, 0] },
  { id: "leo", name: "Leo", role: "Content", color: "#f59e0b", position: [-3, 0, 0] },
  { id: "iris", name: "Iris", role: "SEO", color: "#ec4899", position: [0, 0, 3] },
  { id: "atlas", name: "Atlas", role: "Data", color: "#8b5cf6", position: [3, 0, 3] },
  { id: "scout", name: "Scout", role: "Research", color: "#06b6d4", position: [-3, 0, 3] },
  { id: "hugo", name: "Hugo", role: "QA", color: "#ef4444", position: [0, 0, -3] },
];

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
  const gridSize = 14; // Slightly larger for jungle feel
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

    const torchLight = new THREE.PointLight(0xff6600, 0.8, 8);
    torchLight.position.set(tx, ty + 0.5, tz);
    scene.add(torchLight);
    lights.push(torchLight);
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

  // Fireplace PointLight (big warm light)
  const fireplaceLight = new THREE.PointLight(0xff6622, 1.5, 12);
  fireplaceLight.position.set(0, 1.2, 1.5);
  fireplaceLight.castShadow = true;
  scene.add(fireplaceLight);

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

// ─── Create a Minecraft-style agent character ────────────────────────
interface AgentParts {
  group: THREE.Group;
  head: THREE.Mesh;
  body: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  label: CSS2DObject;
  offset: number;
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

  // Head (0.6 cube)
  const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const head = new THREE.Mesh(headGeo, [
    skinMat, skinMat, agentMat, skinMat, skinMat, skinMat,
  ]);
  head.position.y = 1.8;
  head.castShadow = true;
  group.add(head);

  // Eyes (tiny black cubes on front face)
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12, 1.85, 0.31);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12, 1.85, 0.31);
  group.add(rightEye);

  // Body (0.6 x 0.8 x 0.4)
  const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
  const body = new THREE.Mesh(bodyGeo, agentMat);
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  // Arms (0.2 x 0.8 x 0.3)
  const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.3);

  const leftArm = new THREE.Mesh(armGeo, darkMat);
  leftArm.position.set(-0.4, 1.1, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, darkMat);
  rightArm.position.set(0.4, 1.1, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // Legs (0.25 x 0.7 x 0.3)
  const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.3);
  const legMat = new THREE.MeshLambertMaterial({ color: 0x333355 });

  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.15, 0.35, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.15, 0.35, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Position group
  group.position.set(agent.position[0], agent.position[1], agent.position[2]);

  // Name label (CSS2D)
  const labelDiv = document.createElement("div");
  labelDiv.className = "agent-label";
  labelDiv.textContent = `${agent.name} - ${agent.role}`;
  labelDiv.style.cssText = `
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.75);
    padding: 2px 8px;
    border-radius: 3px;
    border: 1px solid ${agent.color};
    white-space: nowrap;
    pointer-events: none;
    text-shadow: 0 0 4px ${agent.color};
  `;
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, 2.4, 0);
  group.add(label);

  // Random animation offset
  const offset = Math.random() * Math.PI * 2;

  return { group, head, body, leftArm, rightArm, leftLeg, rightLeg, label, offset };
}

// ─── Animate an agent with idle animations ───────────────────────────
function animateAgent(parts: AgentParts, time: number): void {
  const t = time + parts.offset;

  // Breathing: subtle Y scale oscillation on body
  parts.body.scale.y = 1 + Math.sin(t * 1.5) * 0.02;
  parts.body.position.y = 1.1 + Math.sin(t * 1.5) * 0.01;

  // Head position follows body breathing
  parts.head.position.y = 1.8 + Math.sin(t * 1.5) * 0.01;

  // Head gentle rotation (look around)
  parts.head.rotation.y = Math.sin(t * 0.5) * 0.3;
  parts.head.rotation.x = Math.sin(t * 0.3) * 0.05;

  // Gentle body sway
  parts.group.rotation.y = Math.sin(t * 0.25) * 0.05;

  // Arm swing (subtle idle)
  parts.leftArm.rotation.x = Math.sin(t * 0.8) * 0.15;
  parts.rightArm.rotation.x = Math.sin(t * 0.8 + Math.PI) * 0.15;
  parts.leftArm.rotation.z = -0.05 + Math.sin(t * 0.6) * 0.03;
  parts.rightArm.rotation.z = 0.05 - Math.sin(t * 0.6) * 0.03;

  // Leg subtle shift
  parts.leftLeg.rotation.x = Math.sin(t * 0.7) * 0.04;
  parts.rightLeg.rotation.x = Math.sin(t * 0.7 + Math.PI) * 0.04;
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
export function PixelOffice() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [showNames, setShowNames] = useState(true);
  const labelsVisibleRef = useRef(true);
  const agentPartsRef = useRef<AgentParts[]>([]);

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

    // Fog for depth — color adapts to day/night (jungle-green tinted)
    const nightFogColor = new THREE.Color(0x0d1117);
    const dayFogColor = new THREE.Color(0x1a3a1a);
    const initFogColor = nightFogColor.clone().lerp(dayFogColor, initDayFactor);
    scene.fog = new THREE.FogExp2(initFogColor.getHex(), 0.035);

    // ─── Camera ──────────────────────────────────────────────
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 1, -2);

    // ─── WebGL Renderer ──────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    controls.maxDistance = 30;
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
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
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
    ];
    for (const [tx, tz] of normalTreePositions) {
      createTree(scene, tx, tz);
    }

    const jungleTreePositions = [
      [-12, 6], [12, 7], [-11, -7], [11, 9],
      [-13, 0], [13, 1], [-9, 10], [9, -10],
      [-12, -10], [12, -8], [-10, 8], [10, 6],
      [-7, -11], [8, 11],
    ];
    for (const [tx, tz] of jungleTreePositions) {
      createJungleTree(scene, tx, tz);
    }

    // Bushes scattered around
    const bushPositions = [
      [-4, 4], [4, 4], [-6, 2], [6, 2],
      [-3, 7], [3, 7], [-8, 0], [8, 0],
      [-5, 9], [5, -7], [-2, 5], [2, 6],
    ];
    for (const [bx, bz] of bushPositions) {
      createBush(scene, bx, bz);
    }

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
        (Math.random() - 0.5) * 60,
        15 + Math.random() * 15,
        (Math.random() - 0.5) * 60
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

    // ─── Animation loop ──────────────────────────────────────
    let frameId: number;
    const clock = new THREE.Clock();

    function animate() {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate agents
      for (const parts of agentParts) {
        animateAgent(parts, elapsed);
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

      // Update fog color
      const fogColor = nightFogColor.clone().lerp(dayFogColor, dayFactor);
      scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.025);

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
        light.intensity = 0.6 + Math.random() * 0.4;
      }

      // Fireplace flickering
      torchData.fireplaceFlame.scale.y = 0.8 + Math.random() * 0.4;
      torchData.fireplaceFlame.scale.x = 0.9 + Math.random() * 0.2;
      torchData.fireplaceLight.intensity = 1.2 + Math.random() * 0.6;
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
