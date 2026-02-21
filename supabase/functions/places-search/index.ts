import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

interface SearchParams {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
  query?: string;
}

serve(async (req) => {
  try {
    // Check for authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const params: SearchParams = await req.json();
    const { lat, lng, radius = 5000, type, query } = params;

    let url: string;

    if (query) {
      // Text search
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&location=${lat},${lng}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;
    } else {
      // Nearby search
      const typeParam = type ? `&type=${type}` : '';
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}${typeParam}&key=${GOOGLE_PLACES_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(data.error_message || 'Places API error');
    }

    // Format the results
    const places = (data.results || []).map((place: any) => ({
      id: place.place_id,
      google_place_id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating,
      price_level: place.price_level,
      types: place.types,
      photos: place.photos?.map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ),
      google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    }));

    return new Response(
      JSON.stringify({ places }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
