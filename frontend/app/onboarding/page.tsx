"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ScanLine, Award, Leaf, ArrowRight, Check } from "lucide-react"

const steps = [
    {
        id: 1,
        title: "Welcome to GreenLens",
        description: "Your AI-powered companion for a sustainable lifestyle. Scan products to unveil their environmental impact.",
        icon: Leaf,
        color: "text-eco-green"
    },
    {
        id: 2,
        title: "Scan & Analyze",
        description: "Use your camera to scan barcodes. Instantly see carbon footprints, eco-scores, and better alternatives.",
        icon: ScanLine,
        color: "text-blue-500"
    },
    {
        id: 3,
        title: "Earn Rewards",
        description: "Complete eco-challenges, collect badges, and earn points for every sustainable choice you make.",
        icon: Award,
        color: "text-yellow-500"
    }
]

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            router.push('/auth/register')
        }
    }

    const StepIcon = steps[currentStep].icon

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col items-center justify-center gap-8"
                >
                    <div className={`p-6 rounded-full bg-muted/30 ${steps[currentStep].color}`}>
                        <StepIcon size={64} />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">{steps[currentStep].title}</h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {steps[currentStep].description}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="w-full mt-12 space-y-8">
                {/* Indicators */}
                <div className="flex justify-center gap-2">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                                }`}
                        />
                    ))}
                </div>

                <div className="flex gap-4">
                    {currentStep > 0 && (
                        <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(currentStep - 1)}>
                            Back
                        </Button>
                    )}
                    <Button className="flex-1" onClick={handleNext}>
                        {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                        {currentStep === steps.length - 1 ? <Check className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
