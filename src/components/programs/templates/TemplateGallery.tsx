import React, { useState } from 'react';
import { Dumbbell, Calendar, BarChart, ChevronRight, X } from 'lucide-react';
import createLogger from '../../../utils/logger';

const logger = createLogger('TemplateGallery');

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
}

// Template type
interface Template {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'hypertrophy' | 'weight_loss' | 'endurance' | 'general';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
  sessions: number; // sessions per week
  image?: string;
}

// Mock templates data
const MOCK_TEMPLATES: Template[] = [
  {
    id: 'template-5x5',
    name: '5x5 Strength Program',
    description: 'Classic strength training program focusing on compound movements with 5 sets of 5 reps.',
    type: 'strength',
    level: 'beginner',
    duration: 12,
    sessions: 3,
  },
  {
    id: 'template-ppl',
    name: 'Push/Pull/Legs Split',
    description: 'High-volume program dividing workouts by movement pattern for optimal hypertrophy.',
    type: 'hypertrophy',
    level: 'intermediate',
    duration: 12,
    sessions: 6,
  },
  {
    id: 'template-upper-lower',
    name: 'Upper/Lower Split',
    description: 'Four-day program alternating between upper and lower body workouts for balanced development.',
    type: 'strength',
    level: 'intermediate',
    duration: 8,
    sessions: 4,
  },
  {
    id: 'template-full-body',
    name: 'Full Body Workout',
    description: 'Efficient training program hitting all major muscle groups 3 times per week.',
    type: 'general',
    level: 'beginner',
    duration: 8,
    sessions: 3,
  },
  {
    id: 'template-10k',
    name: '10K Run Preparation',
    description: 'Progressive running program designed to prepare for a 10K race over 8 weeks.',
    type: 'endurance',
    level: 'beginner',
    duration: 8,
    sessions: 4,
  },
  {
    id: 'template-weight-loss',
    name: 'Weight Loss Circuit',
    description: 'High-intensity circuit training combined with cardio for maximum calorie burn.',
    type: 'weight_loss',
    level: 'beginner',
    duration: 12,
    sessions: 5,
  },
];

/**
 * TemplateGallery Component
 * Displays a grid of program templates that can be previewed and selected
 */
const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  // State for preview drawer
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  
  // Handle preview template
  const handlePreview = (template: Template) => {
    logger.debug('Previewing template', { templateId: template.id });
    setPreviewTemplate(template);
  };
  
  // Handle close preview
  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };
  
  // Handle select template
  const handleSelectTemplate = (templateId: string) => {
    logger.debug('Using template', { templateId });
    onSelectTemplate(templateId);
    setPreviewTemplate(null);
  };
  
  // Get background gradient based on template type
  const getTemplateBackground = (type: string): string => {
    switch (type) {
      case 'strength':
        return 'from-blue-500/10 to-indigo-500/10';
      case 'hypertrophy':
        return 'from-indigo-500/10 to-purple-500/10';
      case 'weight_loss':
        return 'from-red-500/10 to-orange-500/10';
      case 'endurance':
        return 'from-green-500/10 to-emerald-500/10';
      default:
        return 'from-gray-500/10 to-slate-500/10';
    }
  };
  
  // Get badge color based on level
  const getLevelBadgeColor = (level: string): string => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-500';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div data-testid="template-gallery">
      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_TEMPLATES.map(template => (
          <div 
            key={template.id}
            className={`bg-gradient-to-br ${getTemplateBackground(template.type)} border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => handlePreview(template)}
            data-testid={`template-card-${template.id}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-text-primary">{template.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getLevelBadgeColor(template.level)}`}>
                  {template.level}
                </span>
              </div>
              
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between text-text-tertiary text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{template.duration} weeks</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" />
                  <span>{template.sessions}x/week</span>
                </div>
                
                <div className="text-primary flex items-center">
                  <span>Preview</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Template preview drawer */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
          onClick={handleClosePreview}
          data-testid="template-preview-backdrop"
        >
          <div 
            className="w-full max-w-md bg-background-default h-full overflow-y-auto shadow-xl transition-transform animate-drawer-in"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background-default border-b border-border px-4 py-4 flex justify-between items-center">
              <h2 id="preview-title" className="text-lg font-semibold text-text-primary">
                Template Preview
              </h2>
              <button
                onClick={handleClosePreview}
                className="rounded-full p-2 hover:bg-background-hover transition-colors"
                aria-label="Close preview"
                data-testid="close-preview-button"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              {/* Hero section */}
              <div className={`bg-gradient-to-br ${getTemplateBackground(previewTemplate.type)} p-6 rounded-xl mb-6`}>
                <h3 className="text-xl font-bold text-text-primary mb-1">
                  {previewTemplate.name}
                </h3>
                <div className="flex gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${getLevelBadgeColor(previewTemplate.level)}`}>
                    {previewTemplate.level}
                  </span>
                  <span className="text-xs px-2 py-1 bg-background-hover/50 rounded-full">
                    {previewTemplate.type}
                  </span>
                </div>
                
                <p className="text-text-secondary mb-4">
                  {previewTemplate.description}
                </p>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background-default/20 rounded-lg p-2">
                    <div className="text-sm font-medium">{previewTemplate.duration}</div>
                    <div className="text-xs text-text-tertiary">Weeks</div>
                  </div>
                  
                  <div className="bg-background-default/20 rounded-lg p-2">
                    <div className="text-sm font-medium">{previewTemplate.sessions}</div>
                    <div className="text-xs text-text-tertiary">Sessions/Week</div>
                  </div>
                  
                  <div className="bg-background-default/20 rounded-lg p-2">
                    <div className="text-sm font-medium">{previewTemplate.sessions * previewTemplate.duration}</div>
                    <div className="text-xs text-text-tertiary">Total Sessions</div>
                  </div>
                </div>
              </div>
              
              {/* Program details - simplified for demo */}
              <h4 className="font-medium text-text-primary mb-3">Program Overview</h4>
              
              <div className="space-y-4 mb-6">
                <div className="bg-background-surface rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-full">
                      <BarChart className="h-4 w-4" />
                    </div>
                    <h5 className="font-medium">Training Focus</h5>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {previewTemplate.type === 'strength' && 'Building maximal strength through progressive overload on compound lifts.'}
                    {previewTemplate.type === 'hypertrophy' && 'Muscle growth through moderate weight, high volume training with adequate time under tension.'}
                    {previewTemplate.type === 'weight_loss' && 'Calorie burning and metabolic conditioning with high-intensity circuits and cardio sessions.'}
                    {previewTemplate.type === 'endurance' && 'Cardiovascular stamina and muscular endurance with progressive distance and intensity.'}
                    {previewTemplate.type === 'general' && 'Overall fitness improvement targeting strength, conditioning, and mobility.'}
                  </p>
                </div>
                
                <div className="bg-background-surface rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-full">
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <h5 className="font-medium">Weekly Structure</h5>
                  </div>
                  <ul className="text-sm text-text-secondary space-y-2">
                    {previewTemplate.id === 'template-5x5' && (
                      <>
                        <li>• Monday: Full Body A (Squat focus)</li>
                        <li>• Wednesday: Full Body B (Bench focus)</li>
                        <li>• Friday: Full Body A (Deadlift focus)</li>
                      </>
                    )}
                    {previewTemplate.id === 'template-ppl' && (
                      <>
                        <li>• Monday: Push (Chest/Shoulders/Triceps)</li>
                        <li>• Tuesday: Pull (Back/Biceps)</li>
                        <li>• Wednesday: Legs (Quads/Hamstrings/Calves)</li>
                        <li>• Thursday: Push</li>
                        <li>• Friday: Pull</li>
                        <li>• Saturday: Legs</li>
                      </>
                    )}
                    {previewTemplate.id === 'template-upper-lower' && (
                      <>
                        <li>• Monday: Upper Body</li>
                        <li>• Tuesday: Lower Body</li>
                        <li>• Thursday: Upper Body</li>
                        <li>• Friday: Lower Body</li>
                      </>
                    )}
                    {previewTemplate.id === 'template-full-body' && (
                      <>
                        <li>• Monday: Full Body</li>
                        <li>• Wednesday: Full Body</li>
                        <li>• Friday: Full Body</li>
                      </>
                    )}
                    {previewTemplate.id === 'template-10k' && (
                      <>
                        <li>• Monday: Speed Intervals</li>
                        <li>• Wednesday: Tempo Run</li>
                        <li>• Friday: Recovery Run</li>
                        <li>• Sunday: Long Run</li>
                      </>
                    )}
                    {previewTemplate.id === 'template-weight-loss' && (
                      <>
                        <li>• Monday: Upper Body Circuit</li>
                        <li>• Tuesday: HIIT Cardio</li>
                        <li>• Wednesday: Lower Body Circuit</li>
                        <li>• Thursday: Active Recovery</li>
                        <li>• Friday: Full Body Circuit</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClosePreview}
                  className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-background-hover transition-colors"
                  data-testid="cancel-preview-button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSelectTemplate(previewTemplate.id)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  data-testid="use-template-button"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
