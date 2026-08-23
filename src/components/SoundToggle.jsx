import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/avengers_endgame.mp3";

function SpeakerOnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path
        d="M16 9.5 20.5 14M20.5 9.5 16 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SoundToggle() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.45;

    /*
     * Always try autoplay fresh on every load/refresh.
     * No stored preference is checked — session-only behavior.
     * Browsers normally block audible autoplay without prior
     * interaction; treat rejection as expected, not an error.
     */
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });

    /*
     * If autoplay was blocked, the first user interaction
     * (this visit only) attempts to start the music.
     */
    const startAfterInteraction = async () => {
      if (!audio.paused) return;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Browser still refused playback; leave state as-is.
      }
    };

    window.addEventListener("click", startAfterInteraction, { once: true });
    window.addEventListener("touchstart", startAfterInteraction, { once: true });
    window.addEventListener("keydown", startAfterInteraction, { once: true });

    return () => {
      window.removeEventListener("click", startAfterInteraction);
      window.removeEventListener("touchstart", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
    };
  }, []);

  const toggleSound = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    /*
     * Playing → pause. Session-only, nothing persisted.
     */
    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    /*
     * Paused → play.
     */
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("REVIBE background music could not start:", error);
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" />

      <button
        type="button"
        className="sound-toggle"
        onClick={toggleSound}
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
      </button>

      <style>{`
        .sound-toggle {
          position: fixed;
          top: 92px;
          right: 1.25rem;
          z-index: 30;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 46px;
          height: 46px;
          border-radius: 50%;

          border: 1px solid rgba(245, 197, 66, 0.9);
          background: var(--gold);

          color: var(--bg);
          cursor: pointer;

          box-shadow:
            0 0 16px rgba(245, 197, 66, 0.35);

          transition:
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .sound-toggle svg {
          width: 20px;
          height: 20px;
        }

        .sound-toggle:hover,
        .sound-toggle:focus-visible {
          background: #ffd76a;

          box-shadow:
            0 0 22px rgba(245, 197, 66, 0.55);

          transform: translateY(-1px);
        }

        .sound-toggle[aria-pressed="false"] {
          background: rgba(245, 197, 66, 0.75);
        }

        @media (max-width: 899px) {
          .sound-toggle {
            top: 148px;
            right: 1rem;
          }
        }

        @media (max-width: 430px) {
          .sound-toggle {
            top: 140px;
            right: 0.9rem;

            width: 42px;
            height: 42px;
          }

          .sound-toggle svg {
            width: 18px;
            height: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sound-toggle {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}