import { cn } from '@/lib/utils';
import React from 'react';
import { BackgroundGradient } from '@/components/ui/background-gradient';

interface DayCellProps {
  dayInfo: {
    day: string;
    isCurrentMonth: boolean;
    hasWorkout: boolean;
  };
  onClick: () => void;
}

const DayCell: React.FC<DayCellProps> = ({ dayInfo, onClick }) => {
  const { day, isCurrentMonth, hasWorkout } = dayInfo;

  if (!day || day.startsWith('-') || day.startsWith('+')) {
    return <div className="w-full aspect-square" />;
  }

  const dayContent = (
    <div
      className={cn(
        'w-full aspect-square flex flex-col items-center justify-center rounded-full transition-colors duration-200',
        isCurrentMonth ? 'bg-neutral-800/50' : 'bg-transparent text-neutral-600',
        hasWorkout && 'cursor-pointer bg-neutral-900/80'
      )}
      onClick={onClick}
    >
      <span className={cn('text-sm', isCurrentMonth ? 'text-white' : 'text-neutral-600')}>
        {day}
      </span>
    </div>
  );

  if (hasWorkout) {
    return (
      <BackgroundGradient
        containerClassName="rounded-full"
        borderRadius="rounded-full"
        className="w-full aspect-square"
      >
        {dayContent}
      </BackgroundGradient>
    );
  }

  return dayContent;
};

export default DayCell;
