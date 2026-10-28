(function (root) {
  'use strict';
  const radians = n => n * Math.PI / 180;
  function distance(a, b) {
    const dLat = radians(b.lat - a.lat), dLon = radians(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  // Project onto every segment, rather than checking only sparse route vertices.
  function routeProximity(point, coordinates) {
    let best = { distance: Infinity, progress: 0 }, travelled = 0;
    const scaleX = 111320 * Math.cos(radians(point.lat)), scaleY = 111320;
    for (let i = 1; i < coordinates.length; i++) {
      const [ax, ay] = coordinates[i - 1], [bx, by] = coordinates[i];
      const dx = (bx - ax) * scaleX, dy = (by - ay) * scaleY;
      const px = (point.lon - ax) * scaleX, py = (point.lat - ay) * scaleY;
      const length2 = dx * dx + dy * dy;
      const fraction = length2 ? Math.max(0, Math.min(1, (px * dx + py * dy) / length2)) : 0;
      const offset = Math.hypot(px - fraction * dx, py - fraction * dy);
      const segmentLength = distance({lat: ay, lon: ax}, {lat: by, lon: bx});
      if (offset < best.distance) best = { distance: offset, progress: travelled + fraction * segmentLength };
      travelled += segmentLength;
    }
    return best;
  }
  function sampleRoute(coordinates, count = 4) {
    if (coordinates.length < 2) return [];
    const cumulative = [0];
    for (let i = 1; i < coordinates.length; i++) cumulative[i] = cumulative[i-1] + distance({lon:coordinates[i-1][0],lat:coordinates[i-1][1]}, {lon:coordinates[i][0],lat:coordinates[i][1]});
    return Array.from({length: count}, (_, n) => {
      const target = cumulative.at(-1) * n / (count - 1);
      let i = cumulative.findIndex(d => d >= target);
      if (i < 1) return {lon: coordinates[0][0], lat: coordinates[0][1]};
      const fraction = (target - cumulative[i-1]) / (cumulative[i] - cumulative[i-1] || 1);
      return {lon: coordinates[i-1][0] + fraction * (coordinates[i][0] - coordinates[i-1][0]), lat: coordinates[i-1][1] + fraction * (coordinates[i][1] - coordinates[i-1][1])};
    });
  }
  function fitsTime(baseSeconds, viaSeconds, visitMinutes, availableMinutes, maxDetourMinutes) {
    const detour = Math.max(0, (viaSeconds - baseSeconds) / 60);
    return detour <= maxDetourMinutes && viaSeconds / 60 + visitMinutes <= availableMinutes;
  }
  const api = { distance, routeProximity, sampleRoute, fitsTime };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NavigueOutingCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
