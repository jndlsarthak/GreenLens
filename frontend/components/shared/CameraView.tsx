"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Flashlight, FlipHorizontal, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CameraViewProps {
    onScan: (data: string) => void
    onError?: (error: Error) => void
}

export function CameraView({ onScan, onError }: CameraViewProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [flashOn, setFlashOn] = useState(false)

    useEffect(() => {
        let currentStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                const constraints = {
                    video: {
                        facingMode: "environment", // Use back camera on mobile
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                }
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
                currentStream = mediaStream;
                setStream(mediaStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (err) {
                console.error("Camera error:", err)
                if (onError && err instanceof Error) onError(err)
            }
        }

        startCamera()

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [onError])

    const handleScan = () => {
        setIsScanning(true)
        // Simulate scan delay
        setTimeout(() => {
            setIsScanning(false)
            onScan("1234567890") // Mock barcode
        }, 2000)
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden rounded-lg">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />

            {/* Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
                    {/* Scan Line Animation */}
                    <motion.div
                        className="absolute w-full h-0.5 bg-primary/80 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        initial={{ top: 0 }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <div className="absolute text-white/80 text-sm mt-80 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    Align code within frame
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/20 text-white hover:bg-black/40"
                    onClick={() => setFlashOn(!flashOn)}
                >
                    <Flashlight className={cn("h-6 w-6", flashOn && "text-yellow-400")} />
                </Button>

                <Button
                    size="lg"
                    className="h-16 w-16 rounded-full border-4 border-white bg-transparent hover:bg-white/20 p-1"
                    onClick={handleScan}
                >
                    <div className="w-full h-full bg-white rounded-full"></div>
                </Button>

                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white hover:bg-black/40">
                    <FlipHorizontal className="h-6 w-6" />
                </Button>
            </div>

            {/* Scanning Overlay */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-50"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-t-primary border-r-primary/30 border-b-primary/30 border-l-primary/30 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ScanLine className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                        </div>
                        <p className="text-white mt-4 font-medium animate-pulse">Analyzing product...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ScanLine({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        </svg>
    )
}
