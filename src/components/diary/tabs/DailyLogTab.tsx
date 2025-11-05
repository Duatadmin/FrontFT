import React from 'react';
import useDiaryStore from '@/store/useDiaryStore';
import { SessionList } from '@/components/diary/SessionList';
import CalendarView from '@/components/diary/calendar/CalendarView';
import { ViewModeSwitch, type ViewMode } from '@/components/diary/ViewModeSwitch';

/**
 * Daily Log Tab
 * Shows the user's completed workout history.
 */
const DailyLogTab: React.FC = () => {
  const { dailyViewMode, setDailyViewMode } = useDiaryStore();

  const handleModeChange = (mode: ViewMode) => {
    setDailyViewMode(mode);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4 flex justify-start">
        <ViewModeSwitch currentMode={dailyViewMode} onModeChange={handleModeChange} />
      </div>
                        <div className={`flex-1 ${dailyViewMode === 'calendar' ? 'flex items-center' : ''}`}>
        {dailyViewMode === 'list' ? <SessionList /> : <CalendarView />}
      </div>
    </div>
  );
};

export default DailyLogTab;

