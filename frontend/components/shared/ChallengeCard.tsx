import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Challenge } from "@/store/challengeStore"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ImagePlus, X } from "lucide-react"

interface ChallengeCardProps {
    challenge: Challenge
    onAccept?: () => void
    onCancel?: (id: string) => void
}

export function ChallengeCard({ challenge, onAccept, onCancel }: ChallengeCardProps) {
    const isCompleted = challenge.status === 'completed'
    const isActive = challenge.status === 'active'

    return (
        <Card className={isCompleted ? "opacity-75 bg-muted/50" : ""}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">{challenge.category}</Badge>
                    <Badge variant="secondary" className="bg-eco-brown/10 text-eco-brown">
                        {challenge.points} pts
                    </Badge>
                </div>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {(isActive || isCompleted) && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{challenge.progress} / {challenge.target}</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.target) * 100} />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {challenge.status === 'available' && (
                    <Button className="w-full" onClick={onAccept}>Accept Challenge</Button>
                )}
                {isActive && (
                    <>
                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => {}}
                                title="Add pictures (coming soon)"
                            >
                                <ImagePlus className="w-4 h-4" />
                                Add pictures
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive gap-2"
                                onClick={() => onCancel?.(challenge.id)}
                                title="Cancel challenge"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
                {isCompleted && (
                    <div className="flex items-center justify-center w-full gap-2 text-primary font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        Completed
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
