/**
 * Sync en.json and el.json so both have identical key sets.
 * Run with: node scripts/sync-locale-keys.js
 */
const fs = require('fs');

const EN = 'src/i18n/locales/en.json';
const EL = 'src/i18n/locales/el.json';

const en = JSON.parse(fs.readFileSync(EN, 'utf8'));
const el = JSON.parse(fs.readFileSync(EL, 'utf8'));

// ─── 1. ADD MISSING KEYS TO el.json ────────────────────────────────────────

// meta: add 7 keys after blogDescription, before homeDescriptionShort
const elMetaOrdered = {};
for (const [k, v] of Object.entries(el.meta)) {
  elMetaOrdered[k] = v;
  if (k === 'blogDescription') {
    elMetaOrdered['blogPostSuffix'] = 'Διαβάστε αυτόν τον λεπτομερή οδηγό Googlementor με επιμελημένους χάρτες, πρακτικές συμβουλές και τοπικές προτάσεις για να σχεδιάσετε το ταξίδι σας.';
    elMetaOrdered['insuranceTitle'] = 'Ταξιδιωτική Ασφάλεια για Ελλάδα | Οικονομική Κάλυψη | Googlementor';
    elMetaOrdered['insuranceDescription'] = 'Οικονομική ταξιδιωτική ασφάλεια ειδικά για την Ελλάδα — συγκρίνετε πακέτα για ιατρικές έκτακτες ανάγκες, ακυρώσεις ταξιδιών και προστασία αποσκευών, ιδανικά για island-hopping και πολυήμερα ταξίδια.';
    elMetaOrdered['termsTitle'] = 'Όροι & Προϋποθέσεις | Googlementor';
    elMetaOrdered['termsDescription'] = 'Διαβάστε τους όρους και προϋποθέσεις του Googlementor, συμπεριλαμβανομένων υποχρεώσεων χρηστών, όρων πληρωμής, ιδιοκτησίας περιεχομένου και επίλυσης διαφορών.';
    elMetaOrdered['privacyTitle'] = 'Πολιτική Απορρήτου | Googlementor';
    elMetaOrdered['privacyDescription'] = 'Πώς το Googlementor συλλέγει, αποθηκεύει και χρησιμοποιεί προσωπικά δεδομένα, cookies και αναλυτικά στοιχεία. Μάθετε τα δικαιώματά σας και πώς να διαχειριστείτε τις ρυθμίσεις απορρήτου.';
  }
}
el.meta = elMetaOrdered;

// product: add "descriptions" object after "fish", and "viewMore" after "imageAlt"
const elProductOrdered = {};
for (const [k, v] of Object.entries(el.product)) {
  elProductOrdered[k] = v;
  if (k === 'fish') {
    elProductOrdered['descriptions'] = {
      title: '📍 Ζαχαροπλαστεία',
      description: 'Απολαύστε τα πιο αδύνατο να αντισταθείτε γλυκά της Ελλάδας, από κρεμώδη μπακλαβά έως λαχταριστούς λουκουμάδες, ιδανικά για κάθε λάτρη του γλυκού.'
    };
  }
  if (k === 'imageAlt') {
    elProductOrdered['viewMore'] = 'Δείτε Περισσότερα {{title}}';
  }
}
el.product = elProductOrdered;

// store: add "filters" after "meta"
const elStoreOrdered = {};
for (const [k, v] of Object.entries(el.store)) {
  elStoreOrdered[k] = v;
  if (k === 'meta') {
    elStoreOrdered['filters'] = { all: 'Όλα', amazon: 'Amazon', temu: 'Temu' };
  }
}
el.store = elStoreOrdered;

// ─── 2. ADD MISSING KEYS TO en.json ────────────────────────────────────────

// mainHero: add 9 entries after "viewProduct"
const enMainHeroOrdered = {};
for (const [k, v] of Object.entries(en.mainHero)) {
  enMainHeroOrdered[k] = v;
  if (k === 'viewProduct') {
    enMainHeroOrdered['athens'] = 'Athens';
    enMainHeroOrdered['athensAndSurroundings'] = 'Athens & Surroundings';
    enMainHeroOrdered['areas'] = 'areas';
    enMainHeroOrdered['backToSearchOptions'] = 'Back to Search Options';
    enMainHeroOrdered['exploreByLocation'] = 'Explore by Location';
    enMainHeroOrdered['choosePreferredArea'] = 'Choose your preferred area to discover amazing {{category}} nearby';
    enMainHeroOrdered['clickToReturnToMain'] = 'Click to return to main page';
    enMainHeroOrdered['chooseDifferentCuisine'] = 'Choose Different Cuisine';
    enMainHeroOrdered['features'] = {
      curatedSelection: 'Curated Selection',
      qualityAssured: 'Quality Assured',
      directNavigation: 'Direct Navigation',
      localFavorites: 'Local Favorites'
    };
  }
}
en.mainHero = enMainHeroOrdered;

// restaurantFinder: add several keys
const enRFOrdered = {};
for (const [k, v] of Object.entries(en.restaurantFinder)) {
  enRFOrdered[k] = v;
  if (k === 'subtitle') {
    enRFOrdered['discoverGreekCuisine'] = 'Discover Greek Cuisine';
    enRFOrdered['findPerfectDining'] = 'Find the perfect dining experience tailored to your preferences';
  }
  if (k === 'nearYou') {
    enRFOrdered['findCategoryNearLocation'] = 'Find {{category}} near your location';
    enRFOrdered['byCuisine'] = 'By Cuisine';
    enRFOrdered['exploreFoodCategories'] = 'Explore different food categories';
    enRFOrdered['byRegion'] = 'By Region';
    enRFOrdered['chooseAthensAreas'] = 'Choose specific Athens areas';
  }
  if (k === 'resultsTitle') {
    enRFOrdered['restaurants'] = 'Restaurants';
    enRFOrdered['found'] = 'Found';
  }
  if (k === 'closestTavernas') {
    enRFOrdered['of'] = 'of';
  }
  if (k === 'viewOnMaps') {
    enRFOrdered['goToRestaurant'] = 'Go to restaurant';
  }
}
en.restaurantFinder = enRFOrdered;

// categorySelection: add 3 keys before "backToLocationStep"
const enCSOrdered = {};
for (const [k, v] of Object.entries(en.categorySelection)) {
  if (k === 'backToLocationStep') {
    enCSOrdered['chooseYourCuisine'] = 'Choose Your Cuisine';
    enCSOrdered['selectFromCurated'] = 'Choose from our curated categories to find the perfect dining experience';
    enCSOrdered['backToSearchOptions'] = 'Back to Search Options';
  }
  enCSOrdered[k] = v;
}
en.categorySelection = enCSOrdered;

// top-level "hiking" key — insert after "categories" and before "aria"
const enTopOrdered = {};
for (const [k, v] of Object.entries(en)) {
  enTopOrdered[k] = v;
  if (k === 'categories') {
    enTopOrdered['hiking'] = 'Hiking';
  }
}
// Rebuild en from this new top-level order
Object.keys(en).forEach(k => delete en[k]);
Object.assign(en, enTopOrdered);

// product: add "descriptions" after "fish" in en.json
const enProductOrdered = {};
for (const [k, v] of Object.entries(en.product)) {
  enProductOrdered[k] = v;
  if (k === 'fish') {
    enProductOrdered['descriptions'] = {
      title: '📍 Dessert Shops',
      description: "Treat yourself to Greece's most irresistible desserts, from creamy baklava to luscious loukoumades, perfect for every sweet tooth."
    };
  }
}
en.product = enProductOrdered;

// product: add "desserts" after "fish" (parallel to el.json's existing product.desserts)
// Already adding "descriptions"; also add "desserts" after it
const enProductOrdered2 = {};
for (const [k, v] of Object.entries(en.product)) {
  enProductOrdered2[k] = v;
  if (k === 'descriptions') {
    enProductOrdered2['desserts'] = {
      title: '📍 Dessert Shops',
      description: "Treat yourself to Greece's most irresistible desserts, from creamy baklava to luscious loukoumades, perfect for every sweet tooth."
    };
  }
}
en.product = enProductOrdered2;

// travelInsurance: add "ctaSubtitle" after "ctaTitle"
const enTIOrdered = {};
for (const [k, v] of Object.entries(en.travelInsurance)) {
  enTIOrdered[k] = v;
  if (k === 'ctaTitle') {
    enTIOrdered['ctaSubtitle'] = 'Discover the insurance that covers you at every destination.';
  }
}
en.travelInsurance = enTIOrdered;

// ─── 3. WRITE FILES ─────────────────────────────────────────────────────────
fs.writeFileSync(EN, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(EL, JSON.stringify(el, null, 2) + '\n', 'utf8');

console.log('✅ Wrote', EN);
console.log('✅ Wrote', EL);

// ─── 4. VALIDATE ────────────────────────────────────────────────────────────
function flat(obj, p = '') {
  const r = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(r, flat(v, key));
    else r[key] = v;
  }
  return r;
}

const enF = flat(en);
const elF = flat(el);
const missingEl = Object.keys(enF).filter(k => !(k in elF));
const missingEn = Object.keys(elF).filter(k => !(k in enF));

console.log('\n📊 Validation:');
console.log('  Missing in el.json:', missingEl.length, missingEl.length ? missingEl : '');
console.log('  Missing in en.json:', missingEn.length, missingEn.length ? missingEn : '');

if (missingEl.length === 0 && missingEn.length === 0) {
  console.log('\n🎉 Both locale files are fully in sync!');
} else {
  console.log('\n⚠️  Still some differences to resolve.');
}
