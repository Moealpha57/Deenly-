
import React, { useState, useEffect, useCallback } from 'react';
import { PrayerTimes } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import MosqueIcon from './icons/MosqueIcon';

interface CachedPrayerData {
  prayerTimes: PrayerTimes;
  location: string;
  coordinates: { lat: number; lon: number };
  timestamp: number;
}

const CACHE_KEY = 'deeniePrayerData';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const PrayerTimesView: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number, lon: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const { t } = useLanguage();

  const fetchPrayerDataForCoords = useCallback(async (latitude: number, longitude: number, displayName?: string) => {
    setIsLoading(true);
    setError(null);

    let finalLocationName = '';

    try {
      // If a display name isn't provided (from geocoding), fetch it.
      if (!displayName) {
        const locationResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        if (locationResponse.ok) {
          const locationData = await locationResponse.json();
          finalLocationName = `${locationData.city}, ${locationData.countryName}`;
        } else {
          finalLocationName = t('yourCurrentLocation');
        }
      } else {
        finalLocationName = displayName;
      }
      setLocation(finalLocationName);

      // Fetch prayer times using coordinates
      const prayerApiUrl = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`; // Method 2 = ISNA
      const prayerResponse = await fetch(prayerApiUrl);
      if (!prayerResponse.ok) {
        throw new Error('Network response for prayer times was not ok');
      }

      const prayerData = await prayerResponse.json();
      if (prayerData.code === 200) {
        setPrayerTimes(prayerData.data.timings);
        setCoordinates({ lat: latitude, lon: longitude });

        // Cache the new data
        const cachePayload: CachedPrayerData = {
          prayerTimes: prayerData.data.timings,
          location: finalLocationName,
          coordinates: { lat: latitude, lon: longitude },
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
      } else {
        throw new Error('Could not fetch prayer times from the API.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const requestGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerDataForCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError(t('locationError'));
          setIsLoading(false);
          console.error('Geolocation error:', err);
        },
        {
          maximumAge: 600000, // Accept a cached position up to 10 minutes old
          timeout: 10000,     // Fail if it takes longer than 10 seconds
          enableHighAccuracy: false // Use less power and potentially faster
        }
      );
    } else {
      setError(t('geolocationNotSupported'));
      setIsLoading(false);
    }
  }, [fetchPrayerDataForCoords, t]);

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed: CachedPrayerData = JSON.parse(cachedData);
      if (Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
        setPrayerTimes(parsed.prayerTimes);
        setLocation(parsed.location);
        setCoordinates(parsed.coordinates);
        setIsLoading(false);
        return; // Exit if we successfully loaded from cache
      }
    }
    // If no valid cache, request location
    requestGeolocation();
  }, [requestGeolocation]);
  
  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchInput.trim()) return;
      setIsLoading(true);
      setError(null);

      try {
          // Using Open-Meteo Geocoding API which is free, reliable, and CORS-friendly
          const geocodeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchInput)}&count=1&language=en&format=json`);
          
          if (!geocodeResponse.ok) throw new Error("Could not connect to the location service.");
          
          const geocodeData = await geocodeResponse.json();
          
          if (!geocodeData.results || geocodeData.results.length === 0) {
              throw new Error(t('locationNotFound', { city: searchInput }));
          }

          const result = geocodeData.results[0];
          const display_name = `${result.name}${result.country ? `, ${result.country}` : ''}`;
          
          await fetchPrayerDataForCoords(result.latitude, result.longitude, display_name);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred during search.');
          setIsLoading(false);
      }
  };


  const renderPrayerTimes = () => {
      if (!prayerTimes) return null;
      return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(prayerTimes).map(([name, time]) => (
                    (name === 'Fajr' || name === 'Dhuhr' || name === 'Asr' || name === 'Maghrib' || name === 'Isha') &&
                    <div key={name} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                        <p className="text-lg font-semibold text-brand-primary">{name}</p>
                        <p className="text-3xl font-bold text-slate-700 dark:text-slate-300 mt-2">{time}</p>
                    </div>
                ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-6">
                {t('prayerCalculationMethod')}
            </p>
          </>
      )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6">{t('prayerTimes')}</h2>
      
      {/* Moved Nearby Mosques Button to the top */}
      {coordinates && !isLoading && !error && (
        <div className="text-center mb-8">
            <a
                href={`https://www.google.com/maps/search/?api=1&query=mosques&ll=${coordinates.lat},${coordinates.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg w-full max-w-md mx-auto transform hover:-translate-y-0.5"
            >
                <MosqueIcon className="h-7 w-7" />
                <span className="text-lg">{t('findNearbyMosques')}</span>
            </a>
        </div>
      )}

      {isLoading && <div className="text-center text-slate-500">{t('loading')}...</div>}
      {error && <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg mb-4">{error}</div>}
      
      {!isLoading && !error && (
          <div className="mb-8">
              {renderPrayerTimes()}
          </div>
      )}

      {location && !isLoading && <p className="text-center text-slate-500 dark:text-slate-400 mb-4 text-sm">{t('showingPrayerTimesFor')} <span className="font-semibold">{location}</span>.</p>}

      <form onSubmit={handleSearch} className="mb-3 flex gap-2 max-w-md mx-auto">
        <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchCity')}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button type="submit" className="bg-brand-primary text-white font-semibold rounded-full px-5 flex-shrink-0 disabled:bg-slate-400 hover:bg-brand-dark transition-colors" disabled={isLoading}>
            {t('search')}
        </button>
      </form>
      <div className="text-center mb-6">
        <button onClick={requestGeolocation} disabled={isLoading} className="text-xs text-brand-primary hover:underline disabled:text-slate-400">
            {t('useCurrentLocation')}
        </button>
      </div>
      
    </div>
  );
};

export default PrayerTimesView;
