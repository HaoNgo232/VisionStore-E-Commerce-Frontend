/**
 * Search Input Component
 * Standalone search input với debounce - quản lý state độc lập
 */

"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputProps {
    readonly placeholder?: string;
    readonly onSearch: (value: string) => void;
    readonly disabled?: boolean;
}

export function SearchInput({
    placeholder = "Tìm kiếm...",
    onSearch,
    disabled = false,
}: SearchInputProps): React.ReactElement {
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 300);

    // Gửi debounced search value đến parent
    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    const handleClear = (): void => {
        setSearchValue("");
    };

    return (
        <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-10"
                disabled={disabled}
            />
            {searchValue && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 size-8 p-0"
                    onClick={handleClear}
                    disabled={disabled}
                >
                    <X className="size-4" />
                </Button>
            )}
        </div>
    );
}

