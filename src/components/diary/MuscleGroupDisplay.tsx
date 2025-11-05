// src/components/diary/MuscleGroupDisplay.tsx

import React from 'react';
import { Target } from 'lucide-react'; // Using Target as a placeholder for Cardio

// Define the type for a muscle group
export type MuscleGroup = 
  | 'abs' | 'back' | 'biceps' | 'calves' | 'cardio' 
  | 'chest' | 'forearms' | 'glutes' | 'hamstrings' 
  | 'quads' | 'shoulders' | 'traps' | 'triceps';

export const validMuscleGroups: MuscleGroup[] = [
  'abs', 'back', 'biceps', 'calves', 'cardio', 'chest', 
  'forearms', 'glutes', 'hamstrings', 'quads', 
  'shoulders', 'traps', 'triceps'
];

const MUSCLE_GROUP_PRIORITY_ORDER: MuscleGroup[] = [
  'back',
  'chest',
  'quads',
  'shoulders',
  'biceps',
  'triceps',
  'abs',
  'traps',
  'calves',
  'forearms',
  'hamstrings',
  'glutes', // Added glutes as it was in the user's list but missing from the original validMuscleGroups
  'cardio' // Added cardio as it's a valid group
];

interface MuscleIconProps {
  muscleGroup: MuscleGroup;
  size?: number;
  className?: string;
}

const MuscleIcon: React.FC<MuscleIconProps> = ({ muscleGroup, size = 30, className = '' }) => {
  const iconPath = `/muscle_group_icons/${muscleGroup}.svg`;
  const wrapperClasses = "rounded-full p-2 bg-white/5 backdrop-blur-md flex items-center justify-center";

  if (muscleGroup === 'cardio') {
    return (
      <div className={wrapperClasses}>
        <Target size={size} className={`text-emerald-400 ${className}`} />
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <img 
        src={iconPath} 
        alt={`${muscleGroup} icon`} 
        width={size} 
        height={size} 
        className={`icon-muscle-group ${className}`} // Added a generic class for potential global styling
      />
    </div>
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
  let filteredGroups = muscleGroups.filter(group => validMuscleGroups.includes(group));

  if (filteredGroups.length === 0) {
    return null;
  }

  // Sort based on priority order
  filteredGroups.sort((a, b) => {
    const indexA = MUSCLE_GROUP_PRIORITY_ORDER.indexOf(a);
    const indexB = MUSCLE_GROUP_PRIORITY_ORDER.indexOf(b);
    
    // If both are in priority list, sort by their order
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A is in priority list, A comes first
    if (indexA !== -1) return -1;
    // If only B is in priority list, B comes first
    if (indexB !== -1) return 1;
    // If neither are in priority list, maintain original relative order (or sort alphabetically)
    return 0; // Or a.localeCompare(b) for alphabetical as fallback
  });

  const prioritizedDisplayGroups = filteredGroups.slice(0, 3);

  if (prioritizedDisplayGroups.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${containerClassName}`}>
      {prioritizedDisplayGroups.map(group => (
        <MuscleIcon key={group} muscleGroup={group} size={iconSize} />
      ))}
    </div>
  );
};
