import { Sidebar } from "@/components/sidebar";
import { ScriptEditor } from "@/components/script-editor";
import { VideoPreview } from "@/components/video-preview";

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              Untitled Project
            </span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              Draft
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Auto-saved just now
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/20 ring-2 ring-primary/50" />
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex flex-1 gap-6 overflow-hidden p-6">
          {/* Left Panel - Script Editor */}
          <div className="w-[400px] shrink-0">
            <ScriptEditor />
          </div>

          {/* Right Panel - Video Preview */}
          <div className="flex-1">
            <VideoPreview />
          </div>
        </div>
      </main>
    </div>
  );
}
