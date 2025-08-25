"use client";

import { SearchIcon, X } from "lucide-react";
import { useState, FormEvent } from "react";
import { useSearch } from "@/modules/home/contexts/search-context";

export const SearchInput = () => {
    const { searchQuery, setSearchQuery, clearSearch } = useSearch();
    const [localQuery, setLocalQuery] = useState(searchQuery);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSearchQuery(localQuery.trim());
    };

    const handleClear = () => {
        setLocalQuery('');
        clearSearch();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalQuery(value);
        
        // Clear search if input is empty
        if (value === '') {
            clearSearch();
        }
    };

    return (
        <form className="flex w-full max-w-[500px]" onSubmit={handleSubmit}>
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Search posts by content or username..."
                    value={localQuery}
                    onChange={handleInputChange}
                    className="w-full pl-4 py-2 pr-12 rounded-l-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {localQuery && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="size-4 text-gray-500" />
                    </button>
                )}
            </div>
            <button
                type="submit"
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 border border-blue-500 rounded-r-full focus:outline-none focus:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <SearchIcon className="size-5 text-white"/>
            </button>
        </form>
    );
};