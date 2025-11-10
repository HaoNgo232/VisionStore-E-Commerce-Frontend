/**
 * Admin Layout
 * Layout for admin dashboard with sidebar navigation
 */

"use client";

import Link from "next/link";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserRole } from "@/types/auth.types";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/services/auth.service";
import { LogOut, User } from "lucide-react";

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps): React.ReactElement {
  const router = useRouter();
   
  const getUserRole = useAuthStore((state) => state.getUserRole);

  const handleLogout = (): void => {
    authService.logout();
    router.push("/auth/login");
  };

  // Type assertion needed due to Zustand selector type inference
   
  const userRole = getUserRole();
  const userInitials = userRole === "ADMIN" ? "A" : "U";

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/admin">Quản trị viên</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bảng điều khiển</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative size-8 rounded-full">
                    <Avatar className="size-8">
                      <AvatarImage src="" alt="Admin" />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Quản trị viên</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userRole}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="flex items-center">
                      <User className="mr-2 size-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

