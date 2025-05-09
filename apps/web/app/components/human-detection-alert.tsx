"use client"

import { useEffect, useState } from "react"

interface HumanDetectionAlertProps {
    isHumanDetected: boolean
}

export default function HumanDetectionAlert({ isHumanDetected }: HumanDetectionAlertProps) {
    const [isFlashing, setIsFlashing] = useState(false)

    useEffect(() => {
        if (isHumanDetected) {
            const interval = setInterval(() => {
                setIsFlashing((prev) => !prev)
            }, 500) // Fast flashing for alert

            return () => clearInterval(interval)
        } else {
            setIsFlashing(false)
        }
    }, [isHumanDetected])

    return (
        <div
            className={`border-2 ${isHumanDetected ? "border-red-700" : "border-gray-700"} p-3 ${isFlashing ? "bg-red-900" : "bg-gray-900"} transition-colors duration-300`}
        >
            <div className="text-xs uppercase mb-2 text-center border-b border-gray-700 pb-1">Detection Status</div>

            <div className="text-center py-2">
                {isHumanDetected ? (
                    <div className={`text-lg font-bold ${isFlashing ? "text-white" : "text-red-500"}`}>!! HUMAN DETECTED !!</div>
                ) : (
                    <div className="text-lg font-bold text-green-500">ALL SYSTEMS NORMAL</div>
                )}
            </div>

            {/* ASCII art gauge */}
            <div className="font-mono text-xs text-center mt-1">
                <div className="text-gray-500">THREAT LEVEL:</div>
                <div className="flex justify-center space-x-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <span
                            key={i}
                            className={
                                i < (isHumanDetected ? 8 : 2) ? (isHumanDetected ? "text-red-500" : "text-green-500") : "text-gray-700"
                            }
                        >
                            ▮
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
