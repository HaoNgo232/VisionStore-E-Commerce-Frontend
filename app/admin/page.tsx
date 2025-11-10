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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Total users</p>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/users">Manage users →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/orders">Manage orders →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Total products</p>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/products">Manage products →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>System settings</CardDescription>
            <Button asChild variant="link" className="p-0 mt-2">
              <Link href="/admin/settings">Configure →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

