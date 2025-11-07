"use client";

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

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (loading) return;

        setError(null);

        // Validation
        if (!email || !password) {
            setError("Vui lòng nhập email và mật khẩu");
            return;
        }

        if (!email.includes('@')) {
            setError("Email không hợp lệ");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        try {
            setLoading(true);
            await authService.login({ email, password });
            toast.success("Đăng nhập thành công!");
            router.push("/home");
        } catch (err) {
            const message = getErrorMessage(err);
            // User-friendly error messages
            const friendlyMessage = message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('401')
                ? "Email hoặc mật khẩu không chính xác"
                : message.toLowerCase().includes('network')
                    ? "Lỗi kết nối. Vui lòng kiểm tra internet"
                    : message;

            setError(friendlyMessage);
            toast.error(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Đăng nhập tài khoản</CardTitle>
                    <CardDescription>
                        Nhập email để đăng nhập vào tài khoản của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <a
                                    href="/auth/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        {error && <div className="text-sm text-destructive">{error}</div>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>

                        <div className="text-center text-sm">
                            Chưa có tài khoản?{" "}
                            <a href="/auth/register" className="text-primary hover:underline">
                                Đăng ký
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
