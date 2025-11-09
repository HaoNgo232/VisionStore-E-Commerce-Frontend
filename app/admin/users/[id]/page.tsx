/**
 * Admin User Detail Page
 * Page for viewing and editing individual user details
 */

"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, UserX } from "lucide-react";
import { useUser } from "@/features/users/hooks/use-user";
import {
    useUpdateUser,
    useDeactivateUser,
} from "@/features/users/hooks/use-user-mutations";
import { UserEditFormDialog } from "@/features/users/components/user-edit-form-dialog";
import { UserDeactivateDialog } from "@/features/users/components/user-deactivate-dialog";
import { UserRole } from "@/types/auth.types";
import type { UpdateUserRequest } from "@/types";

interface UserDetailPageProps {
    readonly params: Promise<{ id: string }>;
}

export default function UserDetailPage({
    params,
}: UserDetailPageProps): React.ReactElement {
    const { id } = use(params);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

    const { data: user, isLoading, error } = useUser(id);
    const updateUserMutation = useUpdateUser();
    const deactivateUserMutation = useDeactivateUser();

    const handleSaveEdit = async (
        userId: string,
        data: UpdateUserRequest,
    ): Promise<void> => {
        const mutationData: { userId: string; data: UpdateUserRequest } = {
            userId,
             
            data,
        };
        await updateUserMutation.mutateAsync(mutationData);
    };

    const handleConfirmDeactivate = async (userId: string): Promise<void> => {
        await deactivateUserMutation.mutateAsync(userId);
    };

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin">Admin</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/users">Users</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>User Detail</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-destructive">
                            {error instanceof Error ? error.message : "User not found"}
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/admin/users">Back to Users</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin">Admin</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/users">Users</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{user.fullName}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="size-4" />
                            <span className="sr-only">Back to users</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(true)}
                    >
                        <Edit className="mr-2 size-4" />
                        Edit User
                    </Button>
                    {user.isActive && user.role !== UserRole.ADMIN && (
                        <Button
                            variant="destructive"
                            onClick={() => setDeactivateDialogOpen(true)}
                        >
                            <UserX className="mr-2 size-4" />
                            Deactivate
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16">
                            <AvatarImage src="" alt={user.fullName} />
                            <AvatarFallback className="text-lg">
                                {getInitials(user.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{user.fullName}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p className="text-sm">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p className="text-sm">{user.phone ?? "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <Badge
                                variant={user.role === UserRole.ADMIN ? "default" : "secondary"}
                            >
                                {user.role}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Status
                            </p>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Created At
                            </p>
                            <p className="text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Updated At
                            </p>
                            <p className="text-sm">
                                {new Date(user.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <UserEditFormDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                user={user}
                onSave={handleSaveEdit}
            />

            <UserDeactivateDialog
                open={deactivateDialogOpen}
                onOpenChange={setDeactivateDialogOpen}
                user={user}
                onConfirm={handleConfirmDeactivate}
            />
        </div>
    );
}

