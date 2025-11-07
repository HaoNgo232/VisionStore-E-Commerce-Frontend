"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

export function ProfileTab(): JSX.Element {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Nguyen Van A</p>
                            <p className="text-sm text-muted-foreground">user@example.com</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                        <p>
                            Profile management features will be available once authentication is integrated with the backend.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}