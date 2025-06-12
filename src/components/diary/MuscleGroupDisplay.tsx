// src/components/diary/MuscleGroupDisplay.tsx

import React from 'react';
import { Target } from 'lucide-react'; // Using Target as a placeholder for Cardio

// Define the type for a muscle group
export type MuscleGroup = 
  | 'abs' | 'back' | 'biceps' | 'calves' | 'cardio' 
  | 'chest' | 'forearms' | 'glutes' | 'hamstrings' 
  | 'quads' | 'shoulders' | 'traps' | 'triceps';

const validMuscleGroups: MuscleGroup[] = [
  'abs', 'back', 'biceps', 'calves', 'cardio', 'chest', 
  'forearms', 'glutes', 'hamstrings', 'quads', 
  'shoulders', 'traps', 'triceps'
];

interface MuscleIconProps {
  muscleGroup: MuscleGroup;
  size?: number;
  className?: string;
}

const MuscleIcon: React.FC<MuscleIconProps> = ({ muscleGroup, size = 16, className = '' }) => {
  const iconPath = `/muscle_group_icons/${muscleGroup}.svg`;

  if (muscleGroup === 'cardio') {
    return <Target size={size} className={`text-emerald-400 ${className}`} />;
  }

  return (
    <img 
      src={iconPath} 
      alt={`${muscleGroup} icon`} 
      width={size} 
      height={size} 
      className={`icon-muscle-group ${className}`} // Added a generic class for potential global styling
    />
  );
};


export const normalizeMuscleGroups = (focusAreaString: string | null | undefined): MuscleGroup[] => {
  console.log('[MuscleGroupDisplay] normalizeMuscleGroups input:', focusAreaString);
  if (!focusAreaString || typeof focusAreaString !== 'string' || focusAreaString.trim() === '') {
    console.log('[MuscleGroupDisplay] Invalid or empty focusAreaString, returning [].');
    return [];
  }

  try {
  let extractedStrings: string[] = [];

  // Strategy 1: Handle formats with escaped quotes like {"key":["\"value1\"","\"value2\""]}
  // This specifically targets your observed format: {"[\"glutes\""," \"hamstrings\""}
  const escapedQuoteMatches = focusAreaString.match(/\\\"(.*?)\\\"/g); // Matches \"content\"
  if (escapedQuoteMatches && escapedQuoteMatches.length > 0) {
    extractedStrings = escapedQuoteMatches.map(match =>
      match.substring(3, match.length - 3).trim().toLowerCase() // Remove \\\" at start and end
    );
    console.log('[MuscleGroupDisplay] Strategy 1 (escaped quotes) extracted:', extractedStrings);
  }
  // Strategy 2: Handle simple JSON array like '["abs", "chest"]' or '[]'
  else if (focusAreaString.startsWith('[') && focusAreaString.endsWith(']')) {
    try {
      const jsonParsed = JSON.parse(focusAreaString);
      if (Array.isArray(jsonParsed)) {
        extractedStrings = jsonParsed.map(s => String(s).trim().toLowerCase());
        console.log('[MuscleGroupDisplay] Strategy 2 (JSON array) extracted:', extractedStrings);
      }
    } catch (e) {
      console.warn('[MuscleGroupDisplay] Strategy 2 (JSON array) parse error. Trying manual split for "[\"foo\",\"bar\"]" like formats:', e);
      const innerContent = focusAreaString.slice(1, -1); // Remove [ and ]
      extractedStrings = innerContent.split(',').map(s => s.replace(/[\"']/g, '').trim().toLowerCase());
      console.log('[MuscleGroupDisplay] Strategy 2 (JSON array) manual split extracted:', extractedStrings);
    }
  }
  // Strategy 3: Handle comma-separated string like "abs, chest, biceps"
  else if (focusAreaString.includes(',')) {
    extractedStrings = focusAreaString.split(',').map(s => s.trim().toLowerCase());
    console.log('[MuscleGroupDisplay] Strategy 3 (comma-separated) extracted:', extractedStrings);
  }
  // Strategy 4: Handle a single muscle group name as a plain string
  else {
    // Avoid treating parts of JSON-like strings as single words if they contain special chars
    if (!focusAreaString.includes('{') && !focusAreaString.includes('}') && !focusAreaString.includes('['))
    extractedStrings = [focusAreaString.trim().toLowerCase()];
    console.log('[MuscleGroupDisplay] Strategy 4 (single word or unparsed complex string) extracted:', extractedStrings);
  }

  const finalValidGroups = extractedStrings.filter(group =>
    group.length > 0 && validMuscleGroups.includes(group as MuscleGroup)
  ) as MuscleGroup[];

  console.log('[MuscleGroupDisplay] Final valid groups to render:', finalValidGroups);
  return finalValidGroups;

  } catch (error) {
    console.error('[MuscleGroupDisplay] Critical error parsing focusAreaString:', focusAreaString, error);
    return [];
  }
};

interface MuscleGroupDisplayProps {
  muscleGroups: MuscleGroup[];
  iconSize?: number;
  containerClassName?: string;
}

export const MuscleGroupDisplay: React.FC<MuscleGroupDisplayProps> = ({ muscleGroups, iconSize = 14, containerClassName = '' }) => {
  if (!muscleGroups || muscleGroups.length === 0) {
    return null; 
  }

  // Ensure we only render valid muscle groups, though the input should ideally be pre-validated
  const validDisplayGroups = muscleGroups.filter(group => validMuscleGroups.includes(group));

  if (validDisplayGroups.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full ${containerClassName}`}> {/* Adjusted padding and gap for larger icons */}
      {validDisplayGroups.map(group => (
        <MuscleIcon key={group} muscleGroup={group} size={iconSize} />
      ))}
    </div>
  );
};
