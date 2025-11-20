import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildGreeceRegions, GreeceRegion, Municipality } from '../lib/buildGreeceRegions';

type Props = {
  // callback when a municipality is selected
  onSelect?: (m: Municipality) => void;
};

const RegionPicker: React.FC<Props> = ({ onSelect }) => {
  const { t } = useTranslation();
  const [flat, setFlat] = useState<Municipality[] | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Import data directly from src/data (bundled at build time)
    (async () => {
      try {
        // Try to import hierarchical data first (faster)
        const hierarchicalData = (await import('../data/greeceRegions.json')).default;
        // Flatten back to Municipality[] for downstream compatibility
        const normalized: Municipality[] = [];
        for (const region of hierarchicalData) {
          for (const area of region.areas) {
            for (const m of area.municipalities) {
              normalized.push({ name: m.name, lat: Number(m.lat), lng: Number(m.lng), region: area.name });
            }
          }
        }
        if (!cancelled) setFlat(normalized);
        return;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load greeceRegions.json, falling back to municipalities.json');
        }
      }

      try {
        // Fallback: import municipalities directly
        const municipalitiesData = (await import('../data/municipalities.json')).default;
        if (cancelled) return;
        const normalized = municipalitiesData.map((d: any) => ({
          name: d.name,
          lat: Number(d.lat),
          lng: Number(d.lng),
          region: d.region || 'Άγνωστο'
        })) as Municipality[];
        setFlat(normalized);
      } catch (e: any) {
        if (!cancelled) {
          console.error('RegionPicker load error', e);
          setError(t('regionPicker.loadError', 'Failed to load locations'));
          setFlat([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const greeceData: GreeceRegion[] = useMemo(() => {
    if (!flat) return [];
    return buildGreeceRegions(flat);
  }, [flat]);

  const regionData = greeceData.find((r) => r.region === selectedRegion);
  const areaData = regionData?.areas.find((a) => a.name === selectedArea);

  const filteredMunicipalities = areaData
    ? areaData.municipalities.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  if (flat === null) {
    return <div className="p-4 text-center">{t('regionPicker.loading', 'Loading locations…')}</div>;
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
      {/* Breadcrumbs / header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">📍 {t('regionPicker.title', 'Choose Region / Area / Municipality')}</h3>
        <div className="text-sm text-gray-500">{greeceData.length} {t('regionPicker.regions', 'regions')}</div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600">{error}</div>
      )}

      {!selectedRegion ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {greeceData.map((region) => (
              <button
                key={region.region}
                onClick={() => setSelectedRegion(region.region)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegion(region.region); }}
                aria-label={t(`regions.${region.region}`, region.region)}
                className="p-3 border rounded-lg hover:bg-blue-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <div className="font-medium">{t(`regions.${region.region}`, region.region)}</div>
                <div className="text-xs text-gray-500 mt-1">{region.areas.length} {t('regionPicker.areas', 'areas')}</div>
              </button>
            ))}
          </div>
        </div>
      ) : !selectedArea ? (
        <div>
          <button onClick={() => setSelectedRegion(null)} className="text-sm text-blue-500 mb-3">← {t('regionPicker.back', 'Back')}</button>
          <h3 className="text-lg font-bold text-center mb-4">{t(`regions.${selectedRegion}`, selectedRegion)}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-auto">
            {regionData?.areas.map((area) => (
              <button
                key={area.name}
                onClick={() => setSelectedArea(area.name)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedArea(area.name); }}
                aria-label={t(`areas.${area.name}`, area.name)}
                className="p-3 border rounded-lg hover:bg-blue-50 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <div>
                  <div className="font-medium">{t(`areas.${area.name}`, area.name)}</div>
                  <div className="text-xs text-gray-500">{area.municipalities.length} {t('regionPicker.municipalities', 'municipalities')}</div>
                </div>
                <div className="text-xs text-gray-400">→</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <button onClick={() => setSelectedArea(null)} className="text-sm text-blue-500">← {t('regionPicker.back', 'Back')}</button>
              <div className="text-sm text-gray-600">{t(`areas.${selectedArea}`, selectedArea)}</div>
            </div>
            <div className="text-xs text-gray-500">{filteredMunicipalities.length} {t('regionPicker.results', 'results')}</div>
          </div>

          <input
            type="text"
            placeholder={t('regionPicker.searchPlaceholder', 'Search municipalities...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-md p-2 mb-3 text-sm"
            aria-label={t('regionPicker.searchPlaceholder', 'Search municipalities...')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-auto">
            {filteredMunicipalities.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500">{t('regionPicker.noResults', 'No locations found')}</div>
            ) : (
              filteredMunicipalities.map((m) => (
                <button
                  key={m.name}
                  onClick={() => onSelect?.(m)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(m); }}
                  aria-label={t(`municipalities.${m.name}`, m.name)}
                  className="p-3 border rounded-lg hover:bg-blue-50 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <div className="font-medium">{t(`municipalities.${m.name}`, m.name)}</div>
                  <div className="text-xs text-gray-500">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionPicker;
