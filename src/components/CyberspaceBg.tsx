import { useEffect, useRef } from 'react';
import type { AppTheme } from '../hooks/usePreferences';

interface ConstellationNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
}

interface DataPulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
}

const NODE_COUNT = 42;
const PULSE_COUNT = 14;
const LINK_DISTANCE = 175;
const POINTER_RADIUS = 210;

function createNodes(width: number, height: number): ConstellationNode[] {
  const nodes: ConstellationNode[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.24,
      r: 1.2 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return nodes;
}

function createPulses(): DataPulse[] {
  const pulses: DataPulse[] = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    const a = Math.floor(Math.random() * NODE_COUNT);
    const b = (a + 1 + Math.floor(Math.random() * 5)) % NODE_COUNT;
    pulses.push({
      fromIdx: a,
      toIdx: b,
      progress: Math.random(),
      speed: 0.008 + Math.random() * 0.012,
    });
  }
  return pulses;
}

export function CyberspaceBg({ theme }: { theme: AppTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isClaude = theme === 'claude';
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const nodes = createNodes(width, height);
    const pulses = createPulses();
    const pointer = { x: width * 0.5, y: height * 0.45, active: false };

    let gridOffset = 0;
    let rafId = 0;
    let time = 0;

    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleMotionChange = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) {
        cancelAnimationFrame(rafId);
        drawFrame(0);
      } else {
        rafId = requestAnimationFrame(loop);
      }
    };

    function drawPerspectiveFloor(scroll: number) {
      if (!ctx) return;
      const horizonY = height * 0.54;
      const floorHeight = height - horizonY;
      const vanishX = width * 0.5 + (pointer.active ? (pointer.x - width * 0.5) * 0.035 : 0);

      const glow = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 90);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0)');
      glow.addColorStop(0.45, 'rgba(255, 255, 255, 0.08)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - 40, width, 130);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      const lineCount = 24;
      const spread = width * 1.9;
      for (let i = -lineCount; i <= lineCount; i++) {
        const bottomX = vanishX + (i / lineCount) * spread;
        const alpha = Math.max(0.02, 0.14 - Math.abs(i) * 0.0045);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      const rows = 14;
      for (let r = 0; r < rows; r++) {
        const rawT = ((r + scroll) % rows) / rows;
        const depth = rawT * rawT;
        const y = horizonY + depth * floorHeight;
        const alpha = Math.min(0.18, 0.02 + depth * 0.16);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    function drawClaudeAmbient(dt: number) {
      if (!ctx) return;

      // Subtle warm radial glow in top-right corner for calm Claude Dark depth
      const ambient = ctx.createRadialGradient(
        width * 0.78,
        height * 0.16,
        20,
        width * 0.78,
        height * 0.16,
        Math.max(width, height) * 0.6
      );
      ambient.addColorStop(0, 'rgba(217, 119, 87, 0.06)');
      ambient.addColorStop(1, 'rgba(20, 20, 19, 0)');
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, width, height);

      for (const node of nodes) {
        if (!reducedMotion) {
          node.x += node.vx * 0.45 * dt;
          node.y += node.vy * 0.45 * dt;
          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;
        }
      }

      // Ultra-soft warm sand filaments so reading prose stays distraction-free
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DISTANCE * 0.85) {
            const alpha = (1 - dist / (LINK_DISTANCE * 0.85)) * 0.07;
            ctx.strokeStyle = `rgba(177, 173, 161, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pulse = 0.18 + 0.1 * Math.sin(time * 0.02 + node.phase);
        ctx.fillStyle =
          i % 5 === 0
            ? `rgba(217, 119, 87, ${(pulse * 1.35).toFixed(3)})`
            : `rgba(250, 249, 245, ${pulse.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawNoirConstellation(dt: number) {
      if (!ctx) return;

      for (const node of nodes) {
        if (!reducedMotion) {
          node.x += node.vx * dt;
          node.y += node.vy * dt;
          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;
        }
      }

      ctx.lineWidth = 0.85;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const alpha = (1 - dist / LINK_DISTANCE) * 0.18;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const pdx = a.x - pointer.x;
          const pdy = a.y - pointer.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < POINTER_RADIUS) {
            const alpha = (1 - pdist / POINTER_RADIUS) * 0.24;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      if (!reducedMotion) {
        for (const pulse of pulses) {
          pulse.progress += pulse.speed * dt;
          if (pulse.progress >= 1) {
            pulse.progress = 0;
            pulse.fromIdx = pulse.toIdx;
            let bestIdx = (pulse.fromIdx + 1) % nodes.length;
            let bestDist = Infinity;
            const origin = nodes[pulse.fromIdx];
            for (let k = 0; k < nodes.length; k++) {
              if (k === pulse.fromIdx) continue;
              const d = Math.hypot(nodes[k].x - origin.x, nodes[k].y - origin.y);
              if (d < LINK_DISTANCE && d < bestDist && Math.random() > 0.35) {
                bestDist = d;
                bestIdx = k;
              }
            }
            pulse.toIdx = bestIdx;
          }

          const from = nodes[pulse.fromIdx];
          const to = nodes[pulse.toIdx];
          const edgeDist = Math.hypot(to.x - from.x, to.y - from.y);
          if (edgeDist < LINK_DISTANCE * 1.35) {
            const px = from.x + (to.x - from.x) * pulse.progress;
            const py = from.y + (to.y - from.y) * pulse.progress;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(px, py, 1.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      for (const node of nodes) {
        const pulse = 0.4 + 0.3 * Math.sin(time * 0.03 + node.phase);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawFrame(dt: number) {
      if (!ctx) return;
      ctx.fillStyle = isClaude ? '#141413' : '#000000';
      ctx.fillRect(0, 0, width, height);

      if (!reducedMotion) {
        gridOffset = (gridOffset + 0.014 * dt) % 14;
        time += dt;
      }

      if (isClaude) {
        drawClaudeAmbient(dt);
      } else {
        drawPerspectiveFloor(gridOffset);
        drawNoirConstellation(dt);
      }
    }

    let lastTs = performance.now();
    function loop(now: number) {
      const dt = Math.min(2.5, (now - lastTs) / 16.667);
      lastTs = now;
      drawFrame(dt);
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    motionQuery.addEventListener('change', handleMotionChange);

    if (reducedMotion) {
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [theme]);

  return (
    <>
      <canvas ref={canvasRef} className="cyber-bg-canvas" aria-hidden="true" />
      <div className="cyber-scanlines" aria-hidden="true" />
      <div className="cyber-vignette" aria-hidden="true" />
    </>
  );
}
