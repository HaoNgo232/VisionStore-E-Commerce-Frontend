/**
 * Users Filters Component
 * Search and filter controls for users list
 */

"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ListUsersQuery, UserRole } from "@/types";
import { UserRole as UserRoleEnum } from "@/types/auth.types";

interface UsersFiltersProps {
    readonly query: ListUsersQuery;
    readonly onQueryChange: (query: ListUsersQuery) => void;
}

export function UsersFilters({
    query,
    onQueryChange,
}: UsersFiltersProps): React.ReactElement {
    const [searchValue, setSearchValue] = useState(query.search ?? "");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            const newQuery: ListUsersQuery = { ...query };
            if (searchValue) {
                newQuery.search = searchValue;
            } else {
                delete newQuery.search;
            }
            onQueryChange(newQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRoleChange = (role: string): void => {
        const newQuery: ListUsersQuery = { ...query };
        if (role === "all") {
            delete newQuery.role;
        } else {
            newQuery.role = role as UserRole;
        }
        onQueryChange(newQuery);
    };

    const handleClearSearch = (): void => {
        setSearchValue("");
        const newQuery: ListUsersQuery = { ...query };
        delete newQuery.search;
        onQueryChange(newQuery);
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-8 pr-8"
                />
                {searchValue && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 size-8 -translate-y-1/2"
                        onClick={handleClearSearch}
                    >
                        <X className="size-4" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>
            <Select
                value={query.role ?? "all"}
                onValueChange={handleRoleChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value={UserRoleEnum.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRoleEnum.CUSTOMER}>Customer</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

