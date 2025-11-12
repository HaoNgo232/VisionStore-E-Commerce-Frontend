"use client"

import type { JSX } from "react"
import { Button } from "@/components/ui/button"
import { Grid2x2, List } from "lucide-react"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps): JSX.Element {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          value === "grid" && "bg-accent text-accent-foreground"
        )}
        onClick={() => onChange("grid")}
        aria-label="Grid view"
      >
        <Grid2x2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          value === "list" && "bg-accent text-accent-foreground"
        )}
        onClick={() => onChange("list")}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

