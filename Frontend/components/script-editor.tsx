"use client";

import { useState } from "react";
import { FileText, Wand2, Copy, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScriptEditorProps {
  onGenerate: (result: { master_image_url: string; video_urls: VideoEntry[] }) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

export interface VideoEntry {
  scene_number: number;
  visual_prompt: string;
  url: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function ScriptEditor({ onGenerate, isGenerating, setIsGenerating }: ScriptEditorProps) {
  const [script, setScript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const placeholderText = `Enter your production script here...

Example:
Scene 1: Dolly wakes up in a futuristic apartment, sunlight streaming through floor-to-ceiling windows. She stretches and smiles.

Scene 2: Dolly walks through a busy neon-lit city street, dodging hoverboards and street vendors.

Scene 3: Dolly arrives at a sleek tech office, opens her laptop, and begins working with a determined look.`;

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError("Please enter a script before generating.");
      return;
    }
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch(`${BACKEND_URL}/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.detail || "Unknown error from backend");
      }

      onGenerate({
        master_image_url: data.master_image_url,
        video_urls: data.video_urls,
      });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Generation failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Production Script
            </h2>
            <p className="text-xs text-muted-foreground">
              Describe your video scene by scene
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigator.clipboard.writeText(script)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setScript("")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative flex-1">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder={placeholderText}
          className="h-full w-full resize-none rounded-lg border border-border bg-input p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <div className="mt-4">
        <Button
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating with Pixazo AI…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Video
            </>
          )}
        </Button>
      </div>

      {/* AI Assist hint */}
      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Wand2 className="h-3 w-3 text-primary" />
          Powered by Pixazo Kling AI
        </span>
        <span className="text-xs text-muted-foreground">
          {script.length} / 5000 characters
        </span>
      </div>
    </div>
  );
}
