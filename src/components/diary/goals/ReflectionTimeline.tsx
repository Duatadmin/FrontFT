import React, { useState } from 'react';
import { MessageSquare, Plus, Edit2, X, Check } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';
import { Reflection } from '../../../store/useDiaryStore';

/**
 * ReflectionTimeline Component
 * Allows users to add and view journal entries about their fitness journey
 */
const ReflectionTimeline: React.FC = () => {
  const { reflections, addReflection, removeReflection, updateReflection } = useDiaryStore();
  const { user } = useUserStore();
  
  const [isAddingReflection, setIsAddingReflection] = useState(false);
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(null);
  
  // Form state
  const [newReflectionText, setNewReflectionText] = useState('');
  const [editText, setEditText] = useState('');
  
  // Handle adding a new reflection
  const handleAddReflection = () => {
    if (!newReflectionText.trim() || !user?.id) return;
    
    addReflection({
      id: `reflection-${Date.now()}`,
      text: newReflectionText.trim(),
      date: new Date().toISOString(),
      user_id: user.id,
    });
    
    setNewReflectionText('');
    setIsAddingReflection(false);
  };
  
  // Start editing a reflection
  const handleStartEditing = (reflection: Reflection) => {
    setEditingReflectionId(reflection.id);
    setEditText(reflection.text);
  };
  
  // Save reflection edits
  const handleSaveEdit = () => {
    if (!editText.trim() || !user?.id || !editingReflectionId) return;
    
    const reflection = reflections.find(r => r.id === editingReflectionId);
    if (!reflection) return;
    
    updateReflection({
      ...reflection,
      text: editText.trim(),
      user_id: user.id,
    });
    
    setEditingReflectionId(null);
    setEditText('');
  };
  
  // Delete a reflection
  const handleDeleteReflection = (id: string) => {
    if (!user?.id) return;
    removeReflection(id, user.id);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="bg-background-card rounded-2xl shadow-card p-5" data-testid="reflection-timeline">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold flex items-center">
          <MessageSquare className="text-accent-violet mr-2" size={18} />
          Journey Reflections
        </h3>
        
        <button
          onClick={() => setIsAddingReflection(!isAddingReflection)}
          className={`p-1.5 rounded-lg text-sm font-medium flex items-center ${
            isAddingReflection ? 'bg-red-500/10 text-red-500' : 'bg-accent-violet/10 text-accent-violet'
          }`}
          aria-label={isAddingReflection ? "Cancel adding reflection" : "Add new reflection"}
          data-testid="toggle-add-reflection"
        >
          {isAddingReflection ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>
      
      {/* Add reflection form */}
      {isAddingReflection && (
        <div className="bg-background-surface rounded-lg p-4 mb-4 border border-border-light" data-testid="add-reflection-form">
          <h4 className="text-sm font-medium mb-3">Add New Reflection</h4>
          
          <div className="mb-3">
            <textarea
              value={newReflectionText}
              onChange={(e) => setNewReflectionText(e.target.value)}
              className="w-full p-3 text-sm bg-background-card border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
              placeholder="Record your thoughts, progress, or lessons learned..."
              rows={4}
              data-testid="new-reflection-text"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingReflection(false)}
              className="text-text-secondary text-sm mr-3"
              data-testid="cancel-add-reflection"
            >
              Cancel
            </button>
            <button
              onClick={handleAddReflection}
              disabled={!newReflectionText.trim()}
              className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${
                newReflectionText.trim() 
                  ? 'bg-accent-violet text-white hover:bg-accent-violet/90' 
                  : 'bg-background-card text-text-tertiary cursor-not-allowed'
              }`}
              data-testid="confirm-add-reflection"
            >
              <Plus size={14} className="mr-1" />
              Add Entry
            </button>
          </div>
        </div>
      )}
      
      {/* Timeline */}
      <div className="relative">
        {reflections.length === 0 ? (
          <div className="text-center py-6 bg-background-surface rounded-lg">
            <p className="text-sm text-text-secondary mb-3">
              Your fitness journey timeline is empty. Start adding reflections to track your thoughts and progress!
            </p>
            <button
              onClick={() => setIsAddingReflection(true)}
              className="bg-accent-violet text-white text-sm px-3 py-1.5 rounded-lg flex items-center mx-auto hover:bg-accent-violet/90"
              data-testid="start-reflection"
            >
              <Plus size={14} className="mr-1" />
              Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-8 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-0 before:h-full before:w-0.5 before:bg-border-light">
            {reflections.map((reflection) => (
              <div 
                key={reflection.id} 
                className="relative"
                data-testid={`reflection-${reflection.id}`}
              >
                {/* Timeline dot */}
                <div className="absolute -left-6 top-0 h-4 w-4 rounded-full bg-accent-violet"></div>
                
                {/* Date */}
                <div className="text-xs text-text-tertiary mb-1">
                  {formatDate(reflection.date)}
                </div>
                
                {/* Content */}
                {editingReflectionId === reflection.id ? (
                  // Edit mode
                  <div className="bg-background-surface border border-border-light rounded-lg p-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 text-sm bg-background-card border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet mb-3"
                      rows={3}
                      data-testid="edit-reflection-text"
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingReflectionId(null)}
                        className="text-text-secondary text-xs flex items-center"
                        data-testid="cancel-edit-reflection"
                      >
                        <X size={14} className="mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-accent-violet text-white text-xs flex items-center px-2 py-1 rounded-md hover:bg-accent-violet/90"
                        data-testid="save-edit-reflection"
                      >
                        <Check size={14} className="mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="bg-background-surface border border-border-light rounded-lg p-3">
                    <div className="text-sm mb-2">{reflection.text}</div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleStartEditing(reflection)}
                        className="text-text-tertiary hover:text-accent-violet p-1"
                        aria-label="Edit reflection"
                        data-testid="edit-reflection-button"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteReflection(reflection.id)}
                        className="text-text-tertiary hover:text-red-500 p-1"
                        aria-label="Delete reflection"
                        data-testid="delete-reflection-button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionTimeline;
