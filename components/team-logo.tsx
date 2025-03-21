import { cn } from "@/lib/utils"

interface TeamLogoProps {
  team: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function TeamLogo({ team, size = "md", className }: TeamLogoProps) {
  // Map team names to colors
  const teamColors: Record<string, { primary: string; secondary: string }> = {
    "Mumbai Indians": { primary: "#004BA0", secondary: "#D1AB3E" },
    "Chennai Super Kings": { primary: "#FFFF3C", secondary: "#0081E9" },
    "Royal Challengers Bangalore": { primary: "#EC1C24", secondary: "#000000" },
    "Kolkata Knight Riders": { primary: "#3A225D", secondary: "#B3A123" },
    "Delhi Capitals": { primary: "#0078BC", secondary: "#EF1C25" },
    "Rajasthan Royals": { primary: "#EA1A85", secondary: "#254AA5" },
    "Sunrisers Hyderabad": { primary: "#F7A721", secondary: "#E95E0B" },
    "Punjab Kings": { primary: "#ED1B24", secondary: "#A7A9AC" },
    // Add fallback for any other team
    default: { primary: "#6E6E6E", secondary: "#ADADAD" },
  }

  // Get team colors or use default
  const colors = teamColors[team] || teamColors.default

  // Get team initials
  const initials = team
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  // Size classes
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
  }

  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-bold text-white", sizeClasses[size], className)}
      style={{
        backgroundColor: colors.primary,
        border: `2px solid ${colors.secondary}`,
      }}
    >
      {initials}
    </div>
  )
}

