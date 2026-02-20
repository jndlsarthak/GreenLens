"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CameraViewProps {
    onScan: (data: string) => void
    onError?: (error: Error) => void
}

/** Extract product barcode from scanned content (barcode number or Open Food Facts URL). */
function extractBarcode(decodedText: string): string {
    const trimmed = decodedText.trim()
    const productMatch = trimmed.match(/openfoodfacts\.org\/product\/(\d+)/i)
    if (productMatch) return productMatch[1]
    if (/^\d+$/.test(trimmed)) return trimmed
    return trimmed
}

async function decodeBarcodeFromFile(file: File): Promise<string> {
    const { Html5Qrcode } = await import("html5-qrcode")
    const tempId = "greenlens-qr-file-scan"
    let tempEl = document.getElementById(tempId)
    if (!tempEl) {
        tempEl = document.createElement("div")
        tempEl.id = tempId
        tempEl.style.display = "none"
        tempEl.style.position = "absolute"
        tempEl.setAttribute("aria-hidden", "true")
        document.body.appendChild(tempEl)
    }
    const scanner = new Html5Qrcode(tempId)
    const decodedText = await scanner.scanFile(file, false)
    return decodedText ? extractBarcode(decodedText) : ""
}

type Mode = "choice" | "camera" | "decoding"

export function CameraView({ onScan, onError }: CameraViewProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [mode, setMode] = useState<Mode>("choice")
    const [decodeError, setDecodeError] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [cameraReady, setCameraReady] = useState(false)

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setCameraReady(false)
    }, [])

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    // Request camera only after video element is mounted (when mode === "camera")
    useEffect(() => {
        if (mode !== "camera") return
        setCameraError(null)
        setCameraReady(false)
        let cancelled = false
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } })
            .then((stream) => {
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play().then(() => {
                        if (!cancelled) setCameraReady(true)
                    }).catch(() => {
                        if (!cancelled) setCameraReady(true)
                    })
                } else {
                    stream.getTracks().forEach((t) => t.stop())
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    const msg = err instanceof Error ? err.message : "Camera unavailable"
                    setCameraError(msg)
                    if (onError && err instanceof Error) onError(err)
                }
            })
        return () => {
            cancelled = true
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
                streamRef.current = null
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }
    }, [mode, onError])

    const decodeImage = useCallback(
        async (file: File) => {
            setDecodeError(null)
            setMode("decoding")
            try {
                const barcode = await decodeBarcodeFromFile(file)
                if (barcode) {
                    onScan(barcode)
                } else {
                    setDecodeError("No barcode or QR code found. Try a clearer image.")
                    setMode("choice")
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                if (msg.includes("No QR code found") || msg.includes("No barcode"))
                    setDecodeError("No barcode or QR code found. Try a clearer image.")
                else
                    setDecodeError(msg || "Could not read code from image.")
                setMode("choice")
                if (onError && err instanceof Error) onError(err)
            }
        },
        [onScan, onError]
    )

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file && file.type.startsWith("image/")) {
                decodeImage(file)
            }
            e.target.value = ""
        },
        [decodeImage]
    )

    const startCamera = useCallback(() => {
        setCameraError(null)
        setDecodeError(null)
        setMode("camera")
    }, [])

    const handleCapture = useCallback(() => {
        const video = videoRef.current
        if (!video || !video.videoWidth || video.readyState < 2) return
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(video, 0, 0)
        canvas.toBlob(
            (blob) => {
                if (!blob) return
                stopCamera()
                const file = new File([blob], "capture.png", { type: "image/png" })
                decodeImage(file)
            },
            "image/png",
            0.92
        )
    }, [stopCamera, decodeImage])

    const handleBackFromCamera = useCallback(() => {
        stopCamera()
        setMode("choice")
        setCameraError(null)
    }, [stopCamera])

    const handleDemoScan = () => {
        setMode("decoding")
        setTimeout(() => {
            onScan("3017620422003")
        }, 800)
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden rounded-lg min-h-[300px] flex flex-col items-center justify-center">
            {decodeError && mode === "choice" && (
                <div className="absolute top-4 left-4 right-4 z-20 bg-amber-950/90 text-amber-100 text-sm px-3 py-2 rounded-lg border border-amber-500/50">
                    {decodeError}
                </div>
            )}

            <AnimatePresence mode="wait">
                {mode === "choice" && (
                    <motion.div
                        key="choice"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-6 p-6 w-full max-w-sm"
                    >
                        <p className="text-white/90 text-center text-sm">
                            Upload a photo or take a picture of the barcode or QR code, then we’ll scan it.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture={undefined}
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <Button
                                size="lg"
                                variant="secondary"
                                className="flex-1 gap-2"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-5 w-5" />
                                Upload photo
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1 gap-2 bg-primary text-primary-foreground"
                                onClick={startCamera}
                            >
                                <Camera className="h-5 w-5" />
                                Take picture
                            </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" onClick={handleDemoScan}>
                            Try demo product
                        </Button>
                    </motion.div>
                )}

                {mode === "camera" && (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col"
                    >
                        {cameraError ? (
                            <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                                <p className="text-white/90 mb-4">{cameraError}</p>
                                <Button variant="secondary" onClick={handleBackFromCamera}>
                                    Back
                                </Button>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover bg-black"
                                />
                                {!cameraReady && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                                        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <p className="text-white/90 text-sm mt-3">Starting camera…</p>
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
                                    <Button variant="secondary" onClick={handleBackFromCamera}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="rounded-full h-14 w-14 bg-primary text-primary-foreground"
                                        onClick={handleCapture}
                                        disabled={!cameraReady}
                                        title="Capture and scan"
                                    >
                                        <Camera className="h-7 w-7" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {mode === "decoding" && (
                    <motion.div
                        key="decoding"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
                    >
                        <div className="w-16 h-16 border-4 border-t-primary border-r-primary/30 border-b-primary/30 border-l-primary/30 rounded-full animate-spin" />
                        <p className="text-white mt-4 font-medium">Reading code from image…</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
