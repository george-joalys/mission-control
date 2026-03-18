"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════════════════════
   GEM HQ — Joalys Paris Operations Center
   An immersive Minecraft/RPG-style pixel office in a Sri Lankan jungle
   ═══════════════════════════════════════════════════════════════════════ */

const GEORGE_MESSAGES = [
  "📨 Message from the boss! On it... 💪",
  "🔍 Scanning gem market prices...",
  "💎 Found a 5ct Ceylon sapphire!",
  "📦 Shipment from Ratnapura incoming!",
  "🗼 New B2B client from Paris!",
  "⛏️ Mining report from the field...",
  "💍 New jewelry design approved!",
  "📊 Sales up 12% this week!",
  "🌿 Sourcing ethically certified gems...",
  "✈️ Next trip to Sri Lanka: confirmed!",
];

const SEO_MESSAGES = [
  "✍️ Writing: Top Gemstones from Sri Lanka",
  "📈 SEO score: 94/100 ✅",
  "🔑 New keyword: natural sapphire +320%",
  "📝 Draft ready: Padparadscha Guide",
  "🏆 Page 1 for 'ceylon ruby' — yes!",
  "🔗 Building backlinks from gem blogs...",
  "📊 Organic traffic up 27% this month!",
  "✅ Published: Ethical Sourcing Guide",
  "🔍 Competitor analysis complete",
  "💡 New article idea: Spinel vs Ruby",
];

const GEM = {
  ruby: "#E74C3C",
  sapphire: "#3498DB",
  emerald: "#2ECC71",
  amethyst: "#9B59B6",
  topaz: "#F39C12",
};

// ─── CSS Keyframes ─────────────────────────────────────────────────
function GemHQStyles() {
  return (
    <style>{`
      @keyframes gem-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-8px) rotate(5deg); }
      }
      @keyframes gem-glow {
        0%, 100% { box-shadow: 0 0 4px currentColor; }
        50% { box-shadow: 0 0 12px currentColor, 0 0 20px currentColor; }
      }
      @keyframes torch-flicker {
        0% { transform: scaleX(1) scaleY(1); opacity: 0.9; }
        20% { transform: scaleX(1.15) scaleY(1.2); opacity: 1; }
        40% { transform: scaleX(0.85) scaleY(0.85); opacity: 0.7; }
        60% { transform: scaleX(1.1) scaleY(1.1); opacity: 0.95; }
        80% { transform: scaleX(0.9) scaleY(0.95); opacity: 0.8; }
        100% { transform: scaleX(1) scaleY(1); opacity: 0.9; }
      }
      @keyframes torch-glow-pulse {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 0.35; }
      }
      @keyframes sparkle-rise {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-60px) scale(0.2); }
      }
      @keyframes breathe {
        0%, 100% { transform: scaleY(1) scaleX(1); }
        50% { transform: scaleY(1.02) scaleX(1.01); }
      }
      @keyframes star-twinkle {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 1; }
      }
      @keyframes leaf-sway {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
      @keyframes walk-left {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(25deg); }
        75% { transform: rotate(-25deg); }
      }
      @keyframes walk-right {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-25deg); }
        75% { transform: rotate(25deg); }
      }
      @keyframes chest-glow {
        0%, 100% { box-shadow: 0 -2px 8px rgba(243,156,18,0.3); }
        50% { box-shadow: 0 -2px 16px rgba(243,156,18,0.6), 0 -4px 24px rgba(243,156,18,0.3); }
      }
      @keyframes vine-swing {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
      .pixel-font {
        font-family: "Press Start 2P", monospace;
      }
      .walking .george-left-leg {
        animation: walk-left 0.4s ease-in-out infinite;
        transform-origin: top center;
      }
      .walking .george-right-leg {
        animation: walk-right 0.4s ease-in-out infinite;
        transform-origin: top center;
      }
      .walking .george-left-arm {
        animation: walk-right 0.4s ease-in-out infinite;
        transform-origin: top center;
      }
      .walking .george-right-arm {
        animation: walk-left 0.4s ease-in-out infinite;
        transform-origin: top center;
      }
    `}</style>
  );
}

// ─── Stars ──────────────────────────────────────────────────────────
const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 37 + 13) % 97) + 1,
  y: ((i * 23 + 7) % 35) + 2,
  size: i % 3 === 0 ? 3 : 2,
  delay: (i * 0.7) % 4,
  duration: 2 + (i % 4),
}));

// ─── Palm Tree ──────────────────────────────────────────────────────
function PalmTree({ x, h, lean = 0 }: { x: number; h: number; lean?: number }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        bottom: 170,
        transform: `rotate(${lean}deg)`,
        transformOrigin: "bottom center",
        zIndex: 3,
      }}
    >
      {/* Trunk */}
      <div
        style={{
          width: 10,
          height: h,
          background: "linear-gradient(90deg, #5C3317 0%, #8B6914 50%, #5C3317 100%)",
          imageRendering: "pixelated",
          position: "relative",
        }}
      >
        {/* Trunk segments */}
        {Array.from({ length: Math.floor(h / 14) }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * 14,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>
      {/* Leaf clusters */}
      {[-40, -20, 0, 20, 40].map((angle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: -8,
            left: 5,
            width: 50,
            height: 10,
            backgroundColor: i < 2 || i > 2 ? "#1a7a1a" : "#228B22",
            borderRadius: "60% 60% 40% 40%",
            transform: `rotate(${angle}deg) translateX(-10px)`,
            transformOrigin: "left center",
            animation: `leaf-sway ${2.5 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            imageRendering: "pixelated",
          }}
        />
      ))}
      {/* Coconuts */}
      {[-3, 5].map((off, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 2,
            left: off,
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "#6B4226",
          }}
        />
      ))}
    </div>
  );
}

// ─── Torch ──────────────────────────────────────────────────────────
function Torch({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y, zIndex: 6 }}>
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          left: -25,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,150,30,0.25) 0%, transparent 70%)",
          animation: "torch-glow-pulse 2s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {/* Handle */}
      <div
        style={{
          width: 5,
          height: 16,
          backgroundColor: "#5C3317",
          marginLeft: 3,
          imageRendering: "pixelated",
        }}
      />
      {/* Flame */}
      <div
        style={{
          position: "absolute",
          top: -10,
          left: 0,
          width: 10,
          height: 14,
          borderRadius: "50% 50% 20% 20%",
          background: "linear-gradient(0deg, #FF4500 0%, #FF8C00 40%, #FFD700 80%, #FFFACD 100%)",
          animation: "torch-flicker 0.8s ease-in-out infinite",
          transformOrigin: "bottom center",
        }}
      />
    </div>
  );
}

// ─── Floating Gem ───────────────────────────────────────────────────
function FloatingGem({
  x,
  y,
  color,
  size = 12,
  delay = 0,
}: {
  x: number;
  y: number;
  color: string;
  size?: number;
  delay?: number;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        zIndex: 8,
        animation: `gem-float ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          transform: "rotate(45deg)",
          imageRendering: "pixelated",
          color: color,
          animation: `gem-glow 2s ease-in-out infinite`,
          animationDelay: `${delay * 0.7}s`,
        }}
      />
    </div>
  );
}

// ─── Ground Crystal ─────────────────────────────────────────────────
function GroundCrystal({ x, color }: { x: number; color: string }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        bottom: 168,
        zIndex: 4,
      }}
    >
      <div
        style={{
          width: 6,
          height: 10,
          backgroundColor: color,
          clipPath: "polygon(50% 0%, 100% 70%, 50% 100%, 0% 70%)",
          opacity: 0.85,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

// ─── Sparkle Particles ──────────────────────────────────────────────
function Sparkles() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${15 + ((i * 7) % 70)}%`,
            bottom: 180 + (i % 4) * 40,
            width: 3,
            height: 3,
            backgroundColor:
              i % 4 === 0
                ? GEM.ruby
                : i % 4 === 1
                  ? GEM.sapphire
                  : i % 4 === 2
                    ? GEM.emerald
                    : GEM.amethyst,
            borderRadius: "50%",
            animation: `sparkle-rise ${2 + (i % 3)}s ease-out infinite`,
            animationDelay: `${i * 1.2}s`,
            zIndex: 9,
            opacity: 0.8,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

// ─── Speech Bubble ──────────────────────────────────────────────────
function SpeechBubble({ message, side }: { message: string; side: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.85 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute pixel-font"
      style={{
        bottom: "100%",
        [side]: -10,
        marginBottom: 12,
        padding: "8px 12px",
        backgroundColor: "#1a1a2e",
        border: "2px solid #fbbf24",
        borderRadius: 4,
        fontSize: 7,
        lineHeight: 1.6,
        color: "#e2e8f0",
        maxWidth: 200,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        zIndex: 20,
        imageRendering: "auto",
        boxShadow: "0 0 10px rgba(251,191,36,0.2)",
      }}
    >
      {message}
      {/* Bubble pointer */}
      <div
        style={{
          position: "absolute",
          bottom: -8,
          [side]: 18,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "8px solid #fbbf24",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -5,
          [side]: 19,
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "7px solid #1a1a2e",
        }}
      />
    </motion.div>
  );
}

// ─── George — The Gem Explorer ──────────────────────────────────────
function GeorgeSprite({ isWalking }: { isWalking: boolean }) {
  return (
    <div
      className={isWalking ? "walking" : ""}
      style={{
        position: "relative",
        width: 36,
        height: 68,
        imageRendering: "pixelated",
        animation: isWalking ? "none" : "breathe 3s ease-in-out infinite",
        transformOrigin: "bottom center",
      }}
    >
      {/* Explorer hat - brim */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: -2,
          width: 30,
          height: 4,
          backgroundColor: "#6B4226",
          borderRadius: 1,
        }}
      />
      {/* Explorer hat - crown */}
      <div
        style={{
          position: "absolute",
          top: -5,
          left: 4,
          width: 18,
          height: 7,
          backgroundColor: "#5C3317",
          borderRadius: "3px 3px 0 0",
        }}
      />
      {/* Hat band */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: 4,
          width: 18,
          height: 2,
          backgroundColor: "#8B6914",
        }}
      />

      {/* Head */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 5,
          width: 16,
          height: 16,
          backgroundColor: "#FFCC99",
        }}
      >
        {/* Left eye */}
        <div style={{ position: "absolute", top: 5, left: 3, width: 3, height: 3, backgroundColor: "#1a1a2e", borderRadius: 1 }} />
        {/* Right eye */}
        <div style={{ position: "absolute", top: 5, left: 10, width: 3, height: 3, backgroundColor: "#1a1a2e", borderRadius: 1 }} />
        {/* Eye shine */}
        <div style={{ position: "absolute", top: 5, left: 4, width: 1, height: 1, backgroundColor: "#fff" }} />
        <div style={{ position: "absolute", top: 5, left: 11, width: 1, height: 1, backgroundColor: "#fff" }} />
        {/* Smile */}
        <div style={{ position: "absolute", top: 11, left: 5, width: 6, height: 2, backgroundColor: "#CC8866", borderRadius: "0 0 3px 3px" }} />
      </div>

      {/* Body — dark brown explorer jacket */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 4,
          width: 18,
          height: 22,
          backgroundColor: "#5C3317",
        }}
      >
        {/* Jacket lapel */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 18, height: 3, backgroundColor: "#6B4226" }} />
        {/* Gem badge — ruby */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 7,
            width: 5,
            height: 5,
            backgroundColor: GEM.ruby,
            transform: "rotate(45deg)",
            boxShadow: `0 0 4px ${GEM.ruby}`,
          }}
        />
        {/* Belt */}
        <div style={{ position: "absolute", bottom: 2, left: 0, width: 18, height: 2, backgroundColor: "#3D2512" }} />
        {/* Belt buckle */}
        <div style={{ position: "absolute", bottom: 1, left: 7, width: 4, height: 4, backgroundColor: "#C0A030", borderRadius: 1 }} />
      </div>

      {/* Left arm */}
      <div
        className="george-left-arm"
        style={{
          position: "absolute",
          top: 22,
          left: -1,
          width: 5,
          height: 16,
          backgroundColor: "#5C3317",
          borderRadius: "0 0 2px 2px",
        }}
      />
      {/* Right arm */}
      <div
        className="george-right-arm"
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          width: 5,
          height: 16,
          backgroundColor: "#5C3317",
          borderRadius: "0 0 2px 2px",
        }}
      />
      {/* Magnifying glass in right hand */}
      {!isWalking && (
        <div style={{ position: "absolute", top: 20, left: 27 }}>
          <div
            style={{
              width: 9,
              height: 9,
              border: "2px solid #C0C0C0",
              borderRadius: "50%",
              backgroundColor: "rgba(100,150,255,0.15)",
            }}
          />
          <div
            style={{
              width: 2,
              height: 7,
              backgroundColor: "#8B6914",
              position: "absolute",
              top: 8,
              left: 7,
              transform: "rotate(45deg)",
              transformOrigin: "top left",
            }}
          />
        </div>
      )}

      {/* Left leg */}
      <div
        className="george-left-leg"
        style={{
          position: "absolute",
          top: 42,
          left: 6,
          width: 6,
          height: 16,
          backgroundColor: "#3D2512",
        }}
      />
      {/* Right leg */}
      <div
        className="george-right-leg"
        style={{
          position: "absolute",
          top: 42,
          left: 14,
          width: 6,
          height: 16,
          backgroundColor: "#3D2512",
        }}
      />
      {/* Left boot */}
      <div style={{ position: "absolute", top: 56, left: 4, width: 9, height: 4, backgroundColor: "#2C1810", borderRadius: "0 2px 2px 0" }} />
      {/* Right boot */}
      <div style={{ position: "absolute", top: 56, left: 13, width: 9, height: 4, backgroundColor: "#2C1810", borderRadius: "0 2px 2px 0" }} />
    </div>
  );
}

// ─── SEO Agent — The Scroll Keeper ──────────────────────────────────
function SEOAgentSprite() {
  return (
    <div
      style={{
        position: "relative",
        width: 36,
        height: 64,
        imageRendering: "pixelated",
        animation: "breathe 3.5s ease-in-out infinite",
        transformOrigin: "bottom center",
      }}
    >
      {/* Head */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 5,
          width: 16,
          height: 16,
          backgroundColor: "#D4A574",
        }}
      >
        {/* Hair / hood edge */}
        <div style={{ position: "absolute", top: -2, left: -1, width: 18, height: 4, backgroundColor: "#2C2C54", borderRadius: "3px 3px 0 0" }} />
        {/* Left eye */}
        <div style={{ position: "absolute", top: 6, left: 3, width: 3, height: 3, backgroundColor: "#1a1a2e", borderRadius: 1 }} />
        {/* Right eye */}
        <div style={{ position: "absolute", top: 6, left: 10, width: 3, height: 3, backgroundColor: "#1a1a2e", borderRadius: 1 }} />
        {/* Eye shine */}
        <div style={{ position: "absolute", top: 6, left: 4, width: 1, height: 1, backgroundColor: "#fff" }} />
        <div style={{ position: "absolute", top: 6, left: 11, width: 1, height: 1, backgroundColor: "#fff" }} />
        {/* Smile */}
        <div style={{ position: "absolute", top: 11, left: 6, width: 4, height: 2, backgroundColor: "#B58B5F", borderRadius: "0 0 2px 2px" }} />
      </div>

      {/* Body — dark robe */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 3,
          width: 20,
          height: 26,
          backgroundColor: "#2C2C54",
          borderRadius: "0 0 4px 4px",
        }}
      >
        {/* Robe collar */}
        <div style={{ position: "absolute", top: 0, left: 3, width: 14, height: 3, backgroundColor: "#3D3D6B" }} />
        {/* Scroll icon on chest */}
        <div style={{ position: "absolute", top: 7, left: 7, width: 6, height: 8, backgroundColor: "#D4C5A0", borderRadius: 2, border: "1px solid #B8A87A" }} />
        {/* Scroll text lines */}
        <div style={{ position: "absolute", top: 10, left: 9, width: 3, height: 1, backgroundColor: "#8B7D5A" }} />
        <div style={{ position: "absolute", top: 12, left: 9, width: 2, height: 1, backgroundColor: "#8B7D5A" }} />
        {/* Robe sash */}
        <div style={{ position: "absolute", top: 18, left: 0, width: 20, height: 2, backgroundColor: "#C0A030" }} />
      </div>

      {/* Left arm */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: -1,
          width: 5,
          height: 18,
          backgroundColor: "#2C2C54",
          borderRadius: "0 0 2px 2px",
        }}
      />
      {/* Right arm + quill */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 22,
          width: 5,
          height: 18,
          backgroundColor: "#2C2C54",
          borderRadius: "0 0 2px 2px",
        }}
      />
      {/* Quill pen */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 27,
          width: 2,
          height: 18,
          background: "linear-gradient(180deg, #FFD700 0%, #fff 40%, #D4C5A0 100%)",
          transform: "rotate(-15deg)",
          transformOrigin: "bottom center",
          borderRadius: 1,
        }}
      />
      {/* Quill feather */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 25,
          width: 8,
          height: 6,
          backgroundColor: "#E8D8B8",
          borderRadius: "50%",
          transform: "rotate(-15deg)",
          opacity: 0.9,
        }}
      />

      {/* Robe bottom / legs hidden */}
      <div
        style={{
          position: "absolute",
          top: 42,
          left: 1,
          width: 24,
          height: 10,
          backgroundColor: "#2C2C54",
          borderRadius: "0 0 6px 6px",
        }}
      />
      {/* Sandals peaking out */}
      <div style={{ position: "absolute", top: 50, left: 4, width: 8, height: 3, backgroundColor: "#6B4226", borderRadius: 1 }} />
      <div style={{ position: "absolute", top: 50, left: 14, width: 8, height: 3, backgroundColor: "#6B4226", borderRadius: 1 }} />
    </div>
  );
}

// ─── Stone Desk ─────────────────────────────────────────────────────
function StoneDesk({ x, y, w = 90 }: { x: number; y: number; w?: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y, zIndex: 5 }}>
      {/* Desk surface — stone slab */}
      <div
        style={{
          width: w,
          height: 10,
          background: "linear-gradient(90deg, #5a5a4a, #6B6B5A, #5a5a4a)",
          borderRadius: 2,
          imageRendering: "pixelated",
          boxShadow: "0 2px 0 #4a4a3a, 0 4px 0 #3a3a2a",
        }}
      />
      {/* Legs */}
      <div style={{ display: "flex", justifyContent: "space-between", width: w, paddingLeft: 8, paddingRight: 8 }}>
        <div style={{ width: 8, height: 20, backgroundColor: "#4a4a3a" }} />
        <div style={{ width: 8, height: 20, backgroundColor: "#4a4a3a" }} />
      </div>
    </div>
  );
}

// ─── Gem Display Case ───────────────────────────────────────────────
function GemCase({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <div className="absolute" style={{ left: x, top: y, zIndex: 6 }}>
      {/* Glass box */}
      <div
        style={{
          width: 16,
          height: 14,
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: 1,
          backgroundColor: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Gem inside */}
        <div
          style={{
            width: 6,
            height: 6,
            backgroundColor: color,
            transform: "rotate(45deg)",
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Treasure Chest ─────────────────────────────────────────────────
function TreasureChest({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y, zIndex: 5 }}>
      {/* Lid */}
      <div
        style={{
          width: 28,
          height: 10,
          backgroundColor: "#A0792C",
          borderRadius: "4px 4px 0 0",
          border: "2px solid #8B6914",
          borderBottom: "none",
          position: "relative",
        }}
      >
        {/* Metal band */}
        <div style={{ position: "absolute", top: 3, left: 0, right: 0, height: 2, backgroundColor: "#C0A030" }} />
      </div>
      {/* Base */}
      <div
        style={{
          width: 28,
          height: 16,
          backgroundColor: "#8B6914",
          border: "2px solid #6B4E10",
          borderTop: "none",
          position: "relative",
          animation: "chest-glow 3s ease-in-out infinite",
        }}
      >
        {/* Metal band */}
        <div style={{ position: "absolute", top: 5, left: 0, right: 0, height: 2, backgroundColor: "#C0A030" }} />
        {/* Lock gem */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 10,
            width: 6,
            height: 6,
            backgroundColor: GEM.ruby,
            transform: "rotate(45deg)",
            boxShadow: `0 0 6px ${GEM.ruby}`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Scroll Pile ────────────────────────────────────────────────────
function ScrollPile({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y, zIndex: 5 }}>
      {[0, 4, 8].map((off, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: off,
            left: i * 3,
            width: 14,
            height: 6,
            backgroundColor: "#D4C5A0",
            borderRadius: 3,
            border: "1px solid #B8A87A",
            transform: `rotate(${(i - 1) * 10}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Vine ───────────────────────────────────────────────────────────
function Vine({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        zIndex: 7,
        animation: `vine-swing ${3 + Math.random() * 2}s ease-in-out infinite`,
        transformOrigin: "top center",
      }}
    >
      <div style={{ width: 3, height: h, backgroundColor: "#1a6b1a", borderRadius: "0 0 2px 2px" }} />
      {/* Small leaves */}
      {Array.from({ length: Math.floor(h / 18) }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 10 + i * 18,
            left: i % 2 === 0 ? -5 : 3,
            width: 7,
            height: 5,
            backgroundColor: "#228B22",
            borderRadius: i % 2 === 0 ? "50% 0 50% 50%" : "0 50% 50% 50%",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export function PixelOffice() {
  const [georgeMsg, setGeorgeMsg] = useState<string | null>(null);
  const [seoMsg, setSeoMsg] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [seoJumping, setSeoJumping] = useState(false);
  const [gMsgIdx, setGMsgIdx] = useState(0);
  const [sMsgIdx, setSMsgIdx] = useState(0);
  const lastRealtimeRef = useRef(0);

  // Poll comms table every 3 seconds for new entries
  useEffect(() => {
    let lastId: string | null = null;

    const poll = async () => {
      try {
        const supabase = createClient();
        const query = supabase
          .from("comms")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        const { data } = await query;
        if (!data || data.length === 0) return;

        const latest = data[0];
        if (latest.id === lastId) return; // No new entry
        lastId = latest.id;

        const msg = latest.message || "New activity...";
        const fromAgent = latest.from_agent || "George";
        lastRealtimeRef.current = Date.now();

        if (fromAgent.toLowerCase().includes("seo") || fromAgent.toLowerCase().includes("sub")) {
          setSeoMsg(msg);
          setTimeout(() => setSeoMsg(null), 5000);
        } else {
          setGeorgeMsg(msg);
          setTimeout(() => setGeorgeMsg(null), 5000);
          if (msg.toLowerCase().includes("dispatch") || msg.toLowerCase().includes("seo") || msg.toLowerCase().includes("write")) {
            setIsDispatching(true);
            setTimeout(() => { setSeoJumping(true); setTimeout(() => setSeoJumping(false), 500); }, 1200);
            setTimeout(() => setIsDispatching(false), 3000);
          }
        }
      } catch {
        // silent fail
      }
    };

    // Initial poll after 2s
    const timeout = setTimeout(poll, 2000);
    const interval = setInterval(poll, 3000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // ── Fallback message cycling (every 6s, skip if realtime active) ──
  useEffect(() => {
    const showGeorge = (msg: string) => {
      setGeorgeMsg(msg);
      setTimeout(() => setGeorgeMsg(null), 4000);
    };
    const showSeo = (msg: string) => {
      setSeoMsg(msg);
      setTimeout(() => setSeoMsg(null), 4000);
    };

    // Initial message
    showGeorge(GEORGE_MESSAGES[0]);

    const interval = setInterval(() => {
      if (Date.now() - lastRealtimeRef.current < 30000) return;

      // Alternate between George and SEO
      const isGeorgeTurn = Math.random() > 0.4;
      if (isGeorgeTurn) {
        setGMsgIdx((prev) => {
          const next = (prev + 1) % GEORGE_MESSAGES.length;
          const msg = GEORGE_MESSAGES[next];
          showGeorge(msg);

          // Trigger dispatch animation on certain messages
          if (
            msg.includes("boss") ||
            msg.includes("B2B") ||
            msg.includes("design")
          ) {
            setIsDispatching(true);
            setTimeout(() => {
              setSeoJumping(true);
              setTimeout(() => setSeoJumping(false), 500);
            }, 1200);
            setTimeout(() => setIsDispatching(false), 3000);
          }
          return next;
        });
      } else {
        setSMsgIdx((prev) => {
          const next = (prev + 1) % SEO_MESSAGES.length;
          showSeo(SEO_MESSAGES[next]);
          return next;
        });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        minHeight: 600,
        height: 600,
        imageRendering: "pixelated",
        border: "2px solid #2a2a3a",
      }}
    >
      <GemHQStyles />

      {/* ═══ SKY LAYER ════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 20%, #2d1b4e 40%, #3d1f5e 55%, #4a2040 65%, #2a1a20 80%, #1a1a15 100%)",
          zIndex: 0,
        }}
      />

      {/* Stars */}
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: "#fff",
            borderRadius: star.size > 2 ? 1 : 0,
            animation: `star-twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            zIndex: 1,
          }}
        />
      ))}

      {/* ═══ MOUNTAIN LAYERS ══════════════════════════════════════ */}
      {/* Far mountains */}
      <div
        className="absolute"
        style={{
          bottom: 200,
          left: 0,
          right: 0,
          height: 220,
          background: "#0D2B0D",
          clipPath:
            "polygon(0 100%, 0 70%, 4% 55%, 10% 65%, 18% 35%, 26% 50%, 32% 25%, 40% 40%, 48% 20%, 56% 45%, 62% 30%, 70% 55%, 78% 40%, 84% 25%, 90% 50%, 96% 35%, 100% 55%, 100% 100%)",
          zIndex: 1,
        }}
      />
      {/* Near mountains */}
      <div
        className="absolute"
        style={{
          bottom: 170,
          left: 0,
          right: 0,
          height: 200,
          background: "#15451A",
          clipPath:
            "polygon(0 100%, 0 75%, 6% 55%, 14% 70%, 22% 45%, 30% 60%, 38% 40%, 46% 55%, 54% 35%, 62% 50%, 68% 42%, 76% 60%, 84% 50%, 92% 65%, 100% 50%, 100% 100%)",
          zIndex: 2,
        }}
      />

      {/* ═══ JUNGLE LAYER ═════════════════════════════════════════ */}
      <PalmTree x={3} h={140} lean={-5} />
      <PalmTree x={10} h={120} lean={3} />
      <PalmTree x={85} h={150} lean={5} />
      <PalmTree x={93} h={110} lean={-3} />
      <PalmTree x={18} h={100} lean={-8} />
      <PalmTree x={78} h={95} lean={8} />

      {/* Tropical bushes */}
      {[5, 15, 22, 75, 82, 92].map((x, i) => (
        <div
          key={`bush-${i}`}
          className="absolute"
          style={{
            left: `${x}%`,
            bottom: 168,
            width: 30 + (i % 3) * 10,
            height: 20 + (i % 2) * 8,
            backgroundColor: i % 2 === 0 ? "#1a5c1a" : "#1a6b1a",
            borderRadius: "50% 50% 20% 20%",
            zIndex: 3,
          }}
        />
      ))}

      {/* Vines hanging from building */}
      <Vine x={230} y={100} h={70} />
      <Vine x={650} y={110} h={60} />

      {/* ═══ GROUND LAYER ═════════════════════════════════════════ */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background:
            "linear-gradient(180deg, #2d5a1a 0%, #3d6b2a 8%, #4a3a1a 20%, #3d2f15 50%, #2d2010 100%)",
          zIndex: 3,
        }}
      />
      {/* Grass tufts along top of ground */}
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={`grass-${i}`}
          className="absolute"
          style={{
            left: `${(i * 3.5) % 100}%`,
            bottom: 176,
            width: 4,
            height: 8 + (i % 3) * 3,
            backgroundColor: i % 3 === 0 ? "#3d8b2a" : "#2d6b1a",
            borderRadius: "3px 3px 0 0",
            zIndex: 4,
          }}
        />
      ))}

      {/* Ground crystals */}
      <GroundCrystal x={8} color={GEM.ruby} />
      <GroundCrystal x={20} color={GEM.sapphire} />
      <GroundCrystal x={35} color={GEM.emerald} />
      <GroundCrystal x={55} color={GEM.amethyst} />
      <GroundCrystal x={70} color={GEM.topaz} />
      <GroundCrystal x={88} color={GEM.ruby} />
      <GroundCrystal x={95} color={GEM.sapphire} />

      {/* ═══ BUILDING — Stone Temple HQ ═══════════════════════════ */}
      <div
        className="absolute"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 70,
          width: 480,
          height: 340,
          zIndex: 4,
        }}
      >
        {/* Roof / Pediment — triangle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -20,
            width: 0,
            height: 0,
            borderLeft: "260px solid transparent",
            borderRight: "260px solid transparent",
            borderBottom: "70px solid #4a4a3a",
          }}
        />
        {/* Roof detail — inner triangle */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 40,
            width: 0,
            height: 0,
            borderLeft: "200px solid transparent",
            borderRight: "200px solid transparent",
            borderBottom: "50px solid #5a5a4a",
          }}
        />

        {/* GEM HQ Sign */}
        <div
          className="pixel-font absolute"
          style={{
            top: 30,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 14,
            color: "#FFD700",
            textShadow:
              "0 0 10px rgba(255,215,0,0.8), 0 0 20px rgba(255,215,0,0.4), 0 2px 0 #B8860B",
            letterSpacing: 4,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          GEM HQ
        </div>

        {/* Main walls */}
        <div
          style={{
            position: "absolute",
            top: 68,
            left: 0,
            width: 480,
            height: 272,
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 19px,
                rgba(0,0,0,0.15) 19px,
                rgba(0,0,0,0.15) 20px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 39px,
                rgba(0,0,0,0.12) 39px,
                rgba(0,0,0,0.12) 40px
              ),
              linear-gradient(180deg, #5a5a4a 0%, #4a4a3a 100%)
            `,
            imageRendering: "pixelated",
          }}
        />

        {/* Left column */}
        <div
          style={{
            position: "absolute",
            top: 68,
            left: 4,
            width: 16,
            height: 272,
            backgroundColor: "#6B6B5A",
            boxShadow: "inset -3px 0 0 rgba(0,0,0,0.2)",
          }}
        />
        {/* Right column */}
        <div
          style={{
            position: "absolute",
            top: 68,
            left: 460,
            width: 16,
            height: 272,
            backgroundColor: "#6B6B5A",
            boxShadow: "inset 3px 0 0 rgba(0,0,0,0.2)",
          }}
        />
        {/* Column capitals */}
        {[4, 460].map((colX) => (
          <div
            key={colX}
            style={{
              position: "absolute",
              top: 62,
              left: colX - 4,
              width: 24,
              height: 8,
              backgroundColor: "#7B7B6A",
              borderRadius: "2px 2px 0 0",
            }}
          />
        ))}

        {/* Entrance arch */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 70,
            height: 90,
            backgroundColor: "#1a1a15",
            borderRadius: "35px 35px 0 0",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
          }}
        />
        {/* Entrance arch border */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 78,
            height: 94,
            border: "4px solid #6B6B5A",
            borderBottom: "none",
            borderRadius: "40px 40px 0 0",
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        />

        {/* Torches */}
        <Torch x={50} y={90} />
        <Torch x={415} y={90} />
        <Torch x={185} y={100} />
        <Torch x={280} y={100} />

        {/* ─── Interior Elements ──────────────────────────────── */}

        {/* George's stone desk */}
        <StoneDesk x={50} y={230} w={100} />
        {/* SEO's stone desk */}
        <StoneDesk x={310} y={230} w={100} />

        {/* Gem display cases on desks */}
        <GemCase x={70} y={218} color={GEM.sapphire} />
        <GemCase x={95} y={218} color={GEM.ruby} />
        <GemCase x={340} y={218} color={GEM.emerald} />

        {/* Monitor/scroll on George's desk */}
        <div
          className="absolute"
          style={{
            left: 120,
            top: 214,
            width: 20,
            height: 16,
            backgroundColor: "#1a1a2e",
            border: "2px solid #3d3d5a",
            borderRadius: 1,
            zIndex: 6,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(180deg, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.2) 100%)",
            }}
          />
        </div>

        {/* Treasure chest */}
        <TreasureChest x={430} y={250} />

        {/* Scroll pile near SEO */}
        <ScrollPile x={380} y={240} />

        {/* ─── Characters ─────────────────────────────────────── */}

        {/* George — The Gem Explorer */}
        <motion.div
          className="absolute"
          style={{ left: 80, top: 165, zIndex: 10 }}
          animate={
            isDispatching
              ? { x: [0, 240, 240, 0] }
              : { x: 0 }
          }
          transition={
            isDispatching
              ? {
                  duration: 3,
                  times: [0, 0.35, 0.65, 1],
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              {georgeMsg && !isDispatching && (
                <SpeechBubble key={georgeMsg} message={georgeMsg} side="left" />
              )}
            </AnimatePresence>
            {/* Name tag */}
            <div
              className="pixel-font absolute"
              style={{
                top: -28,
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontSize: 6,
                color: "#FFD700",
                textShadow: "0 0 6px rgba(255,215,0,0.5)",
                zIndex: 11,
              }}
            >
              George 🤖 MAIN
            </div>
            {/* Active status dot */}
            <div
              style={{
                position: "absolute",
                top: -12,
                left: -6,
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#2ECC71",
                boxShadow: "0 0 6px #2ECC71",
                animation: "gem-glow 2s ease-in-out infinite",
              }}
            />
            <GeorgeSprite isWalking={isDispatching} />
          </div>
        </motion.div>

        {/* SEO Agent — The Scroll Keeper */}
        <motion.div
          className="absolute"
          style={{ left: 340, top: 170, zIndex: 10 }}
          animate={
            seoJumping
              ? { y: [0, -15, 0] }
              : { y: 0 }
          }
          transition={
            seoJumping
              ? { duration: 0.4, ease: "easeOut" }
              : { duration: 0.3 }
          }
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              {seoMsg && (
                <SpeechBubble key={seoMsg} message={seoMsg} side="right" />
              )}
            </AnimatePresence>
            {/* Name tag */}
            <div
              className="pixel-font absolute"
              style={{
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontSize: 6,
                color: "#9B59B6",
                textShadow: "0 0 6px rgba(155,89,182,0.5)",
                zIndex: 11,
              }}
            >
              SEO Agent ✍️ SUB
            </div>
            {/* Active status dot */}
            <div
              style={{
                position: "absolute",
                top: -8,
                left: -6,
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#2ECC71",
                boxShadow: "0 0 6px #2ECC71",
                animation: "gem-glow 2.5s ease-in-out infinite",
                animationDelay: "0.5s",
              }}
            />
            <SEOAgentSprite />
          </div>
        </motion.div>
      </div>

      {/* ═══ FLOATING GEMS ════════════════════════════════════════ */}
      <FloatingGem x={80} y={120} color={GEM.ruby} size={10} delay={0} />
      <FloatingGem x={200} y={80} color={GEM.sapphire} size={14} delay={1} />
      <FloatingGem x={450} y={100} color={GEM.emerald} size={12} delay={2} />
      <FloatingGem x={650} y={130} color={GEM.amethyst} size={10} delay={0.5} />
      <FloatingGem x={750} y={90} color={GEM.topaz} size={11} delay={1.5} />
      <FloatingGem x={350} y={60} color={GEM.ruby} size={8} delay={2.5} />
      <FloatingGem x={550} y={70} color={GEM.sapphire} size={9} delay={3} />

      {/* ═══ SPARKLE PARTICLES ════════════════════════════════════ */}
      <Sparkles />

      {/* ═══ STATUS BAR ═══════════════════════════════════════════ */}
      <div
        className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2 pixel-font"
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          borderTop: "2px solid #C0A030",
          fontSize: 8,
          zIndex: 15,
        }}
      >
        <span style={{ color: "#C0A030" }}>
          💎 Gem HQ — Joalys Paris Operations
        </span>
        <span className="flex items-center gap-3">
          <span style={{ color: "#8B8B7A" }}>
            Sri Lanka 🇱🇰
          </span>
          <span style={{ color: "#2ECC71" }}>
            ● 2 agents online
          </span>
        </span>
      </div>
    </div>
  );
}
