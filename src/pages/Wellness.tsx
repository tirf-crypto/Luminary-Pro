import React, { useState, useEffect } from 'react';
import { Heart, Activity, Moon, Sun, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardHeader, Button, Badge } from '@/components/ui';
import { useCheckins } from '@/hooks/useCheckins';
import { cn } from '@/lib/utils';

interface CheckinData {
  energy: number;
  clarity: number;
  body: number;
  mood: string;
  notes: string;
}

const moods = [
  { emoji: '😔', label: 'Low', value: 'low' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🤩', label: 'Amazing', value: 'amazing' },
];

export const Wellness: React.FC = () => {
  const { todayCheckin, checkins, createCheckin, fetchCheckins } = useCheckins();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkinData, setCheckinData] = useState<CheckinData>({
    energy: 5,
    clarity: 5,
    body: 5,
    mood: 'good',
    notes: '',
  });

  useEffect(() => {
    fetchCheckins();
  }, []);

  const handleCheckin = async () => {
    await createCheckin({
      energy: checkinData.energy,
      clarity: checkinData.clarity,
      body: checkinData.body,
      mood: checkinData.mood,
      notes: checkinData.notes,
    });
    setIsCheckingIn(false);
  };

  const getMoodEmoji = (moodValue: string) => {
    return moods.find((m) => m.value === moodValue)?.emoji || '🙂';
  };

  const getAverageScore = (checkin: typeof todayCheckin) => {
    if (!checkin) return 0;
    return Math.round((checkin.energy + checkin.clarity + checkin.body) / 3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Wellness</h1>
          <p className="text-zinc-400 mt-1">Track your daily wellness metrics</p>
        </div>
        <Button onClick={() => setIsCheckingIn(true)}>
          <Heart className="w-4 h-4 mr-2" />
          {todayCheckin ? 'Update Check-in' : 'Daily Check-in'}
        </Button>
      </div>

      {/* Today's Status */}
      {todayCheckin ? (
        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-400 font-medium mb-1">Today's Wellness Score</p>
              <h2 className="text-4xl font-bold text-zinc-100">
                {getAverageScore(todayCheckin)}/10
              </h2>
              <p className="text-zinc-400 mt-2">
                Mood: {getMoodEmoji(todayCheckin.mood)} {todayCheckin.mood}
              </p>
            </div>
            <div className="text-6xl">{getMoodEmoji(todayCheckin.mood)}</div>
          </div>
        </Card>
      ) : (
        <Card className="bg-zinc-800/50 border-dashed border-zinc-700">
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              No check-in today
            </h3>
            <p className="text-zinc-500 mb-4">
              Take a moment to check in with yourself
            </p>
            <Button onClick={() => setIsCheckingIn(true)}>Check In Now</Button>
          </div>
        </Card>
      )}

      {/* Metrics Grid */}
      {todayCheckin && (
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            icon={Activity}
            label="Energy"
            value={todayCheckin.energy}
            color="text-amber-400"
            bgColor="bg-amber-500/10"
          />
          <MetricCard
            icon={Sun}
            label="Clarity"
            value={todayCheckin.clarity}
            color="text-sky-400"
            bgColor="bg-sky-500/10"
          />
          <MetricCard
            icon={Heart}
            label="Body"
            value={todayCheckin.body}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
          />
        </div>
      )}

      {/* History */}
      <Card>
        <CardHeader title="Recent Check-ins" />
        <div className="space-y-3">
          {checkins.slice(0, 7).map((checkin) => (
            <div
              key={checkin.id}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMoodEmoji(checkin.mood)}</span>
                <div>
                  <p className="font-medium text-zinc-200">
                    {new Date(checkin.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Avg: {getAverageScore(checkin)}/10
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" size="sm">
                  E: {checkin.energy}
                </Badge>
                <Badge variant="outline" size="sm">
                  C: {checkin.clarity}
                </Badge>
                <Badge variant="outline" size="sm">
                  B: {checkin.body}
                </Badge>
              </div>
            </div>
          ))}
          {checkins.length === 0 && (
            <p className="text-center text-zinc-500 py-4">
              No check-ins yet. Start tracking your wellness today!
            </p>
          )}
        </div>
      </Card>

      {/* Check-in Modal */}
      {isCheckingIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-6">Daily Check-in</h2>

            <div className="space-y-6">
              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  How are you feeling?
                </label>
                <div className="flex justify-between">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setCheckinData((prev) => ({ ...prev, mood: mood.value }))}
                      className={cn(
                        'flex flex-col items-center p-3 rounded-xl transition-all',
                        checkinData.mood === mood.value
                          ? 'bg-amber-500/20 ring-2 ring-amber-500'
                          : 'hover:bg-zinc-800'
                      )}
                    >
                      <span className="text-3xl mb-1">{mood.emoji}</span>
                      <span className="text-xs text-zinc-400">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <SliderInput
                label="Energy Level"
                value={checkinData.energy}
                onChange={(v) => setCheckinData((prev) => ({ ...prev, energy: v }))}
                minLabel="Low"
                maxLabel="High"
                color="bg-amber-500"
              />

              <SliderInput
                label="Mental Clarity"
                value={checkinData.clarity}
                onChange={(v) => setCheckinData((prev) => ({ ...prev, clarity: v }))}
                minLabel="Foggy"
                maxLabel="Clear"
                color="bg-sky-500"
              />

              <SliderInput
                label="Physical Body"
                value={checkinData.body}
                onChange={(v) => setCheckinData((prev) => ({ ...prev, body: v }))}
                minLabel="Tired"
                maxLabel="Strong"
                color="bg-emerald-500"
              />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={checkinData.notes}
                  onChange={(e) =>
                    setCheckinData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Anything on your mind?"
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCheckingIn(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCheckin}>
                Save Check-in
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}) => (
  <Card className="p-4 text-center">
    <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mx-auto mb-2`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="text-sm text-zinc-500">{label}</p>
    <p className={`text-2xl font-bold ${color} mt-1`}>{value}/10</p>
  </Card>
);

// Slider Input Component
interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  color: string;
}

const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  minLabel,
  maxLabel,
  color,
}) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="text-zinc-300">{label}</span>
      <span className="text-zinc-400">{value}/10</span>
    </div>
    <input
      type="range"
      min="1"
      max="10"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className={cn('w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer', color)}
      style={{ accentColor: 'currentColor' }}
    />
    <div className="flex justify-between text-xs text-zinc-500 mt-1">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
);
