/**
 * @fileoverview Airport search/select component with AirportDB.io integration
 * @module components/flights/airport-select
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Location } from '@/types/flight';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
// Removed static airports - using AirportDB.io API only

/**
 * Props for AirportSelect component
 */
interface AirportSelectProps {
  /** Label for the input */
  label: string;
  /** Selected airport location */
  value?: Location | null;
  /** Callback when airport is selected */
  onChange: (location: Location | null) => void;
  /** Error message to display */
  error?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Debounce hook for API calls
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Airport search/select component with AirportDB.io API integration
 * 
 * @param props - Component props
 * @returns Rendered airport select component
 */
export function AirportSelect({
  label,
  value,
  onChange,
  error,
  placeholder = 'Search airports...',
  className,
}: AirportSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search airports using AirportDB.io API via tRPC
  const { data: airports = [], isLoading, error: searchError } = trpc.airports.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.trim().length >= 2 && isOpen,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial display value
  useEffect(() => {
    if (value?.name) {
      setSearchQuery(value.name);
    }
  }, [value]);

  const handleSelect = (airport: Location) => {
    onChange(airport);
    setSearchQuery(airport.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    
    // Clear selection if input is cleared
    if (query.trim().length === 0) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const showDropdown = isOpen && (debouncedQuery.trim().length >= 2 || airports.length > 0);

  return (
    <div className={cn('space-y-2 relative', className)}>
      <Label htmlFor="airport-search">{label}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        <Input
          ref={inputRef}
          id="airport-search"
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            'pl-10',
            error ? 'border-destructive' : '',
            showDropdown && airports.length > 0 ? 'rounded-b-none' : ''
          )}
        />
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-0 bg-popover border border-t-0 rounded-b-md shadow-lg max-h-60 overflow-auto"
          >
            {isLoading && (
              <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching airports...
              </div>
            )}
            {!isLoading && searchError && (
              <div className="px-4 py-2 text-sm text-destructive">
                Error searching airports. Please try again.
              </div>
            )}
            {!isLoading && !searchError && debouncedQuery.trim().length < 2 && (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </div>
            )}
            {!isLoading && debouncedQuery.trim().length >= 2 && airports.length === 0 && (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                <p className="mb-2">No airport found for &quot;{debouncedQuery}&quot;</p>
                {searchError && (
                  <p className="text-xs text-destructive mt-1">
                    Error: {searchError.message}
                  </p>
                )}
              </div>
            )}
            {!isLoading && !searchError && airports.length > 0 && (
              <>
                {airports.map((airport) => (
                  <button
                    key={airport.icaoCode || `${airport.latitude}-${airport.longitude}`}
                    type="button"
                    onClick={() => handleSelect(airport)}
                    className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{airport.name}</div>
                      {airport.icaoCode && (
                        <div className="text-xs text-muted-foreground">{airport.icaoCode}</div>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {value && (
        <p className="text-xs text-muted-foreground">
          Selected: {value.name} ({value.icaoCode || 'No code'})
        </p>
      )}
    </div>
  );
}
