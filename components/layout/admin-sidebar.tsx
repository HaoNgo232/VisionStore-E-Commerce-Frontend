/**
 * Admin Sidebar Component
 * Navigation sidebar for admin dashboard
 * Based on shadcn sidebar-01 block
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Bảng điều khiển",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Đơn hàng",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Sản phẩm",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Cài đặt",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar(
  props: React.ComponentProps<typeof Sidebar>,
): React.ReactElement {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Bảng quản trị</span>
            <span className="text-xs text-muted-foreground">
              Bảng điều khiển quản lý
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                // For root path (/admin), only check exact match
                // For nested paths, check exact match or startsWith
                const isActive =
                  item.url === "/admin"
                    ? pathname === item.url
                    : pathname === item.url || pathname.startsWith(`${item.url}/`);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

