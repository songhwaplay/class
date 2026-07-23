'use strict';

const path = require('node:path');

const CATALOG_DIR = path.join(__dirname, '..', 'data', 'catalog');

function loadJson(filename) {
  return require(path.join(CATALOG_DIR, filename));
}

const ORIGINAL_CITIES = Object.freeze(loadJson('original-cities.json'));
const LANDMARKS = Object.freeze(loadJson('places.json'));
const PLACES = Object.freeze([...ORIGINAL_CITIES, ...LANDMARKS]);
const ITEMS = Object.freeze(loadJson('items.json'));
const TEMPLATES = Object.freeze(loadJson('templates.json'));
const READY_MISSIONS = Object.freeze(loadJson('ready-missions.json'));

function latLonToCell(lat, lon) {
  return {
    x: ((Number(lon) + 180) / 360) * 2500,
    y: ((90 - Number(lat)) / 180) * 1250
  };
}

function placeCell(place) {
  const x = Number(place?.cellX);
  const y = Number(place?.cellY);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    const width = Math.max(1, Number(place.markerWidth) || 1);
    const height = Math.max(1, Number(place.markerHeight) || 1);
    return { x: x + width / 2, y: y + height / 2 };
  }
  return latLonToCell(place?.lat, place?.lon);
}

function hasVerifiedSeaAccess(place) {
  return place?.canEnterFromSea === true && place?.verifiedSeaAccess !== false;
}

function normalizePlaceAccess(place) {
  if (!place?.isOriginalCity || hasVerifiedSeaAccess(place) === (place.canEnterFromSea === true)) return place;
  return {
    ...place,
    category: place.category === '항구 도시' ? '도시' : place.category,
    access: 'land',
    canEnterFromSea: false,
    facilities: Array.isArray(place.facilities)
      ? place.facilities.filter((facility) => facility !== '항구')
      : place.facilities
  };
}

function publicCatalog() {
  return {
    version: 2,
    places: PLACES.map((source) => {
      const place = normalizePlaceAccess(source);
      const { originalMarkerCells, originalSeaEntryCells, originalLandEntryCells, ...publicPlace } = place;
      return { ...publicPlace, facilities: place.facilities ? [...place.facilities] : undefined };
    }),
    items: ITEMS.map((item) => ({ ...item })),
    templates: TEMPLATES.map((template) => ({ ...template, needs: [...template.needs] })),
    readyMissions: READY_MISSIONS.map((mission) => ({ ...mission }))
  };
}

module.exports = {
  ORIGINAL_CITIES,
  LANDMARKS,
  PLACES,
  ITEMS,
  TEMPLATES,
  READY_MISSIONS,
  latLonToCell,
  placeCell,
  hasVerifiedSeaAccess,
  normalizePlaceAccess,
  publicCatalog
};
