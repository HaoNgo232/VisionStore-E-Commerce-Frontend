"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, X, Check } from "lucide-react";
import { useUserProfile } from "../hooks/use-user-profile";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { UpdateProfileRequestSchema, type UpdateProfileRequest } from "@/types";
import { UserRole } from "@/types/auth.types";

type ProfileFormValues = UpdateProfileRequest;

export function ProfileTab(): JSX.Element {
    const [isEditing, setIsEditing] = useState(false);
    const { data: user, isLoading, error } = useUserProfile();
    const updateProfileMutation = useUpdateProfile();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(UpdateProfileRequestSchema),
        defaultValues: {
            fullName: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (!user) {
            return;
        }
        // SAFE: user is guaranteed to exist after above check
        form.reset({
            fullName: user.fullName,
            phone: user.phone ?? "",
        });
    }, [user, form]);

    const handleEdit = (): void => {
        setIsEditing(true);
    };

    const handleCancel = (): void => {
        setIsEditing(false);
        if (!user) {
            return;
        }
        // SAFE: user is guaranteed to exist after above check
        form.reset({
            fullName: user.fullName,
            phone: user.phone ?? "",
        });
    };

    const onSubmit = async (values: ProfileFormValues): Promise<void> => {
        try {
            await updateProfileMutation.mutateAsync(values);
            setIsEditing(false);
        } catch {
            // Error is handled by the mutation hook (toast)
        }
    };

    const getInitials = (name: string | undefined | null): string => {
        if (!name) {
            return "U";
        }
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin hồ sơ</CardTitle>
                    <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin hồ sơ</CardTitle>
                    <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                        <p>Lỗi khi tải thông tin hồ sơ: {error instanceof Error ? error.message : "Unknown error"}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!user || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin hồ sơ</CardTitle>
                    <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                        <p>Không tìm thấy thông tin người dùng.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // SAFE: user is guaranteed to exist after above !user check + return
    const isAdmin = user.role === UserRole.ADMIN;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Thông tin hồ sơ</CardTitle>
                        <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
                    </div>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                {getInitials(user.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            {isEditing ? (
                                <Form {...form}>
                                    <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(onSubmit)(e); }} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Họ và tên</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nguyen Van A" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Số điện thoại</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="0123456789" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={updateProfileMutation.isPending}
                                                size="sm"
                                            >
                                                <Check className="mr-2 h-4 w-4" />
                                                {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancel}
                                                disabled={updateProfileMutation.isPending}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Hủy
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <>
                                    <p className="font-semibold text-lg">{user.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    {user.phone && (
                                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Role and Status Badges */}
                    {!isEditing && (
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={isAdmin ? "default" : "secondary"}>
                                {user.role}
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Hoạt động" : "Không hoạt động"}
                            </Badge>
                        </div>
                    )}

                    {/* Additional Info */}
                    {!isEditing && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-muted-foreground">Ngày tạo</p>
                                <p>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">Cập nhật lần cuối</p>
                                <p>{new Date(user.updatedAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
