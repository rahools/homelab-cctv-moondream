"use client"

import { useEffect, useState } from "react"

interface ConnectionIndicatorProps {
    isConnected: boolean
}

export default function ConnectionIndicator({ isConnected }: ConnectionIndicatorProps) {
    const [blinking, setBlinking] = useState(false)

    useEffect(() => {
        if (isConnected) {
            const interval = setInterval(() => {
                setBlinking((prev) => !prev)
            }, 1000)

            return () => clearInterval(interval)
        } else {
            setBlinking(false)
        }
    }, [isConnected])

    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-3 h-3 rounded-full ${isConnected ? (blinking ? "bg-red-500" : "bg-red-800") : "bg-gray-700"}`}
            ></div>
            <span className="text-xs uppercase">{isConnected ? "REC" : "STANDBY"}</span>
        </div>
    )
}
