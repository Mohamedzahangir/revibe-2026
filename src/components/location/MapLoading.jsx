import { useEffect, useRef, useState } from "react";

const STAGES = [
  { text: "REVIBE CAMPUS TRACKER", delay: 0 },
  { text: "INITIALIZING SYSTEM...", delay: 400 },
  { text: "LOADING CAMPUS DATA...", delay: 800 },
  { text: "CALIBRATING MAP...", delay: 1100 },
  { text: "TRACKER READY", delay: 1400 },
];

export default function MapLoading({ onComplete }) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const audioCtxRef = useRef(null);
  const beepIntervalRef = useRef(null);

  const playBeep = (freq = 800, dur = 0.05) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.value = 0.06;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch { /* audio blocked */ }
  };

  useEffect(() => {
    const timers = STAGES.map((s, i) =>
      setTimeout(() => { setStage(i); playBeep(600 + i * 100, 0.08); }, s.delay)
    );

    let beepCount = 0;
    beepIntervalRef.current = setInterval(() => {
      beepCount++;
      playBeep(beepCount % 2 === 0 ? 1000 : 1200, 0.03);
    }, 300);

    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progressTimer); return 100; }
        return p + 2;
      });
    }, 28);

    const exitTimer = setTimeout(() => {
      clearInterval(beepIntervalRef.current);
      playBeep(1400, 0.15);
      setExiting(true);
      setTimeout(onComplete, 500);
    }, 1800);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressTimer);
      clearInterval(beepIntervalRef.current);
      clearTimeout(exitTimer);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [onComplete]);

  return (
    <div className={"mapload" + (exiting ? " mapload--exit" : "")}>
      <div className="mapload__inner">
        <div className="mapload__brand">REVIBE '26</div>
        <div className="mapload__sub">SGC &middot; CAHCET</div>

        <div className="mapload__lines">
          {STAGES.map((s, i) => (
            <div
              key={s.text}
              className={"mapload__line" + (i <= stage ? " mapload__line--on" : "")}
            >
              <span className="mapload__dot" />
              {s.text}
            </div>
          ))}
        </div>

        <div className="mapload__bar">
          <div className="mapload__bar-fill" style={{ width: progress + "%" }} />
        </div>
        <div className="mapload__pct">{progress}%</div>
      </div>

      <style>{`
        .mapload {
          position: absolute;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a1628;
          border-radius: 0;
          font-family: 'JetBrains Mono', monospace;
          transition: opacity 0.5s ease, visibility 0.5s ease;
        }

        .mapload--exit {
          opacity: 0;
          visibility: hidden;
        }

        .mapload__inner {
          text-align: center;
          max-width: 360px;
          width: 85%;
        }

        .mapload__brand {
          font-family: 'Anton', sans-serif;
          font-size: clamp(24px, 5vw, 36px);
          letter-spacing: 0.08em;
          color: #3aa5d1;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .mapload__sub {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(58, 165, 209, 0.4);
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .mapload__lines {
          text-align: left;
          margin-bottom: 20px;
        }

        .mapload__line {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.15);
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .mapload__line--on {
          color: #3aa5d1;
        }

        .mapload__dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
          transition: background 0.3s, box-shadow 0.3s;
        }

        .mapload__line--on .mapload__dot {
          background: #3aa5d1;
          box-shadow: 0 0 6px rgba(58, 165, 209, 0.5);
        }

        .mapload__bar {
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 1px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .mapload__bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #1a3a5c, #3aa5d1);
          border-radius: 1px;
          transition: width 0.05s linear;
        }

        .mapload__pct {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
}
