"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <SearchContext.Provider value={{
            searchQuery,
            setSearchQuery,
            clearSearch
        }}>
            {children}
        </SearchContext.Provider>
    );
};