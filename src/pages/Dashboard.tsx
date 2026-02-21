import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Wallet,
  MessageSquare,
  Heart,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, Button, Badge, CircularProgress } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useCheckins } from '@/hooks/useCheckins';
import { useHybridDay } from '@/hooks/useHybridDay';
import { useFinance } from '@/hooks/useFinance';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { todayCheckin, fetchCheckins } = useCheckins();
  const { todayPlan, blocks, fetchTodayPlan } = useHybridDay();
  const { summary, fetchFinanceData } = useFinance();

  useEffect(() => {
    fetchCheckins();
    fetchTodayPlan();
    fetchFinanceData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDayWord = () => todayPlan?.word || 'Focus';
  const getCompletion = () => todayPlan?.completion_percentage || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Warrior'}
          </h1>
          <p className="text-zinc-400 mt-1">
            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" dot dotColor="bg-amber-400">
            <Flame className="w-3 h-3 mr-1" />
            {user?.streak || 0} day streak
          </Badge>
        </div>
      </div>

      {/* Day Word Card */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-400 font-medium mb-1">Today's Word</p>
            <h2 className="text-3xl font-bold text-zinc-100">{getDayWord()}</h2>
            <p className="text-zinc-400 mt-2">
              {getCompletion()}% of your day completed
            </p>
          </div>
          <CircularProgress
            value={getCompletion()}
            size={80}
            strokeWidth={6}
            variant="default"
          />
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          icon={Heart}
          label="Energy"
          value={todayCheckin?.energy || 0}
          max={10}
          color="text-rose-400"
          bgColor="bg-rose-500/10"
        />
        <QuickStatCard
          icon={Target}
          label="Clarity"
          value={todayCheckin?.clarity || 0}
          max={10}
          color="text-sky-400"
          bgColor="bg-sky-500/10"
        />
        <QuickStatCard
          icon={Sparkles}
          label="Body"
          value={todayCheckin?.body || 0}
          max={10}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <QuickStatCard
          icon={TrendingUp}
          label="Savings Rate"
          value={Math.round(summary.savingsRate)}
          max={100}
          suffix="%"
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hybrid Day Preview */}
        <Card>
          <CardHeader
            title="Today's Schedule"
            action={
              <Link to="/hybrid-day">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          />
          <div className="space-y-3">
            {blocks.slice(0, 4).map((block, index) => (
              <div
                key={block.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50"
              >
                <div
                  className={cn(
                    'w-2 h-10 rounded-full',
                    block.color === 'amber' && 'bg-amber-500',
                    block.color === 'violet' && 'bg-violet-500',
                    block.color === 'sky' && 'bg-sky-500',
                    block.color === 'indigo' && 'bg-indigo-500',
                    block.color === 'emerald' && 'bg-emerald-500'
                  )}
                />
                <div className="flex-1">
                  <p className="font-medium text-zinc-200">{block.name}</p>
                  <p className="text-sm text-zinc-500">
                    {block.start_time} - {block.end_time}
                  </p>
                </div>
                <CircularProgress
                  value={block.completion_percentage || 0}
                  size={40}
                  strokeWidth={4}
                  variant={block.completion_percentage === 100 ? 'success' : 'default'}
                />
              </div>
            ))}
            {blocks.length === 0 && (
              <p className="text-center text-zinc-500 py-4">
                No blocks scheduled for today
              </p>
            )}
          </div>
        </Card>

        {/* Finance Preview */}
        <Card>
          <CardHeader
            title="Finance Overview"
            action={
              <Link to="/finance">
                <Button variant="ghost" size="sm">
                  Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-800/50">
                <p className="text-sm text-zinc-500 mb-1">Monthly Income</p>
                <p className="text-xl font-bold text-emerald-400">
                  ${summary.monthlyIncome.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/50">
                <p className="text-sm text-zinc-500 mb-1">Available</p>
                <p className="text-xl font-bold text-zinc-200">
                  ${summary.availableToSpend.toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Monthly Spending</span>
                <span className="text-zinc-200">
                  ${summary.monthlySpending.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (summary.monthlySpending / Math.max(1, summary.monthlyIncome)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickActionCard
            icon={Calendar}
            label="Plan Day"
            description="Set your schedule"
            to="/hybrid-day"
            color="bg-violet-500/10 text-violet-400"
          />
          <QuickActionCard
            icon={Wallet}
            label="Add Expense"
            description="Track spending"
            to="/finance"
            color="bg-emerald-500/10 text-emerald-400"
          />
          <QuickActionCard
            icon={MessageSquare}
            label="Ask Coach"
            description="Get guidance"
            to="/coach"
            color="bg-amber-500/10 text-amber-400"
          />
          <QuickActionCard
            icon={Heart}
            label="Check In"
            description="Log wellness"
            to="/wellness"
            color="bg-rose-500/10 text-rose-400"
          />
        </div>
      </div>
    </div>
  );
};

// Quick Stat Card Component
interface QuickStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  max: number;
  suffix?: string;
  color: string;
  bgColor: string;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({
  icon: Icon,
  label,
  value,
  max,
  suffix = '',
  color,
  bgColor,
}) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="text-xl font-bold text-zinc-100">
          {value}
          {suffix}
          <span className="text-sm text-zinc-500 font-normal">/{max}{suffix}</span>
        </p>
      </div>
    </div>
  </Card>
);

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.ElementType;
  label: string;
  description: string;
  to: string;
  color: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  label,
  description,
  to,
  color,
}) => (
  <Link to={to}>
    <Card hover className="p-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-medium text-zinc-200">{label}</p>
      <p className="text-sm text-zinc-500">{description}</p>
    </Card>
  </Link>
);
