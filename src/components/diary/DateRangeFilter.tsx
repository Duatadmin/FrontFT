import React, { useState, useEffect, useRef } from 'react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, parseISO } from 'date-fns';
import { Calendar, ChevronDown, X } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './calendar-styles.css';
import useDiaryStore from '../../store/useDiaryStore';

type DateRangeFilterProps = {
  className?: string;
};

// Define preset options
type DatePreset = {
  label: string;
  getRange: () => { startDate: Date; endDate: Date };
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ className = '' }) => {
  const { filters, setFilters } = useDiaryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Initialize with default date range if none exists
  useEffect(() => {
    if (!filters.dateRange) {
      // Set default date range (last 30 days)
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      
      setFilters({
        dateRange: {
          from: from.toISOString().split('T')[0],
          to: to.toISOString().split('T')[0]
        }
      });
    }
  }, []);
  
  // Convert string dates from store to Date objects for the calendar
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
    key: string;
  }>({
    startDate: filters.dateRange ? new Date(filters.dateRange.from) : subDays(new Date(), 30),
    endDate: filters.dateRange ? new Date(filters.dateRange.to) : new Date(),
    key: 'selection',
  });

  // Define preset date ranges
  const presets: Record<string, DatePreset> = {
    today: {
      label: 'Today',
      getRange: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
    },
    yesterday: {
      label: 'Yesterday',
      getRange: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          startDate: yesterday,
          endDate: yesterday,
        };
      },
    },
    thisWeek: {
      label: 'This Week',
      getRange: () => ({
        startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
        endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
      }),
    },
    lastWeek: {
      label: 'Last Week',
      getRange: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return {
          startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          endDate: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
      },
    },
    last7Days: {
      label: 'Last 7 Days',
      getRange: () => ({
        startDate: subDays(new Date(), 6),
        endDate: new Date(),
      }),
    },
    last30Days: {
      label: 'Last 30 Days',
      getRange: () => ({
        startDate: subDays(new Date(), 29),
        endDate: new Date(),
      }),
    },
    thisMonth: {
      label: 'This Month',
      getRange: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      }),
    },
    lastMonth: {
      label: 'Last Month',
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
      },
    },
  };

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle date range change from calendar
  const handleRangeChange = (ranges: RangeKeyDict) => {
    const range = ranges.selection;
    setDateRange(range);
    setSelectedPreset(null); // Clear preset when manually selecting dates
  };

  // Apply selected date range to store
  const applyDateRange = () => {
    // Format dates in the expected format for the store and API
    const formattedRange = {
      dateRange: {
        from: format(dateRange.startDate, 'yyyy-MM-dd'),
        to: format(dateRange.endDate, 'yyyy-MM-dd'),
      },
    };
    
    // Update the store
    setFilters(formattedRange);
    
    // Trigger a refetch of sessions with the new date range
    if (typeof window !== 'undefined') {
      // Use a mock user ID for development or the actual user ID in production
      import useCurrentUser from '@/lib/stores/useUserStore';
const currentUser = useCurrentUser();
const userId = currentUser?.id;
if (!userId) return null;
      const store = useDiaryStore.getState();
      store.fetchSessions(userId, formattedRange);
    }
    
    setIsOpen(false);
  };

  // Apply preset date range
  const applyPreset = (presetKey: string) => {
    const preset = presets[presetKey];
    if (preset) {
      const range = preset.getRange();
      setDateRange({
        startDate: range.startDate,
        endDate: range.endDate,
        key: 'selection',
      });
      setSelectedPreset(presetKey);
      
      // Auto-apply the preset immediately
      setTimeout(() => {
        setFilters({
          dateRange: {
            from: format(range.startDate, 'yyyy-MM-dd'),
            to: format(range.endDate, 'yyyy-MM-dd'),
          },
        });
      }, 100);
    }
  };

  // Clear date range
  const clearDateRange = () => {
    const defaultRange = {
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      key: 'selection',
    };
    setDateRange(defaultRange);
    setSelectedPreset(null);
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!filters.dateRange) {
      return 'Date Range';
    }
    
    const from = new Date(filters.dateRange.from);
    const to = new Date(filters.dateRange.to);
    
    return `${format(from, 'MMM d')} - ${format(to, 'MMM d')}`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        data-testid="date-range-filter"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-sm rounded-lg bg-background-card hover:bg-background-card/80 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Calendar size={14} className="mr-1.5 text-accent-violet" />
        <span>{formatDateRange()}</span>
        <ChevronDown 
          size={14} 
          className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-background-card rounded-2xl shadow-lg border border-white/10 backdrop-blur-xl z-50 w-auto max-w-[calc(100vw-2rem)] overflow-hidden transition-all duration-200 animate-in fade-in-50 slide-in-from-top-5">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-text">Select Date Range</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text p-1 rounded-full hover:bg-background-surface/50"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-text-secondary text-sm">
              Filter workouts by date range
            </p>
          </div>
          
          {/* Presets */}
          <div className="p-4 border-b border-white/10 grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedPreset === key
                    ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30'
                    : 'bg-background-surface/50 hover:bg-background-surface/80 border border-white/5'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-4 flex justify-center overflow-x-auto">
            <DateRange
              ranges={[dateRange]}
              onChange={handleRangeChange}
              months={window.innerWidth > 768 ? 2 : 1}
              direction="horizontal"
              showDateDisplay={false}
              rangeColors={['rgba(124, 58, 237, 0.3)']} // Violet color with transparency
              color="rgb(124, 58, 237)" // Accent violet
              className="custom-calendar" // For additional styling
            />
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={clearDateRange}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text"
            >
              Reset
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm border border-white/10 rounded-lg hover:bg-background-surface/50"
              >
                Cancel
              </button>
              <button
                onClick={applyDateRange}
                className="px-4 py-1.5 text-sm bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent-violet/20"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Note: Calendar styling is applied via global CSS */}
    </div>
  );
};

export default DateRangeFilter;
