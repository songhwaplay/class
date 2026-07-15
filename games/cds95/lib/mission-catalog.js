'use strict';

const path = require('node:path');

const CATALOG_DIR = path.join(__dirname, '..', 'data', 'catalog');

function loadJson(filename) {
  // require() keeps startup simple and validates JSON syntax immediately.
  return require(path.join(CATALOG_DIR, filename));
}

const PLACES = Object.freeze(loadJson('places.json'));
const ITEMS = Object.freeze(loadJson('items.json'));
const TEMPLATES = Object.freeze(loadJson('templates.json'));
const READY_MISSIONS = Object.freeze(loadJson('ready-missions.json'));

function latLonToCell(lat, lon) {
  return {
    x: ((Number(lon) + 180) / 360) * 2500,
    y: ((90 - Number(lat)) / 180) * 1250
  };
}

function publicCatalog() {
  return {
    version: 1,
    places: PLACES.map((place) => ({ ...place, facilities: place.facilities ? [...place.facilities] : undefined })),
    items: ITEMS.map((item) => ({ ...item })),
    templates: TEMPLATES.map((template) => ({ ...template, needs: [...template.needs] })),
    readyMissions: READY_MISSIONS.map((mission) => ({ ...mission }))
  };
}

module.exports = {
  PLACES,
  ITEMS,
  TEMPLATES,
  READY_MISSIONS,
  latLonToCell,
  publicCatalog
};
