import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function calculateTimeLeft(endDate: Date | string): {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
} {
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  const difference = end - now

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isExpired: false,
  }
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "bg-green-500"
    case "CLOSED":
      return "bg-yellow-500"
    case "SETTLED":
      return "bg-blue-500"
    case "UPCOMING":
      return "bg-purple-500"
    case "LIVE":
      return "bg-red-500"
    case "COMPLETED":
      return "bg-gray-500"
    default:
      return "bg-gray-400"
  }
}

export function getStatusText(status: string): string {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "Active"
    case "CLOSED":
      return "Closed"
    case "SETTLED":
      return "Settled"
    case "UPCOMING":
      return "Upcoming"
    case "LIVE":
      return "Live"
    case "COMPLETED":
      return "Completed"
    default:
      return status
  }
}

export function generatePaginationArray(currentPage: number, totalPages: number, maxLength = 7): (number | "...")[] {
  if (totalPages <= maxLength) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const sideWidth = Math.floor(maxLength / 2)
  let leftWidth = sideWidth
  let rightWidth = sideWidth

  if (currentPage <= sideWidth) {
    leftWidth = currentPage - 1
    rightWidth = maxLength - leftWidth - 1
  } else if (currentPage >= totalPages - sideWidth) {
    rightWidth = totalPages - currentPage
    leftWidth = maxLength - rightWidth - 1
  }

  const result: (number | "...")[] = []

  // Always include page 1
  result.push(1)

  // Add left ellipsis if needed
  if (currentPage - leftWidth > 2) {
    result.push("...")
  }

  // Add pages around current page
  for (let i = Math.max(2, currentPage - leftWidth); i <= Math.min(totalPages - 1, currentPage + rightWidth); i++) {
    result.push(i)
  }

  // Add right ellipsis if needed
  if (currentPage + rightWidth < totalPages - 1) {
    result.push("...")
  }

  // Always include last page
  if (totalPages > 1) {
    result.push(totalPages)
  }

  return result
}

