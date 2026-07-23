'use strict';

const GeoMotion = require('../public/js/geo-motion.js');

function normalizeLon(lon) {
  let x = Number(lon);
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}

function deltaLon(a, b) {
  let d = normalizeLon(a) - normalizeLon(b);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function pixelToLatLon(x, y, worldPixelWidth, worldPixelHeight) {
  return {
    lon: normalizeLon((Number(x) / worldPixelWidth) * 360 - 180),
    lat: 90 - (Number(y) / worldPixelHeight) * 180
  };
}

function localXY(lat, lon, refLat, refLon) {
  const cos = Math.max(GeoMotion.MIN_LONGITUDE_SCALE, Math.abs(Math.cos((refLat * Math.PI) / 180)));
  return { x: deltaLon(lon, refLon) * cos, y: lat - refLat };
}

function pointInPolygon(lat, lon, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = localXY(Number(points[i][0]), Number(points[i][1]), lat, lon);
    const b = localXY(Number(points[j][0]), Number(points[j][1]), lat, lon);
    const intersects = ((a.y > 0) !== (b.y > 0)) && (0 < ((b.x - a.x) * (-a.y)) / ((b.y - a.y) || 1e-9) + a.x);
    if (intersects) inside = !inside;
  }
  return inside;
}

function distanceToSegmentDeg(lat, lon, a, b) {
  const p = localXY(lat, lon, lat, lon);
  const av = localXY(Number(a[0]), Number(a[1]), lat, lon);
  const bv = localXY(Number(b[0]), Number(b[1]), lat, lon);
  const dx = bv.x - av.x;
  const dy = bv.y - av.y;
  const denom = dx * dx + dy * dy;
  const t = denom <= 1e-12 ? 0 : Math.max(0, Math.min(1, ((p.x - av.x) * dx + (p.y - av.y) * dy) / denom));
  return Math.hypot(p.x - (av.x + t * dx), p.y - (av.y + t * dy));
}

function inCircle(lat, lon, centerLat, centerLon, radiusDeg) {
  const p = localXY(lat, lon, Number(centerLat), Number(centerLon));
  return Math.hypot(p.x, p.y) <= Number(radiusDeg);
}

function containsLatLon(zone, lat, lon) {
  if (!zone) return false;
  if (zone.type === 'circle') return inCircle(lat, lon, zone.center[0], zone.center[1], zone.radiusDeg);
  if (zone.type === 'multiCircle') return zone.circles.some((c) => inCircle(lat, lon, c[0], c[1], c[2]));
  if (zone.type === 'polygon') return pointInPolygon(lat, lon, zone.points);
  if (zone.type === 'corridor') {
    for (let i = 1; i < zone.path.length; i += 1) {
      if (distanceToSegmentDeg(lat, lon, zone.path[i - 1], zone.path[i]) <= Number(zone.widthDeg)) return true;
    }
    return false;
  }
  return false;
}

function wrappedPixelDistance(ax, ay, bx, by, worldPixelWidth) {
  let dx = Number(ax) - Number(bx);
  if (dx > worldPixelWidth / 2) dx -= worldPixelWidth;
  if (dx < -worldPixelWidth / 2) dx += worldPixelWidth;
  return Math.hypot(dx, Number(ay) - Number(by));
}

function containsPlayer(player, resolvedPlace, zone, options) {
  if (!player || !resolvedPlace) return false;
  const expectedMode = zone?.mode || (resolvedPlace.access === 'land' ? 'land' : 'sea');
  if (expectedMode !== 'any' && player.mode !== expectedMode) return false;
  if (zone) {
    const ll = pixelToLatLon(player.x, player.y, options.worldPixelWidth, options.worldPixelHeight);
    return containsLatLon(zone, ll.lat, ll.lon);
  }
  return GeoMotion.greatCircleDistancePixels(
    player.x,
    player.y,
    resolvedPlace.point.x,
    resolvedPlace.point.y,
    options.worldPixelWidth,
    options.worldPixelHeight
  )
    <= Number(resolvedPlace.arrivalRadiusTiles || 3.2) * Number(options.tile);
}

module.exports = {
  normalizeLon,
  deltaLon,
  pixelToLatLon,
  pointInPolygon,
  containsLatLon,
  containsPlayer
};
