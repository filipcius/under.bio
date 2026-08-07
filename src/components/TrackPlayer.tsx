"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { Slider } from "@/components/forms/Slider";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export type TrackPlayerHandle = {
  /** Must be called from a click/tap handler — browsers only allow sound then */
  playFromGesture: () => Promise<boolean>;
};

export const TrackPlayer = forwardRef<
  TrackPlayerHandle,
  {
    title: string;
    url: string;
    cover?: string;
    loop?: boolean;
    autoPlay?: boolean;
    defaultVolume?: number;
    visualizer?: boolean;
    playerSize?: number;
    primary: string;
    secondary: string;
    border: string;
    panelStyle?: CSSProperties;
    panelClass?: string;
    silent?: boolean;
  }
>(function TrackPlayer(
  {
    title,
    url,
    cover,
    loop,
    autoPlay = true,
    defaultVolume = 80,
    visualizer = true,
    playerSize = 112,
    primary,
    secondary,
    border,
    panelStyle,
    panelClass,
    silent = false,
  },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const unlocked = useRef(false);
  const volumeRef = useRef(silent ? 0 : defaultVolume / 100);
  const [audible, setAudible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(silent ? 0 : defaultVolume / 100);
  const [ready, setReady] = useState(false);

  const size = Math.min(168, Math.max(72, Math.round(playerSize)));
  const showCover = cover !== undefined;
  const compact = size < 120;
  const roomy = size >= 148;

  volumeRef.current = volume;

  function syncDuration(audio: HTMLAudioElement) {
    const d = audio.duration;
    if (Number.isFinite(d) && d > 0) {
      setDuration(d);
      setReady(true);
    }
  }

  async function playAudible(): Promise<boolean> {
    const audio = audioRef.current;
    if (!audio || silent) return false;
    if (unlocked.current && !audio.paused) {
      setAudible(true);
      setPlaying(true);
      return true;
    }
    const target = Math.min(1, Math.max(0.01, volumeRef.current || 0.8));
    try {
      audio.muted = false;
      audio.volume = target;
      await audio.play();
      unlocked.current = true;
      setAudible(true);
      setPlaying(true);
      syncDuration(audio);
      return true;
    } catch {
      return false;
    }
  }

  useImperativeHandle(ref, () => ({
    playFromGesture: () => playAudible(),
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || silent) {
      setPlaying(false);
      setCurrent(0);
      setDuration(0);
      setReady(false);
      return;
    }

    unlocked.current = false;
    setAudible(false);

    const onMeta = () => syncDuration(audio);
    const onEnded = () => {
      setPlaying(false);
      if (!audio.loop) setCurrent(0);
    };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnded);

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    async function boot() {
      const el = audioRef.current;
      if (!el) return;
      if (el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          el.addEventListener("canplay", done, { once: true });
          window.setTimeout(done, 4000);
        });
      }
      if (cancelled || !autoPlay) return;

      // Works when browser allows it (returning visitors / MEI)
      if (await playAudible()) return;

      // No forced enter screen — unlock on first real click/tap/key anywhere
      const unlock = () => {
        void playAudible().then((ok) => {
          if (ok) cleanups.forEach((fn) => fn());
        });
      };
      const opts: AddEventListenerOptions = { capture: true };
      for (const ev of ["pointerdown", "touchstart", "keydown"] as const) {
        window.addEventListener(ev, unlock, opts);
        cleanups.push(() => window.removeEventListener(ev, unlock, opts));
      }
    }

    void boot();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoPlay, silent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.muted) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      setCurrent(audio.currentTime);
      syncDuration(audio);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  async function toggle() {
    if (silent) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (playing && audible && !audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    await playAudible();
  }

  function seek(clientX: number) {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(audio.currentTime);
  }

  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  return (
    <div
      className={panelClass || "ub-panel overflow-hidden rounded-2xl"}
      style={
        panelStyle || {
          borderColor: border,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #121212",
          borderRadius: 16,
        }
      }
    >
      <div className="flex overflow-hidden" style={showCover ? { height: size } : undefined}>
        {showCover && (
          <div className="relative h-full shrink-0 overflow-hidden" style={{ width: size }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover || "/avatar-fallback.svg"}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col justify-center"
          style={{
            gap: compact ? 4 : roomy ? 10 : 6,
            padding: showCover
              ? compact
                ? "8px 10px"
                : roomy
                  ? "14px 16px"
                  : "10px 14px"
              : "12px 14px",
          }}
        >
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0">
              {!compact && (
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Now playing
                </p>
              )}
              <p
                className={`truncate font-semibold ${compact ? "text-xs" : roomy ? "text-base" : "text-sm"} ${compact ? "" : "mt-0.5"}`}
                style={{ color: primary }}
              >
                {title}
              </p>
            </div>
            {visualizer && playing && audible && (
              <div className="flex h-5 shrink-0 items-end gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="eq-bar h-4"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-[10px] tabular-nums" style={{ color: secondary }}>
              {formatTime(current)}
            </span>
            <div
              ref={barRef}
              className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/10"
              onClick={(e) => seek(e.clientX)}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span
              className="w-9 shrink-0 text-right text-[10px] tabular-nums"
              style={{ color: secondary }}
            >
              {ready ? formatTime(duration) : "--:--"}
            </span>
            <button
              type="button"
              onClick={toggle}
              className={`flex shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 ${
                roomy ? "h-10 w-10" : compact ? "h-7 w-7" : "h-8 w-8"
              }`}
              aria-label={playing && audible ? "Pause" : "Play"}
            >
              <Icon
                name={playing && audible ? "pause" : "play"}
                className="text-[10px]"
                glow={false}
              />
            </button>
          </div>

          {!compact && (
            <div className="flex items-center gap-2">
              <Icon
                name={volume < 0.4 ? "volumeLow" : "volumeHigh"}
                className="text-[10px] text-white/35"
                glow={false}
              />
              <Slider min={0} max={1} step={0.01} value={volume} onChange={setVolume} />
              <span className="w-8 text-right text-[10px] text-white/40">
                {Math.round(volume * 100)}
              </span>
            </div>
          )}
        </div>
      </div>

      {!silent && (
        <audio ref={audioRef} src={url} loop={loop} preload="auto" playsInline />
      )}
    </div>
  );
});
