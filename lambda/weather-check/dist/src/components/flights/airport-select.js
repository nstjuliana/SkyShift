"use strict";
/**
 * @fileoverview Airport search/select component with AirportDB.io integration
 * @module components/flights/airport-select
 */
'use client';
/**
 * @fileoverview Airport search/select component with AirportDB.io integration
 * @module components/flights/airport-select
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportSelect = AirportSelect;
const react_1 = require("react");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const trpc_1 = require("@/lib/trpc");
/**
 * Debounce hook for API calls
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = (0, react_1.useState)(value);
    (0, react_1.useEffect)(() => {
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
function AirportSelect({ label, value, onChange, error, placeholder = 'Search airports...', className, }) {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const inputRef = (0, react_1.useRef)(null);
    const dropdownRef = (0, react_1.useRef)(null);
    // Debounce search query to avoid too many API calls
    const debouncedQuery = useDebounce(searchQuery, 300);
    // Search airports using AirportDB.io API via tRPC
    const { data: airports = [], isLoading, error: searchError } = trpc_1.trpc.airports.search.useQuery({ query: debouncedQuery }, {
        enabled: debouncedQuery.trim().length >= 2 && isOpen,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
    // Close dropdown when clicking outside
    (0, react_1.useEffect)(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Set initial display value
    (0, react_1.useEffect)(() => {
        if (value?.name) {
            setSearchQuery(value.name);
        }
    }, [value]);
    const handleSelect = (airport) => {
        onChange(airport);
        setSearchQuery(airport.name);
        setIsOpen(false);
    };
    const handleInputChange = (e) => {
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
    return (<div className={(0, utils_1.cn)('space-y-2 relative', className)}>
      <label_1.Label htmlFor="airport-search">{label}</label_1.Label>
      <div className="relative">
        <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        {isLoading && (<lucide_react_1.Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"/>)}
        <input_1.Input ref={inputRef} id="airport-search" type="text" value={searchQuery} onChange={handleInputChange} onFocus={handleInputFocus} placeholder={placeholder} className={(0, utils_1.cn)('pl-10', error ? 'border-destructive' : '', showDropdown && airports.length > 0 ? 'rounded-b-none' : '')}/>
        {showDropdown && (<div ref={dropdownRef} className="absolute z-50 w-full mt-0 bg-popover border border-t-0 rounded-b-md shadow-lg max-h-60 overflow-auto">
            {isLoading && (<div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                Searching airports...
              </div>)}
            {!isLoading && searchError && (<div className="px-4 py-2 text-sm text-destructive">
                Error searching airports. Please try again.
              </div>)}
            {!isLoading && !searchError && debouncedQuery.trim().length < 2 && (<div className="px-4 py-2 text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </div>)}
            {!isLoading && debouncedQuery.trim().length >= 2 && airports.length === 0 && (<div className="px-4 py-2 text-sm text-muted-foreground">
                <p className="mb-2">No airport found for &quot;{debouncedQuery}&quot;</p>
                {searchError && (<p className="text-xs text-destructive mt-1">
                    Error: {searchError.message}
                  </p>)}
              </div>)}
            {!isLoading && !searchError && airports.length > 0 && (<>
                {airports.map((airport) => (<button key={airport.icaoCode || `${airport.latitude}-${airport.longitude}`} type="button" onClick={() => handleSelect(airport)} className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors">
                    <lucide_react_1.MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{airport.name}</div>
                      {airport.icaoCode && (<div className="text-xs text-muted-foreground">{airport.icaoCode}</div>)}
                    </div>
                  </button>))}
              </>)}
          </div>)}
      </div>
      {error && (<p className="text-sm text-destructive">{error}</p>)}
      {value && (<p className="text-xs text-muted-foreground">
          Selected: {value.name} ({value.icaoCode || 'No code'})
        </p>)}
    </div>);
}
