const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function transliterateGreek(s) {
  if (!s) return s;
  const map = {
    'Α':'A','α':'a','Β':'V','β':'v','Γ':'G','γ':'g','Δ':'D','δ':'d','Ε':'E','ε':'e','Ζ':'Z','ζ':'z',
    'Η':'I','η':'i','Θ':'Th','θ':'th','Ι':'I','ι':'i','Κ':'K','κ':'k','Λ':'L','λ':'l','Μ':'M','μ':'m',
    'Ν':'N','ν':'n','Ξ':'X','ξ':'x','Ο':'O','ο':'o','Π':'P','π':'p','Ρ':'R','ρ':'r','Σ':'S','σ':'s','ς':'s',
    'Τ':'T','τ':'t','Υ':'Y','υ':'y','Φ':'F','φ':'f','Χ':'Ch','χ':'ch','Ψ':'Ps','ψ':'ps','Ω':'O','ω':'o',
    'Ά':'A','ά':'a','Έ':'E','έ':'e','Ή':'I','ή':'i','Ί':'I','ί':'i','Ό':'O','ό':'o','Ύ':'Y','ύ':'y','Ώ':'O','ώ':'o',
    'Ϊ':'I','ϊ':'i','Ϋ':'Y','ϋ':'y','·':'.','—':'-','–':'-','΄':'','’':'','‘':'','"':'','«':'','»':'','/':'-'
  };
  return s.split('').map(ch => map[ch] !== undefined ? map[ch] : ch).join('').replace(/[^A-Za-z0-9\- ]/g,'').replace(/\s+/g,' ').trim();
}

function downloadToString(url) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith('https') ? https : http;
    getter.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadToString(res.headers.location));
      }
      if (res.statusCode !== 200) return reject(new Error('Request failed ' + res.statusCode));
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function safeParseJSON(s) {
  try { return JSON.parse(s); } catch (e) { return null; }
}

function centroidFromCoords(coords) {
  // coords can be nested arrays for polygons/multipolygons
  const points = [];
  function walk(a) {
    if (typeof a[0] === 'number' && typeof a[1] === 'number') {
      points.push(a);
      return;
    }
    for (const el of a) walk(el);
  }
  walk(coords);
  if (points.length === 0) return null;
  let sx = 0, sy = 0;
  for (const p of points) { sx += p[0]; sy += p[1]; }
  return [sx / points.length, sy / points.length];
}

function computeCentroid(geom) {
  if (!geom) return null;
  const t = geom.type;
  if (t === 'Point') return geom.coordinates.slice(0,2);
  if (t === 'MultiPoint') return centroidFromCoords(geom.coordinates);
  if (t === 'Polygon') return centroidFromCoords(geom.coordinates);
  if (t === 'MultiPolygon') return centroidFromCoords(geom.coordinates);
  return null;
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(l => {
    const parts = l.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    const obj = {};
    for (let i=0;i<header.length;i++) obj[header[i]] = parts[i] || '';
    return obj;
  });
  return rows;
}

function buildRegionsFromFlat(flat) {
  const map = {};
  for (const m of flat) {
    const area = (m.region && m.region.trim()) || 'Άλλες Περιοχές';
    map[area] = map[area] || [];
    map[area].push({ name: m.name, lat: m.lat, lng: m.lng });
  }
  const result = Object.entries(map).map(([region, municipalities]) => ({ region, areas: [{ name: region, municipalities }] }));
  return result;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/import_geogreece.js <local-file-or-remote-url>');
    process.exit(1);
  }

  let content;
  if (/^https?:\/\//.test(arg)) {
    console.log('Downloading', arg);
    content = await downloadToString(arg);
  } else {
    const p = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
    if (!fs.existsSync(p)) { console.error('File not found', p); process.exit(1); }
    content = fs.readFileSync(p, 'utf8');
  }

  // Try JSON/GeoJSON first
  const parsed = safeParseJSON(content);
  let items = [];
  if (parsed && parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
    for (const f of parsed.features) {
      const props = f.properties || {};
      const geom = f.geometry;
      const c = computeCentroid(geom);
      const name_el = props.NAME || props.NAME_EL || props.DIMOS || props.NAME_GR || props['Dimos'] || props['DimosName'] || props['name_el'] || props['name'] || '';
      const name_en = props['NAME_EN'] || props['NAME_LATIN'] || props['NAME_LAT'] || props['name_en'] || '';
      const region = props['PERIFEREIA'] || props['PERIOCHI'] || props['REGION'] || props['NUTS2'] || '';
      items.push({ name: name_el || (name_en || '').toString(), name_en: name_en || '', transliteration: transliterateGreek(name_el || name_en || ''), lat: c ? c[1] : null, lng: c ? c[0] : null, region });
    }
  } else {
    // Try CSV
    const rows = parseCSV(content);
    if (rows.length > 0) {
      for (const r of rows) {
        const name_el = r['NAME'] || r['name'] || r['NAME_GR'] || r['Όνομα'] || r['Ονομα'] || r['dim'] || r['dimos'] || '';
        const name_en = r['NAME_EN'] || r['name_en'] || r['NAME_LATIN'] || '';
        const lat = Number(r['lat'] || r['LAT'] || r['Y'] || r['latitude'] || r['LATITUDE'] || '') || null;
        const lng = Number(r['lng'] || r['LON'] || r['X'] || r['longitude'] || r['LONGITUDE'] || '') || null;
        const region = r['PERIFEREIA'] || r['region'] || r['Νομός'] || r['prefecture'] || '';
        items.push({ name: name_el || name_en, name_en, transliteration: transliterateGreek(name_el || name_en), lat, lng, region });
      }
    } else {
      // fallback: try to parse HTML table (like geogreece list)
      const lines = content.split(/\r?\n/);
      for (const ln of lines) {
        const m = ln.match(/\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([0-9,\.]+)/);
        if (m) {
          const name_en = m[2].trim();
          const region = m[3].trim();
          items.push({ name: name_en, name_en, transliteration: transliterateGreek(name_en), lat: null, lng: null, region });
        }
      }
    }
  }

  // Deduplicate by name
  const byName = new Map();
  for (const it of items) {
    const key = (it.name || it.name_en).trim();
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, it);
    else {
      const ex = byName.get(key);
      if ((!ex.lat || !ex.lng) && (it.lat && it.lng)) byName.set(key, it);
    }
  }
  const final = Array.from(byName.values()).map(x => ({ name: x.name, name_en: x.name_en, transliteration: x.transliteration, lat: x.lat, lng: x.lng, region: x.region }));

  // Write municipalities.json
  const outMunicipalities = path.join(process.cwd(), 'src', 'data', 'municipalities.json');
  fs.writeFileSync(outMunicipalities, JSON.stringify(final, null, 2), 'utf8');
  console.log('Wrote', outMunicipalities, 'items:', final.length);

  // Build minimal greeceRegions.json grouping by region
  const regions = buildRegionsFromFlat(final.map(f => ({ name: f.name, lat: f.lat, lng: f.lng, region: f.region })));
  const outRegions = path.join(process.cwd(), 'public', 'data', 'greeceRegions.json');
  const outDir = path.dirname(outRegions);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outRegions, JSON.stringify(regions, null, 2), 'utf8');
  console.log('Wrote', outRegions);
}

main().catch(err => { console.error(err); process.exit(1); });
