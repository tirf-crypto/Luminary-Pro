import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sun, Moon, Briefcase, Dumbbell, Target, Heart } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { Button, Input, Select } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

interface OnboardingData {
  biological_sex: string;
  wake_time: string;
  work_start: string;
  work_end: string;
  training_preference: string;
  personas: string[];
  goals: string[];
  why: string;
}

const steps = [
  { id: 'welcome', title: 'Welcome to Luminary' },
  { id: 'basics', title: 'Your Basics' },
  { id: 'schedule', title: 'Your Schedule' },
  { id: 'personas', title: 'Your Personas' },
  { id: 'goals', title: 'Your Goals' },
  { id: 'complete', title: "You're Ready!" },
];

const personaOptions = [
  { id: 'early_bird', label: 'Early Bird', icon: Sun, desc: 'I thrive in the morning' },
  { id: 'night_owl', label: 'Night Owl', icon: Moon, desc: 'I do my best work at night' },
  { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Career-focused achiever' },
  { id: 'athlete', label: 'Athlete', icon: Dumbbell, desc: 'Physical performance matters' },
  { id: 'creative', label: 'Creative', icon: Heart, desc: 'Artistic and imaginative' },
  { id: 'analytical', label: 'Analytical', icon: Target, desc: 'Data-driven decision maker' },
];

const goalOptions = [
  'Build better habits',
  'Improve productivity',
  'Increase energy levels',
  'Reduce stress',
  'Better sleep',
  'Financial freedom',
  'Physical fitness',
  'Mental clarity',
  'Work-life balance',
  'Personal growth',
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    biological_sex: '',
    wake_time: '06:00',
    work_start: '09:00',
    work_end: '17:00',
    training_preference: 'morning',
    personas: [],
    goals: [],
    why: '',
  });

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const togglePersona = (personaId: string) => {
    setData((prev) => ({
      ...prev,
      personas: prev.personas.includes(personaId)
        ? prev.personas.filter((p) => p !== personaId)
        : [...prev.personas, personaId],
    }));
  };

  const toggleGoal = (goal: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding(data);
      navigate('/');
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg
                className="w-10 h-10 text-zinc-950"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">
                Welcome to Luminary
              </h2>
              <p className="text-zinc-400">
                Your personal operating system for a balanced, productive, and fulfilling life.
                Let's set up your profile in just a few steps.
              </p>
            </div>
            <Button onClick={handleNext} fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Your Basics</h2>
              <p className="text-zinc-400 text-sm">This helps us personalize your experience</p>
            </div>

            <div className="space-y-4">
              <Select
                label="Biological Sex"
                value={data.biological_sex}
                onChange={(e) => updateData('biological_sex', e.target.value)}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="Wake Time"
                  value={data.wake_time}
                  onChange={(e) => updateData('wake_time', e.target.value)}
                />
                <Select
                  label="Training Preference"
                  value={data.training_preference}
                  onChange={(e) => updateData('training_preference', e.target.value)}
                  options={[
                    { value: 'morning', label: 'Morning' },
                    { value: 'afternoon', label: 'Afternoon' },
                    { value: 'evening', label: 'Evening' },
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Your Schedule</h2>
              <p className="text-zinc-400 text-sm">When do you typically work?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="Work Start"
                  value={data.work_start}
                  onChange={(e) => updateData('work_start', e.target.value)}
                />
                <Input
                  type="time"
                  label="Work End"
                  value={data.work_end}
                  onChange={(e) => updateData('work_end', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Next
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Your Personas</h2>
              <p className="text-zinc-400 text-sm">Select all that resonate with you</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {personaOptions.map((persona) => {
                const Icon = persona.icon;
                const isSelected = data.personas.includes(persona.id);
                return (
                  <button
                    key={persona.id}
                    onClick={() => togglePersona(persona.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${
                        isSelected ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    />
                    <p
                      className={`font-medium text-sm ${
                        isSelected ? 'text-zinc-100' : 'text-zinc-400'
                      }`}
                    >
                      {persona.label}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{persona.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Your Goals</h2>
              <p className="text-zinc-400 text-sm">What do you want to achieve?</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {goalOptions.map((goal) => {
                const isSelected = data.goals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Why is this important to you?
              </label>
              <textarea
                value={data.why}
                onChange={(e) => updateData('why', e.target.value)}
                placeholder="I want to improve my life because..."
                className="w-full px-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg
                className="w-10 h-10 text-zinc-950"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">
                You're All Set!
              </h2>
              <p className="text-zinc-400">
                Your Luminary profile is ready. Let's start building your best life.
              </p>
            </div>
            <Button
              onClick={handleComplete}
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Your Journey
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      {/* Progress indicator */}
      <div className="flex items-center gap-1 mb-6">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index <= currentStep ? 'bg-amber-500' : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>

      {renderStep()}
    </AuthLayout>
  );
};
