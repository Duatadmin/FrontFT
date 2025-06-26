import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayCell from '@/components/diary/calendar/DayCell';
import { useMonthlySessions } from '@/hooks/useMonthlySessions';
import { SessionDetailPanel } from './SessionDetailPanel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// This function generates the grid for the calendar view, now using real workout data.
const generateDaysForMonth = (year: number, month: number, workoutDays: Set<number>) => {
    const days = [];
    const date = new Date(year, month, 1);
    const firstDay = date.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add filler days for the previous month
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: `-${i}`, isCurrentMonth: false, hasWorkout: false });
    }

    // Add days for the current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ 
            day: String(i).padStart(2, '0'), 
            isCurrentMonth: true, 
            hasWorkout: workoutDays.has(i) 
        });
    }

    // The grid will now dynamically adjust its rows based on the month's length.
    return days;
}


const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: sessions, isLoading } = useMonthlySessions(year, month);

  const workoutDays = useMemo(() => {
    if (!sessions) return new Set<number>();
    // Create a set of unique days that have workouts.
    // The day is extracted from the 'session_date' which is a string like '2024-06-26T12:00:00Z'
    return new Set(
      sessions
        .filter(s => s.sessionDate) // Ensure sessionDate is not null
        .map(s => new Date(s.sessionDate).getDate())
    );
  }, [sessions]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

    const handleDayClick = (day: number) => {
    // Only allow clicking on days with workouts
    if (workoutDays.has(day)) {
      setSelectedDate(new Date(year, month, day));
    }
  };

  const handleClosePanel = () => {
    setSelectedDate(null);
  };

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate || !sessions) return [];
    return sessions.filter(s => new Date(s.sessionDate).getDate() === selectedDate.getDate());
  }, [selectedDate, sessions]);

  const monthDays = generateDaysForMonth(year, month, workoutDays);
    const monthName = currentDate.toLocaleString('en-US', { month: 'long' });

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-wider">
                {monthName} <span className="opacity-50">{year}</span>
            </h2>
            <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ChevronRight className="h-5 w-5 text-white" />
                </button>
            </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-neutral-400 py-2">
                    {day}
                </div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
                        {isLoading 
                ? <div className="col-span-7 h-48"><LoadingSpinner /></div>
                : monthDays.map((dayInfo, index) => (
                    <DayCell key={index} dayInfo={dayInfo} onClick={() => handleDayClick(parseInt(dayInfo.day, 10))} />
                ))
            }
        </div>
      <SessionDetailPanel 
        selectedDate={selectedDate} 
        sessions={selectedDaySessions} 
        onClose={handleClosePanel} 
      />
    </div>
  );
};

export default CalendarView;
