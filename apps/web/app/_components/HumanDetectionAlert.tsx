'use client';

import { useEffect, useRef, useState } from 'react';

interface DetectionEvent {
    timestamp: string;
    hasHumans: boolean;
    imageSrc?: string;
    error?: string;
}

interface HumanDetectionAlertProps {
    soundEnabled?: boolean;
    sseEndpoint?: string;
}

const HumanDetectionAlert: React.FC<HumanDetectionAlertProps> = ({
    soundEnabled = true,
    sseEndpoint = 'http://localhost:3002/sse',
}) => {
    const [lastDetection, setLastDetection] = useState<DetectionEvent | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

    useEffect(() => {
        // Update current time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Create audio element for alert sound
        if (typeof window !== 'undefined' && soundEnabled) {
            audioRef.current = new Audio('/replicate-prediction-w4nqa04vbdrj40cpj3n8637csm.mp3');
        }

        return () => {
            // Clean up audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [soundEnabled]);

    useEffect(() => {
        // Connect to SSE endpoint
        if (typeof window !== 'undefined') {
            const connectSSE = () => {
                try {
                    // Close any existing connection
                    if (eventSourceRef.current) {
                        eventSourceRef.current.close();
                    }

                    // Create new EventSource connection
                    const eventSource = new EventSource(sseEndpoint);
                    eventSourceRef.current = eventSource;

                    // Handle connection open
                    eventSource.onopen = () => {
                        setIsConnected(true);
                        console.log('Connected to SSE endpoint');
                    };

                    // Handle incoming messages
                    eventSource.onmessage = (event) => {
                        try {
                            const data: DetectionEvent = JSON.parse(event.data);
                            setLastDetection(data);

                            // If humans are detected, play alert sound
                            if (data.hasHumans && soundEnabled && audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play().catch(error => {
                                    console.error('Error playing alert sound:', error);
                                });
                            }
                        } catch (error) {
                            console.error('Error parsing SSE event:', error);
                        }
                    };

                    // Handle errors
                    eventSource.onerror = (error) => {
                        console.error('SSE connection error:', error);
                        setIsConnected(false);

                        // Attempt to reconnect
                        if (eventSourceRef.current) {
                            eventSourceRef.current.close();
                            eventSourceRef.current = null;

                            // Try to reconnect after 5 seconds
                            setTimeout(connectSSE, 5000);
                        }
                    };
                } catch (error) {
                    console.error('Failed to connect to SSE endpoint:', error);
                    setIsConnected(false);
                }
            };

            // Initial connection
            connectSSE();

            // Clean up on unmount
            return () => {
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
            };
        }
    }, [sseEndpoint, soundEnabled]);

    return (
        <div className="flex flex-col h-[60vh] w-[60vw]  items-center justify-center">
            {/* Monitor Header - Status Bar */}
            <div className="bg-gray-900 p-2 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-mono">
                        {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                </div>
                <div className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                    {currentTime}
                </div>
                {lastDetection && lastDetection.hasHumans && (
                    <div className="bg-red-600 px-2 py-1 rounded-md animate-pulse font-bold text-sm">
                        HUMAN DETECTED
                    </div>
                )}
            </div>

            {/* Video Feed */}
            <div className="bg-gray-900 flex items-center justify-center border-b border-gray-700 overflow-hidden">
                {lastDetection?.imageSrc ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <img
                            src={lastDetection.imageSrc}
                            alt="Camera feed"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <div className="text-gray-400 mb-2">No image feed available</div>
                        <div className="text-xs text-gray-500">SSE is not configured to send images</div>
                    </div>
                )}

                {/* Camera UI overlay elements */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 p-1 rounded text-xs font-mono">
                    CAM-01
                </div>

                {lastDetection && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                        <div className="bg-black bg-opacity-50 p-1 rounded text-xs font-mono">
                            {new Date(lastDetection.timestamp).toLocaleTimeString()}
                        </div>
                        <div className={`p-1 rounded text-xs font-mono ${lastDetection.hasHumans ? 'bg-red-600' : 'bg-green-600'} bg-opacity-80`}>
                            {lastDetection.hasHumans ? 'MOTION DETECTED' : 'NO MOTION'}
                        </div>
                    </div>
                )}

                {/* Recording indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black bg-opacity-50 p-1 rounded">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-mono">REC</span>
                </div>
            </div>

            {/* Footer status */}
            <div className="bg-gray-900 p-2 text-xs font-mono">
                {!isConnected && (
                    <div className="text-red-400 animate-pulse">
                        Connection lost. Attempting to reconnect...
                    </div>
                )}
                {isConnected && lastDetection && (
                    <div className="text-gray-400">
                        Last update: {new Date(lastDetection.timestamp).toLocaleString()}
                        {lastDetection.hasHumans ? ' - Human activity detected' : ' - Area secure'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HumanDetectionAlert;