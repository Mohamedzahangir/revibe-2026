import { useState, useEffect, useRef } from "react";
import SpiderWeb from "./navigation/SpiderWeb";

/* =========================================================
   REVIBE'26 — Registration Success Reveal
   ONE screen, ONE composition, ~7.5s
   Web-driven choreography · comic-book · premium
========================================================================= */

function createAudioCtx(ref) {
  if (!ref.current) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ref.current = new AC();
  }
  if (ref.current.state === "suspended") ref.current.resume();
  return ref.current;
}

const sfx = {
  webWhip(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const len = ctx.sampleRate * 0.08;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const p = i / len;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 4) * (1 + Math.sin(p * 40) * 0.3);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    src.connect(hp).connect(g).connect(ctx.destination);
    src.start(t);
  },
  webTension(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    osc.connect(lp).connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  },
  webSnap(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const len = ctx.sampleRate * 0.06;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 4000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    src.connect(hp).connect(g).connect(ctx.destination);
    src.start(t);
  },
  impact(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
    const noise = ctx.createBufferSource();
    const nBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const nd = nBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 5);
    noise.buffer = nBuf;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(ng).connect(ctx.destination);
    noise.start(t);
  },
  bigImpact(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.2);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(300, t);
    osc2.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    g2.gain.setValueAtTime(0.3, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc2.connect(g2).connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.15);
    const noise = ctx.createBufferSource();
    const nBuf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const nd = nBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 4);
    noise.buffer = nBuf;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    noise.connect(ng).connect(ctx.destination);
    noise.start(t);
  },
  chime(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    [1047, 1319, 1568].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * 0.05);
      g.gain.linearRampToValueAtTime(0.08, t + i * 0.05 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.12);
      osc.connect(g).connect(ctx.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.15);
    });
  },
  slingWhoosh(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const len = ctx.sampleRate * 0.25;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const p = i / len;
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 1.5) * (0.5 + Math.sin(p * Math.PI) * 0.5);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(1500, t);
    bp.frequency.exponentialRampToValueAtTime(3000, t + 0.1);
    bp.frequency.exponentialRampToValueAtTime(400, t + 0.25);
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(t);
  },
  lightWhoosh(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const len = ctx.sampleRate * 0.12;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(2000, t);
    bp.frequency.exponentialRampToValueAtTime(800, t + 0.12);
    bp.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(t);
  },
  finalHit(ctx) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 660;
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.05, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc2.connect(g2).connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.35);
  },
};

function WebStrands({ phase }) {
  return (
    <svg className="svr-strands" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <line className="svr-strand svr-st1" x1="-50" y1="180" x2="1050" y2="320"
        stroke="#dc0000" strokeWidth="1.2" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand svr-st2" x1="1050" y1="100" x2="-50" y2="500"
        stroke="rgba(26,26,26,0.18)" strokeWidth="0.8" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand svr-st3" x1="300" y1="-30" x2="700" y2="730"
        stroke="rgba(220,0,0,0.15)" strokeWidth="0.6" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand svr-st4" x1="-50" y1="450" x2="1050" y2="250"
        stroke="rgba(26,26,26,0.1)" strokeWidth="0.5" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand svr-st5" x1="800" y1="-30" x2="200" y2="730"
        stroke="rgba(220,0,0,0.1)" strokeWidth="0.5" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand svr-st6" x1="500" y1="-30" x2="500" y2="730"
        stroke="rgba(26,26,26,0.06)" strokeWidth="0.4" strokeLinecap="round" pathLength="1" />

      <line className="svr-strand-taut svr-taut1" x1="-50" y1="180" x2="1050" y2="320"
        stroke="#dc0000" strokeWidth="1.8" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand-taut svr-taut2" x1="1050" y1="100" x2="-50" y2="500"
        stroke="rgba(26,26,26,0.25)" strokeWidth="1" strokeLinecap="round" pathLength="1" />

      <line className="svr-strand-sling svr-sling1" x1="-50" y1="350" x2="500" y2="350"
        stroke="#dc0000" strokeWidth="1" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand-sling svr-sling2" x1="1050" y1="350" x2="500" y2="350"
        stroke="rgba(26,26,26,0.2)" strokeWidth="0.8" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand-sling svr-sling3" x1="500" y1="-30" x2="500" y2="350"
        stroke="rgba(220,0,0,0.12)" strokeWidth="0.6" strokeLinecap="round" pathLength="1" />
      <line className="svr-strand-sling svr-sling4" x1="500" y1="730" x2="500" y2="350"
        stroke="rgba(26,26,26,0.08)" strokeWidth="0.5" strokeLinecap="round" pathLength="1" />

      {phase >= 2 && (
        <g className="svr-particles">
          <circle className="svr-ptcl svr-ptcl1" r="1.5" fill="#dc0000">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M-50,180 L1050,320" />
          </circle>
          <circle className="svr-ptcl svr-ptcl2" r="1" fill="rgba(26,26,26,0.4)">
            <animateMotion dur="3s" repeatCount="indefinite" path="M1050,100 L-50,500" />
          </circle>
          <circle className="svr-ptcl svr-ptcl3" r="1.2" fill="rgba(220,0,0,0.3)">
            <animateMotion dur="2.8s" repeatCount="indefinite" path="M300,-30 L700,730" />
          </circle>
        </g>
      )}
    </svg>
  );
}

function ImpactBurst({ active, x = "50%", y = "43%", color = "#dc0000" }) {
  if (!active) return null;
  return (
    <svg className="svr-burst" style={{ left: x, top: y }} viewBox="0 0 200 200" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const inner = 15 + (i % 2) * 5;
        const outer = 60 + (i % 3) * 15;
        return (
          <line key={i}
            x1={100 + Math.cos(angle) * inner} y1={100 + Math.sin(angle) * inner}
            x2={100 + Math.cos(angle) * outer} y2={100 + Math.sin(angle) * outer}
            stroke={color} strokeWidth={i % 2 === 0 ? 2 : 1.2} strokeLinecap="round" />
        );
      })}
    </svg>
  );
}

function HalftoneBurst({ active }) {
  if (!active) return null;
  return (
    <svg className="svr-halftone" viewBox="0 0 400 400" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15) * Math.PI / 180;
        const r = 80 + (i % 4) * 25;
        const size = 2 + (i % 3) * 1.5;
        return (
          <circle key={i}
            cx={200 + Math.cos(angle) * r}
            cy={200 + Math.sin(angle) * r}
            r={size} fill="#1a1a1a" opacity={0.08 + (i % 3) * 0.03} />
        );
      })}
    </svg>
  );
}

export default function SpiderVerseReveal({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [flash, setFlash] = useState(0);
  const audioCtxRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [rm, setRm] = useState(false);

  useEffect(() => {
    setRm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const ctx = createAudioCtx(audioCtxRef);

    const timers = [];
    const at = (ms, fn) => { timers.push(setTimeout(fn, ms)); };

    at(30,   () => setPhase(1));
    at(100,  () => sfx.webWhip(ctx));
    at(200,  () => sfx.webWhip(ctx));
    at(400,  () => sfx.webSnap(ctx));
    at(1300, () => sfx.webTension(ctx));
    at(1500, () => { setFlash(1); sfx.impact(ctx); });
    at(2700, () => { setPhase(2); sfx.webSnap(ctx); });
    at(2900, () => sfx.chime(ctx));
    at(3200, () => sfx.lightWhoosh(ctx));
    at(4000, () => { setPhase(3); sfx.slingWhoosh(ctx); });
    at(4600, () => sfx.webTension(ctx));
    at(5000, () => { setFlash(2); setPhase(4); sfx.bigImpact(ctx); });
    at(6100, () => sfx.lightWhoosh(ctx));
    at(6400, () => sfx.lightWhoosh(ctx));
    at(6900, () => sfx.finalHit(ctx));
    at(7500, () => onCompleteRef.current?.());

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className={"svr-overlay" + (rm ? " svr-rm" : "")}>
      <div className="svr-grid" aria-hidden="true" />

      <SpiderWeb className="svr-corner svr-corner--tl" />
      <SpiderWeb className="svr-corner svr-corner--br" />

      <WebStrands phase={phase} />

      <HalftoneBurst active={phase >= 1 && flash === 1} />
      <ImpactBurst active={flash === 1} color="#dc0000" />
      <ImpactBurst active={flash === 2} color="#1a1a1a" />

      <div className={"svr-flash" + (flash === 1 ? " f1" : flash === 2 ? " f2" : "")} aria-hidden="true" />

      <div className={"svr-center-web" + (phase >= 3 ? " svr-center-web--on" : "")} aria-hidden="true">
        <SpiderWeb className="svr-center-web-far" />
        <SpiderWeb className="svr-center-web-near" />
      </div>

      <p className={"svr-t svr-hero" + (phase >= 1 ? " svr-in" : "")}>
        ANOTHER SPIDER HAS ENTERED THE WEB.
      </p>

      <p className={"svr-t svr-you" + (phase >= 1 ? " svr-in" : "")} data-text="THAT'S YOU.">
        THAT&apos;S YOU.
      </p>

      <div className={"svr-t svr-check-group" + (phase >= 2 ? " visible" : "")}>
        <SpiderWeb className="svr-check-web" />
        <svg className="svr-check" viewBox="0 0 50 50" aria-hidden="true">
          <circle className="svr-ck-ring" cx="25" cy="25" r="20"
            fill="none" stroke="#dc0000" strokeWidth="2" pathLength="1" />
          <path className="svr-ck-tick" d="M15 25 L22 32 L35 19"
            fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round"
            strokeLinejoin="round" pathLength="1" />
        </svg>
        <p className="svr-confirm">Registration confirmed.</p>
        <p className="svr-sub">Your universe just got a little more competitive.</p>
      </div>

      <div className={"svr-t svr-brand-wrap" + (phase >= 4 ? " visible" : "")}>
        <span className="svr-brand">Revibe</span>
        <span className="svr-year">'26</span>
      </div>

      <p className="svr-t svr-phrases">
        <span className="svr-ph">Different skills.</span>
        <span className="svr-ph">Different stories.</span>
        <span className="svr-ph">One arena.</span>
      </p>

      <p className={"svr-t svr-final" + (phase >= 4 ? " svr-in" : "")}>SEE YOU IN THE SPIDER-VERSE.</p>

      <style>{svrCSS}</style>
    </div>
  );
}

const svrCSS = `
  .svr-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #f5f5f5;
    overflow: hidden;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Hanken Grotesk', sans-serif;
  }
  .svr-rm .svr-overlay * { animation: none !important; transition: none !important; }

  .svr-grid {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      repeating-linear-gradient(45deg, rgba(26,26,26,0.04) 0 1px, transparent 1px 28px),
      repeating-linear-gradient(-45deg, rgba(26,26,26,0.04) 0 1px, transparent 1px 28px);
  }

  .svr-corner { position: absolute; pointer-events: none; z-index: 0; opacity: 0; }
  .svr-corner--tl { top: -60px; left: -60px; width: 220px; height: 220px; }
  .svr-corner--br { bottom: -60px; right: -60px; width: 220px; height: 220px; transform: rotate(180deg); }
  .svr-corner { animation: svrFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; }

  .svr-strands {
    position: absolute; inset: 0; width: 100%; height: 100%;
    z-index: 1; pointer-events: none;
  }
  .svr-strand {
    stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0;
  }
  .svr-st1 { animation: svrStrandShoot1 0.25s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards; }
  .svr-st2 { animation: svrStrandShoot2 0.3s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards; }
  .svr-st3 { animation: svrStrandShoot3 0.35s cubic-bezier(0.22, 1, 0.36, 1) 0.18s forwards; }
  .svr-st4 { animation: svrStrandShoot4 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.25s forwards; }
  .svr-st5 { animation: svrStrandShoot5 0.38s cubic-bezier(0.22, 1, 0.36, 1) 0.22s forwards; }
  .svr-st6 { animation: svrStrandShoot6 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards; }

  .svr-strand-taut { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; }
  .svr-taut1 { animation: svrTaut1 0.12s cubic-bezier(0.36, 0, 0.66, -0.56) 1.35s forwards; }
  .svr-taut2 { animation: svrTaut2 0.12s cubic-bezier(0.36, 0, 0.66, -0.56) 1.38s forwards; }

  .svr-strand-sling { stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; }
  .svr-sling1 { animation: svrSling1 0.4s cubic-bezier(0.22, 1, 0.36, 1) 3.8s forwards; }
  .svr-sling2 { animation: svrSling2 0.4s cubic-bezier(0.22, 1, 0.36, 1) 3.85s forwards; }
  .svr-sling3 { animation: svrSling3 0.35s cubic-bezier(0.22, 1, 0.36, 1) 3.9s forwards; }
  .svr-sling4 { animation: svrSling4 0.35s cubic-bezier(0.22, 1, 0.36, 1) 3.92s forwards; }

  .svr-particles circle { opacity: 0; }
  .svr-ptcl1 { animation: svrPtclIn 0.5s ease 2.8s forwards; }
  .svr-ptcl2 { animation: svrPtclIn 0.5s ease 3.0s forwards; }
  .svr-ptcl3 { animation: svrPtclIn 0.5s ease 3.2s forwards; }

  .svr-center-web {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 1; pointer-events: none; opacity: 0;
    transition: opacity 0.3s ease;
  }
  .svr-center-web--on { opacity: 1; }
  .svr-center-web-far {
    width: min(85vw, 85vh); height: min(85vw, 85vh);
    position: absolute; opacity: 0;
    animation: svrWebFarIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .svr-center-web-near {
    width: min(60vw, 60vh); height: min(60vw, 60vh);
    position: absolute; opacity: 0;
    animation: svrWebNearIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
  }

  .svr-burst {
    position: absolute; z-index: 55; pointer-events: none;
    width: 200px; height: 200px;
    transform: translate(-50%, -50%) scale(0);
    animation: svrBurstIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .svr-halftone {
    position: absolute; left: 50%; top: 43%; z-index: 54;
    width: 300px; height: 300px; pointer-events: none;
    transform: translate(-50%, -50%) scale(0);
    animation: svrBurstIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .svr-flash {
    position: absolute; inset: 0; z-index: 50;
    pointer-events: none; opacity: 0; background: transparent;
  }
  .svr-flash.f1 { animation: svrFlashRed 0.18s ease forwards; }
  .svr-flash.f2 { animation: svrFlashGold 0.2s ease forwards; }
  .svr-rm .svr-flash { display: none; }

  .svr-t {
    position: absolute; z-index: 10; margin: 0;
    opacity: 0; pointer-events: none;
    text-align: center; max-width: 90vw;
    will-change: transform, opacity;
  }

  .svr-hero {
    font-family: 'Anton', sans-serif;
    font-size: clamp(1.5rem, 5vw, 3.2rem);
    font-weight: 400; line-height: 1.1;
    letter-spacing: 0.02em; color: #1a1a1a;
    text-transform: uppercase;
    top: 32%; left: 50%; transform: translateX(-50%);
    opacity: 0;
  }
  .svr-hero.svr-in {
    animation:
      svrHeroCatch 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards,
      svrHeroTaut 0.15s cubic-bezier(0.36, 0, 0.66, -0.56) 1.3s forwards,
      svrCondense 0.4s cubic-bezier(0.16, 1, 0.3, 1) 2.2s forwards;
  }

  .svr-you {
    font-family: 'Anton', sans-serif;
    font-size: clamp(2.8rem, 9vw, 6.5rem);
    font-weight: 400; line-height: 1;
    letter-spacing: 0.02em; color: #ffffff;
    text-transform: uppercase;
    background: #dc0000;
    padding: 14px 28px;
    display: inline-block;
    top: 48%; left: 50%; transform: translateX(-50%) scale(0);
    box-shadow: 4px 4px 0 #1a1a1a;
    opacity: 0;
  }
  .svr-you.svr-in {
    animation:
      svrYouSlam 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.45s forwards,
      svrCondense 0.4s cubic-bezier(0.16, 1, 0.3, 1) 2.2s forwards;
  }
  .svr-you::before, .svr-you::after {
    content: attr(data-text); position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    padding: 14px 28px; pointer-events: none;
  }
  .svr-you::before { color: #dc0000; mix-blend-mode: multiply; opacity: 0; }
  .svr-you::after { color: #1a1a1a; mix-blend-mode: multiply; opacity: 0; }
  .svr-you.svr-in::before { animation: svrChA 0.2s steps(1) 1.45s forwards; }
  .svr-you.svr-in::after { animation: svrChB 0.2s steps(1) 1.45s forwards; }
  .svr-rm .svr-you::before, .svr-rm .svr-you::after { animation: none; opacity: 0; }

  .svr-check-group {
    display: flex; flex-direction: column;
    align-items: center; gap: 0.8rem;
    top: 44%; opacity: 0;
  }
  .svr-check { width: 48px; height: 48px; opacity: 0; }
  .svr-check-group.visible { animation: svrFadeIn 0.15s ease 2.7s forwards; }
  .svr-check-group.visible .svr-check { animation: svrCheckDraw 0.6s cubic-bezier(0.22, 1, 0.36, 1) 2.85s forwards; }
  .svr-ck-ring { stroke-dasharray: 1; stroke-dashoffset: 1; }
  .svr-check-group.visible .svr-ck-ring { animation: svrDraw 0.3s ease 2.85s forwards; }
  .svr-ck-tick { stroke-dasharray: 1; stroke-dashoffset: 1; }
  .svr-check-group.visible .svr-ck-tick { animation: svrDraw 0.2s ease 3.1s forwards; }

  .svr-confirm {
    font-family: 'Anton', sans-serif;
    font-size: clamp(1.3rem, 3.5vw, 2.2rem);
    font-weight: 400; line-height: 1.1;
    letter-spacing: 0.02em; color: #1a1a1a;
    text-transform: uppercase; margin: 0;
    opacity: 0;
  }
  .svr-check-group.visible .svr-confirm { animation: svrSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) 3.0s forwards; }

  .svr-sub {
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: clamp(0.8rem, 2vw, 1rem);
    line-height: 1.5; color: #3a3a3a;
    margin: 0; opacity: 0;
  }
  .svr-check-group.visible .svr-sub { animation: svrSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) 3.2s forwards; }

  .svr-check-web {
    position: absolute; z-index: 0; pointer-events: none;
    width: 120px; height: 120px;
    top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.6);
    opacity: 0;
    color: #b2aeae;
  }
  .svr-check-group.visible .svr-check-web {
    animation: svrCheckWebIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 2.75s forwards;
  }
  @keyframes svrCheckWebIn {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6) rotate(-15deg); }
    100% { opacity: 0.13; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }

  .svr-brand-wrap {
    display: flex; align-items: baseline;
    gap: 0.08em; top: 40%; left: 50%;
    transform: translateX(-50%) scale(0.1) rotate(-8deg);
    opacity: 0;
  }
  .svr-brand {
    font-family: 'Brusher', cursive;
    font-size: clamp(4.5rem, 14vw, 10rem);
    line-height: 0.92; letter-spacing: 0.03em;
    color: #0d0d0d;
  }
  .svr-year {
    font-family: 'Brusher', cursive;
    font-size: clamp(2.4rem, 7.5vw, 5rem);
    line-height: 1; letter-spacing: 0.05em;
    color: #dc0000;
  }
  .svr-brand-wrap.visible {
    animation: svrBrandSling 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .svr-phrases {
    font-family: 'Anton', sans-serif;
    font-size: clamp(0.85rem, 2.2vw, 1.3rem);
    font-weight: 400; line-height: 1.4;
    letter-spacing: 0.03em; color: #1a1a1a;
    text-transform: uppercase; top: 70%;
    display: flex; gap: 0.5rem;
    flex-wrap: wrap; justify-content: center;
    opacity: 1;
  }
  .svr-ph { opacity: 0; }
  .svr-ph:nth-child(1) { animation: svrPhraseIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) 5.4s forwards; }
  .svr-ph:nth-child(2) { animation: svrPhraseIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) 5.7s forwards; }
  .svr-ph:nth-child(3) { animation: svrPhraseIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) 6.0s forwards; }

  .svr-final {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.85rem, 2.2vw, 1.2rem);
    font-weight: 700; letter-spacing: 0.18em;
    text-transform: uppercase; color: #ffffff;
    background: #dc0000;
    padding: 8px 20px;
    bottom: 10%; opacity: 0;
  }
  .svr-final.svr-in { animation: svrSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

  @keyframes svrDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes svrFadeIn { from { opacity: 0; } to { opacity: 1; } }

  @keyframes svrStrandShoot1 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    10% { opacity: 0.8; }
    100% { stroke-dashoffset: 0; opacity: 0.6; }
  }
  @keyframes svrStrandShoot2 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    10% { opacity: 0.5; }
    100% { stroke-dashoffset: 0; opacity: 0.3; }
  }
  @keyframes svrStrandShoot3 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    10% { opacity: 0.4; }
    100% { stroke-dashoffset: 0; opacity: 0.2; }
  }
  @keyframes svrStrandShoot4 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    10% { opacity: 0.3; }
    100% { stroke-dashoffset: 0; opacity: 0.15; }
  }
  @keyframes svrStrandShoot5 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    10% { opacity: 0.3; }
    100% { stroke-dashoffset: 0; opacity: 0.12; }
  }
  @keyframes svrStrandShoot6 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    10% { opacity: 0.2; }
    100% { stroke-dashoffset: 0; opacity: 0.08; }
  }

  @keyframes svrTaut1 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    30% { opacity: 1; stroke-width: 2.5; }
    100% { stroke-dashoffset: 0; opacity: 0.7; stroke-width: 1.2; }
  }
  @keyframes svrTaut2 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    30% { opacity: 0.8; stroke-width: 1.5; }
    100% { stroke-dashoffset: 0; opacity: 0.4; stroke-width: 0.8; }
  }

  @keyframes svrSling1 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    20% { opacity: 0.7; }
    100% { stroke-dashoffset: 0; opacity: 0.5; }
  }
  @keyframes svrSling2 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    20% { opacity: 0.5; }
    100% { stroke-dashoffset: 0; opacity: 0.3; }
  }
  @keyframes svrSling3 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    20% { opacity: 0.4; }
    100% { stroke-dashoffset: 0; opacity: 0.2; }
  }
  @keyframes svrSling4 {
    0% { stroke-dashoffset: 1; opacity: 0; }
    20% { opacity: 0.3; }
    100% { stroke-dashoffset: 0; opacity: 0.12; }
  }

  @keyframes svrPtclIn { from { opacity: 0; } to { opacity: 0.8; } }

  @keyframes svrWebFarIn {
    0% { opacity: 0; transform: scale(0.15) rotate(-25deg); }
    50% { opacity: 0.14; transform: scale(1.04) rotate(2deg); }
    100% { opacity: 0.12; transform: scale(1) rotate(0deg); }
  }
  @keyframes svrWebNearIn {
    0% { opacity: 0; transform: scale(0.08) rotate(15deg); }
    60% { opacity: 0.2; transform: scale(1.06) rotate(-1.5deg); }
    100% { opacity: 0.16; transform: scale(1) rotate(0deg); }
  }

  @keyframes svrBurstIn {
    0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
    40% { transform: translate(-50%, -50%) scale(1.2) rotate(3deg); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0; }
  }

  @keyframes svrFlashRed {
    0% { background: transparent; opacity: 0; }
    20% { background: rgba(220,0,0,0.12); opacity: 1; }
    100% { background: transparent; opacity: 0; }
  }
  @keyframes svrFlashGold {
    0% { background: transparent; opacity: 0; }
    15% { background: rgba(245,197,66,0.1); opacity: 1; }
    100% { background: transparent; opacity: 0; }
  }

  @keyframes svrHeroCatch {
    0% { opacity: 0; transform: translateX(-50%) translateY(30px) scaleX(1.4) scaleY(0.6); }
    40% { opacity: 1; transform: translateX(-50%) translateY(-5px) scaleX(0.95) scaleY(1.05); }
    70% { transform: translateX(-50%) translateY(2px) scaleX(1.02) scaleY(0.98); }
    100% { opacity: 1; transform: translateX(-50%) translateY(0) scaleX(1) scaleY(1); }
  }
  @keyframes svrHeroTaut {
    0% { transform: translateX(-50%) scaleY(1); }
    40% { transform: translateX(-50%) scaleY(0.85) scaleX(1.1); }
    100% { transform: translateX(-50%) scaleY(1) scaleX(1); }
  }

  @keyframes svrYouSlam {
    0% { opacity: 0; transform: translateX(-50%) scale(0) rotate(-12deg); box-shadow: none; }
    35% { opacity: 1; transform: translateX(-50%) scale(1.15) rotate(3deg); box-shadow: 6px 6px 0 #1a1a1a; }
    55% { transform: translateX(-50%) scale(0.92) rotate(-1deg); box-shadow: 3px 3px 0 #1a1a1a; }
    75% { transform: translateX(-50%) scale(1.04) rotate(0.5deg); }
    100% { opacity: 1; transform: translateX(-50%) scale(1) rotate(0); box-shadow: 4px 4px 0 #1a1a1a; }
  }

  @keyframes svrCondense {
    0% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) scale(0.4) translateY(-40vh); }
  }

  @keyframes svrChA {
    0% { opacity: 0; transform: translateX(0); }
    25% { opacity: 0.6; transform: translateX(-6px); }
    50% { opacity: 0.3; transform: translateX(3px); }
    75%, 100% { opacity: 0; }
  }
  @keyframes svrChB {
    0% { opacity: 0; transform: translateX(0); }
    25% { opacity: 0.6; transform: translateX(6px); }
    50% { opacity: 0.3; transform: translateX(-3px); }
    75%, 100% { opacity: 0; }
  }

  @keyframes svrCheckDraw {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes svrSlideUp {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes svrBrandSling {
    0% {
      opacity: 0;
      transform: translateX(-50%) scale(0.1) rotate(-8deg);
      filter: blur(4px);
    }
    25% {
      opacity: 0.6;
      transform: translateX(-50%) scale(1.12) rotate(2deg);
      filter: blur(1px);
    }
    45% {
      transform: translateX(-50%) scale(0.94) rotate(-0.8deg);
      filter: blur(0);
    }
    65% {
      transform: translateX(-50%) scale(1.03) rotate(0.3deg);
    }
    80% {
      transform: translateX(-50%) scale(0.99) rotate(-0.1deg);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) scale(1) rotate(0);
      filter: blur(0);
    }
  }

  @keyframes svrPhraseIn {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes svrWipeIn {
    from { clip-path: inset(0 100% 0 0); opacity: 1; }
    to { clip-path: inset(0 0 0 0); opacity: 1; }
  }

  @media (max-width: 640px) {
    .svr-hero { font-size: clamp(1.1rem, 6.5vw, 2rem); top: 30%; }
    .svr-you { font-size: clamp(2.2rem, 13vw, 4.5rem); padding: 10px 16px; top: 46%; }
    .svr-you::before, .svr-you::after { padding: 10px 16px; }
    .svr-check-group { top: 45%; }
    .svr-confirm { font-size: clamp(1.1rem, 5vw, 1.6rem); }
    .svr-brand-wrap { top: 38%; }
    .svr-brand { font-size: clamp(3.5rem, 18vw, 7rem); }
    .svr-year { font-size: clamp(1.8rem, 9vw, 3.5rem); }
    .svr-phrases { font-size: clamp(0.75rem, 3vw, 1rem); top: 70%; }
    .svr-final { font-size: clamp(0.75rem, 2.5vw, 1rem); bottom: 10%; }
    .svr-corner--tl { width: 140px; height: 140px; top: -40px; left: -40px; }
    .svr-corner--br { width: 140px; height: 140px; bottom: -40px; right: -40px; }
    .svr-center-web-far { width: min(95vw, 95vh); height: min(95vw, 95vh); }
    .svr-center-web-near { width: min(70vw, 70vh); height: min(70vw, 70vh); }
    .svr-burst { width: 140px; height: 140px; }
    .svr-halftone { width: 200px; height: 200px; }
  }
`;
