import { useEffect, useMemo, useRef } from 'react';

interface CharacterRigProps {
  size?: 'sidebar' | 'splash';
  celebratePulse?: number;
}

const optionalAssets = import.meta.glob('../assets/character*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function resolveCharacterAssets() {
  let headUrl: string | null = null;
  let bodyUrl: string | null = null;
  let singleUrl: string | null = null;

  for (const [path, url] of Object.entries(optionalAssets)) {
    const file = path.split('/').pop()?.toLowerCase() ?? '';
    if (file === 'character-head.png') headUrl = url;
    else if (file === 'character-body.png') bodyUrl = url;
    else if (file === 'character.png') singleUrl = url;
  }

  if (headUrl && bodyUrl) {
    return { mode: 'split-png' as const, headUrl, bodyUrl };
  }
  if (singleUrl) {
    return { mode: 'single-png' as const, singleUrl };
  }
  return { mode: 'svg-split' as const };
}

function CyberAvatarBodySvg() {
  return (
    <svg
      viewBox="0 0 220 260"
      className="character-img"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Tactical Cyber Coat / Shoulders */}
      <path
        d="M52 222 L66 138 L86 122 L110 132 L134 122 L154 138 L168 222 Z"
        fill="var(--rig-fill)"
        stroke="var(--rig-stroke)"
        strokeWidth="1.6"
      />
      {/* Inner Chest Plate & Neural Conduit */}
      <path
        d="M84 126 L110 144 L136 126 L128 214 L92 214 Z"
        fill="var(--rig-fill-inner)"
        stroke="var(--rig-stroke-soft)"
        strokeWidth="1.2"
      />
      {/* Glowing Core Diamond */}
      <polygon
        points="110,148 122,164 110,180 98,164"
        fill="var(--rig-accent)"
        fillOpacity="0.92"
      />
      <polygon
        points="110,154 116,164 110,174 104,164"
        fill="var(--bg-void)"
      />
      {/* Shoulder HUD Pins */}
      <line x1="66" y1="146" x2="88" y2="152" stroke="var(--rig-stroke)" strokeWidth="1.2" />
      <line x1="154" y1="146" x2="132" y2="152" stroke="var(--rig-stroke)" strokeWidth="1.2" />
      <circle cx="64" cy="146" r="2.2" fill="var(--rig-accent)" />
      <circle cx="156" cy="146" r="2.2" fill="var(--rig-accent)" />
      {/* Collar Framing */}
      <path
        d="M78 126 L92 104 L110 116 L128 104 L142 126"
        fill="none"
        stroke="var(--rig-stroke)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CyberAvatarHeadSvg() {
  return (
    <svg
      viewBox="0 0 220 260"
      className="character-img"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Cyber Halo Antennae / Hair Silhouette */}
      <path
        d="M74 88 L64 56 L82 40 L110 32 L138 40 L156 56 L146 88"
        fill="var(--rig-fill)"
        stroke="var(--rig-stroke)"
        strokeWidth="1.6"
      />
      {/* Twin Side Crest Blades */}
      <path d="M72 78 L52 62 L66 94 Z" fill="var(--rig-fill-inner)" stroke="var(--rig-stroke-soft)" strokeWidth="1.2" />
      <path d="M148 78 L168 62 L154 94 Z" fill="var(--rig-fill-inner)" stroke="var(--rig-stroke-soft)" strokeWidth="1.2" />
      {/* Helmet / Face Shell */}
      <path
        d="M80 54 L140 54 L144 88 L126 112 L94 112 L76 88 Z"
        fill="var(--rig-fill-inner)"
        stroke="var(--rig-stroke)"
        strokeWidth="1.6"
      />
      {/* Neural Visor */}
      <polygon
        points="82,74 138,74 132,90 88,90"
        fill="var(--rig-accent)"
        fillOpacity="0.92"
      />
      {/* Visor Scan Slit */}
      <line x1="88" y1="82" x2="132" y2="82" stroke="var(--bg-void)" strokeWidth="1.8" />
      <circle cx="98" cy="82" r="2.2" fill="var(--bg-void)" />
      <circle cx="122" cy="82" r="2.2" fill="var(--bg-void)" />
      {/* Crown Crest */}
      <polygon points="110,36 116,49 110,56 104,49" fill="var(--rig-accent)" />
    </svg>
  );
}

export function CharacterRig({ size = 'sidebar', celebratePulse = 0 }: CharacterRigProps) {
  const assets = useMemo(resolveCharacterAssets, []);
  const stageRef = useRef<HTMLDivElement>(null);
  const headLayerRef = useRef<HTMLDivElement>(null);
  const bodyLayerRef = useRef<HTMLDivElement>(null);
  const singleLayerRef = useRef<HTMLDivElement>(null);
  const celebrating = celebratePulse > 0;

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let rafId = 0;
    const startTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.42;
      const normX = Math.max(-1, Math.min(1, (e.clientX - cx) / Math.max(window.innerWidth * 0.45, 220)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - cy) / Math.max(window.innerHeight * 0.45, 220)));
      target.x = normX;
      target.y = normY;
    };

    const handlePointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const applyTransforms = (now: number) => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      const elapsed = (now - startTime) * 0.001;
      const floatY = reducedMotion ? 0 : Math.sin(elapsed * 1.9) * 4.5;

      if (assets.mode === 'single-png') {
        const el = singleLayerRef.current;
        if (el) {
          const rx = -current.y * 6;
          const ry = current.x * 9;
          const rz = current.x * 2;
          el.style.transform = `perspective(700px) translate3d(0, ${floatY.toFixed(2)}px, 0) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
        }
      } else {
        const headEl = headLayerRef.current;
        const bodyEl = bodyLayerRef.current;

        if (headEl) {
          const tx = current.x * 3.5;
          const ty = current.y * 3.5 + floatY;
          const ry = current.x * 14;
          const rx = -current.y * 9;
          const rz = current.x * 4.5;
          headEl.style.transform = `perspective(700px) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
        }

        if (bodyEl) {
          const btx = -current.x * 1.8;
          const bty = -current.y * 1.2 + floatY * 0.82;
          const bry = -current.x * 2.5;
          bodyEl.style.transform = `perspective(700px) translate3d(${btx.toFixed(2)}px, ${bty.toFixed(2)}px, 0) rotateY(${bry.toFixed(2)}deg)`;
        }
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(applyTransforms);
      }
    };

    const handleMotionChange = () => {
      reducedMotion = motionQuery.matches;
      cancelAnimationFrame(rafId);
      if (!reducedMotion) {
        rafId = requestAnimationFrame(applyTransforms);
      } else {
        applyTransforms(performance.now());
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    motionQuery.addEventListener('change', handleMotionChange);

    if (!reducedMotion) {
      rafId = requestAnimationFrame(applyTransforms);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [assets.mode]);

  return (
    <div
      className={`character-rig-root character-rig-root--${size}`}
      aria-label="Neural Operator Avatar"
    >
      {/* Rotating Targeting Reticle */}
      <div className="character-reticle" aria-hidden="true">
        <svg
          viewBox="0 0 240 240"
          className={`character-reticle-svg ${celebrating ? 'character-reticle-svg--celebrate' : ''}`}
        >
          <circle
            cx="120"
            cy="120"
            r="104"
            fill="none"
            stroke="var(--rig-stroke-soft)"
            strokeWidth="1"
            strokeDasharray="10 8"
          />
          <g className="character-reticle-ring-inner">
            <circle
              cx="120"
              cy="120"
              r="84"
              fill="none"
              stroke="var(--rig-stroke)"
              strokeOpacity="0.45"
              strokeWidth="1"
              strokeDasharray="24 14 4 14"
            />
          </g>
          <line x1="120" y1="6" x2="120" y2="20" stroke="var(--rig-accent)" strokeOpacity="0.7" strokeWidth="1.2" />
          <line x1="120" y1="220" x2="120" y2="234" stroke="var(--rig-accent)" strokeOpacity="0.7" strokeWidth="1.2" />
          <line x1="6" y1="120" x2="20" y2="120" stroke="var(--rig-accent)" strokeOpacity="0.7" strokeWidth="1.2" />
          <line x1="220" y1="120" x2="234" y2="120" stroke="var(--rig-accent)" strokeOpacity="0.7" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Circular Holographic Floor Pedestal */}
      <svg viewBox="0 0 200 36" className="character-pedestal" aria-hidden="true">
        <ellipse
          cx="100"
          cy="18"
          rx="90"
          ry="13"
          fill="var(--bg-subtle-surface)"
          stroke="var(--rig-stroke)"
          strokeOpacity="0.55"
          strokeWidth="1.1"
        />
        <ellipse
          cx="100"
          cy="18"
          rx="62"
          ry="8"
          fill="none"
          stroke="var(--rig-accent)"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="6 5"
        />
      </svg>

      {/* Flat Transform Stage (NO preserve-3d, NO drop-shadow, overflow visible) */}
      <div ref={stageRef} className="character-stage">
        {assets.mode === 'single-png' ? (
          <div ref={singleLayerRef} className="character-layer character-layer--head">
            <img src={assets.singleUrl} alt="Character Rig" className="character-img" draggable={false} />
          </div>
        ) : assets.mode === 'split-png' ? (
          <>
            <div ref={bodyLayerRef} className="character-layer character-layer--body">
              <img src={assets.bodyUrl} alt="Character Body" className="character-img" draggable={false} />
            </div>
            <div ref={headLayerRef} className="character-layer character-layer--head">
              <img src={assets.headUrl} alt="Character Head" className="character-img" draggable={false} />
            </div>
          </>
        ) : (
          <>
            <div ref={bodyLayerRef} className="character-layer character-layer--body">
              <CyberAvatarBodySvg />
            </div>
            <div ref={headLayerRef} className="character-layer character-layer--head">
              <CyberAvatarHeadSvg />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
