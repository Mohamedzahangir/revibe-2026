import { useCallback, useEffect, useRef, useState } from "react";
import MapMarker from "./MapMarker";
import MapInfoCard from "./MapInfoCard";
import MapLoading from "./MapLoading";

const DESKTOP_MAP = "/clg map.png";
const MOBILE_MAP = "/clg map ( mobile ).png";

const LOCATIONS = [
  { id: "main", name: "Main Block", x: 30, y: 10, desc: "Administrative hub and primary classrooms of CAHCET.", tag: "PPT:-CSE & AIDS smart room,Minni hack:-it smart room , Mehandi:-old aids classroom", color: "cyan" },
  { id: "tech-tower", name: "Tech Tower", x: 50, y: 32, desc: "Technology and innovation center.", tag: "Coding & Debugging:-Lab3&4 , Prompt wars:-Lab1&2", color: "cyan" },
  { id: "mech", name: "Mech Block", x: 62, y: 44, desc: "Department of Mechanical Engineering.", tag: "Art&Painting , IPL auction", color: "red" },
  { id: "eee-mba", name: "EEE Block", x: 63, y: 57, desc: "Departments of EEE and MBA.", tag: "Connections , Games", color: "red" },
  { id: "auditorium", name: "Auditorium", x: 50, y: 82, desc: "Main auditorium for symposium events.", tag: "Innauguration Ceremony , Closing Ceremony", color: "cyan" },
  { id: "lab", name: "MBA / PHY Lab", x: 63, y: 70, desc: "MBA seminar hall and Physics lab", tag: "Tech quiz :- MBA smeinar hall , Cooking :- Phy lab", color: "cyan" },
];

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export default function CampusMap({ onReload }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);

  const [vpSize, setVpSize] = useState({ w: 0, h: 0 });
  const [mapLoaded, setMapLoaded] = useState(false);

  const dragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });
  const pinchRef = useRef({ dist: 0, zoom: 1 });

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 620;
  const mapSrc = isMobile ? MOBILE_MAP : DESKTOP_MAP;
  const imgRatio = isMobile ? 1032 / 1024 : 1536 / 1024;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setVpSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const vpRatio = vpSize.w / vpSize.h;
  const canvasW = vpRatio > imgRatio ? vpSize.h * imgRatio : vpSize.w;
  const canvasH = vpRatio > imgRatio ? vpSize.h : vpSize.w / imgRatio;

  const clampPan = useCallback((px, py, z) => {
    const el = containerRef.current;
    if (!el) return { x: px, y: py };
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const mw = cw * z;
    const mh = ch * z;
    const maxX = Math.max(0, (mw - cw) / 2);
    const maxY = Math.max(0, (mh - ch) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, px)),
      y: Math.max(-maxY, Math.min(maxY, py)),
    };
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta));
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  }, [clampPan]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan(clampPan(dragRef.current.panX + dx, dragRef.current.panY + dy, zoom));
  }, [isDragging, zoom, clampPan]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const getTouchDist = (t) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: getTouchDist(e.touches), zoom };
      return;
    }
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  }, [pan, zoom]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      const scale = newDist / pinchRef.current.dist;
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchRef.current.zoom * scale));
      setZoom(next);
      setPan((p) => clampPan(p.x, p.y, next));
      return;
    }
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      setPan(clampPan(dragRef.current.panX + dx, dragRef.current.panY + dy, zoom));
    }
  }, [isDragging, zoom, clampPan]);

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, z + ZOOM_STEP);
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  }, [clampPan]);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, z - ZOOM_STEP);
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  }, [clampPan]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveMarker(null);
  }, []);

  const jingleRef = useRef(null);

  useEffect(() => {
    const jingle = new Audio("/audio/spidey_jingle.mp3");
    jingle.volume = 1;
    jingle.preload = "auto";
    jingleRef.current = jingle;
    return () => { jingle.pause(); jingle.src = ""; };
  }, []);

  const handleLoadComplete = useCallback(() => {
    setMapLoaded(true);
    const jingle = jingleRef.current;
    if (jingle) {
      jingle.currentTime = 0;
      jingle.play().catch(() => { });
    }
  }, []);

  const handleReload = useCallback(() => {
    setMapLoaded(false);
    resetView();
    if (onReload) onReload();
  }, [onReload, resetView]);

  const handleMarkerClick = useCallback((loc) => {
    setActiveMarker((prev) => (prev?.id === loc.id ? null : loc));
  }, []);



  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [handleMouseUp]);

  return (
    <div className="trk">
      {/* ═══ CHARACTER (overlaps bottom-left) ═══ */}
      <img src="/spider-man-4-logo-transparent-white-eyes.svg" alt="" className="trk__character" />

      {/* ═══ MAIN FRAME ═══ */}
      <div className="trk__frame">
        {/* ─── TOP BAR ─── */}
        <div className="trk__topbar">
          <button type="button" className="trk__menu-btn" aria-label="Menu">
            <img src="/menu-icon.svg" alt="" className="trk__menu-icon" />
          </button>

          <div>
            <img src="/clg tracker.png" alt="" className="trk__title-box" />
          </div>

          <div className="trk__logo-btn">
            <img src="/spider-svgrepo-com.svg" alt="" className="trk__logo-icon" />
          </div>
        </div>

        {/* ─── MAP VIEWPORT ─── */}
        <div
          ref={containerRef}
          className="trk__viewport"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {!mapLoaded && <MapLoading onComplete={handleLoadComplete} />}
          <div
            className="trk__canvas"
            style={{
              width: canvasW + "px",
              height: canvasH + "px",
              left: "50%",
              top: "50%",
              marginLeft: -canvasW / 2 + "px",
              marginTop: -canvasH / 2 + "px",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            <img
              src={mapSrc}
              alt="CAHCET Campus Map"
              className="trk__map"
              draggable={false}
            />
            <div className="trk__map-overlay" />
            {LOCATIONS.map((loc) => (
              <MapMarker key={loc.id} location={loc} isActive={activeMarker?.id === loc.id} onClick={handleMarkerClick} />
            ))}
          </div>

          <div className="trk__bracket trk__bracket--tl" />
          <div className="trk__bracket trk__bracket--tr" />
          <div className="trk__bracket trk__bracket--bl" />
          <div className="trk__bracket trk__bracket--br" />

          <div className="trk__zoom-lbl">{Math.round(zoom * 100)}%</div>

          <MapInfoCard location={activeMarker} onClose={() => setActiveMarker(null)} />
        </div>

        {/* ─── BOTTOM BAR ─── */}
        <div className="trk__bottombar">
          <div className="trk__ticker">
            <div className="trk__ticker-track">
              <span>NAVIGATE THE CAHCET CAMPUS &#8226; REVIBE 2026 &#8226; NATIONAL LEVEL SYMPOSIUM &#8226; EXPLORE EVENT LOCATIONS &#8226; NAVIGATE THE CAHCET CAMPUS &#8226; REVIBE 2026 &#8226; NATIONAL LEVEL SYMPOSIUM &#8226; EXPLORE EVENT LOCATIONS &#8226;</span>
            </div>
          </div>

          <button
            type="button"
            className="trk__reload-btn"
            onClick={handleReload}
            aria-label="Reload map"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
        </div>
      </div>

      {/* ═══ ACTION BUTTONS (below frame) ═══ */}
      <div className="trk__actions">
        <button type="button" className="trk__action-btn" onClick={zoomOut}>
          &#8722; ZOOM
        </button>
        <button type="button" className="trk__action-btn" onClick={resetView}>
          RESET
        </button>
        <button type="button" className="trk__action-btn" onClick={zoomIn}>
          + ZOOM
        </button>
      </div>

      <style>{`
        .trk {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          padding: 0;
        }

        .trk__frame {
          position: relative;
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #0c1e35 0%, #0a1628 40%, #081220 100%);
          border: 4px solid #2a8fb5;
          border-radius: 14px;
          overflow: hidden;
          font-family: 'JetBrains Mono', monospace;
          color: #ffffff;
          box-shadow:
            0 0 0 2px #1a6a94,
            0 0 40px rgba(42, 143, 181, 0.15),
            inset 0 0 80px rgba(42, 143, 181, 0.04);
          min-height: 0;
        }

        /* ════ TOP BAR ════ */

        .trk__topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: linear-gradient(180deg, #0f2840 0%, #0c1e35 100%);
          border-bottom: 2px solid #2a8fb5;
          flex-shrink: 0;
          z-index: 20;
        }

        .trk__menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: #0a1628;
          border: 3px solid #e8a23a;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }

        .trk__menu-btn:hover {
          border-color: #f0b84a;
          box-shadow: 0 0 12px rgba(232, 162, 58, 0.35);
        }

        .trk__menu-icon {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }

        .trk__title-box {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 200px;
          
        }

        .trk__title-text {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: clamp(14px, 2.2vw, 20px);
          letter-spacing: 0.16em;
          color: #2a8fb5;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .trk__title-spider {
          width: 32px;
          height: 32px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(230, 57, 70, 0.5));
        }

        .trk__logo-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #0a1628;
          border: 2px solid #2a8fb5;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .trk__logo-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }

        /* ════ VIEWPORT ════ */

        .trk__viewport {
          flex: 1;
          overflow: hidden;
          position: relative;
          touch-action: none;
          overscroll-behavior: none;
          user-select: none;
          -webkit-user-select: none;
          background: #0a1628;
          min-height: 0;
        }

        .trk__canvas {
          position: absolute;
          transform-origin: center center;
          will-change: transform;
          overflow: hidden;
        }

        .trk__map {
          width: 100%;
          height: 100%;
          pointer-events: none;
          object-fit: fill;
          display: block;
        }

        .trk__map-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }

        .trk__bracket {
          position: absolute;
          width: 22px;
          height: 22px;
          z-index: 10;
          pointer-events: none;
        }

        .trk__bracket::before,
        .trk__bracket::after {
          content: "";
          position: absolute;
          background: #2a8fb5;
        }

        .trk__bracket--tl { top: 8px; left: 8px; }
        .trk__bracket--tl::before { top: 0; left: 0; width: 18px; height: 2px; }
        .trk__bracket--tl::after { top: 0; left: 0; width: 2px; height: 18px; }

        .trk__bracket--tr { top: 8px; right: 8px; }
        .trk__bracket--tr::before { top: 0; right: 0; width: 18px; height: 2px; }
        .trk__bracket--tr::after { top: 0; right: 0; width: 2px; height: 18px; }

        .trk__bracket--bl { bottom: 8px; left: 8px; }
        .trk__bracket--bl::before { bottom: 0; left: 0; width: 18px; height: 2px; }
        .trk__bracket--bl::after { bottom: 0; left: 0; width: 2px; height: 18px; }

        .trk__bracket--br { bottom: 8px; right: 8px; }
        .trk__bracket--br::before { bottom: 0; right: 0; width: 18px; height: 2px; }
        .trk__bracket--br::after { bottom: 0; right: 0; width: 2px; height: 18px; }

        .trk__zoom-lbl {
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: rgba(42, 143, 181, 0.5);
          text-transform: uppercase;
          z-index: 10;
          pointer-events: none;
          background: rgba(6, 14, 26, 0.6);
          padding: 3px 6px;
          border-radius: 3px;
          border: 1px solid rgba(42, 143, 181, 0.15);
        }

        /* ════ BOTTOM BAR ════ */

        .trk__bottombar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: linear-gradient(0deg, #0f2840 0%, #0c1e35 100%);
          border-top: 2px solid #2a8fb5;
          flex-shrink: 0;
          z-index: 20;
        }

        .trk__ticker {
          flex: 1;
          overflow: hidden;
          background: #0a1628;
          border: 2px solid #2a8fb5;
          border-radius: 6px;
          padding: 6px 0;
        }

        .trk__ticker-track {
          overflow: hidden;
          white-space: nowrap;
        }

        .trk__ticker-track span {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.14em;
          color: #2a8fb5;
          text-transform: uppercase;
          animation: trk-scroll 25s linear infinite;
        }

        @keyframes trk-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .trk__reload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: #0a1628;
          border: 3px solid #e8a23a;
          border-radius: 8px;
          color: #e8a23a;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.2s;
        }

        .trk__reload-btn:hover {
          border-color: #f0b84a;
          box-shadow: 0 0 12px rgba(232, 162, 58, 0.35);
          transform: rotate(-30deg);
        }

        /* ════ CHARACTER ════ */

        .trk__character {
          position: absolute;
          bottom: 20px;
          left: 0;
          width: 50px;
          height: 68px;
          object-fit: contain;
          z-index: 30;
          pointer-events: none;
        }

        /* ════ ACTION BUTTONS ════ */

        .trk__actions {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          padding: 8px 0 0;
          flex-shrink: 0;
        }

        .trk__action-btn {
          flex: 1;
          padding: 8px 12px;
          background: #0a1628;
          border: 2px solid #e8a23a;
          border-radius: 6px;
          color: #e8a23a;
          font-family: 'Anton', sans-serif;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          text-align: center;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }

        .trk__action-btn:hover {
          background: #e8a23a;
          color: #0a1628;
          box-shadow: 0 0 14px rgba(232, 162, 58, 0.35);
        }

        /* ════ RESPONSIVE ════ */

        @media (max-width: 620px) {
          .trk__frame {
            border-width: 3px;
            border-radius: 10px;
          }

          .trk__topbar { padding: 6px 8px; }

          .trk__menu-btn {
            width: 40px;
            height: 40px;
          }

          .trk__menu-icon { width: 22px; height: 22px; }
          .trk__logo-btn { width: 24px; height: 24px; }
          .trk__logo-icon { width: 18px; height: 18px; }

          .trk__title-box {
            padding: 5px 14px;
            gap: 6px;
          }

          .trk__title-spider { width: 24px; height: 24px; }
          .trk__title-text { font-size: 12px; }

          .trk__bracket { display: none; }

          .trk__zoom-lbl {
            font-size: 8px;
            bottom: 6px;
            left: 6px;
          }

          .trk__bottombar { padding: 6px 8px; }
          .trk__ticker { padding: 4px 0; }
          .trk__ticker-track span { font-size: 9px; }

          .trk__reload-btn { width: 34px; height: 34px; }
          .trk__reload-btn svg { width: 18px; height: 18px; }

          .trk__character { width: 36px; height: 50px; bottom: 16px; }
          .trk__action-btn { font-size: 10px; padding: 6px 8px; }
        }

        @media (max-width: 430px) {
          .trk__menu-btn { width: 34px; height: 34px; border-width: 2px; }
          .trk__logo-btn { width: 22px; height: 22px; border-width: 2px; }
          .trk__menu-icon { width: 18px; height: 18px; }
          .trk__title-box { padding: 4px 10px; gap: 4px; border-width: 2px; }
          .trk__title-spider { width: 20px; height: 20px; }
          .trk__title-text { font-size: 10px; }
          .trk__character { width: 30px; height: 42px; bottom: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .trk__ticker-track span { animation: none; }
        }
      `}</style>
    </div>
  );
}
