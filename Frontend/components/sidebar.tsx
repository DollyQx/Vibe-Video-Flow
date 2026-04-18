"use client";

import { useState } from "react";
import {
  Video,
  Plus,
  Clock,
  FolderOpen,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const projectHistory = [
  {
    id: 1,
    title: "Product Launch Teaser",
    date: "2 hours ago",
    duration: "0:45",
    status: "completed",
  },
  {
    id: 2,
    title: "Brand Story Video",
    date: "Yesterday",
    duration: "2:30",
    status: "completed",
  },
  {
    id: 3,
    title: "Tutorial Walkthrough",
    date: "3 days ago",
    duration: "5:15",
    status: "completed",
  },
  {
    id: 4,
    title: "Social Media Clip",
    date: "Last week",
    duration: "0:30",
    status: "completed",
  },
  {
    id: 5,
    title: "Testimonial Montage",
    date: "Last week",
    duration: "1:45",
    status: "completed",
  },
];

export function Sidebar() {
  const [activeProject, setActiveProject] = useState<number | null>(null);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            DollyQx
          </h1>
          <p className="text-xs text-muted-foreground">AI Video Studio</p>
        </div>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Project History */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent Projects
          </span>
        </div>
        <ScrollArea className="h-[calc(100%-2rem)] px-2">
          <div className="space-y-1 pb-4">
            {projectHistory.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={`group flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent ${
                  activeProject === project.id ? "bg-sidebar-accent" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <span className="truncate text-sm font-medium text-sidebar-foreground">
                    {project.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-xs text-muted-foreground">
                    {project.date}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {project.duration}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border p-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <FolderOpen className="h-4 w-4" />
          <span className="text-sm">All Projects</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm">Help & Support</span>
        </button>
      </div>
    </aside>
  );
}
