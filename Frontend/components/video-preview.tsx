"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Film,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const GENERATION_STEPS = [
  { step: 1, label: "Analyzing Script", description: "Parsing scenes and dialogue..." },
  { step: 2, label: "Generating Frames", description: "Creating cinematic visuals..." },
  { step: 3, label: "Rendering Video", description: "Compositing final output..." },
];

export function VideoPreview() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([80]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setCurrentStep(1);

    // Step 1 -> Step 2 after 2 seconds
    setTimeout(() => {
      setCurrentStep(2);
    }, 2000);

    // Step 2 -> Step 3 after 4 seconds
    setTimeout(() => {
      setCurrentStep(3);
    }, 4000);

    // Complete after 6 seconds
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep(0);
      setHasVideo(true);
    }, 6000);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      {/* Video Container */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-t-xl bg-background/50">
        {/* Grid overlay for cinematic feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {!hasVideo ? (
          <div className="flex flex-col items-center gap-6 text-center">
            {isGenerating ? (
              <>
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-2 border-primary/30" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <Loader2 className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {GENERATION_STEPS[currentStep - 1]?.label || "Generating Video"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {GENERATION_STEPS[currentStep - 1]?.description || "AI is crafting your cinematic vision..."}
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
                  <h3 className="text-lg font-semibold text-foreground">
                    Ready to Create
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Write your script and click Generate to bring your vision to
                    life
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Simulated video frame */}
            <div className="absolute inset-8 rounded-lg border border-border/50 bg-gradient-to-br from-background via-secondary/20 to-background">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/20 p-4">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Preview Ready
                  </p>
                </div>
              </div>
            </div>

            {/* Aspect ratio indicator */}
            <div className="absolute right-4 top-4 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              16:9 • 1080p
            </div>
          </>
        )}
      </div>

      {/* Controls Bar */}
      <div className="border-t border-border bg-card p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>0:00</span>
            <span>2:30</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              disabled={!hasVideo}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-foreground hover:text-primary"
              disabled={!hasVideo}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              disabled={!hasVideo}
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

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            disabled={!hasVideo}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Generate Button */}
      <div className="border-t border-border p-4">
        <Button
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
