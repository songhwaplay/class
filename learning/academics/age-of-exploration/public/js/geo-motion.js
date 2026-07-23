(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CDS95GeoMotion = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const EARTH_RADIUS_KM = 6371.0088;
  const DEG = Math.PI / 180;
  // An equirectangular map has a singularity at the poles. Limiting sec(latitude)
  // to 50 keeps collision checks finite while preserving the rapid polar travel.
  const MIN_LONGITUDE_SCALE = 0.02;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function wrapRadians(value) {
    let angle = Number(value) || 0;
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  function pixelToRadians(x, y, worldPixelWidth, worldPixelHeight) {
    const width = Math.max(1, Number(worldPixelWidth) || 1);
    const height = Math.max(1, Number(worldPixelHeight) || 1);
    return {
      lon: ((Number(x) || 0) / width) * Math.PI * 2 - Math.PI,
      lat: Math.PI / 2 - clamp(y, 0, height) / height * Math.PI
    };
  }

  function latitudeDegreesAtY(y, worldPixelHeight) {
    const height = Math.max(1, Number(worldPixelHeight) || 1);
    return 90 - clamp(y, 0, height) / height * 180;
  }

  function longitudeScaleAtY(y, worldPixelHeight) {
    const latitude = latitudeDegreesAtY(y, worldPixelHeight) * DEG;
    return Math.max(MIN_LONGITUDE_SCALE, Math.abs(Math.cos(latitude)));
  }

  function localDeltaToMap(eastPixels, southPixels, y, worldPixelHeight) {
    return {
      x: (Number(eastPixels) || 0) / longitudeScaleAtY(y, worldPixelHeight),
      y: Number(southPixels) || 0
    };
  }

  function centralAngle(ax, ay, bx, by, worldPixelWidth, worldPixelHeight) {
    const a = pixelToRadians(ax, ay, worldPixelWidth, worldPixelHeight);
    const b = pixelToRadians(bx, by, worldPixelWidth, worldPixelHeight);
    const dLat = b.lat - a.lat;
    const dLon = wrapRadians(b.lon - a.lon);
    const sinLat = Math.sin(dLat / 2);
    const sinLon = Math.sin(dLon / 2);
    const h = Math.min(1, sinLat * sinLat + Math.cos(a.lat) * Math.cos(b.lat) * sinLon * sinLon);
    return 2 * Math.asin(Math.sqrt(h));
  }

  function kilometersPerPixel(worldPixelWidth) {
    return EARTH_RADIUS_KM * Math.PI * 2 / Math.max(1, Number(worldPixelWidth) || 1);
  }

  function greatCircleDistanceKm(ax, ay, bx, by, worldPixelWidth, worldPixelHeight) {
    return centralAngle(ax, ay, bx, by, worldPixelWidth, worldPixelHeight) * EARTH_RADIUS_KM;
  }

  function greatCircleDistancePixels(ax, ay, bx, by, worldPixelWidth, worldPixelHeight) {
    const radiansPerPixel = Math.PI * 2 / Math.max(1, Number(worldPixelWidth) || 1);
    return centralAngle(ax, ay, bx, by, worldPixelWidth, worldPixelHeight) / radiansPerPixel;
  }

  // Returns a unit vector in the local tangent plane: +x east, +y south.
  function initialDirection(ax, ay, bx, by, worldPixelWidth, worldPixelHeight) {
    const a = pixelToRadians(ax, ay, worldPixelWidth, worldPixelHeight);
    const b = pixelToRadians(bx, by, worldPixelWidth, worldPixelHeight);
    const dLon = wrapRadians(b.lon - a.lon);
    const east = Math.sin(dLon) * Math.cos(b.lat);
    const north = Math.cos(a.lat) * Math.sin(b.lat)
      - Math.sin(a.lat) * Math.cos(b.lat) * Math.cos(dLon);
    const length = Math.hypot(east, north);
    return {
      x: length > 1e-12 ? east / length : 0,
      y: length > 1e-12 ? -north / length : 0,
      distancePixels: greatCircleDistancePixels(ax, ay, bx, by, worldPixelWidth, worldPixelHeight)
    };
  }

  return {
    EARTH_RADIUS_KM,
    MIN_LONGITUDE_SCALE,
    pixelToRadians,
    latitudeDegreesAtY,
    longitudeScaleAtY,
    localDeltaToMap,
    centralAngle,
    kilometersPerPixel,
    greatCircleDistanceKm,
    greatCircleDistancePixels,
    initialDirection
  };
}));
