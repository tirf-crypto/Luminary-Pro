import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Heart, Navigation, Filter } from 'lucide-react';
import { Card, CardHeader, Button, Input, Badge } from '@/components/ui';
import { usePlaces } from '@/hooks/usePlaces';
import { cn } from '@/lib/utils';

const placeTypes = [
  { id: 'all', label: 'All' },
  { id: 'gym', label: 'Gyms' },
  { id: 'spa', label: 'Spas' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'park', label: 'Parks' },
  { id: 'restaurant', label: 'Healthy Food' },
];

export const Places: React.FC = () => {
  const {
    places,
    savedPlaces,
    isLoading,
    searchNearby,
    searchByText,
    fetchSavedPlaces,
    savePlace,
    unsavePlace,
    isPlaceSaved,
  } = usePlaces();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState<'discover' | 'saved'>('discover');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<typeof places[0] | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    fetchSavedPlaces();
  }, []);

  useEffect(() => {
    if (userLocation && activeTab === 'discover') {
      searchNearby({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: 5000,
        type: selectedType === 'all' ? undefined : selectedType,
      });
    }
  }, [userLocation, selectedType, activeTab]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchByText(searchQuery, userLocation || undefined);
    }
  };

  const displayedPlaces = activeTab === 'saved'
    ? savedPlaces.map(sp => sp.place)
    : places;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Discover</h1>
          <p className="text-zinc-400 mt-1">Find wellness spots near you</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search places..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('discover')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'discover'
              ? 'bg-amber-500 text-zinc-950'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          )}
        >
          Discover
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
          Saved ({savedPlaces.length})
        </button>
      </div>

      {/* Type Filters */}
      {activeTab === 'discover' && (
        <div className="flex flex-wrap gap-2">
          {placeTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                selectedType === type.id
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      )}

      {/* Places Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedPlaces.map((place) => (
          <Card
            key={place.id}
            hover
            onClick={() => setSelectedPlace(place)}
            className="cursor-pointer"
          >
            <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-zinc-800">
              {place.photos && place.photos[0] ? (
                <img
                  src={place.photos[0]}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-zinc-600" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPlaceSaved(place.id)) {
                    const savedPlace = savedPlaces.find(sp => sp.place_id === place.id);
                    if (savedPlace) unsavePlace(savedPlace.id);
                  } else {
                    savePlace(place);
                  }
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-900 transition-colors"
              >
                <Heart
                  className={cn(
                    'w-4 h-4',
                    isPlaceSaved(place.id) ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                  )}
                />
              </button>
            </div>
            <h3 className="font-semibold text-zinc-100 mb-1">{place.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-zinc-400">{place.rating || 'N/A'}</span>
              {place.price_level && (
                <span className="text-sm text-zinc-500">
                  {'$'.repeat(place.price_level)}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 line-clamp-2">{place.address}</p>
            {place.types && (
              <div className="flex flex-wrap gap-1 mt-2">
                {place.types.slice(0, 2).map((type, idx) => (
                  <Badge key={idx} variant="outline" size="sm">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {displayedPlaces.length === 0 && !isLoading && (
        <Card className="py-12 text-center">
          <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500">
            {activeTab === 'saved'
              ? 'No saved places yet'
              : 'No places found nearby'}
          </p>
          {activeTab === 'discover' && !userLocation && (
            <p className="text-sm text-zinc-600 mt-2">
              Enable location access to discover places near you
            </p>
          )}
        </Card>
      )}

      {/* Place Detail Modal */}
      {selectedPlace && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedPlace(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">{selectedPlace.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-zinc-400">{selectedPlace.rating || 'N/A'}</span>
                  {selectedPlace.price_level && (
                    <span className="text-zinc-500">
                      {'$'.repeat(selectedPlace.price_level)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {selectedPlace.photos && selectedPlace.photos[0] && (
              <img
                src={selectedPlace.photos[0]}
                alt={selectedPlace.name}
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-zinc-300 mb-1">Address</h3>
                <p className="text-zinc-400">{selectedPlace.address}</p>
              </div>

              {selectedPlace.phone && (
                <div>
                  <h3 className="font-medium text-zinc-300 mb-1">Phone</h3>
                  <p className="text-zinc-400">{selectedPlace.phone}</p>
                </div>
              )}

              {selectedPlace.website && (
                <div>
                  <h3 className="font-medium text-zinc-300 mb-1">Website</h3>
                  <a
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Visit website
                    <Navigation className="w-3 h-3" />
                  </a>
                </div>
              )}

              {selectedPlace.types && (
                <div>
                  <h3 className="font-medium text-zinc-300 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlace.types.map((type, idx) => (
                      <Badge key={idx} variant="outline">
                        {type.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant={isPlaceSaved(selectedPlace.id) ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => {
                    if (isPlaceSaved(selectedPlace.id)) {
                      const savedPlace = savedPlaces.find(sp => sp.place_id === selectedPlace.id);
                      if (savedPlace) unsavePlace(savedPlace.id);
                    } else {
                      savePlace(selectedPlace);
                    }
                  }}
                >
                  <Heart
                    className={cn(
                      'w-4 h-4 mr-2',
                      isPlaceSaved(selectedPlace.id) && 'fill-current'
                    )}
                  />
                  {isPlaceSaved(selectedPlace.id) ? 'Saved' : 'Save Place'}
                </Button>
                {selectedPlace.google_maps_url && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => window.open(selectedPlace.google_maps_url, '_blank')}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
