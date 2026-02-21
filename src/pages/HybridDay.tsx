import React, { useState, useEffect } from 'react';
import {
  Plus,
  Check,
  Clock,
  MoreHorizontal,
  Edit2,
  Trash2,
  Target,
} from 'lucide-react';
import { Card, CardHeader, Button, Input, Modal, Badge } from '@/components/ui';
import { useHybridDay } from '@/hooks/useHybridDay';
import { cn } from '@/lib/utils';

export const HybridDay: React.FC = () => {
  const {
    todayPlan,
    blocks,
    habits,
    habitCompletions,
    isLoading,
    fetchTodayPlan,
    createHabit,
    toggleHabitCompletion,
    updatePlanWord,
    updateBlockCompletion,
  } = useHybridDay();

  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
  });

  useEffect(() => {
    fetchTodayPlan();
  }, []);

  const handleUpdateWord = async () => {
    if (newWord.trim()) {
      await updatePlanWord(newWord.trim());
      setIsWordModalOpen(false);
      setNewWord('');
    }
  };

  const handleCreateHabit = async () => {
    if (newHabit.name.trim()) {
      await createHabit({
        name: newHabit.name.trim(),
        description: newHabit.description,
        frequency: newHabit.frequency,
      });
      setIsHabitModalOpen(false);
      setNewHabit({ name: '', description: '', frequency: 'daily' });
    }
  };

  const getBlockColor = (color: string) => {
    const colors: Record<string, string> = {
      amber: 'bg-amber-500',
      violet: 'bg-violet-500',
      sky: 'bg-sky-500',
      indigo: 'bg-indigo-500',
      emerald: 'bg-emerald-500',
      rose: 'bg-rose-500',
      orange: 'bg-orange-500',
    };
    return colors[color] || 'bg-zinc-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Hybrid Day</h1>
          <p className="text-zinc-400 mt-1">
            Structure your day for maximum productivity
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setNewWord(todayPlan?.word || '');
            setIsWordModalOpen(true);
          }}
        >
          <Target className="w-4 h-4 mr-2" />
          Set Word
        </Button>
      </div>

      {/* Day Word */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
        <div className="text-center py-6">
          <p className="text-sm text-amber-400 font-medium mb-2">Today's Word</p>
          <h2 className="text-4xl font-bold text-zinc-100">{todayPlan?.word || 'Focus'}</h2>
          <p className="text-zinc-400 mt-2">
            {todayPlan?.completion_percentage || 0}% complete
          </p>
        </div>
      </Card>

      {/* Time Blocks */}
      <Card>
        <CardHeader title="Time Blocks" />
        <div className="space-y-3">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <div
                className={cn(
                  'w-1 h-12 rounded-full',
                  getBlockColor(block.color || 'zinc')
                )}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-zinc-200">{block.name}</h3>
                  <Badge variant="outline" size="sm">
                    {block.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {block.start_time} - {block.end_time}
                </div>
                {block.activities && block.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {block.activities.map((activity, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-zinc-700/50 rounded text-zinc-400"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={block.completion_percentage || 0}
                  onChange={(e) =>
                    updateBlockCompletion(block.id, parseInt(e.target.value))
                  }
                  className="w-24 accent-amber-500"
                />
                <span className="text-sm text-zinc-400 w-10 text-right">
                  {block.completion_percentage || 0}%
                </span>
              </div>
            </div>
          ))}
          {blocks.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <p>No time blocks scheduled</p>
              <p className="text-sm mt-1">Your default schedule will be generated automatically</p>
            </div>
          )}
        </div>
      </Card>

      {/* Habits */}
      <Card>
        <CardHeader
          title="Daily Habits"
          action={
            <Button size="sm" onClick={() => setIsHabitModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          }
        />
        <div className="space-y-2">
          {habits.map((habit) => {
            const isCompleted = habitCompletions.some(
              (c) => c.habit_id === habit.id
            );
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabitCompletion(habit.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                  isCompleted
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-zinc-600'
                  )}
                >
                  {isCompleted && <Check className="w-4 h-4 text-zinc-950" />}
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={cn(
                      'font-medium',
                      isCompleted ? 'text-emerald-400 line-through' : 'text-zinc-200'
                    )}
                  >
                    {habit.name}
                  </p>
                  {habit.description && (
                    <p className="text-sm text-zinc-500">{habit.description}</p>
                  )}
                </div>
                <Badge variant="outline" size="sm">
                  {habit.streak} day streak
                </Badge>
              </button>
            );
          })}
          {habits.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <p>No habits yet</p>
              <p className="text-sm mt-1">Add your first habit to start building momentum</p>
            </div>
          )}
        </div>
      </Card>

      {/* Word Modal */}
      <Modal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        title="Set Today's Word"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsWordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateWord}>Save</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-zinc-400">
            Choose a single word to guide your day. This will be your north star.
          </p>
          <Input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="e.g., Focus, Growth, Balance"
            maxLength={20}
          />
          <div className="flex flex-wrap gap-2">
            {['Focus', 'Growth', 'Balance', 'Discipline', 'Gratitude', 'Energy'].map(
              (word) => (
                <button
                  key={word}
                  onClick={() => setNewWord(word)}
                  className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {word}
                </button>
              )
            )}
          </div>
        </div>
      </Modal>

      {/* Add Habit Modal */}
      <Modal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        title="Add New Habit"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsHabitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateHabit}>Create</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Habit Name"
            value={newHabit.name}
            onChange={(e) =>
              setNewHabit((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Morning Meditation"
          />
          <Input
            label="Description (optional)"
            value={newHabit.description}
            onChange={(e) =>
              setNewHabit((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Brief description of the habit"
          />
        </div>
      </Modal>
    </div>
  );
};
