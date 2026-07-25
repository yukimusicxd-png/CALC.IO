import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/GeographicModule.css';

const cityLocations = [
  { id: 'nyc', name: 'New York City', country: 'United States', code: 'US', lat: 40.7128, lng: -74.0060 },
  { id: 'ldn', name: 'London', country: 'United Kingdom', code: 'GB', lat: 51.5074, lng: -0.1278 },
  { id: 'tok', name: 'Tokyo', country: 'Japan', code: 'JP', lat: 35.6762, lng: 139.6503 },
  { id: 'syd', name: 'Sydney', country: 'Australia', code: 'AU', lat: -33.8688, lng: 151.2093 },
  { id: 'del', name: 'New Delhi', country: 'India', code: 'IN', lat: 28.6139, lng: 77.2090 },
  { id: 'rio', name: 'Rio de Janeiro', country: 'Brazil', code: 'BR', lat: -22.9068, lng: -43.1729 },
  { id: 'cpt', name: 'Cape Town', country: 'South Africa', code: 'ZA', lat: -33.9249, lng: 18.4241 },
  { id: 'cdg', name: 'Paris', country: 'France', code: 'FR', lat: 48.8566, lng: 2.3522 },
  { id: 'sfo', name: 'San Francisco', country: 'United States', code: 'US', lat: 37.7749, lng: -122.4194 },
  { id: 'sin', name: 'Singapore', country: 'Singapore', code: 'SG', lat: 1.3521, lng: 103.8198 },
];

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

const getFlagUrl = (countryCode) => {
  if (!countryCode) return null;
  const code = countryCode.toLowerCase();
  return `https://flagcdn.com/w80/${code}.png`;
};

const formatCoordinates = (lat, lng) => `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

const getLocalTime = (timezone) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return 'UTC time unavailable';
  }
};

const computeCentroid = (geometry) => {
  if (!geometry) return { lat: 0, lng: 0 };
  const coords = geometry.coordinates;
  let points = [];

  const collect = (arr) => {
    if (!Array.isArray(arr[0])) return;
    if (typeof arr[0][0] === 'number') {
      points.push(arr);
      return;
    }
    arr.forEach(collect);
  };

  collect(coords);

  let sumLat = 0;
  let sumLng = 0;
  let count = 0;

  points.forEach((ring) => {
    ring.forEach(([lng, lat]) => {
      sumLat += lat;
      sumLng += lng;
      count += 1;
    });
  });

  if (!count) return { lat: 0, lng: 0 };
  return { lat: sumLat / count, lng: sumLng / count };
};

const createSearchIndex = (geoData) => {
  const countries = geoData?.features?.map((feature) => {
    const latlng = computeCentroid(feature.geometry);
    return {
      id: feature.properties.ADM0_A3 || feature.properties.ISO_A3 || feature.properties.ADMIN,
      name: feature.properties.ADMIN,
      code: feature.properties.ISO_A2 || feature.properties.ISO_A3 || null,
      type: 'country',
      country: feature.properties.ADMIN,
      lat: latlng.lat,
      lng: latlng.lng,
      feature,
    };
  }) || [];

  const cities = cityLocations.map((city) => ({
    ...city,
    type: 'city',
    country: city.country,
  }));

  return [...countries, ...cities];
};

const mapViewTo = (mapRef, lat, lng, zoom = 3) => {
  if (mapRef.current) {
    mapRef.current.flyTo([lat, lng], zoom, { duration: 1.3 });
  }
};

function GeographicModule() {
  const [mode, setMode] = useState('globe');
  const [geoData, setGeoData] = useState(null);
  const [searchIndex, setSearchIndex] = useState([]);
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [hoveredCountryId, setHoveredCountryId] = useState(null);
  const [tooltipCountry, setTooltipCountry] = useState(null);
  const globeContainerRef = useRef(null);
  const globeRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (!globeContainerRef.current) return;
      const rect = globeContainerRef.current.getBoundingClientRect();
      setViewSize({
        width: Math.max(200, Math.floor(rect.width)),
        height: Math.max(200, Math.floor(rect.height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (globeContainerRef.current) observer.observe(globeContainerRef.current);
    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetch('https://unpkg.com/three-globe/example/ne_110m_admin_0_countries.geojson', {
      signal: abortController.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        setGeoData(data);
        setSearchIndex(createSearchIndex(data));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Failed to load country shapes:', error);
        }
      });

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (mode !== 'globe' || !geoData || !globeContainerRef.current || !viewSize.width || !viewSize.height) return undefined;

    let isCanceled = false;
    let globeInstance = null;

    const initializeGlobe = async () => {
      const module = await import('globe.gl');
      if (isCanceled) return;

      const Globe = module.default || module.Globe || module;
      if (globeContainerRef.current) {
        globeContainerRef.current.innerHTML = '';
      }

      globeInstance = Globe()(globeContainerRef.current)
        .width(viewSize.width)
        .height(viewSize.height)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#00ffff')
        .atmosphereAltitude(0.12)
        .atmosphereBlur(0.6)
        .showGlobe(true)
        .showGraticules(false)
        .polygonsData(geoData.features)
        .polygonCapColor((feature) =>
          feature === tooltipCountry ? 'rgba(0,255,255,0.35)' : 'rgba(0,255,255,0.08)'
        )
        .polygonSideColor(() => 'rgba(0,255,255,0.08)')
        .polygonStrokeColor((feature) =>
          feature === tooltipCountry ? '#00ffff' : 'rgba(0,255,255,0.18)'
        )
        .polygonAltitude(0.015)
        .polygonLabel((feature) => `<b>${feature.properties.ADMIN}</b>`)
        .onPolygonHover((feature) => {
          setTooltipCountry(feature);
          setHoveredCountryId(feature?.properties?.ADM0_A3 || feature?.properties?.ISO_A3 || null);
        })
        .onPolygonClick((feature) => {
          if (!feature) return;
          const centroid = computeCentroid(feature.geometry);
          handleLocationSelect({
            id: feature.properties.ADM0_A3 || feature.properties.ISO_A3 || feature.properties.ADMIN,
            name: feature.properties.ADMIN,
            type: 'country',
            code: feature.properties.ISO_A2 || feature.properties.ISO_A3,
            lat: centroid.lat,
            lng: centroid.lng,
          });
        })
        .pointOfView({ lat: 20, lng: 0, altitude: 2.4 }, 0);

      globeInstance.controls().autoRotate = true;
      globeInstance.controls().autoRotateSpeed = 0.25;
      globeRef.current = globeInstance;
    };

    initializeGlobe();

    return () => {
      isCanceled = true;
      if (globeInstance) {
        try {
          globeInstance.renderer().dispose();
        } catch (error) {
          // ignore cleanup failure
        }
        globeInstance = null;
      }
      globeRef.current = null;
    };
  }, [mode, geoData, viewSize.width, viewSize.height]);

  useEffect(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      setSearchResults([]);
      return;
    }

    const filtered = searchIndex
      .filter((item) => item.name.toLowerCase().includes(term) || item.country.toLowerCase().includes(term))
      .slice(0, 12);
    setSearchResults(filtered);
  }, [searchQuery, searchIndex]);

  const handleLocationSelect = async ({ id, name, type, code, lat, lng }) => {
    if (!lat || !lng) return;

    if (mode === 'globe' && globeRef.current) {
      globeRef.current.pointOfView({ lat, lng, altitude: 2.4 }, 1000);
    }

    if (mode === 'map' && mapRef.current) {
      mapRef.current.flyTo([lat, lng], type === 'city' ? 5 : 3, { duration: 1.2 });
    }

    setSelectedLocation({
      id,
      name,
      type,
      code,
      lat,
      lng,
      country: type === 'city' ? code ? name : name : name,
      flagUrl: getFlagUrl(code),
      timezone: null,
      localTime: 'Loading…',
      weather: null,
      weatherNotes: null,
    });
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`
      );
      if (!response.ok) {
        throw new Error(`Weather fetch failed: ${response.status}`);
      }
      const weatherData = await response.json();
      const { current_weather, timezone } = weatherData;
      const localTime = getLocalTime(timezone || 'UTC');
      const condition = weatherCodeMap[current_weather.weathercode] || 'Unknown';
      const temperatureC = current_weather.temperature;
      const temperatureF = Number((temperatureC * 9) / 5 + 32).toFixed(1);
      const humidity = weatherData?.hourly?.relativehumidity_2m?.[0] ?? 'N/A';

      setSelectedLocation((prev) => ({
        ...prev,
        timezone,
        localTime,
        weather: {
          temperatureC: temperatureC.toFixed(1),
          temperatureF,
          condition,
          windSpeed: current_weather.windspeed,
          humidity: humidity === 'N/A' ? 'N/A' : humidity,
        },
      }));
    } catch (error) {
      console.warn(error);
      setWeatherError('Unable to fetch live weather.');
      setSelectedLocation((prev) => ({ ...prev, localTime: 'Unavailable' }));
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.name);
    setSearchResults([]);
    handleLocationSelect(item);
  };

  const selectedCountryStyle = (feature) => ({
    fillColor: '#000000',
    fillOpacity: 0.12,
    weight: feature.properties.ADM0_A3 === hoveredCountryId ? 2 : 1,
    color: feature.properties.ADM0_A3 === hoveredCountryId ? '#00FFFF' : '#00FF66',
    dashArray: '2',
    opacity: 0.9,
  });

  const countryGeoJson = useMemo(() => geoData, [geoData]);

  const flyToSearchTarget = async (entry) => {
    if (!entry) return;
    handleLocationSelect(entry);
    setSearchResults([]);
  };

  return (
    <div className="geographic-module">
      <div className="geo-toolbar">
        <div className="geo-mode-toggle">
          <button
            className={mode === 'globe' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setMode('globe')}
            type="button"
          >
            3D Globe
          </button>
          <button
            className={mode === 'map' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setMode('map')}
            type="button"
          >
            2D Flat Map
          </button>
        </div>

        <div className="geo-search">
          <label htmlFor="geo-search-input">Jump to city/country...</label>
          <input
            id="geo-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Jump to city/country..."
            autoComplete="off"
          />
          {searchResults.length > 0 && (
            <div className="geo-search-suggestions">
              {searchResults.map((item) => (
                <button
                  type="button"
                  key={`${item.type}-${item.id}`}
                  className="geo-suggestion"
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item.name} {item.type === 'city' ? `(${item.country})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="geo-view-panel">
        <div className="geo-view-wrapper">
          <div className="geo-view-inner">
            {mode === 'globe' && (
              <div className="geo-globe-container" ref={globeContainerRef} />
            )}

            {mode === 'map' && (
              <MapContainer
                center={[20, 0]}
                zoom={2}
                scrollWheelZoom
                whenCreated={(mapInstance) => {
                  mapRef.current = mapInstance;
                }}
                className="geo-map-container"
              >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attribution">CartoDB</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {countryGeoJson && (
                <GeoJSON
                  data={countryGeoJson}
                  style={selectedCountryStyle}
                  onEachFeature={(feature, layer) => {
                    layer.on({
                      mouseover: () => {
                        setHoveredCountryId(feature.properties.ADM0_A3);
                        layer.setStyle({ weight: 2, color: '#00FFFF' });
                      },
                      mouseout: () => {
                        setHoveredCountryId(null);
                        layer.setStyle({ weight: 1, color: '#00FF66' });
                      },
                      click: () => {
                        const centroid = computeCentroid(feature.geometry);
                        const item = {
                          id: feature.properties.ADM0_A3 || feature.properties.ISO_A3 || feature.properties.ADMIN,
                          name: feature.properties.ADMIN,
                          type: 'country',
                          code: feature.properties.ISO_A2 || feature.properties.ISO_A3,
                          lat: centroid.lat,
                          lng: centroid.lng,
                        };
                        handleLocationSelect(item);
                      },
                    });
                  }}
                />
              )}
              {cityLocations.map((city) => (
                <CircleMarker
                  key={city.id}
                  center={[city.lat, city.lng]}
                  radius={5}
                  pathOptions={{ color: '#00FFFF', fillColor: '#00FFFF', fillOpacity: 0.8 }}
                  eventHandlers={{
                    click: () => handleLocationSelect({
                      ...city,
                      type: 'city',
                    }),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.9} permanent>
                    <span>{city.name}</span>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
          </div>
        </div>
      </div>

      <div className="geo-details-footer">
        <div className="geo-panel-header">
          <h2>Geographic Intelligence</h2>
          <p>Interactive globe and map exploration with live weather and local time.</p>
        </div>

        <div className="geo-footer-content">
          {selectedLocation ? (
            <div className="geo-details-card">
              <div className="geo-details-heading">
                <div>
                  <div className="geo-details-type">{selectedLocation.type === 'city' ? 'City' : 'Country'}</div>
                  <h3>{selectedLocation.name}</h3>
                </div>
                {selectedLocation.flagUrl && (
                  <img className="geo-flag" src={selectedLocation.flagUrl} alt={`${selectedLocation.name} flag`} />
                )}
              </div>

              <div className="geo-stats-row">
                <div>
                  <div className="geo-stat-label">Coordinates</div>
                  <div>{formatCoordinates(selectedLocation.lat, selectedLocation.lng)}</div>
                </div>
                <div>
                  <div className="geo-stat-label">Timezone</div>
                  <div>{selectedLocation.timezone || 'Auto-detect'}</div>
                </div>
              </div>

              <div className="geo-stats-row">
                <div>
                  <div className="geo-stat-label">Local Time</div>
                  <div>{selectedLocation.localTime}</div>
                </div>
                <div>
                  <div className="geo-stat-label">Weather</div>
                  <div>{weatherLoading ? 'Loading…' : selectedLocation.weather?.condition || weatherError || 'Click a location'}</div>
                </div>
              </div>

              {selectedLocation.weather && (
                <div className="geo-weather-grid">
                  <div>
                    <div className="geo-stat-label">Temperature</div>
                    <div>{selectedLocation.weather.temperatureC}°C / {selectedLocation.weather.temperatureF}°F</div>
                  </div>
                  <div>
                    <div className="geo-stat-label">Wind Speed</div>
                    <div>{selectedLocation.weather.windSpeed} km/h</div>
                  </div>
                  <div>
                    <div className="geo-stat-label">Humidity</div>
                    <div>{selectedLocation.weather.humidity}%</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="geo-welcome-card">
              <p>Click a country polygon on the globe or a marker on the map to reveal live local time and weather data.</p>
              <p>Use the search field to jump straight to major cities and countries.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeographicModule;
