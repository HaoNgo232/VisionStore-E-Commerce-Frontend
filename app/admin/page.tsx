/**
 * Admin Dashboard Page
 * Main dashboard for admin panel
 */

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, Package, Settings } from "lucide-react";

export default function AdminDashboardPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Tổng số người dùng</p>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/users">Quản lý người dùng →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Tổng số đơn hàng</p>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/orders">Quản lý đơn hàng →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Tổng số sản phẩm</p>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/products">Quản lý sản phẩm →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cài đặt</CardTitle>
            <Settings className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Cài đặt hệ thống</CardDescription>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/settings">Cấu hình →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

