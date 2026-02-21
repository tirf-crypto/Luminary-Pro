import React, { useState, useEffect } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  DollarSign,
  ArrowRight,
  PiggyBank,
} from 'lucide-react';
import { Card, CardHeader, Button, Input, Modal, Badge, ProgressBar } from '@/components/ui';
import { useFinance } from '@/hooks/useFinance';
import { cn } from '@/lib/utils';

export const Finance: React.FC = () => {
  const {
    savingsGoals,
    spendingCategories,
    spendingEntries,
    summary,
    isLoading,
    fetchFinanceData,
    addIncome,
    createSavingsGoal,
    addToSavings,
    createSpendingCategory,
    addSpending,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'spending'>('overview');
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSpendingModalOpen, setIsSpendingModalOpen] = useState(false);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Finance</h1>
          <p className="text-zinc-400 mt-1">Track, save, and grow your wealth</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsIncomeModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Income
          </Button>
          <Button onClick={() => setIsSpendingModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Wallet}
          label="Monthly Income"
          value={`$${summary.monthlyIncome.toFixed(2)}`}
          trend="up"
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Spending"
          value={`$${summary.monthlySpending.toFixed(2)}`}
          trend="neutral"
          color="text-rose-400"
          bgColor="bg-rose-500/10"
        />
        <SummaryCard
          icon={PiggyBank}
          label="Saved This Month"
          value={`$${summary.monthlySavings.toFixed(2)}`}
          trend="up"
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <SummaryCard
          icon={Target}
          label="Savings Rate"
          value={`${summary.savingsRate.toFixed(1)}%`}
          trend="up"
          color="text-sky-400"
          bgColor="bg-sky-500/10"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        {(['overview', 'goals', 'spending'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors relative',
              activeTab === tab ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Available to Spend */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-400 font-medium mb-1">
                  Available to Spend
                </p>
                <h2 className="text-3xl font-bold text-zinc-100">
                  ${summary.availableToSpend.toFixed(2)}
                </h2>
                <p className="text-zinc-400 mt-1">
                  After savings and expenses
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </Card>

          {/* Spending by Category */}
          <Card>
            <CardHeader title="Spending by Category" />
            <div className="space-y-4">
              {summary.spendingByCategory.map(({ category, spent, budget, percentage }) => (
                <div key={category.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{category.name}</span>
                    <span className="text-zinc-400">
                      ${spent.toFixed(2)} / ${budget.toFixed(2)}
                    </span>
                  </div>
                  <ProgressBar
                    value={spent}
                    max={budget}
                    variant={percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : 'default'}
                    size="sm"
                  />
                </div>
              ))}
              {summary.spendingByCategory.length === 0 && (
                <p className="text-center text-zinc-500 py-4">
                  No spending categories yet
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-zinc-100">Savings Goals</h3>
            <Button size="sm" onClick={() => setIsGoalModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Goal
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {savingsGoals.map((goal) => (
              <Card key={goal.id} className="relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (goal.current_amount / goal.target_amount) * 100)}%`,
                  }}
                />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-zinc-200">{goal.name}</h4>
                    <p className="text-sm text-zinc-500">{goal.description}</p>
                  </div>
                  <Badge variant="primary">
                    {Math.round((goal.current_amount / goal.target_amount) * 100)}%
                  </Badge>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-zinc-100">
                      ${goal.current_amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-zinc-500">
                      of ${goal.target_amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addToSavings(goal.id, 10)}
                  >
                    +$10
                  </Button>
                </div>
              </Card>
            ))}
            {savingsGoals.length === 0 && (
              <Card className="col-span-full py-8 text-center">
                <p className="text-zinc-500">No savings goals yet</p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setIsGoalModalOpen(true)}
                >
                  Create your first goal
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-zinc-100">Recent Expenses</h3>
            <Button size="sm" onClick={() => setIsCategoryModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Category
            </Button>
          </div>
          <Card>
            <div className="space-y-3">
              {spendingEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                >
                  <div>
                    <p className="font-medium text-zinc-200">{entry.description}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-medium text-rose-400">
                    -${entry.amount.toFixed(2)}
                  </p>
                </div>
              ))}
              {spendingEntries.length === 0 && (
                <p className="text-center text-zinc-500 py-4">
                  No expenses recorded yet
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Summary Card Component
interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  color,
  bgColor,
}) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <p className="text-sm text-zinc-500 mt-3">{label}</p>
    <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
  </Card>
);
