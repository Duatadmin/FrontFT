import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import useDiaryStore from '../../store/useDiaryStore';

// Common focus areas for workouts
const FOCUS_AREAS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body'
];

const FiltersBar: React.FC = () => {
  const { filters, setFilters } = useDiaryStore();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFocusAreaOpen, setIsFocusAreaOpen] = useState(false);
  
  // Handle date range changes
  const handleDateRangeChange = (range: { from: string; to: string }) => {
    setFilters({ dateRange: range });
    setIsCalendarOpen(false);
  };
  
  // Handle focus area selection
  const handleFocusAreaChange = (area: string | null) => {
    setFilters({ focusArea: area });
    setIsFocusAreaOpen(false);
  };
  
  // Handle PR achievement toggle
  const handlePrToggle = () => {
    setFilters({ prAchieved: filters.prAchieved ? null : true });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      },
      focusArea: null,
      prAchieved: null
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Check if any filters are active
  const hasActiveFilters = filters.focusArea || filters.prAchieved;
  
  return (
    <div className="bg-background-surface sticky top-0 z-10 p-4 mb-4 rounded-xl border border-border-light flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <h3 className="text-sm font-medium mr-2">Filters:</h3>
        
        {/* Date Range Filter */}
        <div className="relative">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center px-3 py-1.5 text-sm rounded-lg bg-background-card hover:bg-background-card/80"
          >
            <Calendar size={14} className="mr-1.5" />
            {filters.dateRange ? (
              <span>
                {formatDate(filters.dateRange.from)} - {formatDate(filters.dateRange.to)}
              </span>
            ) : (
              <span>Date Range</span>
            )}
          </button>
          
          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-background-card rounded-lg shadow-lg border border-border-light min-w-[280px] z-20">
              <div className="mb-3">
                <label className="text-xs text-text-secondary mb-1 block">From</label>
                <input 
                  type="date" 
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => handleDateRangeChange({
                    from: e.target.value,
                    to: filters.dateRange?.to || new Date().toISOString().split('T')[0]
                  })}
                  className="w-full p-2 bg-background-surface border border-border-light rounded-md text-sm focus:ring-1 focus:ring-accent-violet"
                />
              </div>
              <div className="mb-3">
                <label className="text-xs text-text-secondary mb-1 block">To</label>
                <input 
                  type="date" 
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => handleDateRangeChange({
                    from: filters.dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    to: e.target.value
                  })}
                  className="w-full p-2 bg-background-surface border border-border-light rounded-md text-sm focus:ring-1 focus:ring-accent-violet"
                />
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDateRangeChange(filters.dateRange || {
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    to: new Date().toISOString().split('T')[0]
                  })}
                  className="text-sm text-accent-violet font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Focus Area Filter */}
        <div className="relative">
          <button 
            onClick={() => setIsFocusAreaOpen(!isFocusAreaOpen)}
            className={`flex items-center px-3 py-1.5 text-sm rounded-lg hover:bg-background-card/80 ${
              filters.focusArea 
                ? 'bg-accent-violet/10 text-accent-violet' 
                : 'bg-background-card'
            }`}
          >
            <Filter size={14} className="mr-1.5" />
            {filters.focusArea || 'Focus Area'}
            {filters.focusArea && (
              <X 
                size={14} 
                className="ml-1.5 hover:text-red-500" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleFocusAreaChange(null);
                }} 
              />
            )}
          </button>
          
          {isFocusAreaOpen && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-background-card rounded-lg shadow-lg border border-border-light w-[200px] z-20">
              {FOCUS_AREAS.map(area => (
                <button
                  key={area}
                  onClick={() => handleFocusAreaChange(area)}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-background-surface ${
                    filters.focusArea === area 
                      ? 'bg-accent-violet/10 text-accent-violet' 
                      : ''
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* PR Achievement Filter */}
        <button 
          onClick={handlePrToggle}
          className={`flex items-center px-3 py-1.5 text-sm rounded-lg hover:bg-background-card/80 ${
            filters.prAchieved 
              ? 'bg-accent-green/10 text-accent-green' 
              : 'bg-background-card'
          }`}
        >
          🏆 PR Achieved
          {filters.prAchieved && (
            <X 
              size={14} 
              className="ml-1.5 hover:text-red-500" 
              onClick={(e) => {
                e.stopPropagation();
                setFilters({ prAchieved: null });
              }} 
            />
          )}
        </button>
      </div>
      
      {/* Clear Filters Button - only show if we have active filters */}
      {hasActiveFilters && (
        <button 
          onClick={clearAllFilters}
          className="text-sm text-text-secondary hover:text-red-500 flex items-center px-2 py-1 rounded hover:bg-background-card"
        >
          <X size={14} className="mr-1" />
          Clear filters
        </button>
      )}
    </div>
  );
};

export default FiltersBar;
