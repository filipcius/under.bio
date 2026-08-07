"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { Slider } from "@/components/forms/Slider";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TrackPlayer({
  title,
  url,
  cover,
  loop,
  autoPlay = true,
  defaultVolume = 80,
  visualizer = true,
  primary,
  secondary,
  border,
  silent = false,
}: {
  title: string;
  url: string;
  cover?: string;
  loop?: boolean;
  autoPlay?: boolean;
  defaultVolume?: number;
  visualizer?: boolean;
  primary: string;
  secondary: string;
  border: string;
  /** Preview / editor mode — never load or play audio */
  silent?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const unlocked = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(silent ? 0 : defaultVolume / 100);
  const [ready, setReady] = useState(false);

  function syncDuration(audio: HTMLAudioElement) {
    const d = audio.duration;
    if (Number.isFinite(d) && d > 0) {
      setDuration(d);
      setReady(true);
    }
  }

  async function startMutedThenRamp() {
    const audio = audioRef.current;
    if (!audio) return false;
    const targetVol = volume;
    try {
      audio.muted = true;
      audio.volume = 0;
      await audio.play();
      setPlaying(true);
      audio.muted = false;
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        audio.volume = (targetVol * i) / steps;
        await new Promise((r) => setTimeout(r, 28));
      }
      audio.volume = targetVol;
      unlocked.current = true;
      syncDuration(audio);
      return true;
    } catch {
      return false;
    }
  }

  async function unlockAudible() {
    const audio = audioRef.current;
    if (!audio || unlocked.current) return;
    try {
      audio.muted = false;
      audio.volume = volume;
      await audio.play();
      setPlaying(true);
      unlocked.current = true;
      syncDuration(audio);
    } catch {
      // keep waiting for another gesture
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || silent) {
      setPlaying(false);
      setCurrent(0);
      setDuration(0);
      setReady(false);
      return;
    }
    audio.load();

    const onMeta = () => syncDuration(audio);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", () => {
      setPlaying(false);
      if (!audio.loop) setCurrent(0);
    });

    if (autoPlay) {
      void startMutedThenRamp().then((ok) => {
        if (!ok) {
          // No click required: any hover / scroll / key / touch unlocks audio
          const unlock = () => {
            void unlockAudible();
          };
          window.addEventListener("pointermove", unlock, { once: true, passive: true });
          window.addEventListener("pointerdown", unlock, { once: true, passive: true });
          window.addEventListener("touchstart", unlock, { once: true, passive: true });
          window.addEventListener("keydown", unlock, { once: true });
          window.addEventListener("wheel", unlock, { once: true, passive: true });
          window.addEventListener("scroll", unlock, { once: true, passive: true });
        }
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoPlay, silent]);

  useEffect(() => {
    if (audioRef.current && !audioRef.current.muted) {
      audioRef.current.volume = volume;
    }
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
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.muted = false;
    audio.volume = volume;
    await audio.play();
    unlocked.current = true;
    setPlaying(true);
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
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: border,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), #121212",
      }}
    >
      <div className="flex items-stretch">
        <div className="relative w-[88px] shrink-0 sm:w-[104px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover || "/avatar-fallback.svg"}
            alt=""
            className="h-full min-h-[104px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Now playing</p>
              <p className="mt-1 truncate text-sm font-semibold sm:text-base" style={{ color: primary }}>
                {title}
              </p>
            </div>
            {visualizer && playing && (
              <div className="flex h-6 items-end gap-0.5 pt-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="eq-bar h-5"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-10 text-[10px] tabular-nums" style={{ color: secondary }}>
              {formatTime(current)}
            </span>
            <div
              ref={barRef}
              className="relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/10"
              onClick={(e) => seek(e.clientX)}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 text-right text-[10px] tabular-nums" style={{ color: secondary }}>
              {ready ? formatTime(duration) : "--:--"}
            </span>
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
              aria-label={playing ? "Pause" : "Play"}
            >
              <Icon name={playing ? "pause" : "play"} className="text-xs" glow={false} />
            </button>
          </div>

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
        </div>
      </div>

      {!silent && (
        <audio ref={audioRef} src={url} loop={loop} preload="auto" playsInline muted={silent} />
      )}
    </div>
  );
}
