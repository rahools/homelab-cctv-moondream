"use client"

import { useEffect, useRef } from "react"

export default function StaticLoader() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        const resizeCanvas = () => {
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.clientWidth
                canvas.height = parent.clientHeight
            }
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Generate TV static
        const generateStatic = () => {
            ctx.fillStyle = "black"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw static noise
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            for (let i = 0; i < data.length; i += 4) {
                const noise = Math.floor(Math.random() * 255)
                data[i] = noise // Red
                data[i + 1] = noise // Green
                data[i + 2] = noise // Blue
                data[i + 3] = 255 // Alpha
            }

            ctx.putImageData(imageData, 0, 0)

            // Add "NO SIGNAL" text
            ctx.font = "20px monospace"
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.fillText("NO SIGNAL", canvas.width / 2, canvas.height / 2 - 15)
            ctx.font = "14px monospace"
            ctx.fillText("CONNECTING...", canvas.width / 2, canvas.height / 2 + 15)
        }

        // Animation loop
        let animationId: number
        const animate = () => {
            generateStatic()
            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <div className="absolute inset-0 bg-black">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
    )
}
