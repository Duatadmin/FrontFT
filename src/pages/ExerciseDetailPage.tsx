import React, { useEffect, useState } from 'react';
// useParams removed as ID will come from props
import { supabase } from '@/lib/supabase'; 
import ExerciseDetailView, { ExerciseDetailViewProps as ExerciseDetailViewComponentProps } from '@/components/ExerciseDetailView'; // Renamed to avoid conflict
import UseAnimations from 'react-useanimations';
import loadingAnimation from 'react-useanimations/lib/loading';

// react-loader-spinner removed, install if needed

export interface ExerciseDetailPageProps {
  exerciseId: string;
  onClose: () => void;
}

const ExerciseDetailPage: React.FC<ExerciseDetailPageProps> = ({ exerciseId, onClose }) => {
  // const { id } = useParams<{ id: string }>(); // Replaced by exerciseId prop
  const [exercise, setExercise] = useState<ExerciseDetailViewComponentProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId) { // Use exerciseId from props
        setError('Exercise ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Simulate loading delay for 2 seconds to see the animation
        // await new Promise(resolve => setTimeout(resolve, 2000)); 
        const { data, error: supabaseError } = await supabase
          .from('exrcwiki') // Your table name
          .select('*') // Select all fields, or specify needed ones
          .eq('exercise_id', exerciseId) // Use exerciseId from props
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          // Map Supabase data (snake_case) to ExerciseDetailViewProps (camelCase)
          const mappedData: ExerciseDetailViewComponentProps = {
            exerciseId: data.exercise_id, // Pass the exerciseId
            id: data.exercise_id,
            name: data.name,

            bodypart: data.bodypart || data.muscle_group,
            equipment: data.equipment,
            tier: data.tier,
            isCompound: data.is_compound !== undefined ? data.is_compound : (data.compound !== undefined ? data.compound : false),
            
            maintarget: typeof data.maintarget === 'string' ? data.maintarget.split(',').map((s: string) => s.trim()).filter((s: string) => s) : (Array.isArray(data.maintarget) ? data.maintarget : []),
            secondarymuscles: Array.isArray(data.secondarymuscles) ? data.secondarymuscles : [], // Assuming Supabase returns JSONB array as JS array
            instructions: typeof data.instructions === 'string' ? data.instructions : (data.instructions ? JSON.stringify(data.instructions) : undefined), // Handle if instructions is JSON object/array in DB
            
            // Assuming pros, cons, tips from schema are JSONB arrays of strings, or simple text needing split
            benefits: Array.isArray(data.pros) ? data.pros : (typeof data.pros === 'string' ? data.pros.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []),
            common_mistakes: Array.isArray(data.cons) ? data.cons : (typeof data.cons === 'string' ? data.cons.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []),
            safety_notes: Array.isArray(data.tips) ? data.tips : (typeof data.tips === 'string' ? data.tips.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []),
            
            // Alternatives: Assuming it's a JSONB array of objects {id, name, gifUrl}
            // or needs specific transformation if stored differently.
            // For now, pass as is if it's an array, otherwise default to empty array.
            alternatives: Array.isArray(data.alternatives) ? data.alternatives : [],
          };
          setExercise(mappedData);
        } else {
          setError('Exercise not found.');
        }
      } catch (err: any) {
        console.error('Error fetching exercise:', err);
        setError(err.message || 'Failed to fetch exercise details.');
      }
      setLoading(false);
    };

    fetchExercise();
  }, [exerciseId]); // Depend on exerciseId from props

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full py-20"> {/* py-20 for some vertical spacing */}
        <UseAnimations 
          animation={loadingAnimation} 
          size={60} 
          strokeColor="#DFF250" // Brand color
        />
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 p-8">Error: {error}</div>;
  }

  if (!exercise) {
    return <div className="flex justify-center items-center h-screen text-white p-8">Exercise not found.</div>;
  }

  return <ExerciseDetailView {...exercise} onClose={onClose} />; // Pass onClose to ExerciseDetailView
};

export default ExerciseDetailPage;
