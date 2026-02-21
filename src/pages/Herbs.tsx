import React, { useState, useEffect } from 'react';
import { Search, Heart, Leaf, Filter, BookOpen, ExternalLink } from 'lucide-react';
import { Card, CardHeader, Button, Input, Badge } from '@/components/ui';
import { useHerbs } from '@/hooks/useHerbs';
import { cn } from '@/lib/utils';

export const Herbs: React.FC = () => {
  const {
    herbs,
    savedHerbs,
    isLoading,
    fetchHerbs,
    fetchSavedHerbs,
    saveHerb,
    unsaveHerb,
    isHerbSaved,
    getSavedHerbId,
    categories,
    benefits,
  } = useHerbs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [selectedHerb, setSelectedHerb] = useState<typeof herbs[0] | null>(null);

  useEffect(() => {
    fetchHerbs();
    fetchSavedHerbs();
  }, []);

  useEffect(() => {
    fetchHerbs({
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      benefit: selectedBenefit || undefined,
    });
  }, [searchQuery, selectedCategory, selectedBenefit]);

  const displayedHerbs = activeTab === 'saved' 
    ? savedHerbs.map(sh => sh.herb)
    : herbs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Herb Library</h1>
          <p className="text-zinc-400 mt-1">Discover the power of natural remedies</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search herbs..."
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'all'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            All Herbs
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'saved'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            Saved ({savedHerbs.length})
          </button>
        </div>

        {/* Category Filters */}
        {activeTab === 'all' && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                !selectedCategory
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Herbs Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedHerbs.map((herb) => (
          <Card
            key={herb.id}
            hover
            onClick={() => setSelectedHerb(herb)}
            className="cursor-pointer"
          >
            <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-zinc-800">
              {herb.image_url ? (
                <img
                  src={herb.image_url}
                  alt={herb.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf className="w-12 h-12 text-zinc-600" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isHerbSaved(herb.id)) {
                    unsaveHerb(getSavedHerbId(herb.id)!);
                  } else {
                    saveHerb(herb.id);
                  }
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-900 transition-colors"
              >
                <Heart
                  className={cn(
                    'w-4 h-4',
                    isHerbSaved(herb.id) ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                  )}
                />
              </button>
            </div>
            <h3 className="font-semibold text-zinc-100 mb-1">{herb.name}</h3>
            <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{herb.description}</p>
            <div className="flex flex-wrap gap-1">
              {herb.benefits.slice(0, 3).map((benefit, idx) => (
                <Badge key={idx} variant="outline" size="sm">
                  {benefit}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {displayedHerbs.length === 0 && (
        <Card className="py-12 text-center">
          <Leaf className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500">
            {activeTab === 'saved'
              ? 'No saved herbs yet'
              : 'No herbs found matching your search'}
          </p>
        </Card>
      )}

      {/* Herb Detail Modal */}
      {selectedHerb && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedHerb(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">{selectedHerb.name}</h2>
                <p className="text-zinc-500 italic">{selectedHerb.latin_name}</p>
              </div>
              <button
                onClick={() => setSelectedHerb(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {selectedHerb.image_url && (
              <img
                src={selectedHerb.image_url}
                alt={selectedHerb.name}
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-zinc-300 mb-2">Description</h3>
                <p className="text-zinc-400">{selectedHerb.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-zinc-300 mb-2">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHerb.benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="primary">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedHerb.usage && (
                <div>
                  <h3 className="font-medium text-zinc-300 mb-2">How to Use</h3>
                  <p className="text-zinc-400">{selectedHerb.usage}</p>
                </div>
              )}

              {selectedHerb.precautions && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h3 className="font-medium text-amber-400 mb-2">Precautions</h3>
                  <p className="text-amber-400/80 text-sm">{selectedHerb.precautions}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant={isHerbSaved(selectedHerb.id) ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => {
                    if (isHerbSaved(selectedHerb.id)) {
                      unsaveHerb(getSavedHerbId(selectedHerb.id)!);
                    } else {
                      saveHerb(selectedHerb.id);
                    }
                  }}
                >
                  <Heart
                    className={cn(
                      'w-4 h-4 mr-2',
                      isHerbSaved(selectedHerb.id) && 'fill-current'
                    )}
                  />
                  {isHerbSaved(selectedHerb.id) ? 'Saved' : 'Save Herb'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
