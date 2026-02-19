"use client"

import { useChallengeStore } from "@/store/challengeStore"
import { ChallengeCard } from "@/components/shared/ChallengeCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ChallengesPage() {
    const { challenges, acceptChallenge } = useChallengeStore()

    const activeChallenges = challenges.filter(c => c.status === 'active' || c.status === 'available')
    const completedChallenges = challenges.filter(c => c.status === 'completed')

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
                <p className="text-muted-foreground">Complete challenges to earn points and badges.</p>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active & Available</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4">
                    {activeChallenges.map(challenge => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onAccept={() => acceptChallenge(challenge.id)}
                        />
                    ))}
                </TabsContent>
                <TabsContent value="completed" className="space-y-4">
                    {completedChallenges.length > 0 ? (
                        completedChallenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No completed challenges yet. Keep going!
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
