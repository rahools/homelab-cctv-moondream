"use client"

import { useState, useEffect, useRef } from "react"
import { AlertTriangle, Power, Wifi, WifiOff } from "lucide-react"
import { SSE } from "sse.js"

import AuthForm from "./auth-form"
import ConnectionIndicator from "./connection-indicator"
import HumanDetectionAlert from "./human-detection-alert"
import StaticLoader from "./static-loader"
import { env } from "../../env"

interface CCTVEvent {
    image: string
    timestamp: string
    isHumanDetected: boolean
}


export default function CCTVMonitor() {
    const [authToken, setAuthToken] = useState<string>("")
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState<string>("--:--:--")
    const [isHumanDetected, setIsHumanDetected] = useState<boolean>(false)
    const eventSourceRef = useRef<SSE | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (authToken && !isConnected) {
            connectToSSE()
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
                setIsConnected(false)
            }
        }
    }, [authToken])

    useEffect(() => {
        if (isHumanDetected && audioRef.current) {
            audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
        }
    }, [isHumanDetected])

    const connectToSSE = () => {
        try {
            setIsLoading(true)
            setError(null)

            console.log("Connecting to SSE...", env.NEXT_PUBLIC_SSE_URL)
            const eventSource = new SSE(env.NEXT_PUBLIC_SSE_URL, {
                withCredentials: false,
                headers: {
                    "authorization": `Bearer ${authToken}`,
                },
            })

            eventSource.onopen = () => {
                setIsConnected(true)
                setIsLoading(false)
            }

            eventSource.onmessage = (event) => {
                try {
                    const data: CCTVEvent = JSON.parse(event.data)
                    setCurrentImage(data.image)
                    setCurrentTime(data.timestamp)
                    setIsHumanDetected(data.isHumanDetected)
                } catch (err) {
                    console.error("Error parsing SSE data:", err)
                }
            }

            eventSource.onerror = (err) => {
                console.error("SSE Error:", err)
                setError("Connection failed. Please check your authorization token and try again.")
                setIsConnected(false)
                setIsLoading(false)
                eventSource.close()
            }

            eventSourceRef.current = eventSource
        } catch (err) {
            console.error("Error setting up SSE:", err)
            setError("Failed to establish connection to CCTV server.")
            setIsConnected(false)
            setIsLoading(false)
        }
    }

    const disconnect = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
            setIsConnected(false)
            setCurrentImage(null)
            setIsHumanDetected(false)
        }
    }

    return (
        <div className="relative border-4 border-gray-700 bg-black p-4 rounded-md overflow-hidden font-mono text-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
            {/* CRT Scan lines effect */}
            <div className="absolute inset-0 pointer-events-none bg-scan-lines opacity-10 z-10"></div>

            {/* Header */}
            <div className="border-b-2 border-gray-700 pb-2 mb-4">
                <div className="flex justify-between items-center">
                    <div className="text-xl tracking-wider">
                        <span className="text-amber-500">SECURITY</span>-<span className="text-green-500">MONITOR</span>
                        <span className="text-xs ml-2 text-gray-500">v1.0.3</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ConnectionIndicator isConnected={isConnected} />
                        <button
                            onClick={disconnect}
                            disabled={!isConnected}
                            className={`flex items-center gap-1 px-3 py-1 rounded ${isConnected ? "bg-red-900 text-white hover:bg-red-800" : "bg-gray-800 text-gray-500"}`}
                        >
                            <Power size={14} />
                            DISCONNECT
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Left side - Camera feed */}
                <div className="md:col-span-3 relative">
                    <div className="aspect-video bg-black border-2 border-gray-700 overflow-hidden relative">
                        {isLoading && <StaticLoader />}

                        {error && !isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-red-500 p-4">
                                <AlertTriangle size={48} className="mb-4" />
                                <div className="text-center uppercase tracking-wider">
                                    <div className="text-xl mb-2">CONNECTION ERROR</div>
                                    <div className="text-sm">{error}</div>
                                </div>
                            </div>
                        )}

                        {currentImage && !isLoading && (
                            <img src={currentImage || "/placeholder.svg"} alt="CCTV Feed" className="w-full h-full object-cover" />
                        )}

                        {/* Overlay elements */}
                        {isConnected && (
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Top-left: Camera ID and timestamp */}
                                <div className="absolute top-2 left-2 text-xs bg-black/50 p-1">
                                    <div>CAM-01 :: MAIN ENTRANCE</div>
                                    <div className="font-bold">{currentTime}</div>
                                </div>

                                {/* Bottom-left: Connection status */}
                                <div className="absolute bottom-2 left-2 flex items-center gap-2 text-xs bg-black/50 p-1">
                                    {isConnected ? (
                                        <>
                                            <Wifi size={12} className="text-green-500" />
                                            <span>SIGNAL: STRONG</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff size={12} className="text-red-500" />
                                            <span>SIGNAL: NONE</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side - Controls and indicators */}
                <div className="md:col-span-1 flex flex-col gap-4">
                    {!authToken ? (
                        <AuthForm onSubmit={setAuthToken} />
                    ) : (
                        <>
                            <div className="border-2 border-gray-700 p-3 bg-gray-900">
                                <div className="text-xs uppercase mb-2 text-center border-b border-gray-700 pb-1">System Status</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>FEED:</div>
                                    <div className={isConnected ? "text-green-500" : "text-red-500"}>
                                        {isConnected ? "ACTIVE" : "OFFLINE"}
                                    </div>
                                    <div>SIGNAL:</div>
                                    <div className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? "100%" : "0%"}</div>
                                    <div>RECORDING:</div>
                                    <div className="text-amber-500">ENABLED</div>
                                </div>
                            </div>

                            <HumanDetectionAlert isHumanDetected={isHumanDetected} />

                            <div className="border-2 border-gray-700 p-3 bg-gray-900 flex-grow">
                                <div className="text-xs uppercase mb-2 text-center border-b border-gray-700 pb-1">Activity Log</div>
                                <div className="text-xs h-[120px] overflow-y-auto font-mono">
                                    <div className="text-gray-500">[{currentTime}] System initialized</div>
                                    <div className="text-gray-500">[{currentTime}] Connection established</div>
                                    {isHumanDetected && <div className="text-red-500">[{currentTime}] !! HUMAN DETECTED !!</div>}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Audio for human detection alert */}
            <audio ref={audioRef} preload="auto">
                <source src="/alert.mp3" type="audio/mpeg" />
            </audio>
        </div>
    )
}
