/**
 * Users Table Columns Definition
 * Column definitions for users data table using @tanstack/react-table
 */

"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";
import { UserRole } from "@/types/auth.types";

interface UsersTableColumnsProps {
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onDeactivate: (user: User) => void;
}

export function createUsersTableColumns({
    onView,
    onEdit,
    onDeactivate,
}: UsersTableColumnsProps): ColumnDef<User>[] {
    return [
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Email
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
        },
        {
            accessorKey: "fullName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Full Name
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => {
                const phone = row.original.phone;
                return <div>{phone ?? "-"}</div>;
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const roleValue = row.getValue("role");
                const role = typeof roleValue === "string" ? roleValue as UserRole : UserRole.CUSTOMER;
                const isAdmin = role === UserRole.ADMIN;
                return (
                    <Badge variant={isAdmin ? "default" : "secondary"}>
                        {role}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const isActive = Boolean(row.getValue("isActive"));
                return (
                    <Badge variant={isActive ? "default" : "destructive"}>
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(user)}>
                                View details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                Edit user
                            </DropdownMenuItem>
                            {user.isActive && user.role !== UserRole.ADMIN && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDeactivate(user)}
                                        className="text-destructive"
                                    >
                                        Deactivate user
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}

