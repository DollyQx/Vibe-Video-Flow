"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Film,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { VideoEntry } from "./script-editor";

const GENERATION_STEPS = [
  { step: 1, label: "Parsing Script", description: "Breaking your script into scenes…" },
  { step: 2, label: "Character Lock", description: "Generating master reference image for Dolly…" },
  { step: 3, label: "Rendering Videos", description: "Creating character-consistent clips via Pixazo…" },
];

interface VideoPreviewProps {
  isGenerating: boolean;
  masterImageUrl?: string;
  videoUrls?: VideoEntry[];
}

export function VideoPreview({ isGenerating, masterImageUrl, videoUrls }: VideoPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([80]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideos = videoUrls && videoUrls.length > 0;
  const currentVideo = hasVideos ? videoUrls[currentVideoIndex] : null;

  // ── Animate generation steps ───────────────────────────────────────────────
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }
    setCurrentStep(1);
    const t1 = setTimeout(() => setCurrentStep(2), 8000);
    const t2 = setTimeout(() => setCurrentStep(3), 20000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isGenerating]);

  // ── Sync playback state with native video element ──────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.volume = volume[0] / 100;
    if (isPlaying) vid.play().catch(() => {});
    else vid.pause();
  }, [isPlaying, volume, currentVideoIndex]);

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setProgress([(vid.currentTime / vid.duration) * 100]);
  };

  const handleVideoEnded = () => {
    if (hasVideos && currentVideoIndex < videoUrls.length - 1) {
      setCurrentVideoIndex((i) => i + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (val: number[]) => {
    const vid = videoRef.current;
    if (vid && vid.duration) {
      vid.currentTime = (val[0] / 100) * vid.duration;
      setProgress(val);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentDuration = videoRef.current?.duration ?? 0;
  const currentTime = videoRef.current?.currentTime ?? 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Video Container */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-t-xl bg-background/50">
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {!hasVideos ? (
          <div className="flex flex-col items-center gap-6 text-center">
            {isGenerating ? (
              <>
                {/* Spinner */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-2 border-primary/30" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <Loader2 className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {GENERATION_STEPS[currentStep - 1]?.label || "Generating…"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {GENERATION_STEPS[currentStep - 1]?.description || "AI is crafting your cinematic vision…"}
                  </p>
                </div>
                {/* Step indicators */}
                <div className="flex items-center gap-3">
                  {GENERATION_STEPS.map((step) => (
                    <div key={step.step} className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium transition-all duration-300 ${
                          currentStep > step.step
                            ? "border-primary bg-primary text-primary-foreground"
                            : currentStep === step.step
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        {currentStep > step.step ? "✓" : step.step}
                      </div>
                      {step.step < 3 && (
                        <div
                          className={`h-0.5 w-8 rounded-full transition-all duration-300 ${
                            currentStep > step.step ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  Step {currentStep} of 3
                </div>
              </>
            ) : (
              <>
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-secondary/50">
                  <Film className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Ready to Create</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Write your script and click Generate to bring Dolly to life
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Real video player */}
            <video
              ref={videoRef}
              src={currentVideo?.url}
              className="absolute inset-0 h-full w-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Master image thumbnail + scene label */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
              {masterImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={masterImageUrl}
                  alt="Dolly reference"
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-foreground">
                  Scene {currentVideo?.scene_number} / {videoUrls.length}
                </p>
                <p className="max-w-[160px] truncate text-[10px] text-muted-foreground">
                  {currentVideo?.visual_prompt}
                </p>
              </div>
            </div>

            {/* Aspect ratio badge */}
            <div className="absolute right-4 top-4 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              16:9 • Scene {currentVideoIndex + 1}/{videoUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Scene strip (when videos are ready) */}
      {hasVideos && videoUrls.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto border-t border-border px-4 py-2">
          {videoUrls.map((v, i) => (
            <button
              key={v.scene_number}
              onClick={() => { setCurrentVideoIndex(i); setIsPlaying(true); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                i === currentVideoIndex
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
              }`}
            >
              <ChevronRight className="h-3 w-3" />
              Scene {v.scene_number}
            </button>
          ))}
        </div>
      )}

      {/* Controls Bar */}
      <div className="border-t border-border bg-card p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={progress}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
            disabled={!hasVideos}
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentDuration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              disabled={!hasVideos}
              onClick={() => { setCurrentVideoIndex((i) => Math.max(0, i - 1)); setIsPlaying(true); }}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-foreground hover:text-primary"
              disabled={!hasVideos}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              disabled={!hasVideos || currentVideoIndex >= videoUrls!.length - 1}
              onClick={() => { setCurrentVideoIndex((i) => Math.min(videoUrls!.length - 1, i + 1)); setIsPlaying(true); }}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-24"
            />
          </div>

          {/* Fullscreen & Download */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              disabled={!hasVideos}
              onClick={() => videoRef.current?.requestFullscreen()}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {hasVideos && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => {
                  videoUrls.forEach((v) => {
                    if (v.status !== "success") return;
                    const a = document.createElement("a");
                    a.href = v.url;
                    a.download = `scene_${v.scene_number}.mp4`;
                    a.setAttribute("target", "_blank");
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  });
                }}
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
