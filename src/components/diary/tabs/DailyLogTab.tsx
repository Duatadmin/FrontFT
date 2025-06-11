import React from 'react';
import { SessionList } from '../SessionList';

/**
 * Daily Log Tab
 * Shows the user's completed workout history.
 */
const DailyLogTab: React.FC = () => {
  return (
    <div className="mt-4">
      <SessionList />
    </div>
  );
};

export default DailyLogTab;

