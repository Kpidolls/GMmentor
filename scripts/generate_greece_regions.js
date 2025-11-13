const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'src', 'data', 'municipalities.json');
const outDir = path.join(__dirname, '..', 'public', 'data');
const outPath = path.join(outDir, 'greeceRegions.json');

function inferTopRegion(areaName) {
  if (!areaName) return 'Άλλες Περιοχές';
  const map = {
    'Κέντρο Αθήνας': 'Αττική',
    'Βόρεια Προάστια': 'Αττική',
    'Νότια Προάστια': 'Αττική',
    'Πειραιάς': 'Αττική',
    'Δυτικά Προάστια': 'Αττική',
    'Ανατολικά Προάστια': 'Αττική',
    'Δυτική Αττική': 'Αττική',
    'Βόρεια/Ανατολικά': 'Αττική',
  };
  if (map[areaName]) return map[areaName];
  const lower = areaName.toLowerCase();
  if (lower.includes('αθήνα') || lower.includes('αττική') || lower.includes('προάστια') || lower.includes('αθην')) return 'Αττική';
  if (lower.includes('θεσσαλονίκη') || lower.includes('θεσσαλονικ')) return 'Κεντρική Μακεδονία';
  if (lower.includes('κρήτη') || lower.includes('ηράκλειο') || lower.includes('χανιά') || lower.includes('ρέθυμνο')) return 'Κρήτη';
  if (lower.includes('πελοπόννησο') || lower.includes('πατρα') || lower.includes('καλαμάτα')) return 'Πελοπόννησος';
  return 'Άλλες Περιοχές';
}

function build(flat) {
  const map = {};
  for (const m of flat) {
    const area = (m.region && m.region.trim()) || 'Άγνωστο';
    const top = inferTopRegion(area);
    map[top] = map[top] || {};
    map[top][area] = map[top][area] || [];
    map[top][area].push({ name: m.name, lat: Number(m.lat), lng: Number(m.lng) });
  }
  const result = Object.entries(map).map(([region, areasObj]) => ({
    region,
    areas: Object.entries(areasObj).map(([name, municipalities]) => ({ name, municipalities }))
  }));
  result.sort((a, b) => a.region.localeCompare(b.region, 'el'));
  for (const r of result) r.areas.sort((x, y) => x.name.localeCompare(y.name, 'el'));
  return result;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse municipalities.json', e);
    process.exit(1);
  }
  const grouped = build(data);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(grouped, null, 2), 'utf8');
  console.log('Wrote', outPath);
}

main();
