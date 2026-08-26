import { useEffect, useRef, useState } from "react";
import spideyIcon from "../assets/logos/song-spidey.svg";
import spidermanVideo from "../assets/videos/spiderman.webp";

const AUDIO_SRC = "/audio/the-amazing-spider-man-2---theme.mp3";

export default function SoundToggle() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

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
        /*
         * Audible autoplay is blocked until the first user
         * interaction. Keep the toggle visually "on" (default)
         * and start the track as soon as the visitor interacts.
         */
        setIsPlaying(true);
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

      <div className="sound-toggle-wrap">
        <button
          type="button"
          className="sound-toggle"
          onClick={toggleSound}
          aria-label={isPlaying ? "Mute background music" : "Play background music"}
          aria-pressed={isPlaying}
        >
          <img
            src={spideyIcon}
            alt=""
            className={"sound-toggle-icon" + (isPlaying ? " is-playing" : " is-muted")}
            aria-hidden="true"
          />
        </button>

        <img
          src={spidermanVideo}
          alt=""
          className="sound-spiderman-video"
          aria-hidden="true"
        />
      </div>

      <style>{`
        .sound-toggle-wrap {
          position: fixed;
          top: 13px;
          right: 1.25rem;
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sound-toggle {

          display: flex;
          align-items: center;
          justify-content: center;

          width: 46px;
          height: 46px;
          border-radius: 50%;

          border: 1px solid rgba(220, 0, 0, 0.9);
          background: var(--red);

          color: var(--bg);
          cursor: pointer;

          box-shadow:
            0 0 16px rgba(220, 0, 0, 0.35);

          transition:
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .sound-toggle svg {
          width: 20px;
          height: 20px;
        }

        .sound-toggle-icon {
          width: 30px;
          height: 30px;
          object-fit: contain;
          border-radius: 50%;
          transition:
            opacity 0.2s ease,
            filter 0.2s ease;
        }

        .sound-toggle-icon.is-muted {
          opacity: 0.45;
          filter: grayscale(0.8);
          animation: none;
        }

        .sound-toggle-icon.is-playing {
          opacity: 1;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
          animation: sound-spin 3s linear infinite;
        }

        @keyframes sound-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sound-toggle:hover,
        .sound-toggle:focus-visible {
          background: #ff1a1a;

          box-shadow:
            0 0 22px rgba(220, 0, 0, 0.55);

          transform: translateY(-1px);
        }

        .sound-toggle[aria-pressed="false"] {
          background: rgba(220, 0, 0, 0.75);
        }

        @media (max-width: 899px) {
          .sound-toggle-wrap {
            top: 54px;
            right: 0.8rem;
          }
        }

        @media (max-width: 430px) {
          .sound-toggle-wrap {
            top: 52px;
            right: 0.7rem;
          }

          .sound-toggle {
            width: 42px;
            height: 42px;
          }

          .sound-toggle svg {
            width: 18px;
            height: 18px;
          }

          .sound-toggle-icon {
            width: 26px;
            height: 26px;
          }
        }

        @media (max-width: 340px) {
          .sound-toggle-wrap {
            top: 48px;
            right: 0.6rem;
          }
        }

        .sound-spiderman-video {
          width: 100px;
          height: 100px;
          object-fit: contain;
          margin-top: 4px;
          pointer-events: none;
        }

        @media (max-width: 899px) {
          .sound-spiderman-video {
            width: 56px;
            height: 56px;
          }
        }

        @media (max-width: 430px) {
          .sound-spiderman-video {
            width: 50px;
            height: 50px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sound-toggle {
            transition: none;
          }

          .sound-toggle-icon.is-playing {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}