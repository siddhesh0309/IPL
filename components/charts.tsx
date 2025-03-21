"use client"

import { useEffect, useRef } from "react"

// Mock chart components - in a real app, you would use a charting library like Chart.js, Recharts, etc.
export function LineChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw a simple line chart
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    // Generate random data points
    const dataPoints = Array.from({ length: 12 }, () => Math.floor(Math.random() * (height - 40) + 20))

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i < 5; i++) {
      const y = height - (i * height) / 4 - 20
      ctx.beginPath()
      ctx.moveTo(30, y)
      ctx.lineTo(width - 10, y)
      ctx.stroke()
    }

    // Draw line
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()

    const pointWidth = (width - 40) / (dataPoints.length - 1)

    dataPoints.forEach((point, index) => {
      const x = 30 + index * pointWidth
      const y = height - point - 20

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    ctx.fillStyle = "#3b82f6"
    dataPoints.forEach((point, index) => {
      const x = 30 + index * pointWidth
      const y = height - point - 20

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw axes
    ctx.strokeStyle = "#9ca3af"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(30, 10)
    ctx.lineTo(30, height - 20)
    ctx.lineTo(width - 10, height - 20)
    ctx.stroke()
  }, [])

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <canvas ref={canvasRef} width={500} height={250} className="w-full h-full"></canvas>
    </div>
  )
}

export function BarChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw a simple bar chart
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    // Generate random data points
    const dataPoints = Array.from({ length: 7 }, () => Math.floor(Math.random() * (height - 60) + 20))

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i < 5; i++) {
      const y = height - (i * height) / 4 - 20
      ctx.beginPath()
      ctx.moveTo(30, y)
      ctx.lineTo(width - 10, y)
      ctx.stroke()
    }

    // Draw bars
    const barWidth = 30
    const gap = (width - 40 - barWidth * dataPoints.length) / (dataPoints.length + 1)

    dataPoints.forEach((point, index) => {
      const x = 30 + gap + index * (barWidth + gap)
      const y = height - point - 20
      const barHeight = point

      // Bar gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height - 20)
      gradient.addColorStop(0, "#3b82f6")
      gradient.addColorStop(1, "#93c5fd")

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Bar border
      ctx.strokeStyle = "#2563eb"
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)
    })

    // Draw axes
    ctx.strokeStyle = "#9ca3af"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(30, 10)
    ctx.lineTo(30, height - 20)
    ctx.lineTo(width - 10, height - 20)
    ctx.stroke()
  }, [])

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <canvas ref={canvasRef} width={500} height={250} className="w-full h-full"></canvas>
    </div>
  )
}

export function PieChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw a simple pie chart
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Generate random data points (sum to 100%)
    const dataPoints = [35, 25, 20, 15, 5]
    const colors = ["#3b82f6", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b"]

    let startAngle = 0

    dataPoints.forEach((point, index) => {
      const sliceAngle = (point / 100) * 2 * Math.PI

      ctx.fillStyle = colors[index]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw slice border
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      startAngle += sliceAngle
    })

    // Draw a white circle in the center for a donut chart effect
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <canvas ref={canvasRef} width={500} height={250} className="w-full h-full"></canvas>
    </div>
  )
}

