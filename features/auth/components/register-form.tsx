"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/services/auth.service";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";

export function RegisterForm(): JSX.Element {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);

        if (!fullName || !email || !password || !confirmPassword) {
            setError("Vui lòng nhập tất cả thông tin bắt buộc");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu không trùng khớp");
            return;
        }

        if (password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        try {
            setLoading(true);
            // Backend RegisterDto only accepts: email, password, fullName
            // Phone is not part of registration, will be added to profile later
            await authService.register({
                fullName,
                email,
                password,
            });
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            router.push("/auth/login");
        } catch (err) {
            const message = getErrorMessage(err);
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tạo tài khoản mới</CardTitle>
                    <CardDescription>
                        Điền thông tin bên dưới để tạo tài khoản
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ và tên *</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Nguyễn Văn A"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Ít nhất 8 ký tự
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        {error && <div className="text-sm text-destructive">{error}</div>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </Button>

                        <div className="text-center text-sm">
                            Đã có tài khoản?{" "}
                            <a href="/auth/login" className="text-primary hover:underline">
                                Đăng nhập
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
