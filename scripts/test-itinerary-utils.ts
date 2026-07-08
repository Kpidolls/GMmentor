import assert from 'node:assert/strict';
import { exportJson, exportReadableTxt, exportTxt } from '../src/components/itinerary/exportUtils';
import { importJson } from '../src/components/itinerary/importUtils';
import { Itinerary } from '../src/components/itinerary/useItinerary';

const sample: Itinerary = {
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  days: [
    {
      date: '2026-05-10',
      title: 'Day 1',
      notes: 'Arrival in Athens',
      items: [
        {
          id: 'item-1',
          name: 'Acropolis',
          type: 'place',
          url: 'https://example.com/acropolis',
          time: '09:00',
          notes: 'Buy tickets online',
        },
      ],
    },
  ],
};

const exportedJson = exportJson(sample);
const imported = importJson(exportedJson);

assert.equal(imported.version, 1);
assert.equal(imported.days.length, 1);
const firstDay = imported.days[0];
assert.ok(firstDay);
assert.equal(firstDay.items.length, 1);
const firstItem = firstDay.items[0];
assert.ok(firstItem);
assert.equal(firstItem.name, 'Acropolis');

const exportedTxt = exportTxt(sample);
assert.match(exportedTxt, /MY GREECE ITINERARY/);
assert.match(exportedTxt, /Acropolis/);
assert.match(exportedTxt, /DAY 1/);
assert.match(exportedTxt, /Summary:/);
assert.match(exportedTxt, /Tips:/);
assert.match(exportedTxt, /Have a great trip!/);

const tipsHeaderCount = (exportedTxt.match(/^Tips:/gm) || []).length;
assert.equal(tipsHeaderCount, 1);

const readableTxt = exportReadableTxt(sample);
assert.match(readableTxt, /Last Updated:/);
assert.match(readableTxt, /Places & Activities:/);
assert.match(readableTxt, /Type: Place/);
assert.match(readableTxt, /Map: https:\/\/example.com\/acropolis/);

const greekReadableTxt = exportReadableTxt(sample, 'el');
assert.match(greekReadableTxt, /ΤΟ ΠΡΟΓΡΑΜΜΑ ΜΟΥ ΣΤΗΝ ΕΛΛΑΔΑ/);
assert.match(greekReadableTxt, /Μέρη & Δραστηριότητες:/);
assert.match(greekReadableTxt, /Χάρτης: https:\/\/example.com\/acropolis/);
assert.match(greekReadableTxt, /Καλό ταξίδι!/);

const duplicateTipCount =
  (readableTxt.match(/Group nearby locations together\./g) || []).length +
  (readableTxt.match(/Check opening hours before visiting\./g) || []).length;
assert.equal(duplicateTipCount, 2);

assert.throws(() => importJson('{"version":2,"days":[]}'));
assert.throws(() => importJson('{"version":1,"createdAt":"x"}'));

console.log('Itinerary utility tests passed.');
