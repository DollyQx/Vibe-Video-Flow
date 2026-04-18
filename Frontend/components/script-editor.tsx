"use client";

import { useState } from "react";
import { FileText, Wand2, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScriptEditor() {
  const [script, setScript] = useState("");

  const placeholderText = `Enter your production script here...

Example:
"A cinematic drone shot reveals a modern city skyline at sunset. 
The camera slowly descends through glass towers, 
capturing the golden light reflecting off buildings.
Cut to street level - people walking, 
city life in motion, end with product reveal."`;

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

      {/* AI Assist Button */}
      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full gap-2 border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          <Wand2 className="h-4 w-4 text-primary" />
          Enhance Script with AI
        </Button>
      </div>

      {/* Character Count */}
      <div className="mt-2 text-right">
        <span className="text-xs text-muted-foreground">
          {script.length} / 5000 characters
        </span>
      </div>
    </div>
  );
}
