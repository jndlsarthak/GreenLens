"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Flashlight, FlipHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CameraViewProps {
    onScan: (data: string) => void
    onError?: (error: Error) => void
}

/** Extract product barcode from scanned content (barcode number or Open Food Facts URL). */
function extractBarcode(decodedText: string): string {
    const trimmed = decodedText.trim()
    // Open Food Facts product URL: .../product/3017620422003 or .../product/3017620422003/...
    const productMatch = trimmed.match(/openfoodfacts\.org\/product\/(\d+)/i)
    if (productMatch) return productMatch[1]
    // Plain barcode (digits, possibly with leading zeros)
    if (/^\d+$/.test(trimmed)) return trimmed
    return trimmed
}

export function CameraView({ onScan, onError }: CameraViewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null)
    const isRunningRef = useRef(false)
    const [scanning, setScanning] = useState(false)
    const [flashOn, setFlashOn] = useState(false)
    const [useDemo, setUseDemo] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)

    const stopScanner = async (scanner: { stop: () => Promise<void>; clear: () => void } | null) => {
        if (!scanner || !isRunningRef.current) {
            isRunningRef.current = false
            return
        }
        try {
            await scanner.stop()
            isRunningRef.current = false
        } catch (err) {
            // Ignore "scanner not running" or "paused" errors - these are expected
            const errorMsg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
            if (errorMsg.includes("not running") || errorMsg.includes("paused") || errorMsg.includes("cannot stop")) {
                isRunningRef.current = false
                return
            }
            console.warn("Error stopping scanner:", err)
            isRunningRef.current = false
        }
    }

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return

        let mounted = true
        let scanner: { stop: () => Promise<void>; clear: () => void; start: (a: string, b: object, c: (t: string) => void, d: () => void) => Promise<void> } | null = null

        // Wait a bit for the DOM to be fully rendered before starting scanner
        const startScanner = async () => {
            try {
                // Stop existing scanner if running
                if (scanner && isRunningRef.current) {
                    await stopScanner(scanner)
                    // Small delay to ensure cleanup
                    await new Promise(resolve => setTimeout(resolve, 100))
                }

                const { Html5Qrcode } = await import("html5-qrcode")
                const id = "greenlens-qr-reader"
                
                // Wait for element to be in DOM and have dimensions
                let element = document.getElementById(id)
                let attempts = 0
                const maxAttempts = 10
                
                while ((!element || element.clientWidth === 0 || element.clientHeight === 0) && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                    element = document.getElementById(id)
                    attempts++
                }
                
                if (!element) {
                    console.warn("Scanner element not found after waiting")
                    setCameraError("Camera element not ready")
                    setUseDemo(true)
                    return
                }
                
                if (element.clientWidth === 0 || element.clientHeight === 0) {
                    console.warn("Scanner element has no dimensions", {
                        width: element.clientWidth,
                        height: element.clientHeight
                    })
                    setCameraError("Camera viewport not ready")
                    setUseDemo(true)
                    return
                }

                // Create new scanner instance
                scanner = new Html5Qrcode(id) as unknown as typeof scanner
                scannerRef.current = scanner

                const cameras = await Html5Qrcode.getCameras()
                if (!cameras?.length) {
                    setCameraError("No camera found")
                    setUseDemo(true)
                    return
                }

                const cameraId = cameras.find((c: { label: string }) => /back|rear|environment/i.test(c.label))?.id ?? cameras[0].id

                // Defer start() until after layout so the library's internal DOM has dimensions
                await new Promise<void>((resolve) => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => resolve())
                    })
                })

                // Re-verify element right before start (React may have updated DOM)
                const elBeforeStart = document.getElementById(id)
                if (!elBeforeStart?.clientWidth || !elBeforeStart?.clientHeight) {
                    setCameraError("Camera viewport not ready. Try again or use demo.")
                    setUseDemo(true)
                    return
                }

                const startScannerInstance = () =>
                    scanner!.start(
                        cameraId,
                        {
                            fps: 10,
                            qrbox: { width: 260, height: 260 },
                        },
                        (decodedText: string) => {
                            if (!mounted || !isRunningRef.current) return
                            const barcode = extractBarcode(decodedText)
                            if (barcode) {
                                stopScanner(scanner).then(() => {
                                    setScanning(false)
                                    onScan(barcode)
                                    setTimeout(() => {
                                        if (mounted && !isRunningRef.current) {
                                            startScanner().catch(() => setUseDemo(true))
                                        }
                                    }, 1500)
                                }).catch(() => {
                                    setScanning(false)
                                    onScan(barcode)
                                    setTimeout(() => {
                                        if (mounted && !isRunningRef.current) {
                                            startScanner().catch(() => setUseDemo(true))
                                        }
                                    }, 1500)
                                })
                            }
                        },
                        () => {}
                    )

                try {
                    await startScannerInstance()
                } catch (startErr) {
                    const msg = startErr instanceof Error ? startErr.message : String(startErr)
                    if ((msg.includes("clientWidth") || msg.includes("null")) && mounted) {
                        await new Promise((r) => setTimeout(r, 300))
                        if (!mounted) return
                        try {
                            await startScannerInstance()
                        } catch (retryErr) {
                            throw retryErr
                        }
                    } else {
                        throw startErr
                    }
                }

                isRunningRef.current = true
                setCameraError(null)
                setScanning(true)
            } catch (err) {
                console.error("Scanner init error:", err)
                isRunningRef.current = false
                const errorMsg = err instanceof Error ? err.message : "Camera unavailable"
                if (errorMsg.includes("clientWidth") || errorMsg.includes("null")) {
                    setCameraError("Camera viewport not ready. Use demo or refresh the page.")
                    setUseDemo(true)
                } else {
                    setCameraError(errorMsg)
                    setUseDemo(true)
                }
                if (onError && err instanceof Error) onError(err)
            }
        }

        // Delay so DOM and layout are ready (avoids clientWidth null in html5-qrcode)
        const timeoutId = setTimeout(() => {
            if (mounted) {
                startScanner()
            }
        }, 250)

        return () => {
            clearTimeout(timeoutId)
            mounted = false
            const s = scannerRef.current
            if (s) {
                stopScanner(s).then(() => {
                    s.clear()
                    scannerRef.current = null
                    isRunningRef.current = false
                }).catch(() => {
                    scannerRef.current = null
                    isRunningRef.current = false
                })
            }
        }
    }, [onError])

    const handleDemoScan = () => {
        setScanning(true)
        setTimeout(() => {
            setScanning(false)
            onScan("3017620422003")
        }, 2000)
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden rounded-lg min-h-[300px]" ref={containerRef}>
            <div
                id="greenlens-qr-reader"
                className="absolute inset-0 w-full h-full min-w-[280px] min-h-[300px] [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                style={{ width: "100%", height: "100%" }}
            />

            {/* Guide overlay – pointer-events-none so it doesn't block scan area */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-primary -mb-1 -mr-1" />
                    <motion.div
                        className="absolute w-full h-0.5 bg-primary/80 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        initial={{ top: 0 }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <p className="absolute text-white/80 text-sm mt-64 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    Align barcode or QR within frame
                </p>
            </div>

            {/* Demo fallback when camera fails */}
            {useDemo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-4">
                    <p className="text-white/90 text-sm text-center mb-4">
                        {cameraError ?? "Camera not available."} Use demo to try with a sample product.
                    </p>
                    <Button
                        size="lg"
                        className="rounded-full"
                        onClick={handleDemoScan}
                        disabled={scanning}
                    >
                        {scanning ? "Analyzing…" : "Scan demo product"}
                    </Button>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 px-4 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-black/20 text-white hover:bg-black/40"
                    onClick={() => setFlashOn(!flashOn)}
                >
                    <Flashlight className={cn("h-6 w-6", flashOn && "text-yellow-400")} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white hover:bg-black/40">
                    <FlipHorizontal className="h-6 w-6" />
                </Button>
            </div>

            <AnimatePresence>
                {scanning && useDemo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-50"
                    >
                        <div className="w-16 h-16 border-4 border-t-primary border-r-primary/30 border-b-primary/30 border-l-primary/30 rounded-full animate-spin" />
                        <p className="text-white mt-4 font-medium">Analyzing product…</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
