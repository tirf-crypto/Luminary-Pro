import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

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

    const { placeId } = await req.json();

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: 'Place ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,price_level,types,photos,formatted_phone_number,website,opening_hours&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.error_message || 'Places API error');
    }

    const place = data.result;

    const formattedPlace = {
      id: placeId,
      google_place_id: placeId,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating,
      price_level: place.price_level,
      types: place.types,
      phone: place.formatted_phone_number,
      website: place.website,
      photos: place.photos?.map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ),
      google_maps_url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    };

    return new Response(
      JSON.stringify({ place: formattedPlace }),
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
